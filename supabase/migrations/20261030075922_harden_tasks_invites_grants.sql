-- Endurece tareas, invitaciones y privilegios (tarea SG-01).
--
-- Contratos que introduce (todas las RPC: SECURITY DEFINER,
-- search_path = pg_catalog, public, EXECUTE sólo para authenticated):
--   completar_tarea(p_asignacion_id uuid) -> jsonb
--   puntos_familia() -> table(usuario_id uuid, puntos int)
--   ver_invitacion_familia(p_token uuid) -> jsonb
--   revocar_invitaciones_familia(p_familia_id uuid) -> integer
--   aceptar_invitacion_familia / quitar_miembro_familia: mismas firmas, más comprobaciones
--
-- Compatible con el cliente antiguo: completar con UPDATE directo sigue
-- funcionando (un trigger rellena completado_por / completado_en / dia_mes).
-- Es idempotente: se puede volver a ejecutar sin errores.
BEGIN;

-- =============================================================================
-- 1. Tareas: columnas de autoría y día de mes anclado
-- =============================================================================
ALTER TABLE public.tareas_asignadas
    ADD COLUMN IF NOT EXISTS completado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS completado_en timestamptz,
    ADD COLUMN IF NOT EXISTS dia_mes smallint;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conrelid = 'public.tareas_asignadas'::regclass
                     AND conname = 'tareas_asignadas_dia_mes_check') THEN
        ALTER TABLE public.tareas_asignadas
            ADD CONSTRAINT tareas_asignadas_dia_mes_check CHECK (dia_mes BETWEEN 1 AND 31);
    END IF;
END $$;

-- Las mensuales existentes quedan ancladas al día de su fecha actual.
UPDATE public.tareas_asignadas
SET dia_mes = extract(day FROM fecha_objetivo)::smallint
WHERE recurrencia = 'Mensual' AND dia_mes IS NULL;

CREATE INDEX IF NOT EXISTS tareas_asignadas_familia_fecha_idx ON public.tareas_asignadas (familia_id, fecha_objetivo);
CREATE INDEX IF NOT EXISTS tareas_asignadas_tarea_idx ON public.tareas_asignadas (tarea_id);
CREATE INDEX IF NOT EXISTS tareas_asignadas_asignado_a_idx ON public.tareas_asignadas (asignado_a);
CREATE INDEX IF NOT EXISTS tareas_asignadas_completado_por_idx ON public.tareas_asignadas (completado_por);
CREATE INDEX IF NOT EXISTS tareas_catalogo_familia_idx ON public.tareas_catalogo (familia_id);
CREATE INDEX IF NOT EXISTS usuarios_familia_idx ON public.usuarios (familia_id);
CREATE INDEX IF NOT EXISTS familias_compras_familia_idx ON public.familias_compras (familia_id);

-- Los campos de autoría los decide el servidor, venga el cambio de la RPC o de
-- un UPDATE directo (cliente antiguo): quien completa es auth.uid().
CREATE OR REPLACE FUNCTION public.tareas_asignadas_autoria()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
    IF NEW.recurrencia = 'Mensual' AND NEW.dia_mes IS NULL THEN
        NEW.dia_mes := extract(day FROM NEW.fecha_objetivo)::smallint;
    END IF;

    IF NEW.estado = 'Completada' THEN
        IF TG_OP = 'INSERT' OR OLD.estado IS DISTINCT FROM 'Completada' THEN
            NEW.completado_por := coalesce(auth.uid(), NEW.completado_por);
            NEW.completado_en := CASE WHEN auth.uid() IS NULL THEN coalesce(NEW.completado_en, now()) ELSE now() END;
        ELSE
            NEW.completado_por := OLD.completado_por;
            NEW.completado_en := OLD.completado_en;
        END IF;
    ELSE
        NEW.completado_por := NULL;
        NEW.completado_en := NULL;
    END IF;
    RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.tareas_asignadas_autoria() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tareas_asignadas_autoria ON public.tareas_asignadas;
