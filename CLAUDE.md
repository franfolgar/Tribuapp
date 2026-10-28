@AGENTS.md

# Tribuapp

PWA de organización familiar: menú semanal, lista de la compra, tareas recurrentes y miembros de la familia. Frontend vanilla JS (`index.html`, `app.js`, `style.css`, `sw.js`, `manifest.json`) sobre Supabase. Servidor Express (`server.js`) que sirve la app y hace de proxy a Gemini.

## Comandos
- `npm install`
- `npm run dev`: `node --env-file-if-exists=.env server.js`
- `npm run lint`: `node --check app.js server.js`
- Pruebas E2E con Puppeteer: `node scripts/family-betatester.js`, `scripts/intensive-night-tester.js`, `scripts/multi-agent-testing.js`. Las capturas y los resultados van a `screenshots/`. Último informe: `docs/informe_betatester_familia_gomez.md`.

## Backend
- Endpoints Express: `POST /api/gemini/generate-menu`, `POST /api/gemini/fridge-recipes`. Sin `GEMINI_API_KEY` devuelven contenido curado.
- Supabase: `supabase/migrations/` (RLS de familias, invitaciones, menú y compra, tareas) y la Edge Function `supabase/functions/generate-menu`.
- `app.js` lleva la URL y la *anon key* de Supabase. Son públicas por diseño: la seguridad depende de las políticas RLS. No pongas nunca la *service role key* en el frontend.

## Configuración
`.env` (no versionado): `PORT`, `GEMINI_API_KEY`.

## Notas
- Repo **público**.
