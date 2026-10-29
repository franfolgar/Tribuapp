import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const SUPABASE_HOST = 'skdlkrcdwhxfuwukvoce.supabase.co';

// Lista blanca de ficheros públicos: nada más del repositorio se sirve
// (ni .git, ni server.js, ni scripts, docs, screenshots, supabase...).
const ARCHIVOS_PUBLICOS = new Set([
  'index.html',
  'app.js',
  'style.css',
  'sw.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable.png',
  'apple-touch-icon.png',
  'register-sw.js',
  'vendor/supabase-js.mjs' // supabase-js empaquetado localmente (mismo origen, sin CDN)
]);

// Hashes de los <script> inline de index.html para permitirlos en la CSP
// sin recurrir a 'unsafe-inline'. Se calculan al arrancar.
function hashesScriptsInline() {
  try {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const hashes = [];
    for (const match of html.matchAll(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      if (!match[1].trim()) continue;
      const hash = crypto.createHash('sha256').update(match[1], 'utf8').digest('base64');
      hashes.push(`'sha256-${hash}'`);
    }
    return hashes;
  } catch (error) {
    console.warn('No se pudo leer index.html para calcular la CSP:', error.message);
    return [];
  }
}

// style-src necesita 'unsafe-inline': index.html y app.js usan muchos atributos style="..."
const CSP = [
  "default-src 'self'",
  `script-src 'self' ${hashesScriptsInline().join(' ')}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST}`,
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');

// Middleware de cabeceras de seguridad
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=()');
  next();
});

// No hay API en este servidor (la IA va por la Edge Function de Supabase)
app.all(['/api', '/api/*'], (req, res) => {
  res.status(404).json({ error: 'No encontrado.' });
});

function cabecerasEstaticas(res, filePath) {
  const nombre = path.basename(filePath);
  if (nombre === 'manifest.json') {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  } else if (/\.m?js$/.test(nombre)) {
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  }
  if (nombre === 'sw.js' || nombre === 'index.html') {
    res.setHeader('Cache-Control', 'no-cache');
  }
}

const opcionesEstaticas = {
  dotfiles: 'deny',
  index: false,
  redirect: false,
  setHeaders: cabecerasEstaticas
};

const servirRaiz = express.static(__dirname, opcionesEstaticas);

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const nombre = req.path === '/' ? 'index.html' : req.path.slice(1);
  if (!ARCHIVOS_PUBLICOS.has(nombre)) return next();
  if (req.path === '/') req.url = '/index.html';
  servirRaiz(req, res, next);
});


// Fallback SPA: sólo navegaciones (GET que aceptan HTML) a rutas sin extensión
app.get('*', (req, res, next) => {
  const aceptaHtml = (req.headers.accept || '').includes('text/html');
  const sinExtension = path.extname(req.path) === '';
  if (!aceptaHtml || !sinExtension || req.path.includes('/.')) return next();
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use((req, res) => {
  res.status(404).type('text/plain').send('No encontrado.');
});

// Manejador final: respuesta genérica, sin stack ni detalles internos
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = Number(err.status || err.statusCode);
  const codigo = status >= 400 && status < 500 ? status : 500;
  if (codigo >= 500) console.error('Error en el servidor:', err.message);
  res.status(codigo).json({ error: codigo >= 500 ? 'Error interno del servidor.' : 'Solicitud no válida.' });
});

app.listen(PORT, HOST, () => {
  console.log(`Tribuapp is running on http://${HOST}:${PORT}`);
});