CREATE TRIGGER tareas_asignadas_autoria
    BEFORE INSERT OR UPDATE ON public.tareas_asignadas
    FOR EACH ROW EXECUTE FUNCTION public.tareas_asignadas_autoria();

-- Contrato 1: completar una asignación de forma atómica y programar la siguiente.
-- Devuelve {"ok":true,"siguiente_id":uuid|null,"siguiente_fecha":date|null,"puntos":10}
--       o {"ok":false,"motivo":"ya_completada_o_no_existe"}.
CREATE OR REPLACE FUNCTION public.completar_tarea(p_asignacion_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_hoy date := (now() AT TIME ZONE 'Europe/Madrid')::date;
    v_tarea public.tareas_asignadas%ROWTYPE;
    v_base date;
    v_mes date;
    v_n integer;
    v_siguiente date;
    v_siguiente_id uuid;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión para completar tareas.';
    END IF;

    UPDATE public.tareas_asignadas AS ta
    SET estado = 'Completada',
        completado_por = v_user_id,
        completado_en = now(),
        actualizado_en = now(),
        dia_mes = CASE
            WHEN ta.recurrencia = 'Mensual'
                THEN coalesce(ta.dia_mes, extract(day FROM ta.fecha_objetivo)::smallint)
            ELSE ta.dia_mes
        END
    WHERE ta.id = p_asignacion_id
      AND ta.familia_id = public.mi_familia_id()
      AND coalesce(ta.estado, 'Pendiente') = 'Pendiente'
    RETURNING ta.* INTO v_tarea;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'motivo', 'ya_completada_o_no_existe');
    END IF;

    IF v_tarea.recurrencia IN ('Diaria', 'Semanal', 'Quincenal', 'Mensual') THEN
        v_base := greatest(v_tarea.fecha_objetivo, v_hoy);

        IF v_tarea.recurrencia = 'Diaria' THEN
            v_siguiente := v_base + 1;
        ELSIF v_tarea.recurrencia = 'Semanal' THEN
            v_siguiente := v_base + 7;
        ELSIF v_tarea.recurrencia = 'Quincenal' THEN
            v_siguiente := v_base + 14;
        ELSE
            -- Mensual: mismo día (dia_mes) en meses sucesivos a partir del mes
            -- de fecha_objetivo, recortado al último día del mes. Sin deriva:
            -- 31 ene -> 28 feb -> 31 mar.
            v_n := greatest(1,
                ((extract(year FROM v_base) - extract(year FROM v_tarea.fecha_objetivo)) * 12
                 + extract(month FROM v_base) - extract(month FROM v_tarea.fecha_objetivo))::integer);
            LOOP
                v_mes := (date_trunc('month', v_tarea.fecha_objetivo) + make_interval(months => v_n))::date;
                v_siguiente := v_mes + (least(v_tarea.dia_mes::integer,
                    extract(day FROM (v_mes + interval '1 month - 1 day'))::integer) - 1);
                EXIT WHEN v_siguiente > v_base;
                v_n := v_n + 1;
            END LOOP;
        END IF;

        -- Si ya existe esa siguiente ocurrencia pendiente (p. ej. la creó un
        -- cliente antiguo), se reutiliza en vez de duplicarla.
        SELECT ta.id INTO v_siguiente_id
        FROM public.tareas_asignadas AS ta
        WHERE ta.familia_id = v_tarea.familia_id
          AND ta.tarea_id IS NOT DISTINCT FROM v_tarea.tarea_id
          AND ta.asignado_a IS NOT DISTINCT FROM v_tarea.asignado_a
          AND ta.fecha_objetivo = v_siguiente
          AND coalesce(ta.estado, 'Pendiente') = 'Pendiente'
        LIMIT 1;

        IF v_siguiente_id IS NULL THEN
            INSERT INTO public.tareas_asignadas AS nueva
                (familia_id, tarea_id, asignado_a, fecha_objetivo, estado, recurrencia, dia_mes)
            VALUES
                (v_tarea.familia_id, v_tarea.tarea_id, v_tarea.asignado_a, v_siguiente,
                 'Pendiente', v_tarea.recurrencia, v_tarea.dia_mes)
            RETURNING nueva.id INTO v_siguiente_id;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'siguiente_id', v_siguiente_id,
        'siguiente_fecha', v_siguiente,
        'puntos', 10
    );
