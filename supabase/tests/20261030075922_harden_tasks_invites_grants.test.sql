-- ===================== PRUEBAS (dentro de la transacción) =====================
CREATE TABLE public._sg01_r (prueba text, resultado text);
ALTER TABLE public._sg01_r DISABLE ROW LEVEL SECURITY;
GRANT INSERT, SELECT ON public._sg01_r TO authenticated, anon;

-- Elige usuarios reales de la base de datos (sin identificadores fijos en el repo):
-- F1 y F3: familias con un Admin y un Usuario; B: alguien de una tercera familia (F2).
DO $$
DECLARE r record; n int := 0;
BEGIN
  FOR r IN
    SELECT familia_id,
           (array_agg(id ORDER BY id) FILTER (WHERE rol = 'Admin'))[1] AS a,
           (array_agg(id ORDER BY id) FILTER (WHERE rol = 'Usuario'))[1] AS u
    FROM usuarios WHERE familia_id IS NOT NULL
    GROUP BY familia_id
    HAVING count(*) FILTER (WHERE rol = 'Admin') > 0 AND count(*) FILTER (WHERE rol = 'Usuario') > 0
    ORDER BY familia_id LIMIT 2
  LOOP
    n := n + 1;
    IF n = 1 THEN
      PERFORM set_config('t.F1', r.familia_id::text, true), set_config('t.A', r.a::text, true), set_config('t.U', r.u::text, true);
    ELSE
      PERFORM set_config('t.F3', r.familia_id::text, true), set_config('t.A2', r.a::text, true), set_config('t.U2', r.u::text, true);
    END IF;
  END LOOP;
  IF n < 2 THEN RAISE EXCEPTION 'Hacen falta dos familias con Admin y Usuario para las pruebas.'; END IF;
  SELECT id, familia_id INTO r FROM usuarios
  WHERE familia_id IS NOT NULL AND familia_id NOT IN (current_setting('t.F1')::uuid, current_setting('t.F3')::uuid)
  ORDER BY id LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Hace falta un usuario de una tercera familia para las pruebas.'; END IF;
  PERFORM set_config('t.B', r.id::text, true), set_config('t.F2', r.familia_id::text, true);
END $$;

DO $$
DECLARE c1 uuid; cg uuid; c2 uuid; hoy date := (now() AT TIME ZONE 'Europe/Madrid')::date; v uuid;
BEGIN
  INSERT INTO tareas_catalogo (familia_id, nombre) VALUES (current_setting('t.F1')::uuid, 'SG01 prueba') RETURNING id INTO c1;
  INSERT INTO tareas_catalogo (familia_id, nombre) VALUES (NULL, 'SG01 global') RETURNING id INTO cg;
  INSERT INTO tareas_catalogo (familia_id, nombre) VALUES (current_setting('t.F2')::uuid, 'SG01 otra familia') RETURNING id INTO c2;
  PERFORM set_config('t.cg', cg::text, true); PERFORM set_config('t.c2', c2::text, true);
  INSERT INTO tareas_asignadas (familia_id, tarea_id, asignado_a, fecha_objetivo, recurrencia) VALUES (current_setting('t.F1')::uuid, c1, current_setting('t.A')::uuid, hoy, 'Diaria') RETURNING id INTO v;
  PERFORM set_config('t.diaria', v::text, true);
  INSERT INTO tareas_asignadas (familia_id, tarea_id, asignado_a, fecha_objetivo, recurrencia) VALUES (current_setting('t.F1')::uuid, c1, current_setting('t.A')::uuid, hoy - 10, 'Semanal') RETURNING id INTO v;
  PERFORM set_config('t.atrasada', v::text, true);
  INSERT INTO tareas_asignadas (familia_id, tarea_id, asignado_a, fecha_objetivo, recurrencia) VALUES (current_setting('t.F1')::uuid, c1, current_setting('t.U')::uuid, date '2027-01-31', 'Mensual') RETURNING id INTO v;
  PERFORM set_config('t.mensual', v::text, true);
  INSERT INTO tareas_asignadas (familia_id, tarea_id, asignado_a, fecha_objetivo, recurrencia) VALUES (current_setting('t.F1')::uuid, c1, current_setting('t.A')::uuid, hoy, 'Puntual') RETURNING id INTO v;
  PERFORM set_config('t.vieja', v::text, true);
  INSERT INTO tareas_asignadas (familia_id, tarea_id, asignado_a, fecha_objetivo, recurrencia) VALUES (current_setting('t.F1')::uuid, c1, current_setting('t.U')::uuid, hoy + 3, 'Puntual');
  INSERT INTO tareas_asignadas (familia_id, tarea_id, asignado_a, fecha_objetivo, recurrencia) VALUES (current_setting('t.F2')::uuid, c2, current_setting('t.B')::uuid, hoy, 'Puntual') RETURNING id INTO v;
  PERFORM set_config('t.ajena', v::text, true);
