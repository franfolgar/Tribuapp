-- =============================================================================
-- Esquema base de Tribuapp (REFERENCIA, no es una migración)
-- =============================================================================
-- Estas tablas y funciones existen en producción (proyecto skdlkrcdwhxfuwukvoce)
-- desde antes de la primera migración del repo y se crearon a mano desde el
-- panel de Supabase. Se reproducen aquí, leídas de pg_catalog /
-- information_schema el 2026-10-29, para que el esquema sea auditable.
--
-- NO ejecutes este fichero contra producción: los objetos ya existen. Sirve
-- para levantar una base local (supabase start + este fichero + migraciones/).
-- Las migraciones de supabase/migrations/ se aplican encima en orden.
--
-- Estado anterior a 20261030075922_harden_tasks_invites_grants.sql: no incluye
-- las columnas completado_por/completado_en/dia_mes ni las de invitaciones.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tablas
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.familias (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    dieta_base text DEFAULT 'Mediterránea'::text,
    nivel_flexibilidad text DEFAULT 'Flexible'::text,
    creado_en timestamptz DEFAULT timezone('utc'::text, now()),
    CONSTRAINT familias_pkey PRIMARY KEY (id),
    CONSTRAINT familias_nivel_flexibilidad_check
        CHECK (nivel_flexibilidad = ANY (ARRAY['Estricta'::text, 'Flexible'::text]))
);

CREATE TABLE IF NOT EXISTS public.usuarios (
    id uuid NOT NULL,
    familia_id uuid,
    nombre text NOT NULL,
    rol text DEFAULT 'Usuario'::text,
    edad integer,
    avatar_url text,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT usuarios_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES public.familias(id) ON DELETE CASCADE,
    CONSTRAINT usuarios_rol_check CHECK (rol = ANY (ARRAY['Admin'::text, 'Usuario'::text]))
);

CREATE TABLE IF NOT EXISTS public.tareas_catalogo (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    familia_id uuid,  -- NULL = tarea del catálogo global (sólo lectura para los usuarios)
    nombre text NOT NULL,
    tiempo_estimado_minutos integer DEFAULT 15,
    descripcion text,
    recurrencia_sugerida text DEFAULT 'Puntual'::text,  -- añadida en 20261014133500
    CONSTRAINT tareas_catalogo_pkey PRIMARY KEY (id),
    CONSTRAINT tareas_catalogo_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES public.familias(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.tareas_asignadas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    familia_id uuid,
    tarea_id uuid,
    asignado_a uuid,
    fecha_objetivo date NOT NULL,
    estado text DEFAULT 'Pendiente'::text,
    puntuacion integer,
    actualizado_en timestamptz DEFAULT timezone('utc'::text, now()),
    recurrencia text DEFAULT 'Puntual'::text,  -- añadida en 20261014133500
    CONSTRAINT tareas_asignadas_pkey PRIMARY KEY (id),
    CONSTRAINT tareas_asignadas_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES public.familias(id) ON DELETE CASCADE,
    CONSTRAINT tareas_asignadas_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tareas_catalogo(id) ON DELETE CASCADE,
    CONSTRAINT tareas_asignadas_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES public.usuarios(id) ON DELETE SET NULL,
    CONSTRAINT tareas_asignadas_estado_check CHECK (estado = ANY (ARRAY['Pendiente'::text, 'Completada'::text])),
    CONSTRAINT tareas_asignadas_puntuacion_check CHECK (puntuacion >= 1 AND puntuacion <= 5)
);

-- Tabla antigua sin uso (0 filas). La app usa familias_menus.
CREATE TABLE IF NOT EXISTS public.menus (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    familia_id uuid,
    fecha date NOT NULL,
    tipo text,
    plato_principal text NOT NULL,
    ingredientes jsonb,
    feedback text,
    actualizado_en timestamptz DEFAULT timezone('utc'::text, now()),
    CONSTRAINT menus_pkey PRIMARY KEY (id),
    CONSTRAINT menus_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES public.familias(id) ON DELETE CASCADE,
    CONSTRAINT menus_familia_id_fecha_tipo_key UNIQUE (familia_id, fecha, tipo),
    CONSTRAINT menus_tipo_check CHECK (tipo = ANY (ARRAY['Comida'::text, 'Cena'::text])),
    CONSTRAINT menus_feedback_check CHECK (feedback = ANY (ARRAY['Bien'::text, 'Mal'::text, 'Neutro'::text]))
);

ALTER TABLE public.familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_asignadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Funciones auxiliares de RLS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.mi_familia_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT familia_id FROM usuarios WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.soy_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Admin');
$function$;

-- Creada en 20261009094000_secure_family_memberships.sql; se repite aquí
-- porque es una de las funciones base de las que dependen las RPC.
CREATE OR REPLACE FUNCTION public.usuario_es_admin_de_familia(p_familia_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.usuarios AS u
        WHERE u.id = auth.uid()
          AND u.familia_id = p_familia_id
          AND u.rol = 'Admin'
    );
$function$;

-- Event trigger de Supabase que activa RLS en toda tabla nueva de public.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

-- CREATE EVENT TRIGGER ensure_rls ON ddl_command_end EXECUTE FUNCTION public.rls_auto_enable();

-- -----------------------------------------------------------------------------
-- Políticas base que existían antes de las migraciones
-- (las migraciones posteriores las sustituyen o eliminan)
-- -----------------------------------------------------------------------------
-- menus:            menus_select (SELECT, public), menus_update_familia (UPDATE, public)
--                   USING (familia_id = mi_familia_id())
-- tareas_asignadas: tareas_asignadas_update_familia (UPDATE, public)
--                   USING (familia_id = mi_familia_id())
-- Las de familias, usuarios, tareas_catalogo y tareas_asignadas_all las
-- definen las migraciones 20261009094000 y 20261014133000.
--
-- Privilegios por defecto del rol postgres en public (pg_default_acl):
--   tablas:    anon/authenticated/service_role = Dxtm (TRUNCATE, REFERENCES,
--              TRIGGER, MAINTAIN). Por eso cada tabla nueva salía con esos
--              privilegios para anon. La migración 20261030075922 los retira.
--   funciones: sólo postgres=X (sin EXECUTE para PUBLIC).
