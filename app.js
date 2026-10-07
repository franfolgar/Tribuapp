// Importamos Supabase directamente desde el CDN para módulos ES
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://skdlkrcdwhxfuwukvoce.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UIZX50yoepGiITkC2hREFQ_elTXm7hV';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEYS = {
    app: 'tribuapp-state',
    tasks: 'tribuapp-tasks',
    karma: 'tribuapp-karma',
};

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Fin de semana'];
const BACKUP_VERSION = 2;
const MAX_BACKUP_FILE_SIZE = 1_000_000;
const MAX_BACKUP_ITEMS = 500;

const AISLE_ORDER = [
    'Frutas y Verduras',
    'Lácteos y Huevos',
    'Carnes y Pescados',
    'Panadería y Desayunos',
    'Despensa y Legumbres',
    'Limpieza y Hogar',
    'Otros'
];

const AISLE_ICONS = {
    'Frutas y Verduras': '🍏',
    'Lácteos y Huevos': '🥛',
    'Carnes y Pescados': '🥩',
    'Panadería y Desayunos': '🥖',
    'Despensa y Legumbres': '🍝',
    'Limpieza y Hogar': '🧼',
    'Otros': '📦'
};

function getAisleCategory(itemName = '') {
    const n = itemName.toLowerCase();
    if (/fruta|manzana|plátano|platano|pera|naranja|limón|limon|fresa|aguacate|tomate|lechuga|zanahoria|cebolla|ajo|pimiento|patata|calabacín|calabacin|espinaca|champiñón|champinon|seta|puerro|calabaza|alcachofa|judía|judia|verdura/.test(n)) {
        return 'Frutas y Verduras';
    }
    if (/leche|huevo|queso|yogur|mantequilla|nata|feta|parmesano|mozzarella|cheddar|quesito/.test(n)) {
        return 'Lácteos y Huevos';
    }
    if (/pollo|ternera|carne|jamón|jamon|pavo|bacon|salmón|salmon|pescado|gamba|gambón|gambon|calamar|marisco|atún|atun|merluza|bacalao|solomillo|chuleta/.test(n)) {
        return 'Carnes y Pescados';
    }
    if (/pan|tostada|galleta|cereal|avena|harina|croissant|bollo|tortilla de trigo|masa de pizza/.test(n)) {
        return 'Panadería y Desayunos';
    }
    if (/arroz|pasta|espagueti|macarrón|macarron|lenteja|garbanzo|alubia|aceite|vinagre|sal|azúcar|azucar|especias|pimentón|pimenton|tomate frito|tomate triturado|conserva|orégano|oregano|laurel|caldo|fumet|mayonesa|gazpacho|pesto/.test(n)) {
        return 'Despensa y Legumbres';
    }
    if (/detergente|friegaplatos|jabón|jabon|lejía|lejia|papel|limpieza|bayeta|bolsa|suavizante|estropajo/.test(n)) {
        return 'Limpieza y Hogar';
    }
    return 'Otros';
}

const defaultState = {
    shopping: [
        { id: 'shop-1', nombre: 'Leche entera', cantidad: '2 L', seccion: 'Lácteos y Huevos', comprado: false },
        { id: 'shop-2', nombre: 'Huevos de campo', cantidad: '1 docena', seccion: 'Lácteos y Huevos', comprado: false },
        { id: 'shop-3', nombre: 'Plátanos de Canarias', cantidad: '1 kg', seccion: 'Frutas y Verduras', comprado: false },
        { id: 'shop-4', nombre: 'Aceite de oliva virgen extra', cantidad: '1 botella', seccion: 'Despensa y Legumbres', comprado: true }
    ],
    menu: [
        {
            id: 'menu-1',
            dia: 'Lunes',
            tipo: 'Comida',
            nombre: 'Lentejas caseras con verduras y jamón',
            tiempo: '35 min',
            ingredientes: ['400g lentejas pardinas', '100g taquitos de jamón', '2 zanahorias', '1 cebolla', '1 patata', '1 hoja de laurel']
        },
        {
            id: 'menu-2',
            dia: 'Lunes',
            tipo: 'Cena',
            nombre: 'Tortilla de patatas con ensalada mixta',
            tiempo: '25 min',
            ingredientes: ['4 huevos frescos', '3 patatas medianas', '1 cebolla pequeña', 'Lechuga variada', 'Aceite de oliva']
        },
        {
            id: 'menu-3',
            dia: 'Martes',
            tipo: 'Comida',
            nombre: 'Salmón al horno con patatas panadera',
            tiempo: '30 min',
            ingredientes: ['4 lomos de salmón', '3 patatas', '1 cebolla', 'Limón fresco', 'Eneldo']
        },
        {
            id: 'menu-4',
            dia: 'Martes',
            tipo: 'Cena',
            nombre: 'Crema de calabacín y picatostes dorados',
            tiempo: '20 min',
            ingredientes: ['2 calabacines', '1 puerro', '1 patata', '2 quesitos', 'Pan para picatostes']
        },
        {
            id: 'menu-5',
            dia: 'Miércoles',
            tipo: 'Comida',
            nombre: 'Pasta fresca con pesto y tomates cherry',
            tiempo: '20 min',
            ingredientes: ['350g pasta fresca', '1 bote pesto genovés', '200g tomates cherry', 'Queso parmesano']
        },
        {
            id: 'menu-6',
            dia: 'Miércoles',
            tipo: 'Cena',
            nombre: 'Sándwich vegetal y gazpacho fresco',
            tiempo: '15 min',
            ingredientes: ['Pan de molde integral', '2 latas de atún', '1 tomate', 'Lechuga', '1 brick gazpacho']
        },
        {
            id: 'menu-7',
            dia: 'Jueves',
            tipo: 'Comida',
            nombre: 'Pollo asado al limón con patatas',
            tiempo: '45 min',
            ingredientes: ['4 cuartos de pollo', '4 patatas', '1 limón', 'Romero fresco', 'Vino blanco']
        },
        {
            id: 'menu-8',
            dia: 'Jueves',
            tipo: 'Cena',
            nombre: 'Revuelto de setas y gambas con tostadas',
            tiempo: '15 min',
            ingredientes: ['4 huevos', '200g setas variadas', '150g gambas peladas', '2 dientes de ajo', 'Pan tostado']
        },
        {
            id: 'menu-9',
            dia: 'Viernes',
            tipo: 'Comida',
            nombre: 'Arroz caldoso de marisco',
            tiempo: '35 min',
            ingredientes: ['300g arroz redondo', '200g calamares', '150g gambas', 'Fumet de pescado', 'Pimentón dulce']
        },
        {
            id: 'menu-10',
            dia: 'Viernes',
            tipo: 'Cena',
            nombre: 'Pizza casera margarita con jamón cocido',
            tiempo: '25 min',
            ingredientes: ['1 masa de pizza fresca', '200g queso mozzarella', '100g jamón cocido', 'Tomate frito', 'Orégano']
        },
        {
            id: 'menu-11',
            dia: 'Fin de semana',
            tipo: 'Comida',
            nombre: 'Paella mixta familiar tradicional',
            tiempo: '50 min',
            ingredientes: ['400g arroz bomba', '300g pollo troceado', '200g judías verdes', 'Caldo de ave', 'Azafrán']
        },
        {
            id: 'menu-12',
            dia: 'Fin de semana',
            tipo: 'Cena',
            nombre: 'Hamburguesas caseras con queso cheddar',
            tiempo: '20 min',
            ingredientes: ['4 panes de hamburguesa', '4 hamburguesas de ternera', 'Queso cheddar', 'Bacon', 'Tomate y lechuga']
        }
    ],
};

function getSampleTasks(familyId, userId) {
    const today = getLocalDateInputValue();
    return [
        {
            id: 'demo-task-1',
            fecha_objetivo: today,
            estado: 'Pendiente',
            asignado_a: userId,
            recurrencia: 'Diaria',
            puntos: 10,
            tareas_catalogo: { nombre: 'Poner la lavadora y tender la ropa' },
        },
        {
            id: 'demo-task-2',
            fecha_objetivo: today,
            estado: 'Pendiente',
            asignado_a: null,
            recurrencia: 'Semanal',
            puntos: 20,
            tareas_catalogo: { nombre: 'Limpieza a fondo de la cocina' },
        },
        {
            id: 'demo-task-3',
            fecha_objetivo: today,
            estado: 'Completada',
            asignado_a: userId,
            recurrencia: 'Diaria',
            puntos: 10,
            tareas_catalogo: { nombre: 'Bajar la basura orgánica' },
        }
    ];
}

// UI Elements
const authView = document.getElementById('auth-view');
const onboardingView = document.getElementById('onboarding-view');
const appView = document.getElementById('app-view');
const mainContent = document.getElementById('main-content');
const viewTitle = document.getElementById('view-title');
const headerTribeBadge = document.getElementById('header-tribe-badge');

const authForm = document.getElementById('auth-form');
const authNameGroup = document.getElementById('auth-name-group');
const authMemberNameInput = document.getElementById('auth-member-name');
const authError = document.getElementById('auth-error');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnSubmit = document.getElementById('btn-login');
const btnAuthMode = document.getElementById('btn-auth-mode');
const btnResetPassword = document.getElementById('btn-reset-password');
const btnDemoLogin = document.getElementById('btn-demo-login');
const authMessage = document.getElementById('auth-message');
const passwordUpdateForm = document.getElementById('password-update-form');
const passwordUpdateError = document.getElementById('password-update-error');

const onboardingForm = document.getElementById('onboarding-form');
const btnOnboarding = document.getElementById('btn-onboarding');
const onboardingError = document.getElementById('onboarding-error');
const joinTribuForm = document.getElementById('join-tribu-form');
const btnJoinTribu = document.getElementById('btn-join-tribu');
const tabJoinTribu = document.getElementById('tab-join-tribu');
const tabCreateTribu = document.getElementById('tab-create-tribu');
const joinCodigoInput = document.getElementById('join-codigo');
const joinNombreInput = document.getElementById('join-nombre-usuario');
const inviteWelcomeBanner = document.getElementById('invite-welcome-banner');
const inviteWelcomeText = document.getElementById('invite-welcome-text');
const inviteDetectedBanner = document.getElementById('invite-detected-banner');
const inviteDetectedText = document.getElementById('invite-detected-text');

const btnLogout = document.getElementById('btn-logout');
const btnInviteFamily = document.getElementById('btn-invite-family');
const btnNotificationsToggle = document.getElementById('btn-notifications-toggle');
const navItems = document.querySelectorAll('.nav-item');

const modalContainer = document.getElementById('modal-container');
const modalCardContent = document.getElementById('modal-card-content');
const toastContainer = document.getElementById('toast-container');

let currentUser = null;
let currentProfile = null;
let authMode = 'login';
let currentView = 'dashboard';
let viewRenderId = 0;
let currentTaskFilter = 'all'; // 'all' | 'mine' | 'pool'
let currentMenuDayFilter = 'Todos'; // 'Todos' or day name

const btnThemeToggle = document.getElementById('btn-theme-toggle');
const fabWrapper = document.getElementById('fab-wrapper');
const fabMainBtn = document.getElementById('fab-main-btn');
const fabMenu = document.getElementById('fab-menu');
const fabAddShop = document.getElementById('fab-add-shop');
const fabAddTask = document.getElementById('fab-add-task');
const fabAddMeal = document.getElementById('fab-add-meal');

// --- Theme Management (System Default + Manual Selection) ---
const THEME_STORAGE_KEY = 'tribuapp-theme';

function getCurrentThemePreference() {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
}

function applyTheme(theme) {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
        if (btnThemeToggle) {
            btnThemeToggle.innerText = '🌓';
            btnThemeToggle.title = 'Tema: Automático (Sigue el móvil)';
        }
        if (metaTheme) {
            metaTheme.setAttribute('content', prefersDark ? '#0F172A' : '#4F46E5');
        }
    } else if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (btnThemeToggle) {
            btnThemeToggle.innerText = '🌙';
            btnThemeToggle.title = 'Tema: Modo Oscuro';
        }
        if (metaTheme) metaTheme.setAttribute('content', '#0F172A');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        if (btnThemeToggle) {
            btnThemeToggle.innerText = '☀️';
            btnThemeToggle.title = 'Tema: Modo Claro';
        }
        if (metaTheme) metaTheme.setAttribute('content', '#4F46E5');
    }
}

function initTheme() {
    const saved = getCurrentThemePreference();
    applyTheme(saved);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getCurrentThemePreference() === 'system') {
            applyTheme('system');
        }
    });

    btnThemeToggle?.addEventListener('click', openThemeModal);
}

function openThemeModal() {
    const cur = getCurrentThemePreference();
    const html = `
        <div class="modal-header">
            <h3>🎨 Modo y Apariencia</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
            Elige el modo visual de la app. Por defecto se adapta al tema de tu teléfono:
        </p>

        <div class="theme-options-list">
            <button type="button" class="theme-option-btn ${cur === 'system' ? 'active' : ''}" data-set-theme="system">
                <span class="theme-option-icon">🌓</span>
                <div class="theme-option-text">
                    <strong>Automático (Modo del dispositivo)</strong>
                    <span>Sigue el tema claro u oscuro de tu móvil como el resto de apps.</span>
                </div>
                ${cur === 'system' ? '<span class="theme-check">✓</span>' : ''}
            </button>

            <button type="button" class="theme-option-btn ${cur === 'light' ? 'active' : ''}" data-set-theme="light">
                <span class="theme-option-icon">☀️</span>
                <div class="theme-option-text">
                    <strong>Modo Claro</strong>
                    <span>Fondo claro para alta legibilidad.</span>
                </div>
                ${cur === 'light' ? '<span class="theme-check">✓</span>' : ''}
            </button>

            <button type="button" class="theme-option-btn ${cur === 'dark' ? 'active' : ''}" data-set-theme="dark">
                <span class="theme-option-icon">🌙</span>
                <div class="theme-option-text">
                    <strong>Modo Oscuro</strong>
                    <span>Ideal para descansar la vista y ahorrar batería.</span>
                </div>
                ${cur === 'dark' ? '<span class="theme-check">✓</span>' : ''}
            </button>
        </div>
    `;

    openModal(html);

    document.querySelectorAll('[data-set-theme]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.setTheme;
            localStorage.setItem(THEME_STORAGE_KEY, val);
            applyTheme(val);
            const names = {
                system: 'Automático (Sigue el modo de tu móvil)',
                light: 'Modo Claro',
                dark: 'Modo Oscuro'
            };
            showToast(`Tema: ${names[val]}`);
            closeModal();
        });
    });
}

// --- Push Notifications via Service Worker ---
const PUSH_PREFS_KEY = 'tribuapp_push_prefs';

function getPushPrefs() {
    try {
        const stored = localStorage.getItem(PUSH_PREFS_KEY);
        if (stored) return JSON.parse(stored);
    } catch {}
    return {
        enabled: true,
        alertTasks: true,
        alertMenu: true,
        lastTaskAlertDate: '',
        lastMenuAlertDate: ''
    };
}

function savePushPrefs(prefs) {
    try {
        localStorage.setItem(PUSH_PREFS_KEY, JSON.stringify(prefs));
    } catch {}
}

function isPushSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
}

function getPushPermissionStatus() {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission; // 'granted' | 'denied' | 'default'
}

async function requestPushPermission() {
    if (!isPushSupported()) {
        showToast('Este navegador no soporta notificaciones de Service Worker.');
        return false;
    }
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const prefs = getPushPrefs();
            prefs.enabled = true;
            savePushPrefs(prefs);
            showToast('✅ ¡Notificaciones activadas!');
            await showServiceWorkerNotification('⛺ Tribuapp Familiar', {
                body: '¡Notificaciones activadas! Te avisaremos de tareas pendientes y menús.',
                data: { view: 'dashboard' }
            });
            return true;
        } else if (permission === 'denied') {
            showToast('⚠️ Las notificaciones están bloqueadas en tu navegador.');
            return false;
        }
        return false;
    } catch (err) {
        console.warn('Error solicitando permisos de notificación:', err);
        return false;
    }
}

