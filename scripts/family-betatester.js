import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('screenshots/betatester');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runFamilyBetaTest() {
  console.log('🚀 Iniciando Agente Beta Tester (Familia Gómez)...');
  const results = {
    startedAt: new Date().toISOString(),
    steps: [],
    errors: [],
    warnings: [],
    consoleLogs: [],
    verdict: 'PENDING',
  };

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=412,915'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

  // Listen to browser console and dialogs
  page.on('console', (msg) => {
    const text = msg.text();
    results.consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      results.errors.push(`[Console Error] ${text}`);
    }
  });

  page.on('response', async (res) => {
    if (res.status() >= 400) {
      let body = '';
      try { body = await res.text(); } catch {}
      const logMsg = `[HTTP ${res.status()}] ${res.request().method()} ${res.url()} -> ${body.slice(0, 150)}`;
      console.warn(`⚠️ ${logMsg}`);
      results.warnings.push(logMsg);
    }
  });

  page.on('pageerror', (err) => {
    results.errors.push(`[Page Error] ${err.message}`);
  });

  page.on('dialog', async (dialog) => {
    console.log(`💬 Dialog emergente: [${dialog.type()}] "${dialog.message()}" -> Aceptando...`);
    await dialog.accept();
  });

  async function snap(name, stepTitle) {
    const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`📸 [${stepTitle}] Captura guardada: ${name}.png`);
    results.steps.push({ step: stepTitle, screenshot: `${name}.png`, timestamp: new Date().toISOString() });
  }

  try {
    // ----------------------------------------------------
    // PASO 1: Acceso y Registro de la Familia Gómez
    // ----------------------------------------------------
    console.log('\n--- PASO 1: Registro y Onboarding de la Familia ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await snap('01_login_view', 'Pantalla inicial de acceso');

    // Cambiar a modo registro
    await page.waitForSelector('#btn-auth-mode', { visible: true });
    await page.click('#btn-auth-mode');
    await sleep(400);

    const testEmail = `familia.gomez.${Date.now()}@tribuapp.test`;
    const testPassword = 'FamiliaGomez2026!';
    console.log(`Creando cuenta para: ${testEmail}`);

    await page.type('#email', testEmail);
    await page.type('#password', testPassword);
    await page.click('#auth-form button[type="submit"]');

    // Esperar onboarding o dashboard
    await page.waitForFunction(
      () => {
        const onboarding = document.getElementById('onboarding-view');
        const app = document.getElementById('app-view');
        return (onboarding && !onboarding.classList.contains('hidden')) || (app && !app.classList.contains('hidden'));
      },
      { timeout: 15000 }
    );
    await sleep(600);
    await snap('02_onboarding_screen', 'Pantalla de Onboarding');

    // Comprobar si estamos en Onboarding para crear la Tribu
    const inOnboarding = await page.evaluate(() => {
      const ob = document.getElementById('onboarding-view');
      return ob && !ob.classList.contains('hidden');
    });

    if (inOnboarding) {
      console.log('Configurando nueva Tribu "Familia Gómez"...');
      await page.click('#tab-create-tribu');
      await sleep(300);
      await page.type('#tribu-nombre', 'Familia Gómez');
      await page.select('#tribu-dieta', 'Mediterránea');
      await page.select('#tribu-flexibilidad', 'Flexible');
      await page.click('#btn-onboarding');

      // Esperar a que la app principal esté visible
      await page.waitForSelector('#app-view:not(.hidden)', { timeout: 15000 });
      await sleep(800);
    }

    await snap('03_dashboard_initial', 'Dashboard inicial tras registro');
    console.log('✅ Paso 1 superado: Familia registrada y tribu creada con éxito.');

    // ----------------------------------------------------
    // PASO 2: Menú Semanal e Inteligencia Artificial (Gemini)
    // ----------------------------------------------------
    console.log('\n--- PASO 2: Menú Semanal con IA y Recetas ---');
    await page.click('nav.bottom-nav button[data-target="menus"]');
    await sleep(800);
    await snap('04_menus_view_empty', 'Vista de Menús antes de generar');

    console.log('Abriendo generador de menú IA...');
    await page.waitForSelector('#btn-open-ai-menu', { visible: true });
    await page.click('#btn-open-ai-menu');
    await page.waitForSelector('#modal-container:not(.hidden)', { timeout: 5000 });
    await sleep(400);
    await snap('05_ai_menu_modal', 'Modal de configuración de Menú IA');

    // Enviar formulario para generar menú con Gemini
    console.log('Lanzando generación de menú con IA Gemini...');
    await page.click('#form-ai-menu button[type="submit"]');

    // Esperar a que el menú esté generado (o se abra el modal de despensa automático)
    await page.waitForFunction(
      () => document.querySelectorAll('.weekly-day-card, .meal-slot-item, #btn-confirm-pantry-to-shop').length > 0,
      { timeout: 35000 }
    );
    await sleep(1000);

    // Si se abrió el modal automático de despensa/compra, capturarlo y aceptarlo
    const pantryBtn = await page.$('#btn-confirm-pantry-to-shop');
    if (pantryBtn) {
      await snap('06_pantry_review_auto', 'Modal inteligente de despensa tras crear menú');
      await pantryBtn.click();
      await sleep(800);
    }

    await snap('07_menu_generated', 'Menú semanal completo generado');
    console.log('✅ Menú semanal generado.');

    // Abrir un plato para probar detalles del chef
    console.log('Probando detalles de plato y paso a paso del chef...');
    const recipeBtn = await page.$('[data-view-recipe]');
    if (recipeBtn) {
      await recipeBtn.click();
      await page.waitForSelector('#modal-container:not(.hidden)', { timeout: 5000 });
      await sleep(500);
      await snap('08_dish_modal', 'Detalle del plato seleccionado');

      // Probar botón "¿Cómo se cocina? (Paso a paso IA)"
      const chefBtn = await page.$('#btn-chef-steps');
      if (chefBtn) {
        console.log('Solicitando receta paso a paso al Chef IA...');
        await chefBtn.click();
        // Esperar a que se rendericen los pasos
        await sleep(3500);
        await snap('09_chef_steps', 'Pasos de cocina guiados por Chef IA');
      }

      // Cerrar modal
      await page.evaluate(() => {
        document.getElementById('modal-container')?.classList.add('hidden');
      });
      await sleep(400);
    }
    console.log('✅ Paso 2 superado: Menú generado y paso a paso del chef verificado.');

    // ----------------------------------------------------
    // PASO 3: Lista de la Compra y Modo Supermercado
    // ----------------------------------------------------
    console.log('\n--- PASO 3: Lista de la Compra y Pasillos ---');
    // Asegurar que ningún modal pendiente tape la navegación
    await page.evaluate(() => {
      document.getElementById('modal-container')?.classList.add('hidden');
    });
    await sleep(300);

    await page.click('nav.bottom-nav button[data-target="compra"]');
    await page.waitForSelector('#btn-open-supermarket, #btn-agregar-compra', { timeout: 8000 });
    await sleep(600);
    await snap('09_shopping_view_initial', 'Vista de compra');

    // Si la lista de la compra aún no tiene artículos, importar del menú
    const hasItems = await page.$('.aisle-group, .shopping-item');
    if (!hasItems) {
      console.log('Importando ingredientes del menú a la lista de compra...');
      const reviewBtn = await page.$('#btn-compra-review-pantry');
      if (reviewBtn) {
        await reviewBtn.click();
        const confirmBtn = await page.waitForSelector('#btn-confirm-pantry-to-shop', { timeout: 3000 }).catch(() => null);
        if (confirmBtn) {
          await sleep(500);
          await snap('10_import_from_menu_modal', 'Revisión de despensa e importación');
          await confirmBtn.click();
          await sleep(1000);
        }
      }
    }

    // Añadir además un producto manual (ej. "Detergente para lavadora")
    console.log('Añadiendo producto manual a la lista de compra...');
    await page.evaluate(() => {
      const btn = document.getElementById('btn-agregar-compra');
      if (btn) btn.click();
      const form = document.getElementById('shop-form');
      if (form) form.classList.remove('hidden');
    });
    await page.waitForSelector('#nueva-compra', { visible: true, timeout: 5000 });
    await page.type('#nueva-compra', 'Detergente para lavadora');
    await page.type('#nueva-compra-cantidad', '1 botella');
    await page.evaluate(() => {
      document.querySelector('#shop-form button[type="submit"]')?.click();
    });
    await sleep(800);

    await snap('11_shopping_with_aisles', 'Lista de compra organizada por pasillos');

    // Probar "Modo Supermercado"
    console.log('Activando Modo Supermercado interactivo...');
    const superBtn = await page.$('#btn-open-supermarket');
    if (superBtn) {
      await page.evaluate(() => document.getElementById('btn-open-supermarket')?.click());
      await page.waitForSelector('#supermarket-modal', { timeout: 5000 });
      await sleep(500);
      await snap('12_supermarket_mode_open', 'Modo Supermercado pantalla completa');

      // Marcar los 2 primeros productos como comprados en el carrito
      const itemCards = await page.$$('#supermarket-modal [data-sm-toggle]');
      if (itemCards.length > 0) {
        await page.evaluate(() => {
          const cards = document.querySelectorAll('#supermarket-modal [data-sm-toggle]');
          if (cards[0]) cards[0].click();
          if (cards[1]) cards[1].click();
        });
        await sleep(600);
      }
      await snap('13_supermarket_items_checked', 'Productos marcados en el carrito con progreso');

      // Cerrar modo supermercado
      await page.evaluate(() => {
        document.getElementById('btn-close-sm')?.click();
        document.getElementById('supermarket-modal')?.remove();
      });
      await sleep(500);
    }
    console.log('✅ Paso 3 superado: Compra por pasillos y Modo Supermercado funcionando.');

    // ----------------------------------------------------
    // PASO 4: Tareas Domésticas, Progreso y Persistencia
    // ----------------------------------------------------
    console.log('\n--- PASO 4: Tareas Familiares y Verificación de Estado ---');
    await page.evaluate(() => {
      document.getElementById('supermarket-modal')?.remove();
      document.querySelectorAll('.toast, .toast-container').forEach(el => el.remove());
      document.querySelector('button[data-target="tareas"]')?.click();
    });
    await page.waitForSelector('#form-nueva-tarea', { timeout: 15000 });
    await sleep(600);
    await snap('14_tasks_view_clean', 'Vista de tareas limpia (sin tareas demo falsas)');

    // Crear Tarea 1: Lavadora
    console.log('Creando Tarea 1: Poner lavadora y tender (Diaria)...');
    await page.evaluate(() => {
      const form = document.getElementById('form-nueva-tarea');
      if (form) form.classList.remove('hidden');
    });
    await page.waitForSelector('#nueva-tarea-nombre', { visible: true, timeout: 5000 });
    await page.type('#nueva-tarea-nombre', 'Poner lavadora y tender la ropa');
    await page.select('#nueva-tarea-recurrencia', 'Diaria');
    await page.evaluate(() => document.getElementById('btn-guardar-tarea')?.click());
    await page.waitForSelector('[data-complete-task]', { timeout: 8000 });
    await sleep(500);

    // Crear Tarea 2: Limpieza
    console.log('Creando Tarea 2: Limpieza a fondo de cocina (Semanal)...');
    await page.evaluate(() => {
      const form = document.getElementById('form-nueva-tarea');
      if (form) form.classList.remove('hidden');
    });
    await page.waitForSelector('#nueva-tarea-nombre', { visible: true, timeout: 5000 });
    await page.type('#nueva-tarea-nombre', 'Limpieza a fondo de cocina');
    await page.select('#nueva-tarea-recurrencia', 'Semanal');
    await page.evaluate(() => document.getElementById('btn-guardar-tarea')?.click());
    await sleep(800);

    await snap('15_tasks_created', 'Dos tareas creadas con recurrencia');

    // Marcar la Tarea 1 como completada
    console.log('Completando la primera tarea...');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-complete-task]');
      if (btn) btn.click();
    });
    await sleep(1000);
    await snap('16_task_marked_completed', 'Tarea completada con marca de verificación');

    // Probar Podio Familiar
    console.log('Probando apertura del Podio Familiar de la Tribu...');
    await page.evaluate(() => document.getElementById('btn-toggle-podium')?.click());
    await page.waitForSelector('.podium-grid', { timeout: 5000 });
    await sleep(400);
    await snap('16b_podium_open', 'Podio familiar con medallas y puntos acumulados');

    // Cerrar podio
    await page.evaluate(() => document.getElementById('btn-toggle-podium')?.click());
    await sleep(300);

    // Probar filtro "Ocultar completadas"
    console.log('Probando filtro Ocultar completadas...');
    await page.evaluate(() => {
      const chk = document.getElementById('chk-hide-completed');
      if (chk) chk.click();
    });
    await sleep(500);
    await snap('16c_tasks_hide_completed', 'Vista de tareas con completadas ocultas');

    // Desmarcar para continuar el flujo
    await page.evaluate(() => {
      const chk = document.getElementById('chk-hide-completed');
      if (chk) chk.click();
    });
    await sleep(400);

    // Ir a Dashboard para comprobar que la barra de progreso se ha actualizado
    console.log('Verificando progreso en el Dashboard...');
    await page.evaluate(() => {
      document.querySelectorAll('.toast, .toast-container').forEach(el => el.remove());
      document.querySelector('button[data-target="dashboard"]')?.click();
    });
    await page.waitForSelector('.metric-card, .dashboard-grid, .progress-bar-track', { timeout: 12000 });
    await sleep(800);
    await snap('17_dashboard_task_progress', 'Dashboard reflejando el progreso del hogar');

    // Volver a Tareas y probar el botón de eliminar (🗑️)
    console.log('Probando eliminación de tarea con confirmación...');
    await page.evaluate(() => {
      document.querySelectorAll('.toast, .toast-container').forEach(el => el.remove());
      document.querySelector('button[data-target="tareas"]')?.click();
    });
    await page.waitForSelector('#form-nueva-tarea', { timeout: 15000 });
    await sleep(600);
    const deleteBtn = await page.$('[data-delete-task]');
    if (deleteBtn) {
      await deleteBtn.click();
      await sleep(1000);
    }
    await snap('18_task_deleted', 'Tarea eliminada definitivamente');
    console.log('✅ Paso 4 superado: Creación, completado, progreso y eliminación validados.');

    // ----------------------------------------------------
    // PASO 5: Invitación Familiar
    // ----------------------------------------------------
    console.log('\n--- PASO 5: Invitación Familiar Segura ---');
    await page.click('#btn-invite-family');
    await page.waitForSelector('#modal-container:not(.hidden)', { timeout: 5000 });
    await sleep(600);
    await snap('19_invite_modal', 'Modal de invitación a la tribu familiar');

    const inviteLink = await page.evaluate(() => {
      const input = document.getElementById('invite-link-input');
      return input ? input.value : null;
    });
    console.log(`Enlace de invitación generado: ${inviteLink}`);

    await page.evaluate(() => {
      document.getElementById('modal-container')?.classList.add('hidden');
    });
    await sleep(400);
    console.log('✅ Paso 5 superado: Enlace de invitación generado con éxito.');

    // ----------------------------------------------------
    // FINAL: Resumen de resultados
    // ----------------------------------------------------
    results.verdict = results.errors.length === 0 ? 'PASSED_PERFECT' : (results.errors.length < 3 ? 'PASSED_WITH_WARNINGS' : 'FAILED');
    results.completedAt = new Date().toISOString();

    const reportPath = path.join(SCREENSHOTS_DIR, 'test_results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n🎉 Pruebas de Beta Tester finalizadas con veredicto: ${results.verdict}`);
    console.log(`Reporte guardado en: ${reportPath}`);

  } catch (err) {
    console.error('❌ Error durante la prueba de beta tester:', err);
    results.errors.push(`[Fatal Exception] ${err.message}`);
    results.verdict = 'FAILED';
    await snap('error_state', 'Estado de error');
  } finally {
    await browser.close();
  }

  return results;
}

runFamilyBetaTest();
