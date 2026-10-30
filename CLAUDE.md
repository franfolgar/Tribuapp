@AGENTS.md

# Tribuapp

PWA de organización familiar: menú semanal, lista de la compra, tareas recurrentes y miembros de la familia. Frontend vanilla JS (`index.html`, `app.js`, `style.css`, `sw.js`, `manifest.json`) sobre Supabase. Servidor Express (`server.js`) que sólo sirve la app; la IA va por la Edge Function de Supabase.

## Comandos
- `npm install`
- `npm run dev`: `node --env-file-if-exists=.env server.js`
- `npm run lint`: `node --check app.js server.js`
- Pruebas E2E con Puppeteer: `node scripts/family-betatester.js`, `scripts/intensive-night-tester.js`, `scripts/multi-agent-testing.js`. Las capturas y los resultados van a `screenshots/`. Último informe: `docs/informe_betatester_familia_gomez.md`.

## Backend
- `server.js` sólo sirve estáticos de una lista blanca (index.html, app.js, style.css, sw.js, manifest.json, iconos y `/vendor/`) con CSP y cabeceras de seguridad. No tiene API: `/api/*` responde 404. Las rutas sin extensión que piden HTML caen en index.html (SPA). Si añades un fichero público, añádelo a `ARCHIVOS_PUBLICOS`; si añades un `<script>` inline a index.html, su hash se calcula al arrancar.
- La IA (menú semanal, cambiar plato, receta paso a paso, recetas de nevera) va por la Edge Function `generate-menu`, que exige usuario con familia y usa el secreto `GEMINI_API_KEY` de Supabase; sin clave o si Gemini falla devuelve contenido curado.
- Supabase: `supabase/migrations/` (RLS de familias, invitaciones, menú y compra, tareas) y la Edge Function `supabase/functions/generate-menu`.
- `app.js` lleva la URL y la *anon key* de Supabase. Son públicas por diseño: la seguridad depende de las políticas RLS. No pongas nunca la *service role key* en el frontend.

## Configuración
`.env` (no versionado): `PORT`. `GEMINI_API_KEY` es un secreto de la Edge Function en Supabase, no del servidor.
`vendor/supabase-js.mjs` es supabase-js empaquetado con versión fija; `vendor/README.md` explica cómo regenerarlo.

## Notas
- Repo **público**.