async function showServiceWorkerNotification(title, options = {}) {
    if (!isPushSupported() || Notification.permission !== 'granted') return false;
    const prefs = getPushPrefs();
    if (!prefs.enabled) return false;

    const fullOptions = {
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [100, 50, 100],
        ...options
    };

    try {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if (registration && registration.showNotification) {
                await registration.showNotification(title, fullOptions);
                return true;
            }
        }
        if ('Notification' in window) {
            new Notification(title, fullOptions);
            return true;
        }
        return false;
    } catch (err) {
        console.warn('Error al mostrar notificación con Service Worker:', err);
        return false;
    }
}

async function triggerPendingTasksAlert(tasks, force = false) {
    const prefs = getPushPrefs();
    if (!prefs.enabled || !prefs.alertTasks) return;
    if (Notification.permission !== 'granted') return;

    const todayIso = getLocalDateInputValue();
    if (!force && prefs.lastTaskAlertDate === todayIso) {
        return; // Evita avisar repetidas veces en el mismo día de forma automática
    }

    const pendingToday = (tasks || []).filter(t => t.fecha_objetivo === todayIso && t.estado !== 'Completada');
    if (!pendingToday.length) return;

    const taskTitles = pendingToday.slice(0, 3).map(t => t.tareas_catalogo?.nombre || t.nombre || 'Tarea').join(', ');
    const count = pendingToday.length;
    const moreText = count > 3 ? ` y ${count - 3} más` : '';

    await showServiceWorkerNotification(`📋 ${count} ${count === 1 ? 'tarea pendiente' : 'tareas pendientes'} para hoy`, {
        body: `Tribu: ${taskTitles}${moreText}. ¡No lo olvides!`,
        data: { view: 'tareas', url: './' },
        tag: 'tribuapp-tasks-reminder'
    });

    prefs.lastTaskAlertDate = todayIso;
    savePushPrefs(prefs);
}

async function triggerMenuAlert(dishName, dia = 'Hoy', force = false) {
    const prefs = getPushPrefs();
    if (!prefs.enabled || !prefs.alertMenu) return;
    if (Notification.permission !== 'granted') return;

    const todayIso = getLocalDateInputValue();
    if (!force && prefs.lastMenuAlertDate === todayIso) {
        return;
    }

    await showServiceWorkerNotification(`🍽️ Menú familiar (${dia})`, {
        body: `Plato previsto: ${dishName}. ¡Buen provecho a la tribu!`,
        data: { view: 'menus', url: './' },
        tag: 'tribuapp-menu-reminder'
    });

    prefs.lastMenuAlertDate = todayIso;
    savePushPrefs(prefs);
}

function openNotificationsModal() {
    const status = getPushPermissionStatus();
    const prefs = getPushPrefs();

    let statusBadge = '';
    let statusDesc = '';
    if (status === 'granted') {
        statusBadge = '<span class="notif-badge granted">Permitido</span>';
        statusDesc = 'Las notificaciones push mediante Service Worker están activas en este dispositivo.';
    } else if (status === 'denied') {
        statusBadge = '<span class="notif-badge denied">Bloqueado</span>';
        statusDesc = 'Están bloqueadas en la configuración de permisos de tu navegador. Actívalas en ajustes del sitio.';
    } else if (status === 'default') {
        statusBadge = '<span class="notif-badge default">Sin activar</span>';
        statusDesc = 'Aún no has concedido permiso a la app para recibir alertas de tareas o menú.';
    } else {
        statusBadge = '<span class="notif-badge denied">No soportado</span>';
        statusDesc = 'Este navegador no tiene soporte para notificaciones Service Worker.';
    }

    const html = `
        <div class="modal-header">
            <h3>🔔 Notificaciones Familiares</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
            Recibe alertas automáticas en tu móvil u ordenador cuando haya tareas pendientes del día o cambios en el menú familiar.
        </p>

        <div class="notification-status-box">
            <span class="notification-status-icon">${status === 'granted' ? '🔔' : (status === 'denied' ? '🔕' : '⏳')}</span>
            <div class="notification-status-info">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <strong>Estado en este dispositivo</strong>
                    ${statusBadge}
                </div>
                <span>${statusDesc}</span>
            </div>
        </div>

        ${status !== 'granted' && status !== 'unsupported' ? `
            <button type="button" id="btn-request-notif-perm" class="btn-primary" style="margin-bottom: 16px;">
                🔔 Permitir notificaciones en este móvil/equipo
            </button>
        ` : ''}

        <div class="notif-pref-list">
            <label class="notif-pref-item" for="chk-notif-enabled">
                <div class="notif-pref-label">
                    <strong>Activar notificaciones</strong>
                    <span>Control general de alertas familiares en este dispositivo.</span>
                </div>
                <input type="checkbox" id="chk-notif-enabled" class="notif-checkbox" ${prefs.enabled && status === 'granted' ? 'checked' : ''} ${status !== 'granted' ? 'disabled' : ''}>
            </label>

            <label class="notif-pref-item" for="chk-notif-tasks">
                <div class="notif-pref-label">
                    <strong>Avisos de tareas pendientes de hoy</strong>
                    <span>Alerta matinal si hay tareas asignadas para el día de hoy.</span>
                </div>
                <input type="checkbox" id="chk-notif-tasks" class="notif-checkbox" ${prefs.alertTasks ? 'checked' : ''} ${status !== 'granted' ? 'disabled' : ''}>
            </label>

            <label class="notif-pref-item" for="chk-notif-menu">
                <div class="notif-pref-label">
                    <strong>Avisos del menú semanal</strong>
                    <span>Notificar cuando se diseñe el menú o toque la comida/cena de hoy.</span>
                </div>
                <input type="checkbox" id="chk-notif-menu" class="notif-checkbox" ${prefs.alertMenu ? 'checked' : ''} ${status !== 'granted' ? 'disabled' : ''}>
            </label>
        </div>

        <div style="display: grid; gap: 8px;">
            <button type="button" id="btn-test-push-notif" class="btn-secondary" style="width: 100%;">
                ⚡ Lanzar notificación de prueba ahora
            </button>
            <button type="button" id="btn-trigger-today-tasks-notif" class="btn-secondary" style="width: 100%;">
                📋 Probar aviso de tareas pendientes de hoy
            </button>
        </div>
    `;

    openModal(html);

    document.getElementById('btn-request-notif-perm')?.addEventListener('click', async () => {
        const ok = await requestPushPermission();
        if (ok) {
            closeModal();
            setTimeout(openNotificationsModal, 300);
        }
    });

    const chkEnabled = document.getElementById('chk-notif-enabled');
    const chkTasks = document.getElementById('chk-notif-tasks');
    const chkMenu = document.getElementById('chk-notif-menu');

    const updateCheckboxes = () => {
        const current = getPushPrefs();
        if (chkEnabled) current.enabled = chkEnabled.checked;
        if (chkTasks) current.alertTasks = chkTasks.checked;
        if (chkMenu) current.alertMenu = chkMenu.checked;
        savePushPrefs(current);
    };

    chkEnabled?.addEventListener('change', updateCheckboxes);
    chkTasks?.addEventListener('change', updateCheckboxes);
    chkMenu?.addEventListener('change', updateCheckboxes);

    document.getElementById('btn-test-push-notif')?.addEventListener('click', async () => {
        if (Notification.permission !== 'granted') {
            const ok = await requestPushPermission();
            if (!ok) return;
        }
        await showServiceWorkerNotification('🔔 ¡Prueba de Notificación Tribuapp!', {
            body: 'El Service Worker está conectado y listo para alertar a tu familia.',
            data: { view: 'dashboard' }
        });
        showToast('Notificación de prueba enviada');
    });

    document.getElementById('btn-trigger-today-tasks-notif')?.addEventListener('click', async () => {
        if (Notification.permission !== 'granted') {
            const ok = await requestPushPermission();
            if (!ok) return;
        }
        try {
            const { tasks } = await fetchFamilyData();
            const todayIso = getLocalDateInputValue();
            const pendingToday = (tasks || []).filter(t => t.fecha_objetivo === todayIso && t.estado !== 'Completada');
            if (pendingToday.length > 0) {
                await triggerPendingTasksAlert(tasks, true);
                showToast('Aviso de tareas enviado');
            } else {
                await showServiceWorkerNotification('🎉 ¡Todo al día en la Tribu!', {
                    body: 'No tienes tareas pendientes asignadas para el día de hoy.',
                    data: { view: 'tareas' }
                });
                showToast('Sin tareas pendientes hoy');
            }
        } catch (e) {
            showToast('No se pudieron consultar las tareas');
        }
    });
}

function initNotifications() {
    btnNotificationsToggle?.addEventListener('click', openNotificationsModal);

    // Escuchar mensajes provenientes del Service Worker (ej. clic en notificación que solicita cambiar de vista)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'NAVIGATE_VIEW') {
                const targetView = event.data.targetView || 'dashboard';
                renderizarVista(targetView);
            }
        });
    }
}

// --- Floating Action Button (FAB) ---
function initFab() {
    if (!fabMainBtn || !fabWrapper) return;

    fabMainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = fabWrapper.classList.toggle('open');
        fabMenu?.classList.toggle('hidden', !isOpen);
    });

    document.addEventListener('click', (e) => {
        if (!fabWrapper.contains(e.target)) {
            fabWrapper.classList.remove('open');
            fabMenu?.classList.add('hidden');
        }
    });

    fabAddShop?.addEventListener('click', () => {
        fabWrapper.classList.remove('open');
        fabMenu?.classList.add('hidden');
        openQuickAddShoppingModal();
    });

    fabAddTask?.addEventListener('click', () => {
        fabWrapper.classList.remove('open');
        fabMenu?.classList.add('hidden');
        openQuickAddTaskModal();
    });

    fabAddMeal?.addEventListener('click', () => {
        fabWrapper.classList.remove('open');
        fabMenu?.classList.add('hidden');
        openQuickAddMealModal();
    });
}

