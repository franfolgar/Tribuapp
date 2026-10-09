-- Resolve the output parameter/column name collision in membership RPCs.
BEGIN;

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

CREATE OR REPLACE FUNCTION public.aceptar_invitacion_familia(p_token uuid, p_nombre text)
RETURNS TABLE (id uuid, familia_id uuid, nombre text, rol text, familia_nombre text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
#variable_conflict use_column
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

COMMIT;