END;
$function$;

-- Contrato 2: 10 puntos por tarea completada, para quien la completó
-- (o la persona asignada en las completadas antes de esta migración).
CREATE OR REPLACE FUNCTION public.puntos_familia()
RETURNS TABLE (usuario_id uuid, puntos integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
    SELECT coalesce(ta.completado_por, ta.asignado_a) AS usuario_id,
           (10 * count(*))::integer AS puntos
    FROM public.tareas_asignadas AS ta
    WHERE ta.familia_id = public.mi_familia_id()
      AND ta.estado = 'Completada'
      AND coalesce(ta.completado_por, ta.asignado_a) IS NOT NULL
    GROUP BY 1;
$function$;

-- =============================================================================
-- 3. Invitaciones: usos, revocación y expulsados
-- =============================================================================
ALTER TABLE public.invitaciones_familia
    ADD COLUMN IF NOT EXISTS usos integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_usos integer NOT NULL DEFAULT 10,
    ADD COLUMN IF NOT EXISTS revocada_en timestamptz;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conrelid = 'public.invitaciones_familia'::regclass
                     AND conname = 'invitaciones_familia_usos_check') THEN
        ALTER TABLE public.invitaciones_familia
            ADD CONSTRAINT invitaciones_familia_usos_check CHECK (usos >= 0 AND max_usos >= 1);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS invitaciones_familia_familia_idx ON public.invitaciones_familia (familia_id);

-- Personas quitadas de una familia: no pueden volver a entrar con invitaciones.
-- RLS activada y sin políticas: sólo se accede desde las RPC.
CREATE TABLE IF NOT EXISTS public.familias_expulsados (
    familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expulsado_en timestamptz NOT NULL DEFAULT now(),
    expulsado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    PRIMARY KEY (familia_id, usuario_id)
);

ALTER TABLE public.familias_expulsados ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.familias_expulsados FROM PUBLIC, anon, authenticated;