function openQuickAddShoppingModal() {
    const html = `
        <div class="modal-header">
            <h3>🛒 Añadir a la compra</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <form id="quick-shop-form">
            <label for="quick-shop-name">Producto</label>
            <input type="text" id="quick-shop-name" placeholder="Ej. Leche de avena, Huevos, Manzanas..." required autofocus>

            <div class="form-row-2">
                <div>
                    <label for="quick-shop-cant">Cantidad (opcional)</label>
                    <input type="text" id="quick-shop-cant" placeholder="Ej. 1 kg, 2 L" maxlength="40">
                </div>
                <div>
                    <label for="quick-shop-sec">Pasillo</label>
                    <select id="quick-shop-sec" class="input-select">
                        <option value="auto">🪄 Detectar automáticamente</option>
                        ${AISLE_ORDER.map(a => `<option value="${a}">${AISLE_ICONS[a]} ${a}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="modal-footer" style="margin-top: 14px;">
                <button type="submit" class="btn-primary">Añadir a la compra</button>
                <button type="button" class="btn-secondary" onclick="document.getElementById('modal-container').classList.add('hidden')">Cancelar</button>
            </div>
        </form>
    `;

    openModal(html);
    setTimeout(() => document.getElementById('quick-shop-name')?.focus(), 100);

    document.getElementById('quick-shop-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('quick-shop-name').value.trim();
        const cantidad = document.getElementById('quick-shop-cant').value.trim();
        const secVal = document.getElementById('quick-shop-sec').value;
        const seccion = secVal === 'auto' ? getAisleCategory(nombre) : secVal;

        if (!nombre) return;
        const state = getAppState();
        state.shopping.push({
            id: crypto.randomUUID(),
            nombre,
            cantidad,
            seccion,
            comprado: false
        });
        saveAppState(state);
        showToast(`🛒 "${nombre}" añadido a la compra`);
        closeModal();
        if (currentView === 'dashboard' || currentView === 'compra') {
            renderizarVista(currentView);
        }
    });
}

async function openQuickAddTaskModal() {
    let members = [];
    try {
        const data = await fetchFamilyData();
        members = data.members || [];
    } catch {
        members = [];
    }

    const today = getLocalDateInputValue();
    const html = `
        <div class="modal-header">
            <h3>✅ Nueva Tarea</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <form id="quick-task-form">
            <label for="quick-task-name">Nombre de la tarea</label>
            <input type="text" id="quick-task-name" placeholder="Ej. Poner lavadora, pasar aspiradora..." required autofocus>

            <div class="form-row-2">
                <div>
                    <label for="quick-task-assign">Asignar a</label>
                    <select id="quick-task-assign" class="input-select">
                        <option value="">🧺 Bolsa común</option>
                        ${members.map(m => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.nombre)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="quick-task-date">Fecha límite</label>
                    <input type="date" id="quick-task-date" class="input-select" value="${today}" min="${today}" required>
                </div>
            </div>

            <div>
                <label for="quick-task-recurrence">Repetición</label>
                <select id="quick-task-recurrence" class="input-select">
                    <option value="Puntual">Puntual (una sola vez)</option>
                    <option value="Diaria">🔄 Diaria (todos los días)</option>
                    <option value="Semanal">🔄 Semanal (cada 7 días)</option>
                    <option value="Quincenal">🔄 Quincenal</option>
                    <option value="Mensual">🔄 Mensual</option>
                </select>
            </div>

            <div class="modal-footer" style="margin-top: 14px;">
                <button type="submit" id="btn-quick-task-submit" class="btn-primary">Guardar Tarea</button>
                <button type="button" class="btn-secondary" onclick="document.getElementById('modal-container').classList.add('hidden')">Cancelar</button>
            </div>
        </form>
    `;

    openModal(html);
    setTimeout(() => document.getElementById('quick-task-name')?.focus(), 100);

    document.getElementById('quick-task-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-quick-task-submit');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Guardando...';

        const nombre = document.getElementById('quick-task-name').value.trim();
        const asignadoA = document.getElementById('quick-task-assign').value || null;
        const fecha = document.getElementById('quick-task-date').value || today;
        const recurrencia = document.getElementById('quick-task-recurrence').value || 'Puntual';

        if (!nombre) return;

        let inserted = false;
        try {
            const { data: catData, error: catError } = await supabase
                .from('tareas_catalogo')
                .insert({ nombre, recurrencia_sugerida: recurrencia })
                .select('id')
                .single();

            if (!catError && catData?.id) {
                const { error: asigError } = await supabase
                    .from('tareas_asignadas')
                    .insert({
                        familia_id: currentProfile?.familia_id,
                        tarea_id: catData.id,
                        asignado_a: asignadoA,
                        fecha_objetivo: fecha,
                        recurrencia,
                        estado: 'Pendiente'
                    });
                if (!asigError) inserted = true;
            }
        } catch {
            inserted = false;
        }

        if (!inserted) {
            const currentTasks = readFromStorage(STORAGE_KEYS.tasks, []);
            currentTasks.push({
                id: crypto.randomUUID(),
                fecha_objetivo: fecha,
                estado: 'Pendiente',
                asignado_a: asignadoA,
                recurrencia,
                tareas_catalogo: { nombre }
            });
            saveToStorage(STORAGE_KEYS.tasks, currentTasks);
        }

        showToast(`✅ Tarea "${nombre}" creada`);
        closeModal();

        if (fecha === getLocalDateInputValue()) {
            showServiceWorkerNotification('📋 Nueva tarea para hoy', {
                body: `Se ha añadido "${nombre}" a la tribu para hoy.`,
                data: { view: 'tareas', url: './' }
            });
        }

        if (currentView === 'dashboard' || currentView === 'tareas') {
            await renderizarVista(currentView);
        }
    });
}

function openQuickAddMealModal() {
    const todayDayName = getTodayWeekDayName();
    const html = `
        <div class="modal-header">
            <h3>🍽️ Añadir plato al menú</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <form id="quick-meal-form">
            <label for="quick-meal-name">Nombre del plato</label>
            <input type="text" id="quick-meal-name" placeholder="Ej. Lentejas caseras, Pollo asado..." required autofocus>

            <div class="form-row-2">
                <div>
                    <label for="quick-meal-day">Día</label>
                    <select id="quick-meal-day" class="input-select">
                        ${WEEK_DAYS.map(d => `<option value="${d}" ${d === todayDayName ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="quick-meal-type">Tipo</label>
                    <select id="quick-meal-type" class="input-select">
                        <option value="Comida">☀️ Comida</option>
                        <option value="Cena">🌙 Cena</option>
                    </select>
                </div>
            </div>

            <div class="form-row-2">
                <div>
                    <label for="quick-meal-time">Tiempo</label>
                    <input type="text" id="quick-meal-time" placeholder="Ej. 25 min" value="25 min">
                </div>
                <div>
                    <label for="quick-meal-ing">Ingredientes (opcional)</label>
                    <input type="text" id="quick-meal-ing" placeholder="Ej. Patatas, Huevos, Cebolla">
                </div>
            </div>

            <div class="modal-footer" style="margin-top: 14px;">
                <button type="submit" class="btn-primary">Guardar plato</button>
                <button type="button" class="btn-secondary" onclick="document.getElementById('modal-container').classList.add('hidden')">Cancelar</button>
            </div>
        </form>
    `;

    openModal(html);
    setTimeout(() => document.getElementById('quick-meal-name')?.focus(), 100);

    document.getElementById('quick-meal-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('quick-meal-name').value.trim();
        const dia = document.getElementById('quick-meal-day').value;
        const tipo = document.getElementById('quick-meal-type').value;
        const tiempo = document.getElementById('quick-meal-time').value.trim() || '25 min';
        const rawIng = document.getElementById('quick-meal-ing').value.trim();
        const ingredientes = rawIng ? rawIng.split(',').map(s => s.trim()).filter(Boolean) : [];

        if (!nombre) return;
        const state = getAppState();
        state.menu.push({
            id: crypto.randomUUID(),
            dia,
            tipo,
            nombre,
            tiempo,
            ingredientes
        });
        saveAppState(state);
        showToast(`🍽️ "${nombre}" añadido al menú (${dia})`);
        closeModal();

        if (dia === todayDayName) {
            showServiceWorkerNotification(`🍽️ Plato para hoy (${tipo})`, {
                body: `Se ha añadido "${nombre}" al menú familiar de hoy.`,
                data: { view: 'menus', url: './' }
            });
        }

        if (currentView === 'dashboard' || currentView === 'menus') {
            renderizarVista(currentView);
        }
    });
}

// --- Storage & Utilities ---

function getStorageKey(key) {
    const owner = currentProfile?.familia_id || currentUser?.id || 'anonymous';
    return `${key}-${owner}`;
}

function readFromStorage(key, fallback) {
    try {
        const storageKey = getStorageKey(key);
        let value = localStorage.getItem(storageKey);
        if (!value && currentProfile?.familia_id && currentUser?.id) {
            const legacyKey = `${key}-${currentUser.id}`;
            value = localStorage.getItem(legacyKey);
            if (value) {
                localStorage.setItem(storageKey, value);
                localStorage.removeItem(legacyKey);
            }
        }
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn('No se pudo leer el estado local:', error);
        return fallback;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(getStorageKey(key), JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('No se pudo guardar el estado local:', error);
        return false;
    }
}

function getAppState() {
    const stored = readFromStorage(STORAGE_KEYS.app, defaultState) || {};
    const rawShopping = Array.isArray(stored.shopping) && stored.shopping.length ? stored.shopping : defaultState.shopping;
    const rawMenu = Array.isArray(stored.menu) && stored.menu.length ? stored.menu : defaultState.menu;

    const shopping = rawShopping.map(item => ({
        ...item,
        seccion: item.seccion || getAisleCategory(item.nombre),
        cantidad: item.cantidad || ''
    }));

    const menu = rawMenu.map(item => ({
        ...item,
        tipo: item.tipo === 'Cena' ? 'Cena' : 'Comida',
        tiempo: item.tiempo || '25 min',
        ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : []
    }));

    return { shopping, menu };
}

function saveAppState(state) {
    if (saveToStorage(STORAGE_KEYS.app, state)) return true;
    showToast('Error de almacenamiento local en el navegador');
    return false;
}

function getKarmaPoints() {
    return readFromStorage(STORAGE_KEYS.karma, {
        '31b888de-c2bf-4077-903f-874ad3bc9263': 50
    }) || {};
}

function addKarmaPoints(memberId, points = 10) {
    const karma = getKarmaPoints();
    const id = memberId || currentProfile?.id || 'user';
    karma[id] = (karma[id] || 0) + points;
    saveToStorage(STORAGE_KEYS.karma, karma);
    return karma[id];
}

function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function openModal(contentHtml) {
    if (!modalContainer || !modalCardContent) return;
    modalCardContent.innerHTML = contentHtml;
    modalContainer.classList.remove('hidden');
    const closeBtn = modalCardContent.querySelector('.modal-close');
    if (closeBtn) closeBtn.onclick = closeModal;
}

function closeModal() {
    if (!modalContainer) return;
    modalContainer.classList.add('hidden');
    if (modalCardContent) modalCardContent.innerHTML = '';
}

modalContainer?.addEventListener('click', (e) => {
    if (e.target === modalContainer) closeModal();
});

function getLocalDateInputValue(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function computeNextRecurringDate(baseDateStr, recurrence) {
    const d = new Date(baseDateStr ? `${baseDateStr}T00:00:00` : new Date());
    if (recurrence === 'Diaria') d.setDate(d.getDate() + 1);
    else if (recurrence === 'Semanal') d.setDate(d.getDate() + 7);
    else if (recurrence === 'Quincenal') d.setDate(d.getDate() + 14);
    else if (recurrence === 'Mensual') d.setMonth(d.getMonth() + 1);
    else return null;
    return getLocalDateInputValue(d);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character]);
}

function getTodayWeekDayName() {
    const day = new Date().getDay();
    if (day === 0 || day === 6) return 'Fin de semana';
    const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    return days[day] || 'Lunes';
}

function getInviteCode(familyId = '') {
    const clean = (familyId || 'FAM123').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
    return `TRIBU-${clean}`;
}

function getPublicAppUrl() {
    const custom = localStorage.getItem('tribuapp_custom_deploy_url');
    if (custom && custom.startsWith('http')) {
        return custom.replace(/\/$/, '');
    }
    let url = window.location.origin;
    if (url.includes('ais-dev-')) {
        url = url.replace('ais-dev-', 'ais-pre-');
    }
    if (window.location.pathname && window.location.pathname !== '/' && !window.location.pathname.endsWith('.html')) {
        url += window.location.pathname.replace(/\/$/, '');
    }
    return url;
}

function getPendingInvite() {
    try {
        let params = new URLSearchParams(window.location.search);
        let join = params.get('join');
        let code = params.get('code');
        let tribu = params.get('tribu');

        if (!join && !code && window.location.hash && window.location.hash.includes('?')) {
            const hashSearch = window.location.hash.substring(window.location.hash.indexOf('?'));
            params = new URLSearchParams(hashSearch);
            join = params.get('join');
            code = params.get('code');
            tribu = params.get('tribu');
        }

        if (join || code) {
            const invite = {
                familyId: join || '',
                code: code || '',
                tribuName: tribu || 'Familia'
            };
            sessionStorage.setItem('tribuapp_pending_invite', JSON.stringify(invite));
            return invite;
        }
        const saved = sessionStorage.getItem('tribuapp_pending_invite');
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
}

function setupInviteAuthUI(pendingInvite) {
    authMode = 'invite_join';
    if (inviteWelcomeBanner && inviteWelcomeText) {
        inviteWelcomeText.innerHTML = `<strong>👋 ¡Bienvenido/a a la tribu "${escapeHtml(pendingInvite.tribuName)}"!</strong><br><span style="font-size:12px; font-weight:normal; opacity:0.95;">Crea tu acceso para unirte a la familia en 1 clic:</span>`;
        inviteWelcomeBanner.classList.remove('hidden');
    }
    if (authNameGroup) {
        authNameGroup.classList.remove('hidden');
        if (authMemberNameInput) authMemberNameInput.required = true;
    }
    btnSubmit.innerText = `✨ Unirme a ${pendingInvite.tribuName}`;
    btnSubmit.style.background = 'linear-gradient(135deg, #10B981, #059669)';
    btnAuthMode.innerText = '¿Ya tienes cuenta en Tribuapp? Inicia sesión aquí';
    btnDemoLogin?.classList.add('hidden');
    btnResetPassword?.classList.add('hidden');
    authError?.classList.add('hidden');
    authMessage?.classList.add('hidden');
}

function resetStandardAuthUI() {
    if (inviteWelcomeBanner) inviteWelcomeBanner.classList.add('hidden');
    if (authNameGroup) {
        authNameGroup.classList.add('hidden');
        if (authMemberNameInput) authMemberNameInput.required = false;
    }
    btnSubmit.style.background = '';
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === '1' || urlParams.get('test') === '1') {
        btnDemoLogin?.classList.remove('hidden');
    } else {
        btnDemoLogin?.classList.add('hidden');
    }
    btnResetPassword?.classList.remove('hidden');
    updateAuthMode(authMode === 'signup' ? 'signup' : 'login');
}

// --- Session & Auth ---

function setCurrentUser(user) {
    if (currentUser?.id !== user?.id) {
        viewRenderId += 1;
    }
    currentUser = user;
    currentProfile = null;
}

function getFriendlyUserName() {
    return currentUser?.email ? currentUser.email.split('@')[0] : 'Tú';
}

async function checkSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            showAuthError(`No se pudo comprobar la sesión: ${error.message}`);
            return;
        }

        setCurrentUser(session?.user || null);
        await mostrarApp();
    } catch (error) {
        showAuthError(`No se pudo conectar con Supabase: ${error.message}`);
    }
}

function showAuthError(message) {
    authMessage.classList.add('hidden');
    authError.innerText = message;
    authError.classList.remove('hidden');
}

function showAuthMessage(message) {
    authError.classList.add('hidden');
    authMessage.innerText = message;
    authMessage.classList.remove('hidden');
}

function updateAuthMode(mode) {
    authMode = mode;
    const isSignup = mode === 'signup';
    btnSubmit.innerText = isSignup ? 'Crear cuenta' : 'Iniciar sesión';
    btnSubmit.style.background = '';
    passwordInput.autocomplete = isSignup ? 'new-password' : 'current-password';
    btnAuthMode.innerText = isSignup ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
    btnResetPassword.classList.toggle('hidden', isSignup);
    authError.classList.add('hidden');
    authMessage.classList.add('hidden');
}

btnAuthMode.addEventListener('click', () => {
    const pendingInvite = getPendingInvite();
    if (pendingInvite) {
        if (authMode === 'invite_join') {
            authMode = 'login';
            authNameGroup?.classList.add('hidden');
            if (authMemberNameInput) authMemberNameInput.required = false;
            btnSubmit.innerText = `Iniciar sesión y entrar a ${pendingInvite.tribuName}`;
            btnSubmit.style.background = '';
            btnAuthMode.innerText = '¿Es tu primera vez? Crea tu acceso para unirte';
            btnResetPassword?.classList.remove('hidden');
        } else {
            setupInviteAuthUI(pendingInvite);
        }
        authError.classList.add('hidden');
        authMessage.classList.add('hidden');
        return;
    }
    updateAuthMode(authMode === 'login' ? 'signup' : 'login');
});

if (btnDemoLogin) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === '1' || urlParams.get('test') === '1') {
        btnDemoLogin.classList.remove('hidden');
    }

    btnDemoLogin.addEventListener('click', () => {
        if (authMode !== 'login') updateAuthMode('login');
        emailInput.value = 'demo@tribuapp.com';
        passwordInput.value = 'password123';
        if (typeof authForm.requestSubmit === 'function') {
            authForm.requestSubmit();
        } else {
            btnSubmit.click();
        }
    });
}

btnResetPassword.addEventListener('click', async () => {
    const email = emailInput.value.trim().toLowerCase();
    if (!email) {
        showAuthError('Escribe tu correo electrónico y vuelve a pulsar “He olvidado mi contraseña”.');
        emailInput.focus();
        return;
    }

    btnResetPassword.disabled = true;
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        showAuthMessage('Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.');
    } catch (error) {
        showAuthError(`No se pudo solicitar el restablecimiento: ${error.message}`);
    } finally {
        btnResetPassword.disabled = false;
    }
});

passwordUpdateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    passwordUpdateError.classList.add('hidden');
    const password = document.getElementById('new-password').value;
    const confirmation = document.getElementById('confirm-password').value;
    if (password !== confirmation) {
        passwordUpdateError.innerText = 'Las contraseñas no coinciden.';
        passwordUpdateError.classList.remove('hidden');
        return;
    }

    const submitButton = passwordUpdateForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerText = 'Actualizando...';
    try {
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        passwordUpdateForm.reset();
        passwordUpdateForm.classList.add('hidden');
        authForm.classList.remove('hidden');
        document.querySelector('.auth-actions').classList.remove('hidden');
        if (data.user) {
            setCurrentUser(data.user);
            await mostrarApp();
        } else {
            showAuthMessage('Contraseña actualizada. Ya puedes iniciar sesión.');
        }
    } catch (error) {
        passwordUpdateError.innerText = `No se pudo actualizar la contraseña: ${error.message}`;
        passwordUpdateError.classList.remove('hidden');
    } finally {
        submitButton.disabled = false;
        submitButton.innerText = 'Actualizar contraseña';
    }
});

authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    authError.classList.add('hidden');
    authMessage.classList.add('hidden');
    btnSubmit.disabled = true;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const memberName = authMemberNameInput?.value.trim() || '';
    const pendingInvite = getPendingInvite();

    if (!email || !password) {
        showAuthError('Debes rellenar correo y contraseña.');
        btnSubmit.disabled = false;
        btnSubmit.innerText = authMode === 'signup' ? 'Crear cuenta' : (authMode === 'invite_join' ? `✨ Unirme a ${pendingInvite?.tribuName || 'la Tribu'}` : 'Iniciar sesión');
        return;
    }

    try {
        if (pendingInvite && authMode === 'invite_join') {
            btnSubmit.innerText = `Uniéndote a ${pendingInvite.tribuName}...`;
            let authUser = null;

            // Intento 1: Registro directo
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
            if (!signUpError && signUpData.user) {
                authUser = signUpData.user;
            } else if (signUpError) {
                const msg = (signUpError.message || '').toLowerCase();
                // Si el correo ya estaba registrado previamente, intentar inicio de sesión con esa contraseña
                if (msg.includes('already registered') || msg.includes('user already') || signUpError.status === 422) {
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                    if (signInError) {
                        throw new Error('Este correo ya está registrado en Tribuapp. Comprueba tu contraseña o pulsa en "¿Ya tienes cuenta? Inicia sesión".');
                    }
                    authUser = signInData.user;
                } else {
                    throw signUpError;
                }
            }

            if (!authUser) {
                throw new Error('No se pudo autenticar. Por favor, revisa tus datos.');
            }

            setCurrentUser(authUser);

            // Unión automática instantánea a la familia
            const joinedFamily = await handleJoinTribu(pendingInvite.familyId || pendingInvite.code || pendingInvite.tribuName, memberName || getFriendlyUserName());
            showToast(`🎉 ¡Bienvenido/a a ${joinedFamily?.nombre || pendingInvite.tribuName}!`);
            await mostrarApp();
            return;
        }

        if (authMode === 'signup') {
            btnSubmit.innerText = 'Creando cuenta...';
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            if (data.session && data.user) {
                setCurrentUser(data.user);
                if (pendingInvite) {
                    try {
                        await handleJoinTribu(pendingInvite.familyId || pendingInvite.code || pendingInvite.tribuName, memberName || getFriendlyUserName());
                    } catch (e) {
                        console.warn('Auto join error:', e);
                    }
                }
                await mostrarApp();
            } else {
                updateAuthMode('login');
                showAuthMessage('Cuenta creada con éxito. Ya puedes iniciar sesión.');
            }
        } else {
            // Modo login estándar o con invitación
            btnSubmit.innerText = 'Iniciando sesión...';
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (!data.user) throw new Error('Supabase no devolvió el usuario autenticado.');
            setCurrentUser(data.user);

            if (pendingInvite) {
                try {
                    const joined = await handleJoinTribu(pendingInvite.familyId || pendingInvite.code || pendingInvite.tribuName, memberName || getFriendlyUserName());
                    showToast(`🎉 ¡Te has unido a ${joined?.nombre || pendingInvite.tribuName}!`);
                } catch (e) {
                    console.warn('Auto join error on login:', e);
                }
            }
            await mostrarApp();
        }
    } catch (error) {
        showAuthError(error.message || 'No se pudo completar la operación.');
    } finally {
        btnSubmit.disabled = false;
        if (pendingInvite && authMode === 'invite_join') {
            btnSubmit.innerText = `✨ Unirme a ${pendingInvite.tribuName}`;
        } else if (authMode === 'signup') {
            btnSubmit.innerText = 'Crear cuenta';
        } else {
            btnSubmit.innerText = 'Iniciar sesión';
        }
    }
});