END $$;

-- ---------- Como A (admin F1) ----------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.A'), 'role', 'authenticated')::text, true);
DO $$
DECLARE r jsonb; r2 jsonb; n int; hoy date := (now() AT TIME ZONE 'Europe/Madrid')::date;
BEGIN
  r := completar_tarea(current_setting('t.diaria')::uuid);
  INSERT INTO _sg01_r VALUES ('01 diaria 1a vez', r::text || ' esperado siguiente=' || (hoy + 1));
  r := completar_tarea(current_setting('t.diaria')::uuid);
  INSERT INTO _sg01_r VALUES ('02 diaria 2a vez', r::text);
  r := completar_tarea(current_setting('t.atrasada')::uuid);
  INSERT INTO _sg01_r VALUES ('03 semanal atrasada (hoy-10)', r::text || ' hoy=' || hoy || ' siguiente>hoy=' || ((r->>'siguiente_fecha')::date > hoy));
  r := completar_tarea(current_setting('t.mensual')::uuid);
  r2 := completar_tarea((r->>'siguiente_id')::uuid);
  INSERT INTO _sg01_r VALUES ('04 mensual 31-ene-2027', r::text || ' -> ' || r2::text);
  r := completar_tarea(current_setting('t.ajena')::uuid);
  INSERT INTO _sg01_r VALUES ('05 tarea de otra familia', r::text);
  INSERT INTO _sg01_r SELECT '06 puntos_familia F1', coalesce(json_agg(p)::text, '[]') FROM puntos_familia() p;
  UPDATE tareas_catalogo SET nombre = 'hack' WHERE id = current_setting('t.cg')::uuid; GET DIAGNOSTICS n = ROW_COUNT;
  INSERT INTO _sg01_r VALUES ('07 UPDATE catalogo global', n || ' filas');
  DELETE FROM tareas_catalogo WHERE id = current_setting('t.cg')::uuid; GET DIAGNOSTICS n = ROW_COUNT;
  INSERT INTO _sg01_r VALUES ('08 DELETE catalogo global', n || ' filas');
  UPDATE tareas_catalogo SET nombre = 'hack' WHERE id = current_setting('t.c2')::uuid; GET DIAGNOSTICS n = ROW_COUNT;
  INSERT INTO _sg01_r VALUES ('09 UPDATE catalogo otra familia', n || ' filas');
  DELETE FROM tareas_catalogo WHERE id = current_setting('t.c2')::uuid; GET DIAGNOSTICS n = ROW_COUNT;
  INSERT INTO _sg01_r VALUES ('10 DELETE catalogo otra familia', n || ' filas');
  SELECT count(*) INTO n FROM tareas_catalogo WHERE id = current_setting('t.cg')::uuid;
  INSERT INTO _sg01_r VALUES ('11 SELECT catalogo global visible', n || ' filas');