-- Vista previa de una invitación antes de aceptarla.
-- Devuelve {valida bool, familia_nombre text, invitado_por text, motivo text}.
-- motivo: null | ya_miembro (valida=true) | no_autenticado | no_existe |
--         revocada | caducada | agotada | expulsado | otra_familia
CREATE OR REPLACE FUNCTION public.ver_invitacion_familia(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_inv public.invitaciones_familia%ROWTYPE;
    v_familia_nombre text;
    v_invitado_por text;
    v_mi_familia uuid;
    v_motivo text;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('valida', false, 'familia_nombre', NULL, 'invitado_por', NULL, 'motivo', 'no_autenticado');
    END IF;

    SELECT * INTO v_inv FROM public.invitaciones_familia AS i WHERE i.token = p_token;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('valida', false, 'familia_nombre', NULL, 'invitado_por', NULL, 'motivo', 'no_existe');
    END IF;

    SELECT u.familia_id INTO v_mi_familia FROM public.usuarios AS u WHERE u.id = v_user_id;

    v_motivo := CASE
        WHEN v_inv.revocada_en IS NOT NULL THEN 'revocada'
        WHEN v_inv.caduca_en <= now() THEN 'caducada'
        WHEN v_mi_familia = v_inv.familia_id THEN 'ya_miembro'
        WHEN v_inv.usos >= v_inv.max_usos THEN 'agotada'
        WHEN EXISTS (SELECT 1 FROM public.familias_expulsados AS e
                     WHERE e.familia_id = v_inv.familia_id AND e.usuario_id = v_user_id) THEN 'expulsado'
        WHEN v_mi_familia IS NOT NULL THEN 'otra_familia'
    END;

    IF v_motivo IS NOT NULL AND v_motivo <> 'ya_miembro' THEN
        RETURN jsonb_build_object('valida', false, 'familia_nombre', NULL, 'invitado_por', NULL, 'motivo', v_motivo);
    END IF;

    SELECT f.nombre INTO v_familia_nombre FROM public.familias AS f WHERE f.id = v_inv.familia_id;
    SELECT u.nombre INTO v_invitado_por FROM public.usuarios AS u
    WHERE u.id = v_inv.creada_por AND u.familia_id = v_inv.familia_id;

    RETURN jsonb_build_object('valida', true, 'familia_nombre', v_familia_nombre,
                              'invitado_por', v_invitado_por, 'motivo', v_motivo);
END;
$function$;

CREATE OR REPLACE FUNCTION public.aceptar_invitacion_familia(p_token uuid, p_nombre text)
RETURNS TABLE (id uuid, familia_id uuid, nombre text, rol text, familia_nombre text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
#variable_conflict use_column
DECLARE
    v_user_id uuid := auth.uid();
    v_inv public.invitaciones_familia%ROWTYPE;
    v_familia_nombre text;
    v_nombre text := nullif(btrim(p_nombre), '');
    v_ya_miembro boolean;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión para aceptar una invitación.';
    END IF;
    IF v_nombre IS NULL OR length(v_nombre) > 50 THEN
        RAISE EXCEPTION 'El nombre debe tener entre 1 y 50 caracteres.';
    END IF;

    -- Bloquea la invitación para que dos aceptaciones simultáneas no superen max_usos.
    SELECT i.* INTO v_inv
    FROM public.invitaciones_familia AS i
    WHERE i.token = p_token
      AND i.caduca_en > now()
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La invitación no existe o ha caducado.';
    END IF;
    IF v_inv.revocada_en IS NOT NULL THEN
        RAISE EXCEPTION 'Esta invitación ha sido revocada. Pide un enlace nuevo al administrador.';
    END IF;

    SELECT f.nombre INTO v_familia_nombre FROM public.familias AS f WHERE f.id = v_inv.familia_id;

    v_ya_miembro := EXISTS (
        SELECT 1 FROM public.usuarios AS u
        WHERE u.id = v_user_id AND u.familia_id = v_inv.familia_id
    );

    IF NOT v_ya_miembro THEN
        IF EXISTS (
            SELECT 1 FROM public.familias_expulsados AS e
            WHERE e.familia_id = v_inv.familia_id AND e.usuario_id = v_user_id
        ) THEN
            RAISE EXCEPTION 'Un administrador te quitó de esta familia; no puedes volver a entrar con este enlace.';
        END IF;
        IF v_inv.usos >= v_inv.max_usos THEN
            RAISE EXCEPTION 'Esta invitación ya se ha usado el máximo de veces. Pide un enlace nuevo al administrador.';
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.usuarios AS existing_user
        WHERE existing_user.id = v_user_id
          AND existing_user.familia_id IS NOT NULL
          AND existing_user.familia_id <> v_inv.familia_id
    ) THEN
        RAISE EXCEPTION 'Esta cuenta ya pertenece a otra familia. Pide a su administrador que la quite antes de aceptar otra invitación.';
    END IF;

    INSERT INTO public.usuarios AS current_profile (id, familia_id, nombre, rol)
    VALUES (v_user_id, v_inv.familia_id, v_nombre, 'Usuario')
    ON CONFLICT (id) DO UPDATE
        SET familia_id = EXCLUDED.familia_id,
            nombre = EXCLUDED.nombre,
            rol = CASE
                WHEN current_profile.familia_id IS NULL THEN 'Usuario'
                ELSE current_profile.rol
            END
        WHERE current_profile.familia_id IS NULL
           OR current_profile.familia_id = EXCLUDED.familia_id
    RETURNING current_profile.id, current_profile.familia_id, current_profile.nombre, current_profile.rol
    INTO id, familia_id, nombre, rol;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo vincular el perfil a la familia.';
    END IF;

    IF NOT v_ya_miembro THEN
        UPDATE public.invitaciones_familia AS i
        SET usos = i.usos + 1
        WHERE i.token = v_inv.token;
    END IF;

    familia_nombre := v_familia_nombre;
    RETURN NEXT;
END;
$function$;

-- Revoca todas las invitaciones activas de la familia. Devuelve cuántas.
CREATE OR REPLACE FUNCTION public.revocar_invitaciones_familia(p_familia_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_total integer;
BEGIN
    IF auth.uid() IS NULL OR NOT public.usuario_es_admin_de_familia(p_familia_id) THEN
        RAISE EXCEPTION 'Solo un administrador de esta familia puede revocar invitaciones.';
    END IF;

    UPDATE public.invitaciones_familia AS i
    SET revocada_en = now()
    WHERE i.familia_id = p_familia_id
      AND i.revocada_en IS NULL
      AND i.caduca_en > now();
    GET DIAGNOSTICS v_total = ROW_COUNT;

    RETURN v_total;
END;
$function$;

CREATE OR REPLACE FUNCTION public.quitar_miembro_familia(p_usuario_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_familia_id uuid;
BEGIN
    SELECT u.familia_id
    INTO v_familia_id
    FROM public.usuarios AS u
    WHERE u.id = auth.uid()
      AND u.rol = 'Admin'
      AND u.familia_id IS NOT NULL;

    IF NOT FOUND OR NOT public.usuario_es_admin_de_familia(v_familia_id) THEN
        RAISE EXCEPTION 'Solo un administrador puede quitar miembros de su familia.';
    END IF;
    IF p_usuario_id IS NULL OR p_usuario_id = auth.uid() THEN
        RAISE EXCEPTION 'No puedes quitarte a ti mismo de la familia.';
    END IF;

    UPDATE public.usuarios AS target
    SET familia_id = NULL,
        rol = 'Usuario'
    WHERE target.id = p_usuario_id
      AND target.familia_id = v_familia_id
      AND target.rol = 'Usuario';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El miembro no existe en esta familia o es administrador.';
    END IF;

    INSERT INTO public.familias_expulsados AS e (familia_id, usuario_id, expulsado_por)
    VALUES (v_familia_id, p_usuario_id, auth.uid())
    ON CONFLICT (familia_id, usuario_id) DO UPDATE
        SET expulsado_en = now(), expulsado_por = EXCLUDED.expulsado_por;

    -- Los enlaces que pudiera tener guardados dejan de valer.
    UPDATE public.invitaciones_familia AS i
    SET revocada_en = now()
    WHERE i.familia_id = v_familia_id
      AND i.revocada_en IS NULL
      AND i.caduca_en > now();

    -- Sus tareas pendientes quedan sin asignar dentro de la familia.
    UPDATE public.tareas_asignadas AS ta
    SET asignado_a = NULL
    WHERE ta.familia_id = v_familia_id
      AND ta.asignado_a = p_usuario_id
      AND coalesce(ta.estado, 'Pendiente') = 'Pendiente';

    RETURN true;
END;
$function$;

-- Ajusta el límite del nombre de familia al nuevo CHECK (80) para que el
-- usuario reciba un mensaje claro en vez de un error de restricción.
CREATE OR REPLACE FUNCTION public.crear_familia_con_admin(
    p_nombre text,
    p_dieta_base text,
    p_nivel_flexibilidad text,
    p_nombre_usuario text
)
RETURNS TABLE (id uuid, familia_id uuid, nombre text, rol text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
#variable_conflict use_column
DECLARE
    v_user_id uuid := auth.uid();
    v_familia_id uuid;
    v_nombre_usuario text := nullif(btrim(p_nombre_usuario), '');
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión para crear una familia.';
    END IF;
    IF nullif(btrim(p_nombre), '') IS NULL OR length(btrim(p_nombre)) > 80 THEN
        RAISE EXCEPTION 'El nombre de la familia debe tener entre 1 y 80 caracteres.';
    END IF;
    IF length(btrim(coalesce(p_dieta_base, ''))) > 40 THEN
        RAISE EXCEPTION 'La dieta base no puede superar 40 caracteres.';
    END IF;
    IF p_nivel_flexibilidad IS NULL OR p_nivel_flexibilidad NOT IN ('Estricta', 'Flexible') THEN
        RAISE EXCEPTION 'El nivel de planificación no es válido.';
    END IF;
    IF v_nombre_usuario IS NULL OR length(v_nombre_usuario) > 50 THEN
        RAISE EXCEPTION 'El nombre del administrador debe tener entre 1 y 50 caracteres.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM public.usuarios AS u
        WHERE u.id = v_user_id AND u.familia_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Ya perteneces a una familia.';
    END IF;

    INSERT INTO public.familias AS new_family (nombre, dieta_base, nivel_flexibilidad)
    VALUES (btrim(p_nombre), coalesce(nullif(btrim(p_dieta_base), ''), 'Mediterránea'), p_nivel_flexibilidad)
    RETURNING new_family.id INTO v_familia_id;

    INSERT INTO public.usuarios AS current_profile (id, familia_id, nombre, rol)
    VALUES (v_user_id, v_familia_id, v_nombre_usuario, 'Admin')
    ON CONFLICT (id) DO UPDATE
        SET familia_id = EXCLUDED.familia_id,
            nombre = EXCLUDED.nombre,
            rol = 'Admin'
        WHERE current_profile.familia_id IS NULL
    RETURNING current_profile.id, current_profile.familia_id, current_profile.nombre, current_profile.rol
    INTO id, familia_id, nombre, rol;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo crear el perfil administrador.';
    END IF;

    RETURN NEXT;
END;
$function$;

-- =============================================================================
-- 4. Políticas
-- =============================================================================
-- tareas_catalogo: el catálogo global (familia_id NULL) es de sólo lectura.
DROP POLICY IF EXISTS tareas_catalogo_all ON public.tareas_catalogo;
DROP POLICY IF EXISTS tareas_catalogo_select ON public.tareas_catalogo;
DROP POLICY IF EXISTS tareas_catalogo_insert ON public.tareas_catalogo;
DROP POLICY IF EXISTS tareas_catalogo_update ON public.tareas_catalogo;
DROP POLICY IF EXISTS tareas_catalogo_delete ON public.tareas_catalogo;

CREATE POLICY tareas_catalogo_select ON public.tareas_catalogo
    FOR SELECT TO authenticated
    USING (familia_id IS NULL OR familia_id = public.mi_familia_id());
CREATE POLICY tareas_catalogo_insert ON public.tareas_catalogo
    FOR INSERT TO authenticated
    WITH CHECK (familia_id = public.mi_familia_id());
CREATE POLICY tareas_catalogo_update ON public.tareas_catalogo
    FOR UPDATE TO authenticated
    USING (familia_id = public.mi_familia_id())
    WITH CHECK (familia_id = public.mi_familia_id());
CREATE POLICY tareas_catalogo_delete ON public.tareas_catalogo
    FOR DELETE TO authenticated
    USING (familia_id = public.mi_familia_id());

-- Redundantes con rol public: las cubre tareas_asignadas_all (authenticated).
-- La tabla menus no se usa (0 filas); sin políticas queda inaccesible.
DROP POLICY IF EXISTS tareas_asignadas_update_familia ON public.tareas_asignadas;
DROP POLICY IF EXISTS menus_select ON public.menus;
DROP POLICY IF EXISTS menus_update_familia ON public.menus;

-- =============================================================================
-- 5. Privilegios
-- =============================================================================
-- anon no necesita ninguna tabla; authenticated sólo DML donde hay políticas.
REVOKE ALL ON TABLE
    public.familias, public.usuarios, public.tareas_catalogo, public.tareas_asignadas,
    public.menus, public.invitaciones_familia, public.familias_compras, public.familias_menus,
    public.familias_expulsados
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.familias, public.usuarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    public.tareas_catalogo, public.tareas_asignadas, public.familias_compras, public.familias_menus
TO authenticated;

-- Que las tablas nuevas de postgres no vuelvan a nacer con TRUNCATE/TRIGGER... para anon.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLES FROM anon, authenticated;

-- search_path explícito en las funciones base.
ALTER FUNCTION public.mi_familia_id() SET search_path = pg_catalog, public;
ALTER FUNCTION public.soy_admin() SET search_path = pg_catalog, public;

REVOKE ALL ON FUNCTION public.soy_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.soy_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mi_familia_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mi_familia_id() TO authenticated;
REVOKE ALL ON FUNCTION public.usuario_es_admin_de_familia(uuid) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.completar_tarea(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.puntos_familia() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ver_invitacion_familia(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revocar_invitaciones_familia(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.aceptar_invitacion_familia(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.quitar_miembro_familia(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.crear_invitacion_familia(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.crear_familia_con_admin(text, text, text, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.completar_tarea(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.puntos_familia() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ver_invitacion_familia(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revocar_invitaciones_familia(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aceptar_invitacion_familia(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.quitar_miembro_familia(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_invitacion_familia(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_familia_con_admin(text, text, text, text) TO authenticated;

-- =============================================================================
-- 6. Límites de longitud (NOT VALID + intento de validar: no rompe si hay datos viejos)
-- =============================================================================
DO $$
DECLARE
    c record;
BEGIN
    FOR c IN
        SELECT * FROM (VALUES
            ('familias_compras', 'familias_compras_longitudes_check',
             'length(nombre) <= 120 AND length(cantidad) <= 60 AND length(seccion) <= 60'),
            ('familias_menus', 'familias_menus_longitudes_check',
             'length(nombre) <= 160 AND length(tiempo) <= 40 AND CASE WHEN jsonb_typeof(ingredientes) = ''array'' THEN jsonb_array_length(ingredientes) <= 40 ELSE false END'),
            ('familias', 'familias_longitudes_check',
             'length(nombre) <= 80 AND length(dieta_base) <= 40'),
            ('tareas_catalogo', 'tareas_catalogo_longitudes_check',
             'length(nombre) <= 120 AND length(descripcion) <= 500')
        ) AS v(tabla, nombre, expr)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_constraint
                       WHERE conrelid = format('public.%I', c.tabla)::regclass
                         AND conname = c.nombre) THEN
            EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (%s) NOT VALID',
                           c.tabla, c.nombre, c.expr);
        END IF;
        BEGIN
            EXECUTE format('ALTER TABLE public.%I VALIDATE CONSTRAINT %I', c.tabla, c.nombre);
        EXCEPTION WHEN check_violation THEN
            RAISE NOTICE 'Hay filas antiguas que no cumplen %; queda NOT VALID.', c.nombre;
        END;
    END LOOP;
END $$;

-- =============================================================================
-- 7. Realtime
-- =============================================================================
DO $$
DECLARE
    t text;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        FOREACH t IN ARRAY ARRAY['familias_compras', 'familias_menus', 'tareas_asignadas'] LOOP
            IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                           WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t) THEN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
            END IF;
        END LOOP;
    END IF;
END $$;

-- =============================================================================
-- 8. Único por plato en familias_menus (ya existe uq_familia_menu_dia_tipo en prod)
-- =============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_index AS ix
        WHERE ix.indrelid = 'public.familias_menus'::regclass
          AND ix.indisunique
          AND ix.indnkeyatts = 3
          AND (SELECT array_agg(a.attname::text ORDER BY a.attname)
               FROM pg_attribute AS a
               WHERE a.attrelid = ix.indrelid AND a.attnum = ANY (ix.indkey)) = ARRAY['dia', 'familia_id', 'tipo']
    ) THEN
        IF EXISTS (SELECT 1 FROM public.familias_menus GROUP BY familia_id, dia, tipo HAVING count(*) > 1) THEN
            RAISE EXCEPTION 'familias_menus tiene platos duplicados por (familia_id, dia, tipo); límpialos antes de migrar.';
        END IF;
        CREATE UNIQUE INDEX familias_menus_familia_dia_tipo_key ON public.familias_menus (familia_id, dia, tipo);
    END IF;
END $$;

COMMIT;
