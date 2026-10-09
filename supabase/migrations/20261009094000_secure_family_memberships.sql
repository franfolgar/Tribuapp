-- Apply this migration to Supabase before deploying the matching frontend.
-- Existing family-ID invitation links will stop working; generate new links after migration.
BEGIN;

CREATE TABLE IF NOT EXISTS public.invitaciones_familia (
    token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
    creada_por uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creada_en timestamptz NOT NULL DEFAULT now(),
    caduca_en timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.invitaciones_familia ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.invitaciones_familia FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.usuario_es_admin_de_familia(p_familia_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.usuarios AS u
        WHERE u.id = auth.uid()
          AND u.familia_id = p_familia_id
          AND u.rol = 'Admin'
    );
$function$;

REVOKE ALL ON FUNCTION public.usuario_es_admin_de_familia(uuid) FROM PUBLIC, anon, authenticated;

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
DECLARE
    v_user_id uuid := auth.uid();
    v_familia_id uuid;
    v_nombre_usuario text := nullif(btrim(p_nombre_usuario), '');
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión para crear una familia.';
    END IF;
    IF nullif(btrim(p_nombre), '') IS NULL OR length(btrim(p_nombre)) > 120 THEN
        RAISE EXCEPTION 'El nombre de la familia debe tener entre 1 y 120 caracteres.';
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

CREATE OR REPLACE FUNCTION public.crear_invitacion_familia(p_familia_id uuid)
RETURNS TABLE (token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_token uuid;
BEGIN
    IF auth.uid() IS NULL OR NOT public.usuario_es_admin_de_familia(p_familia_id) THEN
        RAISE EXCEPTION 'Solo un administrador de esta familia puede crear invitaciones.';
    END IF;

    INSERT INTO public.invitaciones_familia AS new_invite (familia_id, creada_por)
    VALUES (p_familia_id, auth.uid())
    RETURNING new_invite.token INTO v_token;

    RETURN QUERY SELECT v_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.aceptar_invitacion_familia(p_token uuid, p_nombre text)
RETURNS TABLE (id uuid, familia_id uuid, nombre text, rol text, familia_nombre text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_user_id uuid := auth.uid();
    v_familia_id uuid;
    v_familia_nombre text;
    v_nombre text := nullif(btrim(p_nombre), '');
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión para aceptar una invitación.';
    END IF;
    IF v_nombre IS NULL OR length(v_nombre) > 50 THEN
        RAISE EXCEPTION 'El nombre debe tener entre 1 y 50 caracteres.';
    END IF;

    SELECT i.familia_id, f.nombre
    INTO v_familia_id, v_familia_nombre
    FROM public.invitaciones_familia AS i
    JOIN public.familias AS f ON f.id = i.familia_id
    WHERE i.token = p_token
      AND i.caduca_en > now();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La invitación no existe o ha caducado.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.usuarios AS existing_user
        WHERE existing_user.id = v_user_id
          AND existing_user.familia_id IS NOT NULL
          AND existing_user.familia_id <> v_familia_id
    ) THEN
        RAISE EXCEPTION 'Esta cuenta ya pertenece a otra familia. Pide a su administrador que la quite antes de aceptar otra invitación.';
    END IF;

    INSERT INTO public.usuarios AS current_profile (id, familia_id, nombre, rol)
    VALUES (v_user_id, v_familia_id, v_nombre, 'Usuario')
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

    familia_nombre := v_familia_nombre;
    RETURN NEXT;
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

    RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.crear_familia_con_admin(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.crear_invitacion_familia(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.aceptar_invitacion_familia(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.quitar_miembro_familia(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.crear_familia_con_admin(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_invitacion_familia(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aceptar_invitacion_familia(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.quitar_miembro_familia(uuid) TO authenticated;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS usuarios_insert_admin ON public.usuarios;
DROP POLICY IF EXISTS usuarios_select ON public.usuarios;
DROP POLICY IF EXISTS usuarios_select_self_or_family ON public.usuarios;

CREATE POLICY usuarios_select_self_or_family
ON public.usuarios
FOR SELECT
TO authenticated
USING (
    id = auth.uid()
    OR (familia_id IS NOT NULL AND familia_id = public.mi_familia_id())
);

REVOKE ALL ON TABLE public.usuarios FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.usuarios TO authenticated;
REVOKE ALL ON FUNCTION public.mi_familia_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mi_familia_id() TO authenticated;

ALTER TABLE public.familias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS familias_insert ON public.familias;
DROP POLICY IF EXISTS familias_select ON public.familias;
DROP POLICY IF EXISTS familias_select_current_member ON public.familias;

CREATE POLICY familias_select_current_member
ON public.familias
FOR SELECT
TO authenticated
USING (id = public.mi_familia_id());

REVOKE ALL ON TABLE public.familias FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.familias TO authenticated;

COMMIT;