btnLogout.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) console.warn(error);
    } catch (error) {
        console.warn(error);
    }

    setCurrentUser(null);
    currentProfile = null;
    authForm.reset();
    authView.classList.remove('hidden');
    onboardingView.classList.add('hidden');
    appView.classList.add('hidden');
    authError.classList.add('hidden');
    if (headerTribeBadge) headerTribeBadge.classList.add('hidden');
});

async function mostrarApp() {
    authView.classList.add('hidden');

    const pendingInvite = getPendingInvite();

    if (!currentUser) {
        authView.classList.remove('hidden');
        onboardingView.classList.add('hidden');
        appView.classList.add('hidden');
        if (pendingInvite) {
            setupInviteAuthUI(pendingInvite);
        } else {
            resetStandardAuthUI();
        }
        return;
    }

    const { data: profile, error } = await supabase
        .from('usuarios')
        .select('id, familia_id, nombre, rol')
        .eq('id', currentUser.id)
        .maybeSingle();

    if (error) {
        onboardingView.classList.add('hidden');
        appView.classList.add('hidden');
        authView.classList.remove('hidden');
        showAuthError(`No se pudo cargar tu perfil: ${error.message}`);
        return;
    }

    currentProfile = profile;
    if (!profile) {
        // Si hay una invitación pendiente, unirse automáticamente sin pantallas intermedias
        if (pendingInvite) {
            try {
                const joined = await handleJoinTribu(pendingInvite.familyId || pendingInvite.code || pendingInvite.tribuName, getFriendlyUserName());
                showToast(`🎉 ¡Bienvenido/a a "${joined?.nombre || pendingInvite.tribuName}"!`);
                onboardingView.classList.add('hidden');
                appView.classList.remove('hidden');
                if (headerTribeBadge) headerTribeBadge.classList.remove('hidden');
                renderizarVista('dashboard');
                return;
            } catch (autoErr) {
                console.warn('Auto-join failed, mostrando onboarding manual:', autoErr);
            }
        }

        onboardingView.classList.remove('hidden');
        appView.classList.add('hidden');

        // Pre-configurar onboarding basado en la invitación
        if (pendingInvite) {
            tabJoinTribu?.classList.add('active');
            tabCreateTribu?.classList.remove('active');
            joinTribuForm?.classList.remove('hidden');
            onboardingForm?.classList.add('hidden');
            if (joinCodigoInput) joinCodigoInput.value = pendingInvite.code || pendingInvite.familyId;
            if (joinNombreInput) joinNombreInput.value = getFriendlyUserName();
            if (inviteDetectedBanner && inviteDetectedText) {
                inviteDetectedText.innerText = `Te estás uniendo a la tribu "${pendingInvite.tribuName}" (Código: ${pendingInvite.code || pendingInvite.familyId})`;
                inviteDetectedBanner.classList.remove('hidden');
            }
        } else {
            inviteDetectedBanner?.classList.add('hidden');
        }
        return;
    }

    // Si el usuario ya tenía perfil pero abre un enlace de otra tribu diferente
    if (pendingInvite && pendingInvite.familyId && profile.familia_id !== pendingInvite.familyId) {
        const switchFamily = confirm(`Has recibido una invitación para unirte a la tribu "${pendingInvite.tribuName}". ¿Deseas unirte a esta tribu ahora?`);
        if (switchFamily) {
            try {
                await handleJoinTribu(pendingInvite.familyId || pendingInvite.code, profile.nombre);
                showToast(`🎉 ¡Te has unido a "${pendingInvite.tribuName}"!`);
            } catch (err) {
                showToast(err.message || 'No se pudo cambiar de tribu');
            }
        }
        sessionStorage.removeItem('tribuapp_pending_invite');
    }

    onboardingView.classList.add('hidden');
    appView.classList.remove('hidden');
    if (headerTribeBadge) headerTribeBadge.classList.remove('hidden');
    renderizarVista('dashboard');
}

async function handleJoinTribu(codigoOId, memberName) {
    if (!currentUser) throw new Error('Debes haber iniciado sesión');

    let family = null;
    const cleanInput = String(codigoOId || '').trim();
    if (!cleanInput) throw new Error('Introduce un código de invitación o enlace');

    // 1. Búsqueda por UUID exacto
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanInput)) {
        const { data, error } = await supabase
            .from('familias')
            .select('id, nombre, dieta_base')
            .eq('id', cleanInput)
            .maybeSingle();
        if (!error && data) family = data;
    }

    // 2. Búsqueda segura por prefijo de código o nombre (en JS para evitar errores de casting en PostgreSQL)
    if (!family) {
        let prefix = cleanInput.toUpperCase().replace('TRIBU-', '').toLowerCase().trim();
        const { data: allFamilias, error: famError } = await supabase
            .from('familias')
            .select('id, nombre, dieta_base');

        if (!famError && Array.isArray(allFamilias) && allFamilias.length > 0) {
            if (prefix.length >= 3) {
                family = allFamilias.find(f => {
                    const rawId = String(f.id || '').replace(/-/g, '').toLowerCase();
                    const cleanPref = prefix.replace(/-/g, '');
                    return rawId.startsWith(cleanPref) || String(f.id || '').toLowerCase().startsWith(prefix);
                });
            }
            if (!family) {
                family = allFamilias.find(f => f.nombre.toLowerCase().includes(cleanInput.toLowerCase()));
            }
        }
    }

    if (!family) {
        throw new Error('No se encontró ninguna tribu con ese código. Comprueba que el enlace sea el correcto.');
    }

    // Guardar o actualizar usuario en la tabla usuarios vinculándolo a la familia ('Usuario' o 'Admin' según usuarios_rol_check)
    let { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .upsert({
            id: currentUser.id,
            familia_id: family.id,
            nombre: memberName || getFriendlyUserName(),
            rol: 'Usuario',
        })
        .select('id, familia_id, nombre, rol')
        .single();

    if (profileError && profileError.message && profileError.message.includes('usuarios_rol_check')) {
        const retry = await supabase
            .from('usuarios')
            .upsert({
                id: currentUser.id,
                familia_id: family.id,
                nombre: memberName || getFriendlyUserName(),
                rol: 'Admin',
            })
            .select('id, familia_id, nombre, rol')
            .single();

        if (!retry.error) {
            profile = retry.data;
            profileError = null;
        }
    }

    if (profileError) throw profileError;

    currentProfile = profile;
    sessionStorage.removeItem('tribuapp_pending_invite');
    return family;
}

tabJoinTribu?.addEventListener('click', () => {
    tabJoinTribu.classList.add('active');
    tabCreateTribu.classList.remove('active');
    joinTribuForm.classList.remove('hidden');
    onboardingForm.classList.add('hidden');
    onboardingError.classList.add('hidden');
});

tabCreateTribu?.addEventListener('click', () => {
    tabCreateTribu.classList.add('active');
    tabJoinTribu.classList.remove('active');
    onboardingForm.classList.remove('hidden');
    joinTribuForm.classList.add('hidden');
    onboardingError.classList.add('hidden');
});

joinTribuForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    onboardingError.classList.add('hidden');
    btnJoinTribu.disabled = true;
    btnJoinTribu.innerText = 'Uniéndote...';

    const codigo = joinCodigoInput.value.trim();
    const nombre = joinNombreInput.value.trim() || getFriendlyUserName();

    try {
        const family = await handleJoinTribu(codigo, nombre);
        showToast(`🎉 ¡Te has unido a "${family.nombre}"!`);
        onboardingView.classList.add('hidden');
        appView.classList.remove('hidden');
        if (headerTribeBadge) headerTribeBadge.classList.remove('hidden');
        await renderizarVista('dashboard');
    } catch (err) {
        onboardingError.innerText = err.message || 'No se pudo unir a la tribu';
        onboardingError.classList.remove('hidden');
    } finally {
        btnJoinTribu.disabled = false;
        btnJoinTribu.innerText = 'Unirme a la Tribu';
    }
});

onboardingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    onboardingError.classList.add('hidden');
    btnOnboarding.disabled = true;
    btnOnboarding.innerText = 'Creando...';

    const nombreFamilia = document.getElementById('tribu-nombre').value.trim();
    const dieta = document.getElementById('tribu-dieta').value;
    const flexibilidad = document.getElementById('tribu-flexibilidad').value;

    if (!nombreFamilia) {
        alert('Pon un nombre para tu tribu.');
        btnOnboarding.disabled = false;
        btnOnboarding.innerText = 'Crear Tribu';
        return;
    }

    let createdFamilyId = null;
    try {
        const { data: family, error: familyError } = await supabase
            .from('familias')
            .insert({
                nombre: nombreFamilia,
                dieta_base: dieta,
                nivel_flexibilidad: flexibilidad,
            })
            .select('id')
            .single();

        if (familyError) throw familyError;
        createdFamilyId = family.id;

        const { data: profile, error: profileError } = await supabase
            .from('usuarios')
            .insert({
                id: currentUser.id,
                familia_id: family.id,
                nombre: getFriendlyUserName(),
                rol: 'Admin',
            })
            .select('id, familia_id, nombre, rol')
            .single();

        if (profileError) throw profileError;
        currentProfile = profile;
    } catch (error) {
        let message = `No se pudo crear la tribu: ${error.message}`;
        onboardingError.innerText = message;
        onboardingError.classList.remove('hidden');
        btnOnboarding.disabled = false;
        btnOnboarding.innerText = 'Crear Tribu';
        return;
    }

    onboardingView.classList.add('hidden');
    appView.classList.remove('hidden');
    if (headerTribeBadge) headerTribeBadge.classList.remove('hidden');
    await renderizarVista('dashboard');
    btnOnboarding.disabled = false;
    btnOnboarding.innerText = 'Crear Tribu';
    onboardingForm.reset();
});

navItems.forEach((item) => {
    item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-target');
        renderizarVista(targetView);
    });
});

async function renderizarVista(vista) {
    currentView = vista;
    const titles = { dashboard: 'Resumen', tareas: 'Tareas', menus: 'Menú', compra: 'Compra' };
    viewTitle.innerText = titles[vista] || 'Resumen';
    navItems.forEach((item) => {
        const active = item.getAttribute('data-target') === vista;
        item.classList.toggle('active', active);
        item.setAttribute('aria-current', active ? 'page' : 'false');
    });

    const renderId = ++viewRenderId;
    mainContent.innerHTML = '<p class="empty-state">Cargando...</p>';
    try {
        switch (vista) {
            case 'dashboard':
                await renderDashboard(renderId);
                break;
            case 'tareas':
                await cargarVistaTareas(renderId);
                break;
            case 'menus':
                renderMenuView();
                break;
            case 'compra':
                renderCompraView();
                break;
            default:
                currentView = 'dashboard';
                await renderDashboard(renderId);
        }
    } catch (error) {
        if (renderId === viewRenderId) {
            mainContent.innerHTML = `<p class="error-text" role="alert">${escapeHtml(error.message)}</p>`;
        }
    }
}

async function fetchFamilyData() {
    if (!currentProfile?.familia_id) {
        throw new Error('Tu perfil todavía no está vinculado a una tribu.');
    }

    const [familyResult, membersResult, tasksResult] = await Promise.all([
        supabase.from('familias').select('id, nombre, dieta_base').eq('id', currentProfile.familia_id).single(),
        supabase.from('usuarios').select('id, nombre, rol').eq('familia_id', currentProfile.familia_id),
        supabase.from('tareas_asignadas')
            .select('id, fecha_objetivo, estado, asignado_a, tareas_catalogo(nombre)')
            .eq('familia_id', currentProfile.familia_id)
            .order('fecha_objetivo', { ascending: true }),
    ]);

    if (familyResult.error) throw familyResult.error;
    if (membersResult.error) throw membersResult.error;

    let tasks = [];
    if (!tasksResult.error && Array.isArray(tasksResult.data)) {
        tasks = tasksResult.data;
    } else {
        const storedTasks = readFromStorage(STORAGE_KEYS.tasks, null);
        if (storedTasks && Array.isArray(storedTasks)) {
            tasks = storedTasks;
        } else {
            tasks = getSampleTasks(currentProfile.familia_id, currentProfile.id);
            saveToStorage(STORAGE_KEYS.tasks, tasks);
        }
    }

    return {
        family: familyResult.data,
        members: membersResult.data || [],
        tasks,
    };
}

// --- Invitación a la Tribu Modal ---

