# Pruebas de migraciones contra la base de datos real, sin dejar cambios

Cada `*.test.sql` prueba la migración del mismo nombre dentro de una transacción que termina en `ROLLBACK`.
Simula usuarios con `SET LOCAL ROLE authenticated` y `request.jwt.claims`, y elige usuarios y familias existentes al vuelo.

Generar el SQL a ejecutar (por ejemplo, pegarlo en el SQL Editor de Supabase):

```bash
M=supabase/migrations/20261030075922_harden_tasks_invites_grants.sql
T=supabase/tests/20261030075922_harden_tasks_invites_grants.test.sql
{ echo "BEGIN;"; grep -vxE 'BEGIN;|COMMIT;' "$M"; cat "$T"; echo "ROLLBACK;"; } > /tmp/prueba.sql
```

El resultado es una tabla `prueba` / `resultado`; cualquier fila con «PERMITIDO (mal)» es un fallo.