END $$;
DO $$ BEGIN
  INSERT INTO tareas_catalogo (familia_id, nombre) VALUES (NULL, 'SG01 hack global');
  INSERT INTO _sg01_r VALUES ('12 INSERT catalogo familia_id NULL', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('12 INSERT catalogo familia_id NULL', 'rechazado: ' || SQLERRM); END $$;
DO $$ BEGIN
  TRUNCATE tareas_catalogo;
  INSERT INTO _sg01_r VALUES ('13 TRUNCATE como authenticated', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('13 TRUNCATE como authenticated', 'rechazado: ' || SQLERRM); END $$;
DO $$ DECLARE t uuid; BEGIN
  SELECT token INTO t FROM crear_invitacion_familia(current_setting('t.F1')::uuid);
  PERFORM set_config('t.tok1', t::text, true);
  INSERT INTO _sg01_r VALUES ('14 A crea invitacion F1', 'ok');
END $$;

-- ---------- Como U: cliente antiguo completa con UPDATE directo ----------
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.U'), 'role', 'authenticated')::text, true);
DO $$ DECLARE r record; BEGIN
  UPDATE tareas_asignadas SET estado = 'Completada', completado_por = current_setting('t.A')::uuid WHERE id = current_setting('t.vieja')::uuid;
  SELECT completado_por = current_setting('t.U')::uuid AS por_u, completado_en IS NOT NULL AS con_fecha INTO r FROM tareas_asignadas WHERE id = current_setting('t.vieja')::uuid;
  INSERT INTO _sg01_r VALUES ('15 UPDATE directo (cliente viejo) intentando atribuir a A', 'completado_por=U: ' || r.por_u || ', completado_en: ' || r.con_fecha);
  INSERT INTO _sg01_r SELECT '16 puntos_familia tras 15', json_agg(p)::text FROM puntos_familia() p;
  INSERT INTO _sg01_r VALUES ('17 U ve tok1 (ya miembro)', ver_invitacion_familia(current_setting('t.tok1')::uuid)::text);
END $$;
DO $$ BEGIN
  PERFORM revocar_invitaciones_familia(current_setting('t.F1')::uuid);
  INSERT INTO _sg01_r VALUES ('18 U (no admin) revoca', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('18 U (no admin) revoca', 'rechazado: ' || SQLERRM); END $$;

-- ---------- A2 crea tok3 y quita a U2 de F3 ----------
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.A2'), 'role', 'authenticated')::text, true);
DO $$ DECLARE t uuid; BEGIN
  SELECT token INTO t FROM crear_invitacion_familia(current_setting('t.F3')::uuid);
  PERFORM set_config('t.tok3', t::text, true);
  INSERT INTO _sg01_r VALUES ('19 A2 quita a U2', quitar_miembro_familia(current_setting('t.U2')::uuid)::text);
END $$;

SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.U2'), 'role', 'authenticated')::text, true);
DO $$ BEGIN
  INSERT INTO _sg01_r VALUES ('21 U2 ve tok3 (revocada al expulsarle)', ver_invitacion_familia(current_setting('t.tok3')::uuid)::text);
  INSERT INTO _sg01_r VALUES ('22 U2 ve tok1 (F1)', ver_invitacion_familia(current_setting('t.tok1')::uuid)::text);
  INSERT INTO _sg01_r VALUES ('23 U2 ve token inexistente', ver_invitacion_familia(gen_random_uuid())::text);
END $$;
DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM aceptar_invitacion_familia(current_setting('t.tok3')::uuid, 'U2');
  INSERT INTO _sg01_r VALUES ('24 U2 acepta tok3 revocada', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('24 U2 acepta tok3 revocada', 'rechazado: ' || SQLERRM); END $$;

SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.A2'), 'role', 'authenticated')::text, true);
DO $$ DECLARE t uuid; BEGIN
  SELECT token INTO t FROM crear_invitacion_familia(current_setting('t.F3')::uuid);
  PERFORM set_config('t.tok4', t::text, true);
END $$;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.U2'), 'role', 'authenticated')::text, true);
DO $$ DECLARE r record; BEGIN
  INSERT INTO _sg01_r VALUES ('25 U2 ve tok4 nueva de F3', ver_invitacion_familia(current_setting('t.tok4')::uuid)::text);
END $$;
DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM aceptar_invitacion_familia(current_setting('t.tok4')::uuid, 'U2');
  INSERT INTO _sg01_r VALUES ('26 U2 expulsado acepta tok4', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('26 U2 expulsado acepta tok4', 'rechazado: ' || SQLERRM); END $$;

RESET ROLE;
UPDATE invitaciones_familia SET max_usos = 1 WHERE token = current_setting('t.tok1')::uuid;
UPDATE usuarios SET familia_id = NULL, rol = 'Usuario' WHERE id = current_setting('t.B')::uuid;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.U2'), 'role', 'authenticated')::text, true);
DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM aceptar_invitacion_familia(current_setting('t.tok1')::uuid, 'Invitado U2');
  INSERT INTO _sg01_r VALUES ('27 U2 acepta tok1 (F1, max_usos=1)', row_to_json(r)::text);
  INSERT INTO _sg01_r VALUES ('28 U2 ve tok1 tras unirse', ver_invitacion_familia(current_setting('t.tok1')::uuid)::text);
  SELECT * INTO r FROM aceptar_invitacion_familia(current_setting('t.tok1')::uuid, 'U2 renombrado');
  INSERT INTO _sg01_r VALUES ('29 U2 re-acepta tok1 siendo miembro', row_to_json(r)::text);
END $$;
RESET ROLE;
INSERT INTO _sg01_r SELECT '30 usos tok1', usos || '/' || max_usos FROM invitaciones_familia WHERE token = current_setting('t.tok1')::uuid;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.B'), 'role', 'authenticated')::text, true);
DO $$ BEGIN
  INSERT INTO _sg01_r VALUES ('31 B (sin familia) ve tok1 agotada', ver_invitacion_familia(current_setting('t.tok1')::uuid)::text);
END $$;
DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM aceptar_invitacion_familia(current_setting('t.tok1')::uuid, 'B');
  INSERT INTO _sg01_r VALUES ('32 B acepta tok1 agotada', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('32 B acepta tok1 agotada', 'rechazado: ' || SQLERRM); END $$;

SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.A'), 'role', 'authenticated')::text, true);
DO $$ DECLARE t uuid; n int; BEGIN
  SELECT token INTO t FROM crear_invitacion_familia(current_setting('t.F1')::uuid);
  PERFORM set_config('t.tok5', t::text, true);
  n := revocar_invitaciones_familia(current_setting('t.F1')::uuid);
  INSERT INTO _sg01_r VALUES ('33 A revoca invitaciones F1', n || ' revocadas');
  INSERT INTO _sg01_r SELECT '34 A ve miembros F1', json_agg(json_build_object('nombre', nombre, 'rol', rol))::text FROM usuarios WHERE familia_id = current_setting('t.F1')::uuid;
  INSERT INTO _sg01_r VALUES ('35 A quita a U', quitar_miembro_familia(current_setting('t.U')::uuid)::text);
  SELECT token INTO t FROM crear_invitacion_familia(current_setting('t.F1')::uuid);
  PERFORM set_config('t.tok6', t::text, true);
END $$;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.B'), 'role', 'authenticated')::text, true);
DO $$ BEGIN
  INSERT INTO _sg01_r VALUES ('36 B ve tok5 revocada', ver_invitacion_familia(current_setting('t.tok5')::uuid)::text);
  INSERT INTO _sg01_r VALUES ('36b B ve tok6 nueva tras revocar', ver_invitacion_familia(current_setting('t.tok6')::uuid)::text);
END $$;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.U'), 'role', 'authenticated')::text, true);
DO $$ BEGIN
  INSERT INTO _sg01_r VALUES ('37 U (expulsado de F1) ve tok6', ver_invitacion_familia(current_setting('t.tok6')::uuid)::text);
END $$;
DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM aceptar_invitacion_familia(current_setting('t.tok6')::uuid, 'U');
  INSERT INTO _sg01_r VALUES ('38 U expulsado acepta tok6', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('38 U expulsado acepta tok6', 'rechazado: ' || SQLERRM); END $$;
DO $$ BEGIN
  INSERT INTO _sg01_r SELECT '39 U lee familias_expulsados', count(*)::text FROM familias_expulsados;
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('39 U lee familias_expulsados', 'rechazado: ' || SQLERRM); END $$;

RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
DO $$ BEGIN PERFORM soy_admin(); INSERT INTO _sg01_r VALUES ('40 anon soy_admin()', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('40 anon soy_admin()', 'rechazado: ' || SQLERRM); END $$;
DO $$ BEGIN PERFORM ver_invitacion_familia(gen_random_uuid()); INSERT INTO _sg01_r VALUES ('41 anon ver_invitacion_familia', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('41 anon ver_invitacion_familia', 'rechazado: ' || SQLERRM); END $$;
DO $$ BEGIN TRUNCATE familias_compras; INSERT INTO _sg01_r VALUES ('42 anon TRUNCATE familias_compras', 'PERMITIDO (mal)');
EXCEPTION WHEN OTHERS THEN INSERT INTO _sg01_r VALUES ('42 anon TRUNCATE familias_compras', 'rechazado: ' || SQLERRM); END $$;
RESET ROLE;

INSERT INTO _sg01_r SELECT '43 funciones public ejecutables por anon', coalesce(string_agg(p.proname, ','), 'ninguna')
  FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace AND has_function_privilege('anon', p.oid, 'EXECUTE');
INSERT INTO _sg01_r SELECT '44 privilegios de anon en tablas public', coalesce(string_agg(table_name || ':' || privilege_type, ','), 'ninguno')
  FROM information_schema.role_table_grants WHERE table_schema = 'public' AND grantee = 'anon' AND table_name <> '_sg01_r';
INSERT INTO _sg01_r SELECT '45 privilegios de authenticated', string_agg(table_name || ':' || p, ' ; ' ORDER BY table_name) FROM (
  SELECT table_name, string_agg(privilege_type, ',' ORDER BY privilege_type) p FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND grantee = 'authenticated' AND table_name <> '_sg01_r' GROUP BY 1) x;
INSERT INTO _sg01_r SELECT '46 politicas tareas_*/menus', string_agg(tablename || '.' || policyname || '(' || cmd || ',' || roles::text || ')', ' ; ' ORDER BY tablename, policyname)
  FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('tareas_catalogo', 'tareas_asignadas', 'menus');
INSERT INTO _sg01_r SELECT '47 realtime', string_agg(tablename, ',' ORDER BY tablename) FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
INSERT INTO _sg01_r SELECT '48 CHECKs longitud', string_agg(conname || ' valid=' || convalidated, ', ' ORDER BY conname) FROM pg_constraint WHERE conname LIKE '%longitudes_check';
INSERT INTO _sg01_r SELECT '49 familias_expulsados', 'rls=' || relrowsecurity || ' politicas=' || (SELECT count(*) FROM pg_policies WHERE tablename = 'familias_expulsados') || ' acl=' || coalesce(relacl::text, 'null') FROM pg_class WHERE oid = 'public.familias_expulsados'::regclass;
CREATE TABLE public._sg01_rls_check (id int);
INSERT INTO _sg01_r SELECT '50 rls_auto_enable sigue activando RLS', relrowsecurity::text FROM pg_class WHERE oid = 'public._sg01_rls_check'::regclass;
INSERT INTO _sg01_r SELECT '51 acl tabla nueva (default privileges)', coalesce(relacl::text, 'null (sólo dueño)') FROM pg_class WHERE oid = 'public._sg01_rls_check'::regclass;
INSERT INTO _sg01_r SELECT '52 tareas pendientes de U en F1 tras quitarle', count(*)::text FROM tareas_asignadas WHERE asignado_a = current_setting('t.U')::uuid AND familia_id = current_setting('t.F1')::uuid AND estado = 'Pendiente';

SELECT prueba, resultado FROM _sg01_r ORDER BY prueba;
