import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOG_PATH = path.join(process.cwd(), 'screenshots', 'betatester', 'night_stress_results.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runIntensiveStressLoop() {
  console.log('🌙 [Familia González/Gómez] Iniciando sesión intensiva nocturna de estrés...');

  const results = {
    startedAt: new Date().toISOString(),
    cyclesCompleted: 0,
    totalActions: 0,
    errorsFound: [],
    anomalies: [],
    latencyLog: [],
    lastCycleAt: null,
    status: 'ACTIVE_TESTING',
  };

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(results, null, 2));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=412,915'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      console.warn(`[Browser Error] ${txt}`);
      results.errorsFound.push({ type: 'CONSOLE_ERROR', message: txt, time: new Date().toISOString() });
    }
  });

  page.on('pageerror', (err) => {
    console.warn(`[Page Error] ${err.message}`);
    results.errorsFound.push({ type: 'PAGE_EXCEPTION', message: err.message, time: new Date().toISOString() });
  });

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  try {
    // Registro inicial de la Familia González para pruebas de estrés
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#btn-auth-mode', { visible: true });
    await page.click('#btn-auth-mode');
    await sleep(300);

    const testEmail = `familia.gonzalez.${Date.now()}@tribuapp.test`;
    await page.type('#email', testEmail);
    await page.type('#password', 'FamiliaGonzalez2026!');
    await page.click('#auth-form button[type="submit"]');

    await page.waitForFunction(
      () => {
        const onboarding = document.getElementById('onboarding-view');
        const app = document.getElementById('app-view');
        return (onboarding && !onboarding.classList.contains('hidden')) || (app && !app.classList.contains('hidden'));
      },
      { timeout: 15000 }
    );
    await sleep(600);

    const inOnboarding = await page.evaluate(() => {
      const ob = document.getElementById('onboarding-view');
      return ob && !ob.classList.contains('hidden');
    });

    if (inOnboarding) {
      const tabCreate = await page.$('#tab-create-tribu');
      if (tabCreate) await tabCreate.click();
      await sleep(300);
      await page.type('#tribu-nombre', 'Familia González');
      await page.select('#tribu-dieta', 'Mediterránea');
      await page.select('#tribu-flexibilidad', 'Flexible');
      await page.evaluate(() => document.getElementById('btn-onboarding')?.click());
      await page.waitForSelector('#app-view:not(.hidden)', { timeout: 15000 });
      await sleep(800);
    }
    console.log('✅ Familia González dada de alta correctamente. Iniciando bucle intensivo...');

    // Ejecutar rondas continuas de estrés
    for (let cycle = 1; cycle <= 15; cycle++) {
      console.log(`\n🔄 [Ciclo ${cycle}/15] Ejecutando pruebas de uso intensivo...`);
      const cycleStart = Date.now();

      // 1. Estrés en Menús
      await page.evaluate(() => {
        document.querySelectorAll('.toast, .toast-container').forEach(el => el.remove());
        document.querySelector('button[data-target="menus"]')?.click();
      });
      await page.waitForSelector('#btn-open-ai-menu, #menu-day-carousel', { timeout: 10000 });
      results.totalActions++;

      // Generar o cambiar platos
      const swapBtn = await page.$('[data-swap-menu]');
      if (swapBtn) {
        await swapBtn.click();
        await sleep(600);
        await page.evaluate(() => document.getElementById('modal-container')?.classList.add('hidden'));
        results.totalActions++;
      }

      // Probar modal "¿Qué cocino hoy? (Nevera)"
      const fridgeBtn = await page.$('#btn-open-fridge');
      if (fridgeBtn) {
        await fridgeBtn.click();
        await sleep(500);
        await page.evaluate(() => document.getElementById('modal-container')?.classList.add('hidden'));
        results.totalActions++;
      }

      // 2. Estrés en Lista de Compra
      await page.evaluate(() => {
        document.querySelectorAll('.toast, .toast-container').forEach(el => el.remove());
        document.querySelector('button[data-target="compra"]')?.click();
      });
      await page.waitForSelector('#btn-open-supermarket, #btn-agregar-compra', { timeout: 10000 });
      results.totalActions++;

      // Añadir 3 productos de prueba en ráfaga
      const sampleItems = [
        { name: `Manzanas Fuji (Ciclo ${cycle})`, qty: '1.5 kg' },
        { name: `Papel de cocina (Ciclo ${cycle})`, qty: '2 rollos' },
        { name: `Yogures naturales (Ciclo ${cycle})`, qty: '1 pack' },
      ];

      for (const item of sampleItems) {
        await page.evaluate(() => {
          const btn = document.getElementById('btn-agregar-compra');
          if (btn) btn.click();
          const form = document.getElementById('shop-form');
          if (form) form.classList.remove('hidden');
        });
        await page.waitForSelector('#nueva-compra', { visible: true, timeout: 5000 });
        await page.type('#nueva-compra', item.name);
        await page.type('#nueva-compra-cantidad', item.qty);
        await page.evaluate(() => document.querySelector('#shop-form button[type="submit"]')?.click());
        await sleep(400);
        results.totalActions++;
      }

      // Probar Modo Supermercado rápido
      await page.evaluate(() => document.getElementById('btn-open-supermarket')?.click());
      await page.waitForSelector('#supermarket-modal', { timeout: 5000 });
      await sleep(300);

      // Marcar 1 artículo y salir
      await page.evaluate(() => {
        const toggle = document.querySelector('#supermarket-modal [data-sm-toggle]');
        if (toggle) toggle.click();
      });
      await sleep(300);
      await page.evaluate(() => {
        document.getElementById('btn-close-sm')?.click();
        document.getElementById('supermarket-modal')?.remove();
      });
      await sleep(400);
      results.totalActions += 2;

      // 3. Estrés en Tareas del Hogar y Gamificación
      await page.evaluate(() => {
        document.querySelectorAll('.toast, .toast-container').forEach(el => el.remove());
        document.querySelector('button[data-target="tareas"]')?.click();
      });
      await page.waitForSelector('#form-nueva-tarea', { timeout: 12000 });
      results.totalActions++;

      // Crear tarea de estrés
      await page.evaluate(() => {
        const form = document.getElementById('form-nueva-tarea');
        if (form) form.classList.remove('hidden');
      });
      await page.waitForSelector('#nueva-tarea-nombre', { visible: true, timeout: 5000 });
      await page.type('#nueva-tarea-nombre', `Repasar deberes con Lucas (Ronda ${cycle})`);
      await page.select('#nueva-tarea-recurrencia', 'Diaria');
      await page.evaluate(() => document.getElementById('btn-guardar-tarea')?.click());
      await page.waitForSelector('[data-complete-task]', { timeout: 8000 });
      await sleep(400);
      results.totalActions += 2;

      // Completar la tarea y probar confeti + podio
      await page.evaluate(() => {
        const btn = document.querySelector('[data-complete-task]');
        if (btn) btn.click();
      });
      await sleep(600);
      results.totalActions++;

      // Alternar filtro ocultar completadas
      await page.evaluate(() => {
        const chk = document.getElementById('chk-hide-completed');
        if (chk) chk.click();
      });
      await sleep(300);
      await page.evaluate(() => {
        const chk = document.getElementById('chk-hide-completed');
        if (chk) chk.click();
      });
      await sleep(300);
      results.totalActions += 2;

      // 4. Estrés en Dashboard
      await page.evaluate(() => {
        document.querySelectorAll('.toast, .toast-container').forEach(el => el.remove());
        document.querySelector('button[data-target="dashboard"]')?.click();
      });
      await page.waitForSelector('.metric-card, .dashboard-grid', { timeout: 10000 });
      results.totalActions++;

      const cycleDuration = Date.now() - cycleStart;
      results.cyclesCompleted = cycle;
      results.lastCycleAt = new Date().toISOString();
      results.latencyLog.push({ cycle, durationMs: cycleDuration });

      console.log(`✨ [Ciclo ${cycle}] completado en ${(cycleDuration / 1000).toFixed(1)}s (Total acciones acumuladas: ${results.totalActions})`);

      // Guardar progreso periódicamente en disco
      fs.writeFileSync(LOG_PATH, JSON.stringify(results, null, 2));

      // Pequeña pausa entre ráfagas
      await sleep(1500);
    }

    results.status = 'COMPLETED_SUCCESSFULLY';
    results.completedAt = new Date().toISOString();
    fs.writeFileSync(LOG_PATH, JSON.stringify(results, null, 2));
    console.log(`\n🎉 Pruebas intensivas completadas. ${results.cyclesCompleted} ciclos, ${results.totalActions} acciones, ${results.errorsFound.length} errores.`);

  } catch (err) {
    console.error('❌ Excepción en prueba intensiva:', err);
    results.status = 'EXCEPTION_HALTED';
    results.errorsFound.push({ type: 'FATAL_EXCEPTION', message: err.message, stack: err.stack });
    fs.writeFileSync(LOG_PATH, JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

runIntensiveStressLoop();
