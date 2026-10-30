# vendor/

Dependencias de terceros servidas desde el propio origen (sin CDN), para que la
app arranque sin conexión y no dependa de jsdelivr.

| Fichero | Paquete | Versión exacta | Licencia |
| --- | --- | --- | --- |
| `supabase-js.mjs` | `@supabase/supabase-js` (con auth-js, postgrest-js, realtime-js, storage-js y functions-js 2.118.0) | 2.118.0 | MIT |

`supabase-js.mjs` es un módulo ES autocontenido (sin imports externos) que sólo
exporta `createClient`, que es lo único que usa `app.js`.

## Cómo regenerarlo

```bash
tmp=$(mktemp -d) && cd "$tmp"
npm init -y >/dev/null
npm install --save-exact @supabase/supabase-js@2.118.0
printf "export { createClient } from '@supabase/supabase-js';\n" > entry.mjs
npx esbuild@0.24.0 entry.mjs --bundle --format=esm --minify --target=es2020 \
  --platform=browser --legal-comments=none --outfile=supabase-js.mjs
# Copia supabase-js.mjs a vendor/ conservando la primera línea de comentario
# con la versión, y sube CACHE_NAME en sw.js para que los clientes lo renueven.
```

Al cambiar de versión, actualiza esta tabla y el comentario de cabecera del fichero.