function openInviteModal(family) {
    const code = getInviteCode(family?.id);
    const publicUrl = getPublicAppUrl();
    const directJoinLink = `${publicUrl}?join=${encodeURIComponent(family?.id || '')}&code=${encodeURIComponent(code)}&tribu=${encodeURIComponent(family?.nombre || 'Mi Hogar')}`;
    const customDeployUrl = localStorage.getItem('tribuapp_custom_deploy_url') || '';

    const html = `
        <div class="modal-header">
            <h3>👥 Invitar a tu Tribu</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            Comparte este enlace con tus familiares. Al pulsar en él, entrarán directamente a tu tribu sin ningún error de acceso 403:
        </p>

        <div class="invite-code-box">
            <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Código de invitación</div>
            <div class="invite-code-val">${escapeHtml(code)}</div>
            <div style="font-size: 11px; color: var(--primary); margin-top: 6px;">Tribu: ${escapeHtml(family?.nombre || 'Mi Hogar')}</div>
        </div>

        <div style="background: var(--card-secondary-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">🔗 Enlace de acceso:</span>
                ${customDeployUrl ? '<span class="chip" style="font-size: 10px; padding: 2px 6px;">Render / Personalizado</span>' : '<span class="chip" style="font-size: 10px; padding: 2px 6px;">AI Studio Público</span>'}
            </div>
            <div style="font-size: 12px; word-break: break-all; color: var(--text-main); font-family: monospace; background: var(--card-bg); padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 6px;">${escapeHtml(directJoinLink)}</div>
            <div style="font-size: 11px; color: var(--success); font-weight: 600;">✨ Enlace verificado y abierto para familiares</div>
        </div>

        <!-- Opción para enlazar a Render / GitHub Pages si está desplegado allí -->
        <details style="margin-bottom: 14px; font-size: 13px; text-align: left;">
            <summary style="cursor: pointer; color: var(--primary); font-weight: 600; margin-bottom: 8px;">⚙️ ¿Usas Render o GitHub Pages? Cambiar enlace base</summary>
            <div style="background: var(--card-secondary-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; margin-top: 6px;">
                <label for="custom-deploy-url-input" style="font-size: 12px; margin-bottom: 4px; display: block; color: var(--text-muted);">
                    URL pública de tu despliegue (ej. https://mi-tribu.onrender.com):
                </label>
                <input type="url" id="custom-deploy-url-input" placeholder="https://..." value="${escapeHtml(customDeployUrl)}" style="margin-bottom: 8px; font-size: 13px; padding: 8px 12px;">
                <div style="display: flex; gap: 8px;">
                    <button type="button" id="btn-save-custom-url" class="btn-secondary" style="font-size: 12px; padding: 8px 12px; flex: 1;">Guardar URL</button>
                    ${customDeployUrl ? '<button type="button" id="btn-reset-custom-url" class="text-button" style="font-size: 12px;">Restablecer</button>' : ''}
                </div>
            </div>
        </details>

        <div class="form-actions" style="margin-bottom: 12px;">
            <button type="button" id="btn-copy-code" class="btn-secondary">📋 Copiar enlace y código</button>
        </div>

        <button type="button" id="btn-invite-wa" class="btn-primary btn-whatsapp" style="width: 100%;">
            💬 Enviar por WhatsApp a la familia
        </button>
    `;

    openModal(html);

    document.getElementById('btn-save-custom-url')?.addEventListener('click', () => {
        const inputVal = document.getElementById('custom-deploy-url-input')?.value.trim();
        if (inputVal && inputVal.startsWith('http')) {
            localStorage.setItem('tribuapp_custom_deploy_url', inputVal.replace(/\/$/, ''));
            showToast('✅ URL de despliegue guardada');
            openInviteModal(family);
        } else {
            showToast('Introduce una URL válida que empiece por https://');
        }
    });

    document.getElementById('btn-reset-custom-url')?.addEventListener('click', () => {
        localStorage.removeItem('tribuapp_custom_deploy_url');
        showToast('Restablecido al enlace público de AI Studio');
        openInviteModal(family);
    });

    document.getElementById('btn-copy-code')?.addEventListener('click', async () => {
        const text = `⛺ ¡Hola! Te invito a unirte a nuestra tribu familiar "${family?.nombre || 'Familia'}" en Tribuapp.\n\nCódigo: ${code}\nEnlace directo: ${directJoinLink}`;
        try {
            await navigator.clipboard.writeText(text);
            showToast('¡Enlace público y código copiados!');
        } catch {
            showToast(`Código: ${code}`);
        }
    });

    document.getElementById('btn-invite-wa')?.addEventListener('click', () => {
        const text = `⛺ ¡Hola! Te invito a unirte a nuestra tribu familiar *${family?.nombre || 'Familia'}* en Tribuapp.\n\nCódigo de acceso: *${code}*\n\n👉 Entra directamente aquí para unirte a la familia:\n${directJoinLink}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    });
}

btnInviteFamily?.addEventListener('click', async () => {
    try {
        const { family } = await fetchFamilyData();
        openInviteModal(family);
    } catch {
        openInviteModal({ id: 'TRIBU1', nombre: 'Mi Familia' });
    }
});

// --- DASHBOARD VIEW ---

async function renderDashboard(renderId) {
    const [{ family, members, tasks }, localState] = await Promise.all([fetchFamilyData(), getAppState()]);
    if (renderId !== viewRenderId) return;

    if (headerTribeBadge) {
        headerTribeBadge.innerText = `⛺ ${family.nombre}`;
        headerTribeBadge.classList.remove('hidden');
    }

    const todayIso = getLocalDateInputValue();
    const todayDayName = getTodayWeekDayName();

    const tasksForToday = tasks.filter((task) => task.fecha_objetivo === todayIso);
    const completedToday = tasksForToday.filter((task) => task.estado === 'Completada');
    const pendingToday = tasksForToday.filter((task) => task.estado !== 'Completada');
    const overdueTasks = tasks.filter((task) => task.estado !== 'Completada' && task.fecha_objetivo && task.fecha_objetivo < todayIso);
    const pendingTasks = tasks.filter((task) => task.estado !== 'Completada');

    const totalTodayCount = tasksForToday.length;
    const completedTodayCount = completedToday.length;
    const progressPercent = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : (pendingToday.length === 0 ? 100 : 0);

    const todayMenu = localState.menu.filter((item) => item.dia === todayDayName);
    const todayComida = todayMenu.find((item) => (item.tipo || 'Comida') === 'Comida');
    const todayCena = todayMenu.find((item) => item.tipo === 'Cena');

    const pendingShopping = localState.shopping.filter((item) => !item.comprado);
    const totalShopping = localState.shopping.length;
    const boughtShopping = localState.shopping.filter((item) => item.comprado).length;
    const shoppingPercent = totalShopping > 0 ? Math.round((boughtShopping / totalShopping) * 100) : 100;

    let todayTasksHtml = '';
    if (overdueTasks.length > 0) {
        todayTasksHtml += `
            <div class="alert-banner">
                <span>⚠️</span>
                <span>Tienes <strong>${overdueTasks.length}</strong> tarea${overdueTasks.length > 1 ? 's' : ''} atrasada${overdueTasks.length > 1 ? 's' : ''} de días anteriores.</span>
            </div>
        `;
    }

    const priorityTasks = [...overdueTasks, ...pendingToday];
    if (priorityTasks.length > 0) {
        todayTasksHtml += `<div class="today-tasks-container">` + priorityTasks.map((task) => {
            const isOverdue = task.fecha_objetivo && task.fecha_objetivo < todayIso;
            const assignedMember = members.find((m) => m.id === task.asignado_a);
            const assignedName = assignedMember?.nombre || 'Bolsa común';
            const badgeClass = isOverdue ? 'badge-overdue' : 'badge-today';
            const badgeLabel = isOverdue ? 'Atrasada' : 'Hoy';

            return `
                <div class="today-task-item">
                    <div class="today-task-info">
                        <span class="today-task-title">${escapeHtml(task.tareas_catalogo?.nombre || 'Tarea')}</span>
                        <div class="today-task-meta">
                            <span class="${badgeClass}">${badgeLabel}</span>
                            ${task.recurrencia && task.recurrencia !== 'Puntual' ? `<span class="recurrence-badge">🔄 ${escapeHtml(task.recurrencia)}</span>` : ''}
                            <span>👤 ${escapeHtml(assignedName)}</span>
                        </div>
                    </div>
                    <button data-complete-task-dash="${escapeHtml(task.id)}" class="btn-primary btn-icon-square" aria-label="Completar tarea" title="Marcar como completada">✓</button>
                </div>
            `;
        }).join('') + `</div>`;
    } else {
        todayTasksHtml += `
            <div class="empty-dashboard-block">
                <p>✨ ¡Todo al día! No tienes tareas pendientes para hoy.</p>
                <button type="button" class="btn-secondary btn-inline" data-nav-view="tareas">+ Asignar tarea</button>
            </div>
        `;
    }

    const todayMenuHtml = `
        <div class="today-meals-grid">
            <div class="today-meal-card">
                <div class="today-meal-header">
                    <span class="meal-badge comida">☀️ Comida</span>
                    <span class="meal-status ${todayComida ? '' : 'empty'}">${todayComida ? 'Planificado' : 'Pendiente'}</span>
                </div>
                ${todayComida ? `
                    <div class="today-meal-content">
                        <span class="today-meal-icon">🍲</span>
                        <div>
                            <strong class="today-meal-name">${escapeHtml(todayComida.nombre)}</strong>
                            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">⏱️ ${escapeHtml(todayComida.tiempo || '25 min')} · ${todayComida.ingredientes?.length || 0} ingr.</div>
                        </div>
                    </div>
                ` : `
                    <div class="today-meal-empty">
                        <p>Sin plato para el mediodía.</p>
                        <button type="button" class="text-button" data-add-meal="Comida">+ Añadir comida</button>
                    </div>
                `}
            </div>

            <div class="today-meal-card">
                <div class="today-meal-header">
                    <span class="meal-badge cena">🌙 Cena</span>
                    <span class="meal-status ${todayCena ? '' : 'empty'}">${todayCena ? 'Planificado' : 'Pendiente'}</span>
                </div>
                ${todayCena ? `
                    <div class="today-meal-content">
                        <span class="today-meal-icon">🥗</span>
                        <div>
                            <strong class="today-meal-name">${escapeHtml(todayCena.nombre)}</strong>
                            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">⏱️ ${escapeHtml(todayCena.tiempo || '20 min')} · ${todayCena.ingredientes?.length || 0} ingr.</div>
                        </div>
                    </div>
                ` : `
                    <div class="today-meal-empty">
                        <p>Sin plato para la noche.</p>
                        <button type="button" class="text-button" data-add-meal="Cena">+ Añadir cena</button>
                    </div>
                `}
            </div>
        </div>
    `;

    mainContent.innerHTML = `
        <div class="dashboard-header">
            <div>
                <p class="eyebrow">Resumen del hogar</p>
                <h3>${escapeHtml(family.nombre)}</h3>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
                <span class="chip">${escapeHtml(family.dieta_base || 'Dieta')}</span>
                <button type="button" id="btn-dash-invite" class="chip" style="cursor: pointer;">👥 Invitar</button>
            </div>
        </div>

        ${getPushPermissionStatus() === 'default' ? `
            <div class="notif-quick-banner" id="banner-enable-notif">
                <div class="notif-quick-banner-content">
                    <span style="font-size: 20px;">🔔</span>
                    <span>Activa las notificaciones para que la tribu no olvide tareas ni comidas de hoy.</span>
                </div>
                <button type="button" class="btn-notif-quick" id="btn-activate-notifs-banner">Activar</button>
            </div>
        ` : ''}

        <div class="dashboard-grid">
            <article class="stat-card">
                <span>Pendientes hoy</span>
                <strong>${pendingToday.length + overdueTasks.length}</strong>
            </article>
            <article class="stat-card">
                <span>Progreso tareas</span>
                <strong>${progressPercent}%</strong>
            </article>
            <article class="stat-card">
                <span>Por comprar</span>
                <strong>${pendingShopping.length}</strong>
            </article>
        </div>

        <!-- Progreso Visual Diario del Hogar -->
        <section class="daily-progress-card" aria-label="Progreso del día">
            <div class="progress-header">
                <span class="progress-title">🎯 Progreso del día</span>
                <span class="progress-badge ${totalTodayCount > 0 && progressPercent === 100 ? 'complete' : ''}">
                    ${totalTodayCount > 0 ? `${completedTodayCount}/${totalTodayCount} tareas (${progressPercent}%)` : (pendingToday.length === 0 ? 'Al día ✨' : `${pendingToday.length} pendiente${pendingToday.length > 1 ? 's' : ''}`)}
                </span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="progress-hint">
                <span>${totalTodayCount > 0 && progressPercent === 100 
                    ? '🎉 ¡Todas las tareas de hoy completadas! Gran trabajo en equipo.' 
                    : (pendingToday.length > 0 ? `Quedan ${pendingToday.length} tarea${pendingToday.length > 1 ? 's' : ''} pendientes para hoy` : '✨ Sin tareas pendientes para hoy')}</span>
                ${totalShopping > 0 ? `<span style="font-size: 11px;">🛒 Compra: ${boughtShopping}/${totalShopping} (${shoppingPercent}%)</span>` : ''}
            </div>
        </section>

        <!-- Tareas para hoy -->
        <section class="panel" aria-labelledby="dash-tasks-title">
            <div class="section-header-compact">
                <h4 id="dash-tasks-title">✅ Tareas para hoy</h4>
                <button type="button" class="text-button" data-nav-view="tareas">Ver todas (${pendingTasks.length}) →</button>
            </div>
            ${todayTasksHtml}
        </section>

        <!-- Menú de hoy -->
        <section class="panel" aria-labelledby="dash-menu-title">
            <div class="section-header-compact">
                <h4 id="dash-menu-title">🍽️ Menú de hoy (${escapeHtml(todayDayName)})</h4>
                <button type="button" class="text-button" data-nav-view="menus">Ver semana →</button>
            </div>
            ${todayMenuHtml}
            <div style="display: flex; gap: 8px; margin-top: 14px;">
                <button type="button" id="btn-quick-pantry-review" class="btn-secondary" style="font-size: 12px; padding: 8px 12px; flex: 1;">🛒 Revisar despensa y comprar</button>
            </div>
        </section>

        <!-- Miembros -->
        <section class="panel" aria-labelledby="dash-members-title">
            <div class="section-header-compact">
                <h4 id="dash-members-title">👥 Miembros de la Tribu</h4>
                <button type="button" class="text-button" id="btn-dash-invite-2">+ Invitar</button>
            </div>
            <div class="member-list">
                ${members.map((member) => `
                    <div class="member-pill">
                        <span class="member-avatar">${escapeHtml((member.nombre || 'T').charAt(0).toUpperCase())}</span>
                        <span>${escapeHtml(member.nombre || 'Miembro')}</span>
                        ${member.rol === 'Admin' ? '<span class="chip" style="font-size: 10px; padding: 2px 6px;">Admin</span>' : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    `;

    mainContent.querySelectorAll('[data-nav-view]').forEach((button) => {
        button.addEventListener('click', () => {
            renderizarVista(button.dataset.navView);
        });
    });

    mainContent.querySelectorAll('[data-add-meal]').forEach((button) => {
        button.addEventListener('click', () => {
            currentView = 'menus';
            viewTitle.innerText = 'Menú';
            navItems.forEach((nav) => {
                const active = nav.getAttribute('data-target') === 'menus';
                nav.classList.toggle('active', active);
                nav.setAttribute('aria-current', active ? 'page' : 'false');
            });
            renderMenuView(todayDayName, button.dataset.addMeal);
        });
    });

    document.getElementById('btn-dash-invite')?.addEventListener('click', () => openInviteModal(family));
    document.getElementById('btn-dash-invite-2')?.addEventListener('click', () => openInviteModal(family));
    document.getElementById('btn-quick-pantry-review')?.addEventListener('click', openPantryReviewModal);

    document.getElementById('btn-activate-notifs-banner')?.addEventListener('click', async () => {
        const ok = await requestPushPermission();
        if (ok) {
            await renderizarVista('dashboard');
        }
    });

    if (getPushPermissionStatus() === 'granted') {
        triggerPendingTasksAlert(tasks, false);
    }

    mainContent.querySelectorAll('[data-complete-task-dash]').forEach((button) => {
        button.addEventListener('click', async () => {
            button.disabled = true;
            await completarTarea(button.dataset.completeTaskDash);
        });
    });
}

// --- TAREAS VIEW (Filtros, Recurrencia y Progreso Visual) ---

async function completarTarea(taskId) {
    let task = null;
    const storedTasks = readFromStorage(STORAGE_KEYS.tasks, []);
    task = storedTasks.find(t => t.id === taskId);

    try {
        const { data, error } = await supabase.from('tareas_asignadas')
            .update({ estado: 'Completada' })
            .eq('id', taskId)
            .eq('familia_id', currentProfile.familia_id)
            .select('id')
            .maybeSingle();

        if (error || !data) {
            const updated = storedTasks.map((t) => t.id === taskId ? { ...t, estado: 'Completada' } : t);
            saveToStorage(STORAGE_KEYS.tasks, updated);
        }
    } catch {
        const updated = storedTasks.map((t) => t.id === taskId ? { ...t, estado: 'Completada' } : t);
        saveToStorage(STORAGE_KEYS.tasks, updated);
    }

    showToast('¡Tarea completada!');

    // Recurrencia: programar próxima aparición automática si es periódica
    if (task && task.recurrencia && task.recurrencia !== 'Puntual') {
        const nextDate = computeNextRecurringDate(task.fecha_objetivo || getLocalDateInputValue(), task.recurrencia);
        if (nextDate) {
            const recurringTask = {
                id: crypto.randomUUID(),
                fecha_objetivo: nextDate,
                estado: 'Pendiente',
                asignado_a: task.asignado_a,
                recurrencia: task.recurrencia,
                tareas_catalogo: { nombre: task.tareas_catalogo?.nombre || 'Tarea' }
            };
            const currentList = readFromStorage(STORAGE_KEYS.tasks, []);
            currentList.push(recurringTask);
            saveToStorage(STORAGE_KEYS.tasks, currentList);
        }
    }

    await renderizarVista(currentView);
}

async function cargarVistaTareas(renderId) {
    const { members, tasks } = await fetchFamilyData();
    if (renderId !== viewRenderId) return;

    // Filter tasks
    const mineTasks = tasks.filter(t => t.asignado_a === currentProfile?.id);
    const poolTasks = tasks.filter(t => !t.asignado_a);

    let displayTasks = tasks;
    if (currentTaskFilter === 'mine') displayTasks = mineTasks;
    else if (currentTaskFilter === 'pool') displayTasks = poolTasks;

    const todayIso = getLocalDateInputValue();
    const tasksForToday = tasks.filter(t => t.fecha_objetivo === todayIso);
    const completedToday = tasksForToday.filter(t => t.estado === 'Completada');
    const pendingToday = tasksForToday.filter(t => t.estado !== 'Completada');
    const todayPercent = tasksForToday.length > 0 ? Math.round((completedToday.length / tasksForToday.length) * 100) : (pendingToday.length === 0 ? 100 : 0);

    mainContent.innerHTML = `
        <div class="section-header">
            <h3>Tareas de la Tribu</h3>
            <button id="btn-nueva-tarea" class="btn-primary btn-inline">+ Asignar tarea</button>
        </div>

        <!-- Progreso Visual de Tareas del Día -->
        <div class="daily-progress-card">
            <div class="progress-header">
                <span class="progress-title">🎯 Progreso de hoy</span>
                <span class="progress-badge ${tasksForToday.length > 0 && todayPercent === 100 ? 'complete' : ''}">
                    ${tasksForToday.length > 0 ? `${completedToday.length}/${tasksForToday.length} tareas (${todayPercent}%)` : (pendingToday.length === 0 ? 'Al día ✨' : `${pendingToday.length} pendientes`)}
                </span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${todayPercent}%;"></div>
            </div>
            <div class="progress-hint">
                <span>${tasksForToday.length > 0 && todayPercent === 100 ? '🎉 ¡Todas las tareas de hoy completadas!' : (pendingToday.length > 0 ? `Quedan ${pendingToday.length} tareas hoy` : '✨ Sin tareas pendientes para hoy')}</span>
                <span>📅 Hoy</span>
            </div>
        </div>

        <!-- Filtros rápidos -->
        <div class="filter-tabs">
            <button type="button" class="filter-tab ${currentTaskFilter === 'all' ? 'active' : ''}" data-task-filter="all">Todas (${tasks.length})</button>
            <button type="button" class="filter-tab ${currentTaskFilter === 'mine' ? 'active' : ''}" data-task-filter="mine">👤 Mis tareas (${mineTasks.length})</button>
            <button type="button" class="filter-tab ${currentTaskFilter === 'pool' ? 'active' : ''}" data-task-filter="pool">🧺 Bolsa común (${poolTasks.length})</button>
        </div>

        <form id="form-nueva-tarea" class="panel hidden">
            <label for="nueva-tarea-nombre">Nombre de la tarea</label>
            <input type="text" id="nueva-tarea-nombre" placeholder="Ej. Poner lavadora, pasar aspiradora..." maxlength="120" required>
            
            <div class="form-row-2">
                <div>
                    <label for="nueva-tarea-asignado">Asignar a</label>
                    <select id="nueva-tarea-asignado" class="input-select">
                        <option value="">🧺 Bolsa común (Cualquiera)</option>
                        ${members.map((member) => `<option value="${escapeHtml(member.id)}">${escapeHtml(member.nombre)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="nueva-tarea-fecha">Fecha límite</label>
                    <input type="date" id="nueva-tarea-fecha" class="input-select" required>
                </div>
            </div>

            <div>
                <label for="nueva-tarea-recurrencia">Repetición</label>
                <select id="nueva-tarea-recurrencia" class="input-select">
                    <option value="Puntual">Puntual (una sola vez)</option>
                    <option value="Diaria">🔄 Diaria (todos los días)</option>
                    <option value="Semanal">🔄 Semanal (cada 7 días)</option>
                    <option value="Quincenal">🔄 Quincenal (cada 15 días)</option>
                    <option value="Mensual">🔄 Mensual</option>
                </select>
            </div>

            <div class="form-actions" style="margin-top: 14px;">
                <button id="btn-guardar-tarea" type="submit" class="btn-primary">Guardar Tarea</button>
                <button id="btn-cancelar-tarea" type="button" class="btn-secondary">Cancelar</button>
            </div>
        </form>

        <div id="lista-tareas" class="task-list"></div>
    `;

    const lista = document.getElementById('lista-tareas');
    if (!displayTasks.length) {
        lista.innerHTML = `
            <div class="empty-dashboard-block">
                <p>No hay tareas en esta sección.</p>
                <button type="button" class="btn-secondary btn-inline" id="btn-empty-add-task">+ Crear nueva tarea</button>
            </div>
        `;
        document.getElementById('btn-empty-add-task')?.addEventListener('click', () => {
            document.getElementById('form-nueva-tarea')?.classList.remove('hidden');
        });
    } else {
        lista.innerHTML = displayTasks.map((task) => {
            const assignedName = members.find((member) => member.id === task.asignado_a)?.nombre || 'Bolsa común';
            const isOverdue = task.fecha_objetivo && task.fecha_objetivo < todayIso && task.estado !== 'Completada';
            const date = task.fecha_objetivo
                ? new Date(`${task.fecha_objetivo}T00:00:00`).toLocaleDateString('es-ES')
                : 'Sin fecha';
            const completed = task.estado === 'Completada';

            return `
                <div class="task-card ${completed ? 'completed' : ''}">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <strong>${escapeHtml(task.tareas_catalogo?.nombre || 'Tarea')}</strong>
                            ${isOverdue ? '<span class="badge-overdue">Atrasada</span>' : ''}
                        </div>
                        <div class="today-task-meta" style="margin-top: 4px;">
                            <span>📅 ${escapeHtml(date)}</span>
                            <span>👤 ${escapeHtml(assignedName)}</span>
                            ${task.recurrencia && task.recurrencia !== 'Puntual' ? `<span class="recurrence-badge">🔄 ${escapeHtml(task.recurrencia)}</span>` : ''}
                        </div>
                    </div>
                    ${completed
                        ? '<span aria-label="Completada" style="color: var(--success); font-weight: bold; font-size: 18px;">✓</span>'
                        : `<button data-complete-task="${escapeHtml(task.id)}" class="btn-primary btn-icon-square" aria-label="Completar tarea">✓</button>`}
                </div>
            `;
        }).join('');
    }

    // Filter clicks
    document.querySelectorAll('[data-task-filter]').forEach(tab => {
        tab.addEventListener('click', () => {
            currentTaskFilter = tab.dataset.taskFilter;
            cargarVistaTareas(renderId);
        });
    });

    document.getElementById('btn-nueva-tarea').addEventListener('click', () => {
        const form = document.getElementById('form-nueva-tarea');
        form.classList.toggle('hidden');
        const fechaInput = document.getElementById('nueva-tarea-fecha');
        const today = getLocalDateInputValue();
        fechaInput.min = today;
        fechaInput.value = today;
    });

    document.getElementById('btn-cancelar-tarea')?.addEventListener('click', () => {
        document.getElementById('form-nueva-tarea').classList.add('hidden');
    });

    lista.querySelectorAll('[data-complete-task]').forEach((button) => {
        button.addEventListener('click', async () => {
            button.disabled = true;
            await completarTarea(button.dataset.completeTask);
        });
    });

    document.getElementById('form-nueva-tarea').addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = document.getElementById('btn-guardar-tarea');
        const nombre = document.getElementById('nueva-tarea-nombre').value.trim();
        const asignadoA = document.getElementById('nueva-tarea-asignado').value || null;
        const fecha = document.getElementById('nueva-tarea-fecha').value;
        const recurrencia = document.getElementById('nueva-tarea-recurrencia').value || 'Puntual';

        if (!nombre || !fecha) {
            alert('El nombre y la fecha son obligatorios.');
            return;
        }

        button.disabled = true;
        button.innerText = 'Guardando...';
        try {
            const { data: catalog, error: catalogError } = await supabase.from('tareas_catalogo')
                .insert({ familia_id: currentProfile.familia_id, nombre })
                .select('id')
                .single();
            if (catalogError) throw catalogError;

            const { error: assignmentError } = await supabase.from('tareas_asignadas')
                .insert({
                    familia_id: currentProfile.familia_id,
                    tarea_id: catalog.id,
                    asignado_a: asignadoA,
                    fecha_objetivo: fecha,
                })
                .select('id')
                .single();
            if (assignmentError) throw assignmentError;
        } catch (error) {
            console.warn('Guardando tarea localmente:', error.message);
            const storedTasks = readFromStorage(STORAGE_KEYS.tasks, []);
            storedTasks.push({
                id: crypto.randomUUID(),
                fecha_objetivo: fecha,
                estado: 'Pendiente',
                asignado_a: asignadoA,
                recurrencia,
                puntos,
                tareas_catalogo: { nombre },
            });
            saveToStorage(STORAGE_KEYS.tasks, storedTasks);
        }

        showToast('Tarea creada y asignada');
        if (fecha === getLocalDateInputValue()) {
            showServiceWorkerNotification('📋 Nueva tarea para hoy', {
                body: `Se ha asignado "${nombre}" para hoy.`,
                data: { view: 'tareas', url: './' }
            });
        }
        await renderizarVista(currentView);
    });
}

// --- MENÚ VIEW (IA Gemini, Recetas, Despensa y WhatsApp) ---

function openRecipeModal(dish) {
    const ingList = Array.isArray(dish.ingredientes) && dish.ingredientes.length ? dish.ingredientes : ['Ingredientes habituales del hogar'];
    const html = `
        <div class="modal-header">
            <h3>🍲 ${escapeHtml(dish.nombre)}</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
            <span class="day-badge">${escapeHtml(dish.dia)}</span>
            <span class="meal-badge ${dish.tipo === 'Cena' ? 'cena' : 'comida'}">${dish.tipo === 'Cena' ? '🌙 Cena' : '☀️ Comida'}</span>
            <span class="chip" style="font-size: 11px;">⏱️ ${escapeHtml(dish.tiempo || '25 min')}</span>
        </div>
        <h4 style="font-size: 14px; margin-bottom: 8px;">Ingredientes clave:</h4>
        <ul style="padding-left: 20px; font-size: 14px; line-height: 1.6; color: var(--text-main); margin-bottom: 16px;">
            ${ingList.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
        </ul>
        <div class="modal-footer">
            <button type="button" id="btn-add-recipe-to-shop" class="btn-primary">🛒 Pasar estos ingredientes a la compra</button>
            <button type="button" class="btn-secondary" onclick="document.getElementById('modal-container').classList.add('hidden')">Cerrar</button>
        </div>
    `;

    openModal(html);

    document.getElementById('btn-add-recipe-to-shop')?.addEventListener('click', () => {
        const state = getAppState();
        let added = 0;
        ingList.forEach(ing => {
            const exists = state.shopping.some(s => s.nombre.toLowerCase() === ing.toLowerCase() && !s.comprado);
            if (!exists) {
                state.shopping.push({
                    id: crypto.randomUUID(),
                    nombre: ing,
                    seccion: getAisleCategory(ing),
                    comprado: false
                });
                added++;
            }
        });
        saveAppState(state);
        showToast(`¡Añadidos ${added} ingredientes a la lista de compra!`);
        closeModal();
    });
}

function openPantryReviewModal() {
    const state = getAppState();
    const allIngredients = [];
    state.menu.forEach(dish => {
        const ingList = Array.isArray(dish.ingredientes) ? dish.ingredientes : [];
        ingList.forEach(ing => {
            if (ing && typeof ing === 'string') {
                allIngredients.push({
                    nombre: ing.trim(),
                    plato: dish.nombre,
                    seccion: getAisleCategory(ing)
                });
            }
        });
    });

    if (!allIngredients.length) {
        showToast('No hay ingredientes registrados en el menú actual.');
        return;
    }

    const uniqueMap = new Map();
    allIngredients.forEach(it => {
        const key = it.nombre.toLowerCase();
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, it);
        }
    });
    const uniqueIngredients = Array.from(uniqueMap.values());

    const html = `
        <div class="modal-header">
            <h3>🛒 Revisar despensa antes de comprar</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
            Marca lo que <strong>te falta</strong> para comprar. Si ya lo tienes en casa, desmárcalo.
        </p>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <button type="button" id="btn-pantry-select-all" class="text-button" style="font-size: 12px;">Marcar todos</button>
            <button type="button" id="btn-pantry-deselect-all" class="text-button" style="font-size: 12px;">Desmarcar todos</button>
        </div>
        <div class="pantry-checklist">
            ${uniqueIngredients.map((it, idx) => `
                <div class="pantry-item-row" id="pantry-row-${idx}">
                    <label class="pantry-item-label">
                        <input type="checkbox" class="pantry-chk" checked data-idx="${idx}" data-name="${escapeHtml(it.nombre)}" data-seccion="${escapeHtml(it.seccion)}">
                        <div>
                            <strong>${escapeHtml(it.nombre)}</strong>
                            <div style="font-size: 11px; color: var(--text-muted);">${AISLE_ICONS[it.seccion] || '📦'} ${escapeHtml(it.seccion)} · <span style="font-style: italic;">${escapeHtml(it.plato)}</span></div>
                        </div>
                    </label>
                    <span class="pantry-tag" id="pantry-tag-${idx}">Comprar</span>
                </div>
            `).join('')}
        </div>
        <div class="modal-footer">
            <button type="button" id="btn-confirm-pantry-to-shop" class="btn-primary">Añadir a la lista de compra</button>
            <button type="button" class="btn-secondary" onclick="document.getElementById('modal-container').classList.add('hidden')">Cancelar</button>
        </div>
    `;

    openModal(html);

    const chks = document.querySelectorAll('.pantry-chk');
    chks.forEach(chk => {
        chk.addEventListener('change', () => {
            const row = document.getElementById(`pantry-row-${chk.dataset.idx}`);
            const tag = document.getElementById(`pantry-tag-${chk.dataset.idx}`);
            if (chk.checked) {
                row?.classList.remove('in-pantry');
                if (tag) {
                    tag.innerText = 'Comprar';
                    tag.style.background = '#e2e8f0';
                    tag.style.color = '#475569';
                }
            } else {
                row?.classList.add('in-pantry');
                if (tag) {
                    tag.innerText = 'En despensa';
                    tag.style.background = '#dcfce7';
                    tag.style.color = '#15803d';
                }
            }
        });
    });

    document.getElementById('btn-pantry-select-all')?.addEventListener('click', () => {
        chks.forEach(c => { c.checked = true; c.dispatchEvent(new Event('change')); });
    });
    document.getElementById('btn-pantry-deselect-all')?.addEventListener('click', () => {
        chks.forEach(c => { c.checked = false; c.dispatchEvent(new Event('change')); });
    });

    document.getElementById('btn-confirm-pantry-to-shop')?.addEventListener('click', () => {
        const toAdd = [];
        chks.forEach(c => {
            if (c.checked) {
                toAdd.push({
                    id: crypto.randomUUID(),
                    nombre: c.dataset.name,
                    seccion: c.dataset.seccion,
                    comprado: false
                });
            }
        });

        if (toAdd.length) {
            const curState = getAppState();
            toAdd.forEach(newIt => {
                const exists = curState.shopping.some(s => s.nombre.toLowerCase() === newIt.nombre.toLowerCase() && !s.comprado);
                if (!exists) {
                    curState.shopping.push(newIt);
                }
            });
            saveAppState(curState);
            showToast(`¡Añadidos ${toAdd.length} artículos a la lista de compra!`);
        } else {
            showToast('¡Todo listo! Tienes todos los ingredientes en casa.');
        }
        closeModal();
    });
}

function getClientCuratedMenu(dieta = 'Mediterránea') {
    if (dieta === 'Vegetariana') {
        return [
            { dia: 'Lunes', tipo: 'Comida', nombre: 'Lentejas con verduras y calabaza', tiempo: '35 min', ingredientes: ['400g lentejas pardinas', '200g calabaza', '1 puerro', '2 zanahorias', 'Pimentón dulce'] },
            { dia: 'Lunes', tipo: 'Cena', nombre: 'Tortilla de espinacas y queso feta', tiempo: '20 min', ingredientes: ['4 huevos', '200g espinacas frescas', '60g queso feta', '1 diente de ajo', 'Aceite de oliva'] },
            { dia: 'Martes', tipo: 'Comida', nombre: 'Risotto cremoso de setas variadas', tiempo: '30 min', ingredientes: ['300g arroz carnaroli', '250g setas y champiñones', '1 cebolla', '50g queso parmesano', 'Caldo vegetal'] },
            { dia: 'Martes', tipo: 'Cena', nombre: 'Crema de calabacín con semillas', tiempo: '25 min', ingredientes: ['2 calabacines', '1 patata', '1 puerro', 'Semillas de calabaza', 'Picatostes'] },
            { dia: 'Miércoles', tipo: 'Comida', nombre: 'Garbanzos salteados con espinacas', tiempo: '20 min', ingredientes: ['400g garbanzos cocidos', '200g espinacas', '30g piñones', '2 dientes de ajo'] },
            { dia: 'Miércoles', tipo: 'Cena', nombre: 'Hamburguesas vegetales con ensalada', tiempo: '25 min', ingredientes: ['2 hamburguesas vegetales', 'Lechuga', '2 tomates', '1 aguacate'] },
            { dia: 'Jueves', tipo: 'Comida', nombre: 'Pasta integral con tomate y albahaca', tiempo: '20 min', ingredientes: ['350g pasta integral', '400g tomate triturado', 'Albahaca fresca', '1 cebolla', 'Queso rallado'] },
            { dia: 'Jueves', tipo: 'Cena', nombre: 'Fajitas de pimientos y guacamole', tiempo: '25 min', ingredientes: ['6 tortillas de trigo', '1 pimiento rojo', '1 pimiento verde', 'Guacamole casero'] },
            { dia: 'Viernes', tipo: 'Comida', nombre: 'Curry suave de garbanzos con arroz', tiempo: '30 min', ingredientes: ['400g garbanzos', '200ml leche de coco', '200g arroz basmati', 'Curry'] },
            { dia: 'Viernes', tipo: 'Cena', nombre: 'Pizza casera de verduras asadas', tiempo: '30 min', ingredientes: ['1 masa de pizza', '150g mozzarella', '1 calabacín', 'Tomates cherry', 'Orégano'] },
            { dia: 'Fin de semana', tipo: 'Comida', nombre: 'Arroz al horno con alcachofas', tiempo: '45 min', ingredientes: ['300g arroz', '4 alcachofas', '1 tomate rallado', 'Caldo vegetal', 'Azafrán'] },
            { dia: 'Fin de semana', tipo: 'Cena', nombre: 'Tacos de judías negras con maíz', tiempo: '25 min', ingredientes: ['6 tortillas', '200g judías negras', '1 lata maíz dulce', '2 tomates', 'Cilantro'] }
        ];
    }
    return [
        { dia: 'Lunes', tipo: 'Comida', nombre: 'Lentejas caseras con verduras y jamón', tiempo: '40 min', ingredientes: ['400g lentejas pardinas', '100g taquitos de jamón', '2 zanahorias', '1 cebolla', '1 patata', 'Laurel'] },
        { dia: 'Lunes', tipo: 'Cena', nombre: 'Tortilla de patatas con ensalada mixta', tiempo: '25 min', ingredientes: ['4 huevos frescos', '3 patatas medianas', 'Lechuga', '1 tomate', 'Aceite de oliva virgen extra'] },
        { dia: 'Martes', tipo: 'Comida', nombre: 'Salmón al horno con patatas panadera', tiempo: '30 min', ingredientes: ['4 lomos de salmón', '3 patatas', '1 cebolla', 'Aceite de oliva', 'Limón y eneldo'] },
        { dia: 'Martes', tipo: 'Cena', nombre: 'Crema de calabacín y picatostes dorados', tiempo: '20 min', ingredientes: ['2 calabacines', '1 puerro', '1 patata', '2 quesitos', 'Pan para picatostes'] },
        { dia: 'Miércoles', tipo: 'Comida', nombre: 'Pasta fresca con salsa boloñesa', tiempo: '30 min', ingredientes: ['350g pasta fresca', '300g carne picada', '400g tomate frito', '1 cebolla', 'Queso parmesano'] },
        { dia: 'Miércoles', tipo: 'Cena', nombre: 'Revuelto de setas y gambas con tostadas', tiempo: '15 min', ingredientes: ['4 huevos', '200g setas variadas', '150g gambas peladas', '2 dientes de ajo', 'Pan'] },
        { dia: 'Jueves', tipo: 'Comida', nombre: 'Pollo asado al limón con patatas', tiempo: '45 min', ingredientes: ['4 cuartos de pollo', '4 patatas', '1 limón', 'Romero fresco', 'Aceite de oliva'] },
        { dia: 'Jueves', tipo: 'Cena', nombre: 'Sándwich vegetal completo y gazpacho', tiempo: '15 min', ingredientes: ['Pan integral', 'Lechuga y tomate', '2 latas de atún', 'Mayonesa', 'Gazpacho fresco'] },
        { dia: 'Viernes', tipo: 'Comida', nombre: 'Arroz caldoso de marisco y pescado', tiempo: '35 min', ingredientes: ['300g arroz', '200g anillas de calamar', '200g gambones', 'Caldo de pescado', 'Pimentón'] },
        { dia: 'Viernes', tipo: 'Cena', nombre: 'Pizza casera margarita con jamón cocido', tiempo: '25 min', ingredientes: ['1 masa de pizza fresca', '200g mozzarella', '100g jamón cocido', 'Tomate frito', 'Orégano'] },
        { dia: 'Fin de semana', tipo: 'Comida', nombre: 'Paella mixta familiar tradicional', tiempo: '50 min', ingredientes: ['400g arroz bomba', '300g pollo troceado', '200g judías verdes', 'Caldo de ave', 'Azafrán'] },
        { dia: 'Fin de semana', tipo: 'Cena', nombre: 'Hamburguesas caseras con patatas gajo', tiempo: '25 min', ingredientes: ['4 panes de hamburguesa', '4 hamburguesas de ternera', 'Queso cheddar', 'Bacon', 'Tomate y lechuga'] }
    ];
}

function openAIGeneratorModal() {
    const curDiet = currentProfile?.familia?.dieta_base || 'Mediterránea';
    const html = `
        <div class="modal-header">
            <h3>✨ Generar Menú Semanal con IA</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
            Gemini creará un menú semanal completo con 12 comidas y cenas equilibradas e ingredientes detallados.
        </p>

        <form id="form-ai-menu">
            <label for="ai-dieta">Dieta o estilo del hogar</label>
            <select id="ai-dieta" class="input-select">
                <option value="Mediterránea" ${curDiet === 'Mediterránea' ? 'selected' : ''}>Dieta Mediterránea equilibrada</option>
                <option value="Vegetariana" ${curDiet === 'Vegetariana' ? 'selected' : ''}>Vegetariana (sin carne ni pescado)</option>
                <option value="Saludable y ligera">Baja en grasas, saludable y ligera</option>
                <option value="Familiar con niños">Platos caseros que encantan a niños</option>
            </select>

            <label for="ai-preferencias">Preferencias o ingredientes deseados (opcional)</label>
            <input type="text" id="ai-preferencias" placeholder="Ej. Platos rápidos, pescado azul, legumbres..." maxlength="120">

            <div id="ai-status-box" class="hidden" style="text-align: center; padding: 20px 10px;">
                <div style="font-size: 32px;">🧠✨</div>
                <p style="font-weight: 700; margin-top: 10px; color: var(--primary);">Diseñando menú con Gemini...</p>
                <p style="font-size: 12px; color: var(--text-muted);">Calculando variedad de platos y combinaciones de ingredientes.</p>
            </div>

            <div class="modal-footer" id="ai-modal-footer">
                <button type="submit" class="btn-primary btn-ai">✨ Generar menú inteligente</button>
                <button type="button" class="btn-secondary" onclick="document.getElementById('modal-container').classList.add('hidden')">Cancelar</button>
            </div>
        </form>
    `;

    openModal(html);

    document.getElementById('form-ai-menu')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusBox = document.getElementById('ai-status-box');
        const footer = document.getElementById('ai-modal-footer');
        const dieta = document.getElementById('ai-dieta').value;
        const preferencias = document.getElementById('ai-preferencias').value.trim();

        if (statusBox) statusBox.classList.remove('hidden');
        if (footer) footer.classList.add('hidden');

        try {
            const res = await fetch('/api/gemini/generate-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dieta, preferencias })
            });
            const data = await res.json();
            if (!data.menu || !Array.isArray(data.menu) || !data.menu.length) {
                throw new Error('Respuesta de menú no válida');
            }

            const state = getAppState();
            state.menu = data.menu.map(m => ({
                id: crypto.randomUUID(),
                dia: m.dia,
                tipo: m.tipo === 'Cena' ? 'Cena' : 'Comida',
                nombre: m.nombre,
                tiempo: m.tiempo || '25 min',
                ingredientes: Array.isArray(m.ingredientes) ? m.ingredientes : []
            }));
            saveAppState(state);

            showToast('¡Menú semanal creado con éxito!');
            closeModal();
            renderMenuView();

            showServiceWorkerNotification('🍽️ ¡Nuevo menú semanal listo!', {
                body: `Se ha planificado el menú de la tribu (${dieta}) con 12 platos equilibrados.`,
                data: { view: 'menus', url: './' }
            });

            setTimeout(() => {
                openPantryReviewModal();
            }, 600);
        } catch (err) {
            console.warn('Backend API no disponible (modo estático/GitHub Pages), usando menú equilibrado:', err);
            const fallbackList = getClientCuratedMenu(dieta);
            const state = getAppState();
            state.menu = fallbackList.map(m => ({
                id: crypto.randomUUID(),
                dia: m.dia,
                tipo: m.tipo === 'Cena' ? 'Cena' : 'Comida',
                nombre: m.nombre,
                tiempo: m.tiempo || '25 min',
                ingredientes: Array.isArray(m.ingredientes) ? m.ingredientes : []
            }));
            saveAppState(state);

            showToast('¡Menú semanal cargado con éxito!');
            closeModal();
            renderMenuView();

            showServiceWorkerNotification('🍽️ Menú semanal planificado', {
                body: `Se ha configurado el menú familiar (${dieta}) con recetas equilibradas.`,
                data: { view: 'menus', url: './' }
            });

            setTimeout(() => {
                openPantryReviewModal();
            }, 600);
        }
    });
}

function shareMenuWhatsApp() {
    const state = getAppState();
    let text = `🍽️ *Menú Semanal - Tribuapp*\n\n`;
    WEEK_DAYS.forEach(day => {
        const dayItems = state.menu.filter(i => i.dia === day);
        const comida = dayItems.find(i => (i.tipo || 'Comida') === 'Comida');
        const cena = dayItems.find(i => i.tipo === 'Cena');
        text += `📅 *${day.toUpperCase()}*\n`;
        text += `  ☀️ Comida: ${comida ? comida.nombre : 'Por definir'}\n`;
        text += `  🌙 Cena: ${cena ? cena.nombre : 'Por definir'}\n\n`;
    });
    text += `_Planificado con amor en Tribuapp_ ⛺`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

function renderMenuView(prefillDia = null, prefillTipo = null) {
    const state = getAppState();
    const todayDayName = getTodayWeekDayName();
    const daysToRender = currentMenuDayFilter === 'Todos' ? WEEK_DAYS : [currentMenuDayFilter];

    const daysHtml = daysToRender.map((day) => {
        const dayItems = state.menu.filter((item) => item.dia === day);
        const dayComidas = dayItems.filter((item) => (item.tipo || 'Comida') === 'Comida');
        const dayCenas = dayItems.filter((item) => item.tipo === 'Cena');

        return `
            <div class="weekly-day-card">
                <div class="weekly-day-header">
                    <strong>${day}</strong>
                    ${day === todayDayName ? '<span class="badge-today">Hoy</span>' : ''}
                </div>
                <div class="weekly-meals-slots">
                    <div class="meal-slot">
                        <span class="meal-badge comida">☀️ Comida</span>
                        ${dayComidas.length ? dayComidas.map((item) => `
                            <div class="meal-slot-item">
                                <span style="cursor: pointer;" data-view-recipe="${escapeHtml(item.id)}" title="Ver receta e ingredientes">${escapeHtml(item.nombre)}</span>
                                <div style="display: flex; gap: 4px; align-items: center;">
                                    <button class="text-button btn-delete-sm" data-view-recipe="${escapeHtml(item.id)}" title="Ver receta">🔍</button>
                                    <button class="text-button btn-delete-sm" data-delete-menu="${escapeHtml(item.id)}" aria-label="Eliminar plato" title="Eliminar plato">✕</button>
                                </div>
                            </div>
                        `).join('') : '<span class="empty-slot-text">Sin planificar</span>'}
                    </div>
                    <div class="meal-slot">
                        <span class="meal-badge cena">🌙 Cena</span>
                        ${dayCenas.length ? dayCenas.map((item) => `
                            <div class="meal-slot-item">
                                <span style="cursor: pointer;" data-view-recipe="${escapeHtml(item.id)}" title="Ver receta e ingredientes">${escapeHtml(item.nombre)}</span>
                                <div style="display: flex; gap: 4px; align-items: center;">
                                    <button class="text-button btn-delete-sm" data-view-recipe="${escapeHtml(item.id)}" title="Ver receta">🔍</button>
                                    <button class="text-button btn-delete-sm" data-delete-menu="${escapeHtml(item.id)}" aria-label="Eliminar plato" title="Eliminar plato">✕</button>
                                </div>
                            </div>
                        `).join('') : '<span class="empty-slot-text">Sin planificar</span>'}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    mainContent.innerHTML = `
        <div class="section-header">
            <div>
                <h3>Menú semanal</h3>
                <p class="local-note">Planifica comidas y cenas de tu hogar</p>
            </div>
            <button id="btn-agregar-menu" class="btn-primary btn-inline">+ Añadir plato</button>
        </div>

        <!-- Carrusel interactivo de días móvil -->
        <div class="day-carousel-container">
            <div class="day-carousel" id="menu-day-carousel">
                <button type="button" class="day-pill ${currentMenuDayFilter === 'Todos' ? 'active' : ''}" data-day-pill="Todos">
                    <span>📅 Toda la semana</span>
                </button>
                ${WEEK_DAYS.map((day) => `
                    <button type="button" class="day-pill ${currentMenuDayFilter === day ? 'active' : ''} ${day === todayDayName ? 'is-today' : ''}" data-day-pill="${day}">
                        ${day === todayDayName ? '<span class="pill-dot"></span>' : ''}
                        <span>${day}</span>
                    </button>
                `).join('')}
            </div>
        </div>

        ${currentMenuDayFilter !== 'Todos' ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 4px 2px;">
                <span style="font-size: 13px; color: var(--text-muted);">Viendo solo: <strong>${currentMenuDayFilter}</strong></span>
                <button type="button" class="text-button" id="btn-show-all-days" style="font-size: 13px;">Ver toda la semana →</button>
            </div>
        ` : ''}

        <!-- Barra de herramientas inteligentes -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
            <button type="button" id="btn-open-ai-menu" class="btn-primary btn-ai" style="flex: 1; padding: 10px 14px; font-size: 13px;">
                ✨ Generar menú con IA
            </button>
            <button type="button" id="btn-open-pantry-review" class="btn-secondary" style="flex: 1; padding: 10px 14px; font-size: 13px;">
                🛒 Revisar despensa y comprar
            </button>
            <button type="button" id="btn-share-menu-wa" class="btn-secondary btn-whatsapp" style="padding: 10px 14px; font-size: 13px;">
                💬 WhatsApp
            </button>
        </div>

        <form id="menu-form" class="panel ${prefillDia ? '' : 'hidden'}">
            <label for="menu-nombre">Nombre del plato</label>
            <input type="text" id="menu-nombre" placeholder="Ej. Risotto de setas o Tortilla francesa" maxlength="120" required>
            
            <div class="form-row-2">
                <div>
                    <label for="menu-dia">Día</label>
                    <select id="menu-dia" class="input-select">
                        ${WEEK_DAYS.map((day) => `<option value="${day}" ${day === (prefillDia || (currentMenuDayFilter !== 'Todos' ? currentMenuDayFilter : 'Lunes')) ? 'selected' : ''}>${day}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="menu-tipo">Momento</label>
                    <select id="menu-tipo" class="input-select">
                        <option value="Comida" ${prefillTipo === 'Comida' ? 'selected' : ''}>☀️ Comida</option>
                        <option value="Cena" ${prefillTipo === 'Cena' ? 'selected' : ''}>🌙 Cena</option>
                    </select>
                </div>
            </div>

            <div class="form-row-2">
                <div>
                    <label for="menu-tiempo">Tiempo estimado</label>
                    <input type="text" id="menu-tiempo" placeholder="Ej. 25 min" maxlength="30" value="25 min">
                </div>
                <div>
                    <label for="menu-ingredientes">Ingredientes (separados por coma)</label>
                    <input type="text" id="menu-ingredientes" placeholder="Ej. Arroz, setas, queso, cebolla" maxlength="200">
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-primary">Guardar plato</button>
                <button type="button" id="btn-cancelar-menu" class="btn-secondary">Cancelar</button>
            </div>
        </form>

        <div class="weekly-days-list">
            ${daysHtml}
        </div>
    `;
    addBackupControls(mainContent);

    if (prefillDia) {
        document.getElementById('menu-nombre').focus();
    }

    document.querySelectorAll('[data-day-pill]').forEach((btn) => {
        btn.addEventListener('click', () => {
            currentMenuDayFilter = btn.dataset.dayPill;
            renderMenuView();
        });
    });

    document.getElementById('btn-show-all-days')?.addEventListener('click', () => {
        currentMenuDayFilter = 'Todos';
        renderMenuView();
    });

    document.getElementById('btn-open-ai-menu')?.addEventListener('click', openAIGeneratorModal);
    document.getElementById('btn-open-pantry-review')?.addEventListener('click', openPantryReviewModal);
    document.getElementById('btn-share-menu-wa')?.addEventListener('click', shareMenuWhatsApp);

    document.getElementById('btn-agregar-menu').addEventListener('click', () => {
        const form = document.getElementById('menu-form');
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) document.getElementById('menu-nombre').focus();
    });

    document.getElementById('btn-cancelar-menu').addEventListener('click', () => {
        document.getElementById('menu-form').reset();
        document.getElementById('menu-form').classList.add('hidden');
    });

    document.getElementById('menu-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const nombre = document.getElementById('menu-nombre').value.trim();
        const dia = document.getElementById('menu-dia').value;
        const tipo = document.getElementById('menu-tipo').value || 'Comida';
        const tiempo = document.getElementById('menu-tiempo').value.trim() || '25 min';
        const rawIng = document.getElementById('menu-ingredientes').value.trim();
        const ingredientes = rawIng ? rawIng.split(',').map(s => s.trim()).filter(Boolean) : [];

        if (!nombre) {
            document.getElementById('menu-nombre').focus();
            return;
        }

        const state = getAppState();
        state.menu.push({ id: crypto.randomUUID(), nombre, dia, tipo, tiempo, ingredientes });
        if (!saveAppState(state)) return;
        document.getElementById('menu-form').reset();
        showToast('Plato guardado');
        renderMenuView();
    });

    mainContent.querySelectorAll('[data-view-recipe]').forEach((button) => {
        button.addEventListener('click', () => {
            const dish = state.menu.find(m => m.id === button.dataset.viewRecipe);
            if (dish) openRecipeModal(dish);
        });
    });

    mainContent.querySelectorAll('[data-delete-menu]').forEach((button) => {
        button.addEventListener('click', () => {
            const state = getAppState();
            state.menu = state.menu.filter((item) => item.id !== button.dataset.deleteMenu);
            if (!saveAppState(state)) return;
            renderMenuView();
        });
    });
}

// --- COMPRA VIEW (Pasillos, Cantidades, Progreso y WhatsApp) ---

function shareShoppingWhatsApp() {
    const state = getAppState();
    const pendingItems = state.shopping.filter(i => !i.comprado);
    if (!pendingItems.length) {
        showToast('La lista de compra está vacía');
        return;
    }
    let text = `🛒 *Lista de la compra - Tribuapp*\n\n`;

    AISLE_ORDER.forEach(aisle => {
        const items = pendingItems.filter(i => (i.seccion || getAisleCategory(i.nombre)) === aisle);
        if (items.length) {
            text += `${AISLE_ICONS[aisle]} *${aisle.toUpperCase()}*\n`;
            items.forEach(it => {
                text += `  • [ ] ${it.nombre}${it.cantidad ? ` (${it.cantidad})` : ''}\n`;
            });
            text += `\n`;
        }
    });

    text += `_Generado con Tribuapp_ ⛺`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

function renderCompraView() {
    const state = getAppState();
    const pendingItems = state.shopping.filter((item) => !item.comprado);
    const completedItems = state.shopping.filter((item) => item.comprado);
    const totalItems = state.shopping.length;
    const shoppingPercent = totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 100;

    // Group pending items by aisle
    const aislesMap = new Map();
    AISLE_ORDER.forEach(aisle => aislesMap.set(aisle, []));

    pendingItems.forEach(item => {
        const seccion = item.seccion || getAisleCategory(item.nombre);
        if (!aislesMap.has(seccion)) aislesMap.set(seccion, []);
        aislesMap.get(seccion).push(item);
    });

    let aislesHtml = '';
    aislesMap.forEach((items, aisle) => {
        if (!items.length) return;
        aislesHtml += `
            <div class="aisle-group">
                <div class="aisle-header">
                    <span>${AISLE_ICONS[aisle] || '📦'} ${escapeHtml(aisle)}</span>
                    <span class="aisle-count">${items.length}</span>
                </div>
                <div class="shopping-list">
                    ${items.map(item => `
                        <div class="shopping-item">
                            <label>
                                <input type="checkbox" data-toggle-shopping="${escapeHtml(item.id)}">
                                <div>
                                    <span>${escapeHtml(item.nombre)}</span>
                                    ${item.cantidad ? `<span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">(${escapeHtml(item.cantidad)})</span>` : ''}
                                </div>
                            </label>
                            <button class="text-button" data-delete-shopping="${escapeHtml(item.id)}" aria-label="Eliminar ${escapeHtml(item.nombre)}">✕</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    if (!aislesHtml) {
        aislesHtml = '<p class="empty-state">La lista está vacía. ¡Todo comprado o despensa llena!</p>';
    }

    mainContent.innerHTML = `
        <div class="section-header">
            <div>
                <h3>Lista de la compra</h3>
                <p class="local-note">Organizada por pasillos del supermercado · ${pendingItems.length} pendiente${pendingItems.length === 1 ? '' : 's'}</p>
            </div>
            <button id="btn-agregar-compra" class="btn-primary btn-inline">+ Producto</button>
        </div>

        <!-- Progreso Visual en el Supermercado -->
        <div class="shopping-progress-card">
            <div class="progress-header">
                <span>Progreso en el supermercado</span>
                <strong>${completedItems.length} de ${totalItems} productos (${shoppingPercent}%)</strong>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${shoppingPercent}%;"></div>
            </div>
            ${completedItems.length === totalItems && totalItems > 0 ? `
                <div class="progress-complete-msg">🎉 ¡Compra lista! Todos los productos están en el carrito.</div>
            ` : ''}
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
            <button type="button" id="btn-share-shop-wa" class="btn-primary btn-whatsapp" style="flex: 1; padding: 10px 14px; font-size: 13px;">
                💬 Compartir por WhatsApp
            </button>
            <button type="button" id="btn-compra-review-pantry" class="btn-secondary" style="flex: 1; padding: 10px 14px; font-size: 13px;">
                🛒 Traer del Menú
            </button>
        </div>

        <form id="shop-form" class="panel hidden">
            <label for="nueva-compra">Producto</label>
            <input type="text" id="nueva-compra" placeholder="Ej. Yogur griego, Manzanas..." maxlength="120" required>
            
            <div class="form-row-2">
                <div>
                    <label for="nueva-compra-cantidad">Cantidad (opcional)</label>
                    <input type="text" id="nueva-compra-cantidad" placeholder="Ej. 1 kg, 2 litros, 1 pack" maxlength="50">
                </div>
                <div>
                    <label for="nueva-compra-seccion">Pasillo / Sección</label>
                    <select id="nueva-compra-seccion" class="input-select">
                        <option value="auto">🪄 Detectar automáticamente</option>
                        ${AISLE_ORDER.map(a => `<option value="${a}">${AISLE_ICONS[a]} ${a}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-primary">Añadir a la lista</button>
                <button type="button" id="btn-cancelar-compra" class="btn-secondary">Cancelar</button>
            </div>
        </form>

        <div class="shopping-aisles-container">
            ${aislesHtml}
        </div>

        ${completedItems.length ? `
            <details class="completed-section">
                <summary>Comprados (${completedItems.length})</summary>
                <div class="shopping-list">${completedItems.map((item) => `
                    <div class="shopping-item done">
                        <label>
                            <input type="checkbox" data-toggle-shopping="${escapeHtml(item.id)}" checked>
                            <div>
                                <span>${escapeHtml(item.nombre)}</span>
                                ${item.cantidad ? `<span style="font-size: 11px; margin-left: 6px;">(${escapeHtml(item.cantidad)})</span>` : ''}
                            </div>
                        </label>
                        <button class="text-button" data-delete-shopping="${escapeHtml(item.id)}" aria-label="Eliminar ${escapeHtml(item.nombre)}">✕</button>
                    </div>`).join('')}
                </div>
                <button id="btn-limpiar-comprados" class="btn-secondary" style="margin-top: 10px;">Quitar comprados</button>
            </details>` : ''}
    `;
    addBackupControls(mainContent);

    document.getElementById('btn-share-shop-wa')?.addEventListener('click', shareShoppingWhatsApp);
    document.getElementById('btn-compra-review-pantry')?.addEventListener('click', openPantryReviewModal);

    document.getElementById('btn-agregar-compra').addEventListener('click', () => {
        const form = document.getElementById('shop-form');
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) document.getElementById('nueva-compra').focus();
    });

    document.getElementById('btn-cancelar-compra').addEventListener('click', () => {
        document.getElementById('shop-form').reset();
        document.getElementById('shop-form').classList.add('hidden');
    });

    document.getElementById('shop-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const nombre = document.getElementById('nueva-compra').value.trim();
        const cantidad = document.getElementById('nueva-compra-cantidad').value.trim();
        const seccionChoice = document.getElementById('nueva-compra-seccion').value;
        const seccion = seccionChoice === 'auto' ? getAisleCategory(nombre) : seccionChoice;

        if (!nombre) {
            document.getElementById('nueva-compra').focus();
            return;
        }

        const state = getAppState();
        const exists = state.shopping.some((item) => item.nombre.toLocaleLowerCase() === nombre.toLocaleLowerCase() && !item.comprado);
        if (exists) {
            document.getElementById('nueva-compra').setCustomValidity('Este producto ya está en la lista.');
            document.getElementById('nueva-compra').reportValidity();
            return;
        }
        state.shopping.push({ id: crypto.randomUUID(), nombre, cantidad, seccion, comprado: false });
        if (!saveAppState(state)) return;
        renderCompraView();
    });

    document.getElementById('nueva-compra').addEventListener('input', (event) => event.target.setCustomValidity(''));

    mainContent.querySelectorAll('[data-toggle-shopping]').forEach((input) => {
        input.addEventListener('change', () => {
            const state = getAppState();
            state.shopping = state.shopping.map((item) => item.id === input.dataset.toggleShopping
                ? { ...item, comprado: input.checked }
                : item);
            if (!saveAppState(state)) return;
            renderCompraView();
        });
    });

    mainContent.querySelectorAll('[data-delete-shopping]').forEach((button) => {
        button.addEventListener('click', () => {
            const state = getAppState();
            state.shopping = state.shopping.filter((item) => item.id !== button.dataset.deleteShopping);
            if (!saveAppState(state)) return;
            renderCompraView();
        });
    });

    document.getElementById('btn-limpiar-comprados')?.addEventListener('click', () => {
        const state = getAppState();
        state.shopping = state.shopping.filter((item) => !item.comprado);
        if (!saveAppState(state)) return;
        renderCompraView();
    });
}

// --- BACKUP & EXPORT ---

function addBackupControls(container) {
    container.insertAdjacentHTML('beforeend', `
        <section class="panel backup-panel" aria-labelledby="backup-title">
            <h4 id="backup-title">Copia de seguridad</h4>
            <p>El menú y la compra se guardan en este dispositivo. Descarga una copia para conservarlos o moverlos.</p>
            <div class="form-actions">
                <button type="button" id="btn-export-backup" class="btn-secondary">Descargar copia</button>
                <button type="button" id="btn-import-backup" class="btn-secondary">Restaurar copia</button>
            </div>
            <input type="file" id="input-backup" accept="application/json,.json" class="hidden">
            <p id="backup-status" class="backup-status" role="status" aria-live="polite"></p>
        </section>
    `);

    const fileInput = document.getElementById('input-backup');
    const status = document.getElementById('backup-status');

    document.getElementById('btn-export-backup').addEventListener('click', () => {
        try {
            const backup = {
                version: BACKUP_VERSION,
                exportedAt: new Date().toISOString(),
                ...getAppState(),
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tribuapp-copia-${getLocalDateInputValue()}.json`;
            link.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            status.innerText = 'Copia descargada.';
        } catch (error) {
            status.innerText = `No se pudo descargar la copia: ${error.message}`;
        }
    });

    document.getElementById('btn-import-backup').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
        const [file] = fileInput.files || [];
        if (!file) return;
        status.classList.remove('error-text');
        try {
            if (file.size > MAX_BACKUP_FILE_SIZE) {
                throw new Error('El archivo supera el límite de 1 MB.');
            }
            const backup = JSON.parse(await file.text());
            const restoredState = validateBackup(backup);
            if (!window.confirm('Restaurar una copia sustituirá el menú y la lista de compra actuales de esta tribu. ¿Quieres continuar?')) {
                status.innerText = 'Restauración cancelada.';
                return;
            }
            if (!saveAppState(restoredState)) {
                status.innerText = 'No se pudo guardar la copia en este dispositivo.';
                status.classList.add('error-text');
                return;
            }
            if (currentView === 'menus') renderMenuView();
            if (currentView === 'compra') renderCompraView();
            const refreshedStatus = document.getElementById('backup-status');
            refreshedStatus.innerText = 'Copia restaurada correctamente.';
        } catch (error) {
            const currentStatus = document.getElementById('backup-status');
            currentStatus.innerText = `No se pudo restaurar la copia: ${error.message}`;
            currentStatus.classList.add('error-text');
        } finally {
            fileInput.value = '';
        }
    });
}

function validateBackup(backup) {
    if (!backup || typeof backup !== 'object' || Array.isArray(backup)) {
        throw new Error('El contenido no es un archivo de copia válido.');
    }
    if (!Array.isArray(backup.shopping) || !Array.isArray(backup.menu)) {
        throw new Error('La copia debe incluir las listas del menú y la compra.');
    }
    if (backup.shopping.length > MAX_BACKUP_ITEMS || backup.menu.length > MAX_BACKUP_ITEMS) {
        throw new Error(`Cada lista admite como máximo ${MAX_BACKUP_ITEMS} elementos.`);
    }

    const shoppingIds = new Set();
    const shopping = backup.shopping.map((item) => {
        if (!item || typeof item.id !== 'string' || !item.id || typeof item.nombre !== 'string' ||
            item.id.length > 128 || shoppingIds.has(item.id) || !item.nombre.trim() ||
            item.nombre.length > 120 || typeof item.comprado !== 'boolean') {
            throw new Error('La copia contiene un producto con datos no válidos.');
        }
        shoppingIds.add(item.id);
        return {
            id: item.id,
            nombre: item.nombre.trim(),
            cantidad: typeof item.cantidad === 'string' ? item.cantidad : '',
            seccion: typeof item.seccion === 'string' ? item.seccion : getAisleCategory(item.nombre),
            comprado: item.comprado
        };
    });

    const menuIds = new Set();
    const menu = backup.menu.map((item) => {
        if (!item || typeof item.id !== 'string' || !item.id || typeof item.nombre !== 'string' ||
            item.id.length > 128 || menuIds.has(item.id) || !item.nombre.trim() ||
            item.nombre.length > 120 || !WEEK_DAYS.includes(item.dia)) {
            throw new Error('La copia contiene un plato con datos no válidos.');
        }
        menuIds.add(item.id);
        const tipo = item.tipo === 'Cena' ? 'Cena' : 'Comida';
        const ingredientes = Array.isArray(item.ingredientes) ? item.ingredientes : [];
        return {
            id: item.id,
            nombre: item.nombre.trim(),
            dia: item.dia,
            tipo,
            tiempo: item.tiempo || '25 min',
            ingredientes
        };
    });

    return { shopping, menu };
}

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        setCurrentUser(session?.user || null);
        authView.classList.remove('hidden');
        onboardingView.classList.add('hidden');
        appView.classList.add('hidden');
        authForm.classList.add('hidden');
        document.querySelector('.auth-actions').classList.add('hidden');
        passwordUpdateForm.classList.remove('hidden');
        passwordUpdateError.classList.add('hidden');
        return;
    }

    if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        currentProfile = null;
        authView.classList.remove('hidden');
        onboardingView.classList.add('hidden');
        appView.classList.add('hidden');
        if (headerTribeBadge) headerTribeBadge.classList.add('hidden');
    }
});

// PWA Service Worker Registration & Notification Navigation
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
            console.warn('Service worker registration failed:', err);
        });
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NAVIGATE_VIEW') {
            const targetView = event.data.targetView || 'dashboard';
            renderizarVista(targetView);
        }
    });
}

initTheme();
initNotifications();
initFab();
checkSession();
