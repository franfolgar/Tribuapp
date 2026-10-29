// supabase-js 2.118.0 servido desde el propio origen (ver vendor/README.md) para funcionar sin conexión
import { createClient } from './vendor/supabase-js.mjs';

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
        { id: 'a0000000-0000-4000-8000-000000000001', nombre: 'Leche entera', cantidad: '2 L', seccion: 'Lácteos y Huevos', comprado: false },
        { id: 'a0000000-0000-4000-8000-000000000002', nombre: 'Huevos de campo', cantidad: '1 docena', seccion: 'Lácteos y Huevos', comprado: false },
        { id: 'a0000000-0000-4000-8000-000000000003', nombre: 'Plátanos de Canarias', cantidad: '1 kg', seccion: 'Frutas y Verduras', comprado: false },
        { id: 'a0000000-0000-4000-8000-000000000004', nombre: 'Aceite de oliva virgen extra', cantidad: '1 botella', seccion: 'Despensa y Legumbres', comprado: true }
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
const passwordRecoveryRequestForm = document.getElementById('password-recovery-request-form');
const recoveryEmailInput = document.getElementById('recovery-email');
const btnSendRecovery = document.getElementById('btn-send-recovery');
const btnCancelRecovery = document.getElementById('btn-cancel-recovery');
const recoveryRequestError = document.getElementById('recovery-request-error');
const recoveryRequestSuccess = document.getElementById('recovery-request-success');
const btnCancelUpdatePassword = document.getElementById('btn-cancel-update-password');
const recoveryPastedUrl = document.getElementById('recovery-pasted-url');
const btnActivatePastedRecovery = document.getElementById('btn-activate-pasted-recovery');
const recoveryPastedError = document.getElementById('recovery-pasted-error');
const supabaseAppUrlPreview = document.getElementById('supabase-app-url-preview');
const btnCopyAppUrl = document.getElementById('btn-copy-app-url');

const onboardingForm = document.getElementById('onboarding-form');
const btnOnboarding = document.getElementById('btn-onboarding');
const onboardingError = document.getElementById('onboarding-error');
const joinTribuForm = document.getElementById('join-tribu-form');
const btnJoinTribu = document.getElementById('btn-join-tribu');
const tabJoinTribu = document.getElementById('tab-join-tribu');
const tabCreateTribu = document.getElementById('tab-create-tribu');
const joinInviteTokenInput = document.getElementById('join-invite-token');
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
let authMode = (typeof getPendingInvite === 'function' && getPendingInvite()) ? 'invite_join' : 'login';
let currentView = 'dashboard';
let viewRenderId = 0;
let currentTaskFilter = 'all'; // 'all' | 'today' | 'mine' | 'pool'
let hideCompletedTasks = false;
let showPodiumView = false;
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

    // Al pulsar una notificación, el Service Worker pide abrir la vista correspondiente
    navigator.serviceWorker?.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NAVIGATE_VIEW') {
            renderizarVista(event.data.targetView || 'dashboard');
        }
    });
}

// --- Floating Action Button (FAB) ---
function initFab() {
    if (!fabMainBtn || !fabWrapper) return;

    const setFabAbierto = (abierto) => {
        // Si el foco está en una opción que se va a ocultar, pasa al botón principal
        if (!abierto && fabMenu?.contains(document.activeElement)) fabMainBtn.focus();
        fabWrapper.classList.toggle('open', abierto);
        fabMenu?.classList.toggle('hidden', !abierto);
        fabMainBtn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    };

    fabMainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setFabAbierto(!fabWrapper.classList.contains('open'));
    });

    document.addEventListener('click', (e) => {
        if (!fabWrapper.contains(e.target)) setFabAbierto(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !fabWrapper.classList.contains('open')) return;
        setFabAbierto(false);
        fabMainBtn.focus();
    });

    fabAddShop?.addEventListener('click', () => {
        setFabAbierto(false);
        openQuickAddShoppingModal();
    });

    fabAddTask?.addEventListener('click', () => {
        setFabAbierto(false);
        openQuickAddTaskModal();
    });

    fabAddMeal?.addEventListener('click', () => {
        setFabAbierto(false);
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
                <button type="button" class="btn-secondary" data-modal-close>Cancelar</button>
            </div>
        </form>
    `;

    openModal(html);
    setTimeout(() => document.getElementById('quick-shop-name')?.focus(), 100);

    document.getElementById('quick-shop-name')?.addEventListener('input', (event) => event.target.setCustomValidity(''));

    document.getElementById('quick-shop-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('quick-shop-name');
        const nombre = nameInput.value.trim();
        const cantidad = document.getElementById('quick-shop-cant').value.trim();
        const secVal = document.getElementById('quick-shop-sec').value;
        const seccion = secVal === 'auto' ? getAisleCategory(nombre) : secVal;

        if (!nombre) return;
        const state = getAppState();
        const exists = state.shopping.some((item) => item.nombre.toLocaleLowerCase() === nombre.toLocaleLowerCase() && !item.comprado);
        if (exists) {
            nameInput.setCustomValidity('Este producto ya está en la lista.');
            nameInput.reportValidity();
            return;
        }
        closeModal();
        const added = await anadirProductosACompra([{ nombre, cantidad, seccion }]);
        if (added > 0) showToast(`🛒 "${nombre}" añadido a la compra`);
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
            <input type="text" id="quick-task-name" placeholder="Ej. Poner lavadora, pasar aspiradora..." maxlength="120" required autofocus>

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
                    <option value="Quincenal">🔄 Quincenal (cada 14 días)</option>
                    <option value="Mensual">🔄 Mensual (mismo día cada mes)</option>
                </select>
            </div>

            <div class="modal-footer" style="margin-top: 14px;">
                <button type="submit" id="btn-quick-task-submit" class="btn-primary">Guardar Tarea</button>
                <button type="button" class="btn-secondary" data-modal-close>Cancelar</button>
            </div>
        </form>
    `;

    openModal(html);
    setTimeout(() => document.getElementById('quick-task-name')?.focus(), 100);

    document.getElementById('quick-task-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-quick-task-submit');
        const nombreInput = document.getElementById('quick-task-name');
        const nombre = nombreInput.value.trim().slice(0, 120);
        const asignadoA = document.getElementById('quick-task-assign').value || null;
        const fecha = document.getElementById('quick-task-date').value || today;
        const recurrencia = document.getElementById('quick-task-recurrence').value || 'Puntual';

        if (!nombre) {
            showToast('Escribe el nombre de la tarea.');
            nombreInput.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = 'Guardando...';
        try {
            await crearTareaEnSupabase({ nombre, asignadoA, fecha, recurrencia });
        } catch (error) {
            console.error('Error al crear la tarea:', error);
            showToast(`⚠️ No se pudo crear la tarea: ${error.message || 'error de conexión'}`);
            submitBtn.disabled = false;
            submitBtn.innerText = 'Guardar Tarea';
            return;
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
                <button type="button" class="btn-secondary" data-modal-close>Cancelar</button>
            </div>
        </form>
    `;

    openModal(html);
    setTimeout(() => document.getElementById('quick-meal-name')?.focus(), 100);

    document.getElementById('quick-meal-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('quick-meal-name').value.trim();
        const dia = document.getElementById('quick-meal-day').value;
        const tipo = document.getElementById('quick-meal-type').value;
        const tiempo = document.getElementById('quick-meal-time').value.trim() || '25 min';
        const rawIng = document.getElementById('quick-meal-ing').value.trim();
        const ingredientes = rawIng ? rawIng.split(',').map(s => s.trim()).filter(Boolean) : [];

        if (!nombre) return;
        closeModal();
        if (!await guardarPlatoEnMenu({ dia, tipo, nombre, tiempo, ingredientes })) return;
        showToast(`🍽️ "${nombre}" añadido al menú (${dia})`);

        if (dia === todayDayName) {
            showServiceWorkerNotification(`🍽️ Plato para hoy (${tipo})`, {
                body: `Se ha añadido "${nombre}" al menú familiar de hoy.`,
                data: { view: 'menus', url: './' }
            });
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

// Identificadores y platos de la demo: una familia real nunca debe verlos ni subirlos.
const DEMO_SHOPPING_IDS = new Set(defaultState.shopping.map(item => item.id));
const DEMO_MENU_IDS = new Set(defaultState.menu.map(item => item.id));
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function esPlatoDemo(item) {
    return DEMO_MENU_IDS.has(item?.id) ||
        defaultState.menu.some(d => d.dia === item?.dia && d.tipo === item?.tipo && d.nombre === item?.nombre);
}

function getAppState() {
    const stored = readFromStorage(STORAGE_KEYS.app, null);
    const tieneFamilia = !!currentProfile?.familia_id;
    // La demo sólo se usa si no hay nada guardado y no hay una familia real detrás.
    const base = stored && typeof stored === 'object'
        ? stored
        : (tieneFamilia ? { shopping: [], menu: [] } : defaultState);
    let rawShopping = Array.isArray(base.shopping) ? base.shopping.filter(Boolean) : [];
    let rawMenu = Array.isArray(base.menu) ? base.menu.filter(Boolean) : [];
    if (tieneFamilia) {
        rawShopping = rawShopping.filter(item => !DEMO_SHOPPING_IDS.has(item.id));
        rawMenu = rawMenu.filter(item => !DEMO_MENU_IDS.has(item.id));
    }

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

function compraDesdeFila(s) {
    return {
        id: s.id,
        nombre: s.nombre,
        cantidad: s.cantidad || '',
        seccion: s.seccion || getAisleCategory(s.nombre),
        comprado: !!s.comprado
    };
}

function platoDesdeFila(m) {
    return {
        id: m.id,
        dia: m.dia,
        tipo: m.tipo === 'Cena' ? 'Cena' : 'Comida',
        nombre: m.nombre,
        tiempo: m.tiempo || '25 min',
        ingredientes: Array.isArray(m.ingredientes) ? m.ingredientes : []
    };
}

// Descarga menú y compra de la familia. Supabase manda: si la tabla está vacía, la lista local queda vacía.
async function syncFamilyDataFromSupabase() {
    const familiaId = currentProfile?.familia_id;
    if (!familiaId) {
        detenerSincronizacionTiempoReal();
        return false;
    }
    let ok = false;
    try {
        const [menuRes, shopRes] = await Promise.all([
            supabase.from('familias_menus')
                .select('*')
                .eq('familia_id', familiaId),
            supabase.from('familias_compras')
                .select('*')
                .eq('familia_id', familiaId)
                .order('creado_en', { ascending: true })
        ]);
        if (currentProfile?.familia_id !== familiaId) return false;

        const state = getAppState();
        let stateChanged = false;

        if (!menuRes.error && Array.isArray(menuRes.data)) {
            state.menu = menuRes.data.filter(m => !esPlatoDemo(m)).map(platoDesdeFila);
            stateChanged = true;
        } else if (menuRes.error) {
            console.warn('No se pudo descargar el menú de la familia:', menuRes.error);
        }

        if (!shopRes.error && Array.isArray(shopRes.data)) {
            state.shopping = shopRes.data.filter(s => !DEMO_SHOPPING_IDS.has(s.id)).map(compraDesdeFila);
            stateChanged = true;
        } else if (shopRes.error) {
            console.warn('No se pudo descargar la compra de la familia:', shopRes.error);
        }

        if (stateChanged) {
            saveToStorage(STORAGE_KEYS.app, state);
        }
        ok = !menuRes.error && !shopRes.error;
    } catch (e) {
        console.warn('Error sincronizando datos familiares de Supabase:', e);
    }
    iniciarSincronizacionTiempoReal(familiaId);
    return ok;
}

function filaMenuParaSupabase(item) {
    return {
        familia_id: currentProfile.familia_id,
        dia: item.dia,
        tipo: item.tipo === 'Cena' ? 'Cena' : 'Comida',
        nombre: item.nombre,
        tiempo: item.tiempo || '25 min',
        ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
        actualizado_en: new Date().toISOString()
    };
}

// Guarda sólo los platos indicados (uno al editar; los 12 al regenerar el menú completo).
// Devuelve null si se guardó o el error de Supabase.
async function persistMenuToSupabase(platos) {
    const lista = (Array.isArray(platos) ? platos : [platos]).filter(Boolean);
    if (!currentProfile?.familia_id || !lista.length) return null;
    try {
        const { data, error } = await supabase.from('familias_menus')
            .upsert(lista.map(filaMenuParaSupabase), { onConflict: 'familia_id,dia,tipo' })
            .select('id, dia, tipo');
        if (error) return error;
        // Adoptamos el id de la base de datos para casar después los eventos en tiempo real.
        if (Array.isArray(data) && data.length) {
            const state = getAppState();
            let cambiado = false;
            data.forEach((fila) => {
                const local = state.menu.find(m => m.dia === fila.dia && m.tipo === fila.tipo);
                if (local && local.id !== fila.id) {
                    local.id = fila.id;
                    cambiado = true;
                }
            });
            if (cambiado) saveToStorage(STORAGE_KEYS.app, state);
        }
        return null;
    } catch (err) {
        return err;
    }
}

function filaCompraParaSupabase(item) {
    return {
        id: item.id,
        familia_id: currentProfile.familia_id,
        nombre: item.nombre,
        cantidad: item.cantidad || '',
        seccion: item.seccion || 'General',
        comprado: !!item.comprado,
        actualizado_en: new Date().toISOString()
    };
}

// item puede ser un producto o una lista (para 'upsert' y 'delete'). En 'update' sólo se envían los campos de `cambios`.
// Devuelve null si se guardó o el error de Supabase.
async function persistShoppingItemToSupabase(item, action = 'upsert', cambios = null) {
    const items = (Array.isArray(item) ? item : [item]).filter(it => it?.id);
    if (!currentProfile?.familia_id || !items.length) return null;
    try {
        let res;
        if (action === 'delete') {
            const ids = items.map(it => it.id).filter(id => UUID_REGEX.test(id));
            if (!ids.length) return null;
            res = await supabase.from('familias_compras').delete().in('id', ids);
        } else if (action === 'update') {
            if (!UUID_REGEX.test(items[0].id)) return null;
            res = await supabase.from('familias_compras')
                .update({ ...(cambios || { comprado: !!items[0].comprado }), actualizado_en: new Date().toISOString() })
                .eq('id', items[0].id);
        } else {
            res = await supabase.from('familias_compras').upsert(items.map(filaCompraParaSupabase));
        }
        return res?.error || null;
    } catch (err) {
        return err;
    }
}

function mostrarErrorGuardado(texto, error) {
    console.warn(texto, error);
    showToast(`⚠️ ${texto} Revisa tu conexión e inténtalo de nuevo.`);
}

// --- Operaciones de compra y menú: se aplican al momento y se deshacen si Supabase falla ---

async function anadirProductosACompra(productos) {
    const state = getAppState();
    const nuevos = [];
    productos.forEach((p) => {
        const nombre = String(p?.nombre || '').trim();
        if (!nombre) return;
        const repetido = state.shopping.concat(nuevos)
            .some(s => s.nombre.toLocaleLowerCase() === nombre.toLocaleLowerCase() && !s.comprado);
        if (repetido) return;
        nuevos.push({
            id: crypto.randomUUID(),
            nombre,
            cantidad: p.cantidad || '',
            seccion: p.seccion || getAisleCategory(nombre),
            comprado: false
        });
    });
    if (!nuevos.length) return 0;
    state.shopping.push(...nuevos);
    if (!saveAppState(state)) return -1;
    refrescarVistasDeDatos({ forzar: true });

    const error = await persistShoppingItemToSupabase(nuevos, 'upsert');
    if (error) {
        const ids = new Set(nuevos.map(n => n.id));
        const actual = getAppState();
        actual.shopping = actual.shopping.filter(s => !ids.has(s.id));
        saveAppState(actual);
        mostrarErrorGuardado(nuevos.length === 1
            ? `No se pudo añadir "${nuevos[0].nombre}" a la compra.`
            : 'No se pudieron añadir los productos a la compra.', error);
        refrescarVistasDeDatos({ forzar: true });
        return -1;
    }
    return nuevos.length;
}

async function marcarProductoComprado(id, comprado) {
    const state = getAppState();
    const item = state.shopping.find(s => s.id === id);
    if (!item) return false;
    const anterior = !!item.comprado;
    item.comprado = !!comprado;
    if (!saveAppState(state)) return false;
    refrescarVistasDeDatos({ forzar: true });

    const error = await persistShoppingItemToSupabase(item, 'update', { comprado: !!comprado });
    if (error) {
        const actual = getAppState();
        const it = actual.shopping.find(s => s.id === id);
        if (it) it.comprado = anterior;
        saveAppState(actual);
        mostrarErrorGuardado(`No se pudo actualizar "${item.nombre}".`, error);
        refrescarVistasDeDatos({ forzar: true });
        return false;
    }
    return true;
}

async function eliminarProductosDeCompra(ids) {
    const idSet = new Set(ids);
    const state = getAppState();
    const quitados = state.shopping
        .map((it, idx) => ({ it, idx }))
        .filter(({ it }) => idSet.has(it.id));
    if (!quitados.length) return true;
    state.shopping = state.shopping.filter(it => !idSet.has(it.id));
    if (!saveAppState(state)) return false;
    refrescarVistasDeDatos({ forzar: true });

    const error = await persistShoppingItemToSupabase(quitados.map(q => q.it), 'delete');
    if (error) {
        const actual = getAppState();
        quitados.forEach(({ it, idx }) => {
            if (!actual.shopping.some(s => s.id === it.id)) {
                actual.shopping.splice(Math.min(idx, actual.shopping.length), 0, it);
            }
        });
        saveAppState(actual);
        mostrarErrorGuardado(quitados.length === 1
            ? `No se pudo eliminar "${quitados[0].it.nombre}".`
            : 'No se pudieron eliminar los productos.', error);
        refrescarVistasDeDatos({ forzar: true });
        return false;
    }
    return true;
}

// Pone un plato en su hueco (día + tipo) y sólo sube ese plato.
async function guardarPlatoEnMenu(plato) {
    const state = getAppState();
    const tipo = plato.tipo === 'Cena' ? 'Cena' : 'Comida';
    const idx = state.menu.findIndex(m => m.dia === plato.dia && m.tipo === tipo);
    const anterior = idx >= 0 ? state.menu[idx] : null;
    const nuevo = {
        id: anterior ? anterior.id : crypto.randomUUID(),
        dia: plato.dia,
        tipo,
        nombre: plato.nombre,
        tiempo: plato.tiempo || '25 min',
        ingredientes: Array.isArray(plato.ingredientes) ? plato.ingredientes : []
    };
    if (idx >= 0) state.menu[idx] = nuevo;
    else state.menu.push(nuevo);
    if (!saveAppState(state)) return false;
    refrescarVistasDeDatos({ forzar: true });

    const error = await persistMenuToSupabase([nuevo]);
    if (error) {
        const actual = getAppState();
        const i = actual.menu.findIndex(m => m.dia === nuevo.dia && m.tipo === nuevo.tipo);
        if (anterior) {
            if (i >= 0) actual.menu[i] = anterior;
            else actual.menu.push(anterior);
        } else if (i >= 0) {
            actual.menu.splice(i, 1);
        }
        saveAppState(actual);
        mostrarErrorGuardado(`No se pudo guardar "${nuevo.nombre}" en el menú.`, error);
        refrescarVistasDeDatos({ forzar: true });
        return false;
    }
    return true;
}

async function eliminarPlatoDelMenu(id) {
    const state = getAppState();
    const idx = state.menu.findIndex(m => m.id === id);
    if (idx < 0) return true;
    const plato = state.menu[idx];
    state.menu.splice(idx, 1);
    if (!saveAppState(state)) return false;
    refrescarVistasDeDatos({ forzar: true });
    if (!currentProfile?.familia_id) return true;

    let error = null;
    try {
        ({ error } = await supabase.from('familias_menus')
            .delete()
            .eq('familia_id', currentProfile.familia_id)
            .eq('dia', plato.dia)
            .eq('tipo', plato.tipo));
    } catch (err) {
        error = err;
    }
    if (error) {
        const actual = getAppState();
        if (!actual.menu.some(m => m.dia === plato.dia && m.tipo === plato.tipo)) {
            actual.menu.splice(Math.min(idx, actual.menu.length), 0, plato);
        }
        saveAppState(actual);
        mostrarErrorGuardado(`No se pudo eliminar "${plato.nombre}" del menú.`, error);
        refrescarVistasDeDatos({ forzar: true });
        return false;
    }
    return true;
}

// Sustituye el menú entero (generado con IA o del chef) y sube los 12 platos de una vez.
async function guardarMenuCompleto(platos) {
    const state = getAppState();
    const previo = state.menu;
    state.menu = platos.map(p => ({
        id: crypto.randomUUID(),
        dia: p.dia,
        tipo: p.tipo === 'Cena' ? 'Cena' : 'Comida',
        nombre: p.nombre,
        tiempo: p.tiempo || '25 min',
        ingredientes: Array.isArray(p.ingredientes) ? p.ingredientes : []
    }));
    if (!saveAppState(state)) return false;
    refrescarVistasDeDatos({ forzar: true });

    const error = await persistMenuToSupabase(state.menu);
    if (error) {
        const actual = getAppState();
        actual.menu = previo;
        saveAppState(actual);
        mostrarErrorGuardado('No se pudo guardar el menú semanal.', error);
        refrescarVistasDeDatos({ forzar: true });
        return false;
    }
    return true;
}

// Sube a Supabase una copia restaurada: primero escribe lo nuevo y después borra lo que sobra.
async function restaurarCopiaEnSupabase(restoredState) {
    const familiaId = currentProfile?.familia_id;
    if (!familiaId) return null;
    try {
        const [shopRes, menuRes] = await Promise.all([
            supabase.from('familias_compras').select('id').eq('familia_id', familiaId),
            supabase.from('familias_menus').select('id, dia, tipo').eq('familia_id', familiaId)
        ]);
        if (shopRes.error) return shopRes.error;
        if (menuRes.error) return menuRes.error;

        const nuevosIds = new Set(restoredState.shopping.map(it => it.id));
        if (restoredState.shopping.length) {
            const error = await persistShoppingItemToSupabase(restoredState.shopping, 'upsert');
            if (error) return error;
        }
        const sobrantes = (shopRes.data || []).filter(f => !nuevosIds.has(f.id)).map(f => ({ id: f.id }));
        if (sobrantes.length) {
            const error = await persistShoppingItemToSupabase(sobrantes, 'delete');
            if (error) return error;
        }

        if (restoredState.menu.length) {
            const error = await persistMenuToSupabase(restoredState.menu);
            if (error) return error;
        }
        const huecos = new Set(restoredState.menu.map(m => `${m.dia}|${m.tipo}`));
        const platosSobrantes = (menuRes.data || []).filter(f => !huecos.has(`${f.dia}|${f.tipo}`)).map(f => f.id);
        if (platosSobrantes.length) {
            const { error } = await supabase.from('familias_menus').delete().in('id', platosSobrantes);
            if (error) return error;
        }
        return null;
    } catch (err) {
        return err;
    }
}

// --- Sincronización en tiempo real de compra y menú ---

let canalTiempoReal = null;
let canalTiempoRealFamiliaId = null;
let refrescoVistaTimer = null;
let ultimaResincronizacion = 0;

function iniciarSincronizacionTiempoReal(familiaId) {
    if (!familiaId || typeof supabase.channel !== 'function') return;
    if (canalTiempoReal && canalTiempoRealFamiliaId === familiaId && ['joined', 'joining'].includes(canalTiempoReal.state)) return;
    detenerSincronizacionTiempoReal();

    let suscritoAntes = false;
    const filtro = `familia_id=eq.${familiaId}`;
    const canal = supabase.channel(`familia-datos-${familiaId}`);
    ['familias_compras', 'familias_menus'].forEach((tabla) => {
        const alRecibir = (payload) => aplicarCambioRemoto(tabla, payload, familiaId);
        canal
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: tabla, filter: filtro }, alRecibir)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tabla, filter: filtro }, alRecibir)
            // Los DELETE no admiten filtro en Realtime: sólo traen el id y se casan por id.
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: tabla }, alRecibir);
    });
    canal.subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;
        // Tras una reconexión puede haberse perdido algún evento: resincronizamos.
        if (suscritoAntes) resincronizarDatosFamilia();
        suscritoAntes = true;
    });
    canalTiempoReal = canal;
    canalTiempoRealFamiliaId = familiaId;
}

function detenerSincronizacionTiempoReal() {
    const canal = canalTiempoReal;
    canalTiempoReal = null;
    canalTiempoRealFamiliaId = null;
    clearTimeout(refrescoVistaTimer);
    if (canal) {
        try {
            supabase.removeChannel(canal);
        } catch (err) {
            console.warn('No se pudo cerrar el canal en tiempo real:', err);
        }
    }
}

function aplicarCambioRemoto(tabla, payload, familiaId) {
    if (currentProfile?.familia_id !== familiaId) {
        detenerSincronizacionTiempoReal();
        return;
    }
    const evento = payload?.eventType;
    const fila = payload?.new;
    const state = getAppState();

    if (tabla === 'familias_compras') {
        if (evento === 'DELETE') {
            const id = payload?.old?.id;
            if (!id || !state.shopping.some(s => s.id === id)) return;
            state.shopping = state.shopping.filter(s => s.id !== id);
        } else {
            if (!fila?.id || fila.familia_id !== familiaId || DEMO_SHOPPING_IDS.has(fila.id)) return;
            const item = compraDesdeFila(fila);
            const idx = state.shopping.findIndex(s => s.id === item.id);
            if (idx >= 0) state.shopping[idx] = item;
            else state.shopping.push(item);
        }
    } else if (tabla === 'familias_menus') {
        if (evento === 'DELETE') {
            const id = payload?.old?.id;
            if (!id || !state.menu.some(m => m.id === id)) return;
            state.menu = state.menu.filter(m => m.id !== id);
        } else {
            if (!fila?.id || fila.familia_id !== familiaId || esPlatoDemo(fila)) return;
            const plato = platoDesdeFila(fila);
            state.menu = state.menu.filter(m => m.id !== plato.id && !(m.dia === plato.dia && m.tipo === plato.tipo));
            state.menu.push(plato);
        }
    } else {
        return;
    }

    saveToStorage(STORAGE_KEYS.app, state);
    clearTimeout(refrescoVistaTimer);
    refrescoVistaTimer = setTimeout(() => refrescarVistasDeDatos(), 150);
}

function hayEdicionEnCurso() {
    if (!mainContent) return false;
    if (mainContent.querySelector('form.panel:not(.hidden)')) return true;
    const activo = document.activeElement;
    return !!(activo && mainContent.contains(activo) && /^(INPUT|TEXTAREA|SELECT)$/.test(activo.tagName) && activo.type !== 'checkbox');
}

// Vuelve a pintar las vistas que muestran compra o menú. Si el usuario está escribiendo, espera.
function refrescarVistasDeDatos({ forzar = false } = {}) {
    const supermercado = document.getElementById('supermarket-modal');
    if (supermercado && typeof supermercado.refrescar === 'function') supermercado.refrescar();
    if (!currentProfile?.familia_id || appView?.classList.contains('hidden')) return;
    if (!['compra', 'menus', 'dashboard'].includes(currentView)) return;
    if (!forzar && hayEdicionEnCurso()) {
        clearTimeout(refrescoVistaTimer);
        refrescoVistaTimer = setTimeout(() => refrescarVistasDeDatos(), 1500);
        return;
    }
    if (currentView === 'compra') renderCompraView();
    else if (currentView === 'menus') renderMenuView();
    else renderDashboard(viewRenderId).catch(err => console.warn('No se pudo refrescar el resumen:', err));
}

async function resincronizarDatosFamilia() {
    if (!currentProfile?.familia_id) return;
    ultimaResincronizacion = Date.now();
    if (await syncFamilyDataFromSupabase()) refrescarVistasDeDatos();
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !currentProfile?.familia_id) return;
    if (Date.now() - ultimaResincronizacion < 5000) return;
    resincronizarDatosFamilia();
});

// Dieta real de la familia (familias.dieta_base), con caché por familia.
const DIETAS_IA = ['Mediterránea', 'Vegetariana', 'Saludable y ligera', 'Familiar con niños'];
let dietaFamiliaCache = { familiaId: null, dieta: null };

async function obtenerDietaFamilia() {
    const familiaId = currentProfile?.familia_id;
    if (!familiaId) return 'Mediterránea';
    if (dietaFamiliaCache.familiaId === familiaId && dietaFamiliaCache.dieta) return dietaFamiliaCache.dieta;
    try {
        const { data, error } = await supabase.from('familias').select('dieta_base').eq('id', familiaId).maybeSingle();
        if (!error && data?.dieta_base) dietaFamiliaCache = { familiaId, dieta: data.dieta_base };
    } catch (err) {
        console.warn('No se pudo leer la dieta de la familia:', err);
    }
    return dietaFamiliaCache.familiaId === familiaId && dietaFamiliaCache.dieta ? dietaFamiliaCache.dieta : 'Mediterránea';
}

// La IA sólo acepta unas dietas concretas; el resto ("Libre", etc.) se trata como mediterránea.
function dietaParaIA(dieta) {
    return DIETAS_IA.includes(dieta) ? dieta : 'Mediterránea';
}

function listaDeTextos(valor) {
    if (Array.isArray(valor)) return valor.filter(v => typeof v === 'string' && v.trim()).map(v => v.trim());
    if (typeof valor === 'string') return valor.split(',').map(v => v.trim()).filter(Boolean);
    return [];
}


// Puntos Tribu: la fuente de verdad es la BD (RPC puntos_familia, 10 pts por tarea completada).
// localStorage sólo guarda una caché de lectura para mostrar algo si no hay conexión.
function getKarmaPoints() {
    const cached = readFromStorage(STORAGE_KEYS.karma, {});
    return cached && typeof cached === 'object' && !Array.isArray(cached) ? cached : {};
}

async function cargarPuntosFamilia() {
    try {
        const { data, error } = await supabase.rpc('puntos_familia');
        if (error) throw error;
        const karma = {};
        (Array.isArray(data) ? data : []).forEach((row) => {
            if (row?.usuario_id) karma[row.usuario_id] = Number(row.puntos) || 0;
        });
        saveToStorage(STORAGE_KEYS.karma, karma);
        return karma;
    } catch (error) {
        console.warn('No se pudieron cargar los puntos de la familia:', error);
        return getKarmaPoints();
    }
}

function triggerConfetti() {
    try {
        const container = document.createElement('div');
        container.className = 'confetti-burst-container';
        document.body.appendChild(container);

        const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];
        const emojis = ['⭐', '🎉', '🌟', '👏', '🏆', '✨', '🎈'];
        const count = 38;

        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-particle';
            const isEmoji = i % 5 === 0;
            if (isEmoji) {
                piece.innerText = emojis[Math.floor(Math.random() * emojis.length)];
                piece.style.fontSize = `${16 + Math.random() * 12}px`;
            } else {
                piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                piece.style.width = `${7 + Math.random() * 8}px`;
                piece.style.height = `${9 + Math.random() * 10}px`;
                piece.style.borderRadius = Math.random() > 0.4 ? '50%' : '3px';
            }

            const startX = 45 + (Math.random() - 0.5) * 30;
            const startY = 48 + (Math.random() - 0.5) * 20;
            const angle = Math.random() * 360;
            const distance = 80 + Math.random() * 200;
            const rad = (angle * Math.PI) / 180;
            const targetX = Math.cos(rad) * distance;
            const targetY = Math.sin(rad) * distance - 60;
            const rot = (Math.random() - 0.5) * 720;

            piece.style.left = `${startX}%`;
            piece.style.top = `${startY}%`;
            piece.style.setProperty('--tx', `${targetX}px`);
            piece.style.setProperty('--ty', `${targetY}px`);
            piece.style.setProperty('--rot', `${rot}deg`);
            piece.style.animationDuration = `${1.0 + Math.random() * 0.6}s`;

            container.appendChild(piece);
        }

        setTimeout(() => container.remove(), 1800);
    } catch (e) {
        console.warn('Error rendering confetti:', e);
    }
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

// --- Modales accesibles: foco atrapado, Escape y vuelta al elemento que lo abrió ---
const SELECTOR_ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
let modalFocoPrevio = null;

function getEnfocables(contenedor) {
    return [...contenedor.querySelectorAll(SELECTOR_ENFOCABLES)]
        .filter(el => el.getClientRects().length > 0 && !el.closest('[inert]'));
}

function openModal(contentHtml) {
    if (!modalContainer || !modalCardContent) return;
    const yaAbierto = !modalContainer.classList.contains('hidden');
    if (!yaAbierto) modalFocoPrevio = document.activeElement;
    modalCardContent.innerHTML = contentHtml;
    modalContainer.classList.remove('hidden');
    modalContainer.setAttribute('aria-modal', 'true');
    const titulo = modalCardContent.querySelector('h3');
    if (titulo) {
        if (!titulo.id) titulo.id = 'modal-title';
        modalContainer.setAttribute('aria-labelledby', titulo.id);
    } else {
        modalContainer.removeAttribute('aria-labelledby');
    }
    appView?.setAttribute('inert', '');
    modalCardContent.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    // Enfoca el primer control (no un campo de texto: en el móvil abriría el teclado)
    const primero = getEnfocables(modalCardContent)[0];
    if (primero) primero.focus({ preventScroll: true });
}

function closeModal() {
    if (!modalContainer) return;
    const estabaAbierto = !modalContainer.classList.contains('hidden');
    modalContainer.classList.add('hidden');
    if (modalCardContent) modalCardContent.innerHTML = '';
    if (!document.getElementById('supermarket-modal')) appView?.removeAttribute('inert');
    if (!estabaAbierto) return;
    let previo = modalFocoPrevio;
    modalFocoPrevio = null;
    // Si se abrió desde el menú del FAB (ya oculto), el foco vuelve al botón principal
    if (previo && fabMenu?.contains(previo)) previo = fabMainBtn;
    if (previo && previo.isConnected && typeof previo.focus === 'function') previo.focus();
}

modalContainer?.addEventListener('click', (e) => {
    if (e.target === modalContainer) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (!modalContainer || modalContainer.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
    }
    if (e.key !== 'Tab') return;
    const enfocables = getEnfocables(modalCardContent);
    if (!enfocables.length) {
        e.preventDefault();
        return;
    }
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    const dentro = modalCardContent.contains(document.activeElement);
    if (e.shiftKey && (!dentro || document.activeElement === primero)) {
        e.preventDefault();
        ultimo.focus();
    } else if (!e.shiftKey && (!dentro || document.activeElement === ultimo)) {
        e.preventDefault();
        primero.focus();
    }
});

function getLocalDateInputValue(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
        let token = params.get('invite');
        // El parámetro `tribu` de la URL se ignora: es falsificable. El nombre real de la familia
        // se obtiene del servidor con ver_invitacion_familia antes de aceptar.

        if (!token && window.location.hash && window.location.hash.includes('?')) {
            const hashSearch = window.location.hash.substring(window.location.hash.indexOf('?'));
            params = new URLSearchParams(hashSearch);
            token = params.get('invite');
        }

        if (params.has('join')) {
            sessionStorage.removeItem('tribuapp_pending_invite');
            return null;
        }
        if (params.has('invite') && (!token || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))) {
            sessionStorage.removeItem('tribuapp_pending_invite');
            return null;
        }
        if (token && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
            const invite = { token };
            sessionStorage.setItem('tribuapp_pending_invite', JSON.stringify(invite));
            return invite;
        }
        const saved = sessionStorage.getItem('tribuapp_pending_invite');
        const invite = saved ? JSON.parse(saved) : null;
        return invite?.token && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invite.token)
            ? invite
            : null;
    } catch {
        return null;
    }
}

function setupInviteAuthUI(pendingInvite) {
    authMode = 'invite_join';
    if (inviteWelcomeBanner && inviteWelcomeText) {
        inviteWelcomeText.innerHTML = `<strong>👋 Te han invitado a una tribu de Tribuapp</strong><br><span style="font-size:12px; font-weight:normal; opacity:0.95;">Crea tu acceso o inicia sesión. Antes de unirte verás el nombre de la familia y quién te invita.</span>`;
        inviteWelcomeBanner.classList.remove('hidden');
    }
    if (authNameGroup) {
        authNameGroup.classList.remove('hidden');
        if (authMemberNameInput) authMemberNameInput.required = true;
    }
    btnSubmit.innerText = '✨ Crear acceso y ver la invitación';
    btnSubmit.style.background = 'linear-gradient(135deg, #10B981, #059669)';
    btnAuthMode.innerText = '¿Ya tienes cuenta en Tribuapp? Inicia sesión aquí';
    btnDemoLogin?.classList.add('hidden');
    btnResetPassword?.classList.add('hidden');
    authError?.classList.add('hidden');
    authMessage?.classList.add('hidden');
}

let isPasswordRecovery = false;

function detectPasswordRecoveryState() {
    const initialHash = window.__INITIAL_HASH__ || '';
    const initialSearch = window.__INITIAL_SEARCH__ || '';
    const hash = window.location.hash || initialHash;
    const search = window.location.search || initialSearch;

    // 1. Detectar si la URL trae un error de Supabase (enlace caducado, inválido, etc.)
    let errorDescription = '';
    if (hash.includes('error=')) {
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
        errorDescription = hashParams.get('error_description') || hashParams.get('error');
    } else if (search.includes('error=')) {
        const searchParams = new URLSearchParams(search.replace(/^\?/, ''));
        errorDescription = searchParams.get('error_description') || searchParams.get('error');
    }

    if (errorDescription) {
        let msg = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
        if (/expired|invalid|token|otp/i.test(msg)) {
            msg = 'El enlace de recuperación ha caducado o ya ha sido utilizado. Solicita un nuevo enlace abajo.';
        }
        showAuthError(`⚠️ ${msg}`);
        try {
            history.replaceState(null, '', window.location.pathname + window.location.search.replace(/[?&]error[^&]*/g, ''));
        } catch {}
        return false;
    }

    // 2. ¿Es un enlace de recuperación de contraseña? Sólo se usa para no mostrar el dashboard
    // mientras supabase-js (detectSessionInUrl) valida los tokens; la sesión NUNCA se crea a mano
    // con los tokens de la URL. El formulario se abre con el evento PASSWORD_RECOVERY o si el SDK
    // ha validado una sesión para este enlace.
    return hash.includes('type=recovery') || search.includes('type=recovery');
}

function showPasswordUpdateForm(user = null) {
    isPasswordRecovery = true;
    if (user) setCurrentUser(user);

    authView.classList.remove('hidden');
    onboardingView.classList.add('hidden');
    appView.classList.add('hidden');
    if (headerTribeBadge) headerTribeBadge.classList.add('hidden');

    authForm.classList.add('hidden');
    passwordRecoveryRequestForm?.classList.add('hidden');
    document.querySelector('.auth-actions')?.classList.add('hidden');
    authError.classList.add('hidden');
    authMessage.classList.add('hidden');

    passwordUpdateForm.classList.remove('hidden');
    passwordUpdateError.classList.add('hidden');
    const newPassInput = document.getElementById('new-password');
    if (newPassInput) {
        newPassInput.value = '';
        setTimeout(() => newPassInput.focus(), 100);
    }
    const confirmPassInput = document.getElementById('confirm-password');
    if (confirmPassInput) confirmPassInput.value = '';
}

function resetStandardAuthUI() {
    passwordRecoveryRequestForm?.classList.add('hidden');
    passwordUpdateForm?.classList.add('hidden');
    authForm?.classList.remove('hidden');
    document.querySelector('.auth-actions')?.classList.remove('hidden');

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
    const isRecoveryUrl = detectPasswordRecoveryState();

    // Sin red no esperamos a que supabase-js intente refrescar el token: usamos lo guardado
    if (!navigator.onLine && !isRecoveryUrl && arrancarSinConexion()) return;

    try {
        // getSession espera a que supabase-js termine de procesar la URL (detectSessionInUrl):
        // si el enlace era de recuperación válido, emite PASSWORD_RECOVERY y guarda la sesión.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            if (esErrorDeRed(error) && arrancarSinConexion()) return;
            showAuthError(`No se pudo comprobar la sesión: ${traducirErrorAuth(error)}`);
            return;
        }

        if (isRecoveryUrl || isPasswordRecovery) {
            if (session?.user) {
                showPasswordUpdateForm(session.user);
            } else {
                isPasswordRecovery = false;
                setCurrentUser(null);
                await mostrarApp();
                showAuthError('⚠️ El enlace de recuperación ha caducado o ya ha sido utilizado. Solicita un nuevo enlace.');
            }
            return;
        }

        setCurrentUser(session?.user || null);
        await mostrarApp();
    } catch (error) {
        if (esErrorDeRed(error) && arrancarSinConexion()) return;
        showAuthError(`No se pudo conectar con Supabase: ${traducirErrorAuth(error)}`);
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
            btnSubmit.innerText = 'Iniciar sesión y ver la invitación';
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

// --- Manejo del flujo "He olvidado mi contraseña" y actualización de clave ---

btnResetPassword?.addEventListener('click', () => {
    authForm.classList.add('hidden');
    document.querySelector('.auth-actions')?.classList.add('hidden');
    authError.classList.add('hidden');
    authMessage.classList.add('hidden');

    if (recoveryEmailInput) {
        recoveryEmailInput.value = emailInput?.value ? emailInput.value.trim() : '';
    }
    recoveryRequestError?.classList.add('hidden');
    recoveryRequestSuccess?.classList.add('hidden');
    if (btnSendRecovery) {
        btnSendRecovery.classList.remove('hidden');
        btnSendRecovery.disabled = false;
        btnSendRecovery.innerText = 'Enviar enlace de recuperación';
    }

    passwordRecoveryRequestForm?.classList.remove('hidden');
    setTimeout(() => recoveryEmailInput?.focus(), 80);
});

btnCancelRecovery?.addEventListener('click', () => {
    passwordRecoveryRequestForm?.classList.add('hidden');
    authForm.classList.remove('hidden');
    document.querySelector('.auth-actions')?.classList.remove('hidden');
    authError.classList.add('hidden');
    authMessage.classList.add('hidden');
});

passwordRecoveryRequestForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = recoveryEmailInput?.value?.trim().toLowerCase();
    if (!email) {
        if (recoveryRequestError) {
            recoveryRequestError.innerText = 'Por favor, escribe tu correo electrónico.';
            recoveryRequestError.classList.remove('hidden');
        }
        return;
    }

    if (btnSendRecovery) {
        btnSendRecovery.disabled = true;
        btnSendRecovery.innerText = 'Enviando...';
    }
    recoveryRequestError?.classList.add('hidden');
    recoveryRequestSuccess?.classList.add('hidden');

    // Construir la URL limpia a la que debe volver el usuario al pulsar el enlace del correo
    let redirectUrl = window.location.origin;
    if (window.location.pathname && window.location.pathname !== '/' && !window.location.pathname.endsWith('.html')) {
        redirectUrl += window.location.pathname.replace(/\/$/, '');
    } else if (window.location.pathname) {
        redirectUrl += window.location.pathname;
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        });

        if (error) throw error;

        if (recoveryRequestSuccess) {
            recoveryRequestSuccess.innerHTML = `
                <div>
                    <strong>✉️ ¡Enlace de recuperación enviado!</strong><br>
                    Hemos enviado un enlace seguro a <strong>${escapeHtml(email)}</strong>.<br>
                </div>
            `;
            recoveryRequestSuccess.classList.remove('hidden');
        }
        if (btnSendRecovery) {
            btnSendRecovery.classList.add('hidden');
        }
    } catch (error) {
        console.warn('Error en resetPasswordForEmail:', error);
        let msg = error.message;
        if (error.status === 429 || error.code === 429 || msg?.includes('rate limit') || msg?.includes('security purposes')) {
            msg = 'Por motivos de seguridad, debes esperar aproximadamente un minuto antes de solicitar otro correo de recuperación.';
        } else {
            msg = traducirErrorAuth(error);
        }
        if (recoveryRequestError) {
            recoveryRequestError.innerText = `No se pudo enviar el correo: ${msg}`;
            recoveryRequestError.classList.remove('hidden');
        }
        if (btnSendRecovery) {
            btnSendRecovery.disabled = false;
            btnSendRecovery.innerText = 'Enviar enlace de recuperación';
        }
    }
});

async function processRecoveryInput(rawInput) {
    let cleanInput = (rawInput || '').trim().replace(/^["']|["']$/g, '');
    if (!cleanInput) {
        throw new Error('Por favor, introduce la dirección o el enlace de recuperación.');
    }

    let hashPart = '';
    let searchPart = '';

    if (cleanInput.includes('#')) {
        const splitHash = cleanInput.split('#');
        hashPart = splitHash[1];
        if (splitHash[0].includes('?')) {
            searchPart = splitHash[0].split('?')[1];
        }
    } else if (cleanInput.includes('?')) {
        searchPart = cleanInput.split('?')[1];
    } else {
        if (cleanInput.includes('access_token=')) {
            hashPart = cleanInput;
        } else {
            searchPart = cleanInput;
        }
    }

    const hashParams = new URLSearchParams(hashPart);
    const searchParams = new URLSearchParams(searchPart);

    // Caso 1: access_token y refresh_token (dirección localhost:3000/#access_token=...)
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

    if (accessToken) {
        // No se llama a setSession con tokens copiados: se recarga la app con el enlace para que
        // supabase-js lo valide (detectSessionInUrl) y emita PASSWORD_RECOVERY si es de recuperación.
        if (!refreshToken || !/type=recovery/.test(hashPart + '&' + searchPart)) {
            throw new Error('El enlace pegado no es un enlace de recuperación de contraseña.');
        }
        history.replaceState(null, '', `${window.location.pathname}#${hashPart}`);
        window.location.reload();
        return;
    }

    // Caso 2: código PKCE (?code=...)
    const code = searchParams.get('code') || hashParams.get('code');
    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        isPasswordRecovery = true;
        setCurrentUser(data.user || null);
        showPasswordUpdateForm(data.user || null);
        showToast('🔑 ¡Código canjeado con éxito! Elige tu nueva contraseña.');
        return;
    }

    // Caso 3: enlace de confirmación original de Supabase (/auth/v1/verify?token=...&type=recovery)
    const token = searchParams.get('token') || hashParams.get('token') || searchParams.get('token_hash') || hashParams.get('token_hash');
    const emailParam = searchParams.get('email') || recoveryEmailInput?.value?.trim() || '';

    if (token) {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'recovery'
            });
            if (!error && (data?.session || data?.user)) {
                isPasswordRecovery = true;
                setCurrentUser(data.user || null);
                showPasswordUpdateForm(data.user || null);
                showToast('🔑 ¡Enlace validado con éxito! Elige tu nueva contraseña.');
                return;
            }
        } catch (otpErr) {
            console.log('Intento con token_hash falló, probando con email:', otpErr);
        }

        if (emailParam) {
            const { data, error } = await supabase.auth.verifyOtp({
                email: emailParam,
                token: token,
                type: 'recovery'
            });
            if (error) throw error;

            isPasswordRecovery = true;
            setCurrentUser(data.user || null);
            showPasswordUpdateForm(data.user || null);
            showToast('🔑 ¡Enlace validado con éxito! Elige tu nueva contraseña.');
            return;
        }

        throw new Error('Escribe tu correo arriba o pega la dirección completa que abrió tu navegador (localhost:3000/#...).');
    }

    // Caso 4: token suelto
    const cleanToken = cleanInput.replace(/\s+/g, '');
    if (/^[0-9a-zA-Z_-]{6,}$/.test(cleanToken)) {
        const email = recoveryEmailInput?.value?.trim() || '';
        if (!email) {
            throw new Error('Escribe tu correo arriba para verificar este código.');
        }
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: cleanToken,
            type: 'recovery'
        });
        if (error) throw error;

        isPasswordRecovery = true;
        setCurrentUser(data.user || null);
        showPasswordUpdateForm(data.user || null);
        showToast('🔑 ¡Código validado! Elige tu nueva contraseña.');
        return;
    }

    throw new Error('No se detectó un enlace o token válido. Copia la dirección completa de la barra del navegador donde pone localhost:3000');
}

if (supabaseAppUrlPreview) {
    supabaseAppUrlPreview.value = window.location.origin;
}

btnCopyAppUrl?.addEventListener('click', async () => {
    const url = window.location.origin;
    try {
        await navigator.clipboard.writeText(url);
        btnCopyAppUrl.innerText = '¡Copiado!';
        setTimeout(() => { if (btnCopyAppUrl) btnCopyAppUrl.innerText = 'Copiar'; }, 2000);
    } catch {
        supabaseAppUrlPreview?.select();
        document.execCommand('copy');
        btnCopyAppUrl.innerText = '¡Copiado!';
        setTimeout(() => { if (btnCopyAppUrl) btnCopyAppUrl.innerText = 'Copiar'; }, 2000);
    }
});

btnActivatePastedRecovery?.addEventListener('click', async () => {
    const rawInput = recoveryPastedUrl?.value?.trim();
    if (!rawInput) {
        if (recoveryPastedError) {
            recoveryPastedError.innerText = 'Por favor, pega la dirección de localhost:3000 o el enlace del correo.';
            recoveryPastedError.classList.remove('hidden');
        }
        return;
    }

    recoveryPastedError?.classList.add('hidden');
    btnActivatePastedRecovery.disabled = true;
    btnActivatePastedRecovery.innerText = 'Verificando enlace...';

    try {
        await processRecoveryInput(rawInput);
    } catch (err) {
        console.warn('Error al activar enlace de recuperación:', err);
        if (recoveryPastedError) {
            recoveryPastedError.innerText = `No se pudo activar: ${err.message ? traducirErrorAuth(err) : 'Verifica que hayas copiado la dirección completa.'}`;
            recoveryPastedError.classList.remove('hidden');
        }
    } finally {
        btnActivatePastedRecovery.disabled = false;
        btnActivatePastedRecovery.innerText = '🚀 Activar y cambiar contraseña';
    }
});

btnCancelUpdatePassword?.addEventListener('click', async () => {
    isPasswordRecovery = false;
    try {
        await supabase.auth.signOut();
    } catch {}
    try {
        history.replaceState(null, '', window.location.pathname);
    } catch {}
    passwordUpdateForm?.classList.add('hidden');
    authForm?.classList.remove('hidden');
    document.querySelector('.auth-actions')?.classList.remove('hidden');
    resetStandardAuthUI();
});

passwordUpdateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    passwordUpdateError.classList.add('hidden');
    const password = document.getElementById('new-password').value;
    const confirmation = document.getElementById('confirm-password').value;

    if (!password || password.length < 6) {
        passwordUpdateError.innerText = 'La contraseña debe tener un mínimo de 6 caracteres.';
        passwordUpdateError.classList.remove('hidden');
        return;
    }

    if (password !== confirmation) {
        passwordUpdateError.innerText = 'Las contraseñas no coinciden. Escríbelas iguales.';
        passwordUpdateError.classList.remove('hidden');
        return;
    }

    const submitButton = document.getElementById('btn-submit-new-password') || passwordUpdateForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerText = 'Guardando nueva contraseña...';

    try {
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) throw error;

        isPasswordRecovery = false;

        // Limpiar el hash de la barra de direcciones para no volver a entrar en modo recuperación
        try {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch {}

        passwordUpdateForm.reset();
        passwordUpdateForm.classList.add('hidden');
        showToast('✅ ¡Contraseña actualizada con éxito!');

        if (data.user) {
            setCurrentUser(data.user);
            await mostrarApp();
        } else {
            resetStandardAuthUI();
            showAuthMessage('✅ Tu contraseña ha sido cambiada. Ya puedes iniciar sesión.');
        }
    } catch (error) {
        let msg = error.message;
        if (msg.includes('same_password')) {
            msg = 'La nueva contraseña no puede ser idéntica a la anterior.';
        } else if (msg.includes('expired') || msg.includes('reauthenticate')) {
            msg = 'La sesión de recuperación ha caducado. Vuelve a solicitar un enlace de recuperación.';
        } else {
            msg = traducirErrorAuth(error);
        }
        passwordUpdateError.innerText = `No se pudo actualizar la contraseña: ${msg}`;
        passwordUpdateError.classList.remove('hidden');
    } finally {
        submitButton.disabled = false;
        submitButton.innerText = 'Guardar nueva contraseña';
    }
});

// Traduce al español los errores habituales de Supabase Auth.
function traducirErrorAuth(error) {
    const raw = String(error?.message || error?.msg || error || '');
    const code = String(error?.code || error?.error_code || '');
    const msg = raw.toLowerCase();
    const status = Number(error?.status) || 0;

    if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
        return 'Correo o contraseña incorrectos.';
    }
    if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
        return 'Tienes que confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.';
    }
    if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered') || msg.includes('user already')) {
        return 'Ya existe una cuenta con este correo. Inicia sesión.';
    }
    if (code === 'weak_password' || msg.includes('password should be') || msg.includes('password is too weak')) {
        return 'La contraseña es demasiado débil: usa al menos 6 caracteres.';
    }
    if (code === 'same_password' || msg.includes('same_password') || msg.includes('should be different')) {
        return 'La nueva contraseña no puede ser idéntica a la anterior.';
    }
    if (code === 'email_address_invalid' || msg.includes('unable to validate email') || msg.includes('invalid format') || msg.includes('email address') && msg.includes('invalid')) {
        return 'El correo electrónico no es válido.';
    }
    if (code === 'signup_disabled' || msg.includes('signups not allowed') || msg.includes('signup is disabled')) {
        return 'El registro de nuevas cuentas está desactivado.';
    }
    if (status === 429 || code.includes('rate_limit') || msg.includes('rate limit') || msg.includes('security purposes') || msg.includes('too many')) {
        return 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.';
    }
    if (code === 'otp_expired' || msg.includes('expired') || msg.includes('token has expired') || msg.includes('invalid or has expired')) {
        return 'El enlace o la sesión han caducado. Solicita uno nuevo o vuelve a iniciar sesión.';
    }
    if (code === 'session_not_found' || msg.includes('auth session missing') || msg.includes('jwt')) {
        return 'Tu sesión ha caducado. Vuelve a iniciar sesión.';
    }
    if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('load failed')) {
        return 'Error de conexión. Comprueba tu conexión a internet.';
    }
    return raw || 'No se pudo completar la operación.';
}

// Traduce los motivos/errores de invitación (ver_invitacion_familia, aceptar_invitacion_familia).
function traducirErrorInvitacion(errorOMotivo) {
    const raw = typeof errorOMotivo === 'string' ? errorOMotivo : String(errorOMotivo?.message || '');
    const msg = raw.toLowerCase();
    if (msg.includes('revocad') || msg.includes('revoked') || msg.includes('invalidad')) {
        return 'El administrador ha invalidado este enlace de invitación. Pide uno nuevo.';
    }
    if (msg.includes('agotad') || msg.includes('max_usos') || msg.includes('máximo de usos') || msg.includes('exhausted')) {
        return 'Este enlace de invitación ya se ha usado el máximo de veces. Pide uno nuevo.';
    }
    if (msg.includes('expulsad') || msg.includes('expelled') || msg.includes('banned')) {
        return 'El administrador te quitó de esta familia, así que no puedes volver a unirte con este enlace.';
    }
    if (msg.includes('caducad') || msg.includes('expired')) {
        return 'La invitación ha caducado. Pide un enlace nuevo al administrador.';
    }
    if (msg.includes('no_existe') || msg === 'not_found' || msg.includes('no existe')) {
        return 'La invitación no existe o ya no está disponible.';
    }
    if (msg.includes('otra familia') || msg.includes('otra_familia') || msg.includes('ya pertenece')) {
        return 'Tu cuenta ya pertenece a otra familia. Pide a su administrador que te quite antes de aceptar otra invitación.';
    }
    if (typeof errorOMotivo === 'object' && errorOMotivo) return traducirErrorAuth(errorOMotivo);
    return raw || 'La invitación no es válida.';
}

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
        btnSubmit.innerText = authMode === 'signup' ? 'Crear cuenta' : (authMode === 'invite_join' ? '✨ Crear acceso y ver la invitación' : 'Iniciar sesión');
        return;
    }

    // El nombre escrito en el formulario se usa para rellenar la confirmación de la invitación.
    if (memberName) nombreParaInvitacion = memberName.slice(0, 50);

    try {
        if (pendingInvite && authMode === 'invite_join') {
            btnSubmit.innerText = 'Creando tu acceso...';
            let authUser = null;

            // Intento 1: Registro directo
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
            if (!signUpError && signUpData.user) {
                if (!signUpData.session) {
                    try {
                        const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
                        if (!signErr && signData?.session && signData?.user) {
                            authUser = signData.user;
                        }
                    } catch {}
                } else {
                    authUser = signUpData.user;
                }
                if (!authUser) {
                    updateAuthMode('login');
                    showAuthMessage('Cuenta creada. Confirma tu correo o inicia sesión para ver la invitación.');
                    return;
                }
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

            // No se acepta la invitación automáticamente: mostrarApp enseña la confirmación con el nombre real.
            setCurrentUser(authUser);
            await mostrarApp();
            return;
        }

        if (authMode === 'signup') {
            btnSubmit.innerText = 'Creando cuenta...';
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            if (data.session && data.user) {
                setCurrentUser(data.user);
                await mostrarApp();
            } else if (data.user) {
                try {
                    const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
                    if (!signErr && signData?.session && signData?.user) {
                        setCurrentUser(signData.user);
                        await mostrarApp();
                        return;
                    }
                } catch (autoLoginErr) {
                    console.warn('Auto-login post-signup no completado:', autoLoginErr);
                }
                updateAuthMode('login');
                showAuthMessage('Cuenta creada con éxito. Ya puedes iniciar sesión.');
            }
        } else {
            // Modo login estándar o con invitación (la invitación se confirma en mostrarApp)
            btnSubmit.innerText = 'Iniciando sesión...';
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (!data.user) throw new Error('Supabase no devolvió el usuario autenticado.');
            setCurrentUser(data.user);
            await mostrarApp();
        }
    } catch (error) {
        showAuthError(traducirErrorAuth(error));
    } finally {
        btnSubmit.disabled = false;
        if (pendingInvite && authMode === 'invite_join') {
            btnSubmit.innerText = '✨ Crear acceso y ver la invitación';
        } else if (authMode === 'signup') {
            btnSubmit.innerText = 'Crear cuenta';
        } else {
            btnSubmit.innerText = 'Iniciar sesión';
        }
    }
});

// Borra del navegador los datos de la sesión anterior (estado, tareas, puntos, caché de Supabase).
// Se conservan sólo las preferencias del dispositivo (tema y notificaciones).
function limpiarDatosLocalesUsuario() {
    const conservar = new Set([THEME_STORAGE_KEY, PUSH_PREFS_KEY]);
    try {
        const claves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || conservar.has(key)) continue;
            if (key.startsWith('tribuapp-') || key.startsWith('tribuapp_') || key.startsWith('sb-')) claves.push(key);
        }
        claves.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
        console.warn('No se pudo limpiar el almacenamiento local:', error);
    }
    invitacionVerificada = null;
    nombreParaInvitacion = '';
}

// Deja la app en la pantalla de acceso sin rastro de la sesión anterior.
function cerrarSesionLocal() {
    if (typeof detenerSincronizacionTiempoReal === 'function') {
        try { detenerSincronizacionTiempoReal(); } catch (error) { console.warn(error); }
    }
    cerrarModoSupermercado();
    closeModal();
    limpiarDatosLocalesUsuario();

    isPasswordRecovery = false;
    setCurrentUser(null);
    currentProfile = null;
    authForm.reset();
    mainContent.innerHTML = '';
    authView.classList.remove('hidden');
    onboardingView.classList.add('hidden');
    appView.classList.add('hidden');
    authError.classList.add('hidden');
    if (headerTribeBadge) headerTribeBadge.classList.add('hidden');
    resetStandardAuthUI();
}

btnLogout.addEventListener('click', async () => {
    if (typeof detenerSincronizacionTiempoReal === 'function') {
        try { detenerSincronizacionTiempoReal(); } catch (error) { console.warn(error); }
    }
    try {
        const { error } = await supabase.auth.signOut();
        if (error) console.warn(error);
    } catch (error) {
        console.warn(error);
    }
    descartarInvitacionPendiente();
    cerrarSesionLocal();
});

// --- Invitaciones y onboarding ---

let invitacionVerificada = null; // { token, familia_nombre, invitado_por } ya mostrada al usuario
let nombreParaInvitacion = '';

function descartarInvitacionPendiente() {
    try {
        sessionStorage.removeItem('tribuapp_pending_invite');
    } catch {}
    invitacionVerificada = null;
    // Quitar ?invite= de la barra de direcciones para no volver a procesarla al recargar
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('invite') || url.searchParams.has('tribu')) {
            url.searchParams.delete('invite');
            url.searchParams.delete('tribu');
            history.replaceState(null, '', url.pathname + url.search + url.hash);
        }
    } catch {}
}

function normalizarTokenInvitacion(inviteOrToken) {
    let token = String(inviteOrToken || '').trim();
    try {
        if (token.startsWith('http://') || token.startsWith('https://')) {
            token = new URL(token).searchParams.get('invite') || '';
        }
    } catch {
        throw new Error('El enlace de invitación no es válido.');
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
        throw new Error('Usa un enlace de invitación válido; los códigos antiguos ya no se aceptan.');
    }
    return token.toLowerCase();
}

// Consulta en el servidor a qué familia lleva la invitación (sin aceptarla).
async function verInvitacion(token) {
    const { data, error } = await supabase.rpc('ver_invitacion_familia', { p_token: token });
    if (error) throw new Error(traducirErrorInvitacion(error));
    const info = Array.isArray(data) ? data[0] : data;
    if (!info?.valida) {
        throw new Error(traducirErrorInvitacion(info?.motivo || 'no_existe'));
    }
    return {
        token,
        familia_nombre: info.familia_nombre || 'Familia',
        invitado_por: info.invitado_por || '',
    };
}

function textoConfirmacionInvitacion(info) {
    return info.invitado_por
        ? `¿Unirte a la familia "${info.familia_nombre}", invitado por ${info.invitado_por}?`
        : `¿Unirte a la familia "${info.familia_nombre}"?`;
}

// Pinta en el formulario de unirse la confirmación con el nombre real de la familia.
function mostrarConfirmacionEnOnboarding(info) {
    invitacionVerificada = info;
    if (joinInviteTokenInput) joinInviteTokenInput.value = info.token;
    if (inviteDetectedBanner && inviteDetectedText) {
        inviteDetectedText.innerText = textoConfirmacionInvitacion(info);
        inviteDetectedBanner.classList.remove('hidden');
    }
    btnJoinTribu.innerText = `Sí, unirme a ${info.familia_nombre}`;
    document.getElementById('btn-reject-invite')?.classList.remove('hidden');
}

function resetConfirmacionOnboarding() {
    invitacionVerificada = null;
    inviteDetectedBanner?.classList.add('hidden');
    btnJoinTribu.innerText = 'Unirme a la Tribu';
    document.getElementById('btn-reject-invite')?.classList.add('hidden');
}

function mostrarOnboarding(mensajeError = '') {
    authView.classList.add('hidden');
    appView.classList.add('hidden');
    onboardingView.classList.remove('hidden');
    if (headerTribeBadge) headerTribeBadge.classList.add('hidden');

    if (joinNombreInput && !joinNombreInput.value) joinNombreInput.value = nombreParaInvitacion || getFriendlyUserName();
    const adminNameInput = document.getElementById('tribu-nombre-usuario');
    if (adminNameInput && !adminNameInput.value) adminNameInput.value = nombreParaInvitacion || getFriendlyUserName();

    if (mensajeError) {
        onboardingError.innerText = mensajeError;
        onboardingError.classList.remove('hidden');
    } else {
        onboardingError.classList.add('hidden');
    }
}

function mostrarTabUnirse() {
    tabJoinTribu?.classList.add('active');
    tabCreateTribu?.classList.remove('active');
    joinTribuForm?.classList.remove('hidden');
    onboardingForm?.classList.add('hidden');
}

// Tras crear o unirse a una tribu: descarga los datos de la familia y entra en la app.
async function entrarEnTribu() {
    descartarInvitacionPendiente();
    resetConfirmacionOnboarding();
    onboardingView.classList.add('hidden');
    authView.classList.add('hidden');
    appView.classList.remove('hidden');
    if (headerTribeBadge) headerTribeBadge.classList.remove('hidden');
    await syncFamilyDataFromSupabase();
    await renderizarVista('dashboard');
}

// Procesa una invitación abierta desde ?invite=TOKEN: muestra a qué familia lleva y quién invita
// y sólo la acepta si el usuario lo confirma.
async function procesarInvitacionPendiente(pendingInvite, profile) {
    let info;
    try {
        info = await verInvitacion(normalizarTokenInvitacion(pendingInvite.token));
    } catch (error) {
        descartarInvitacionPendiente();
        const mensaje = `Invitación no válida: ${error.message}`;
        if (profile?.familia_id) {
            await entrarEnTribu();
            showToast(`⚠️ ${mensaje}`);
        } else {
            resetConfirmacionOnboarding();
            mostrarTabUnirse();
            mostrarOnboarding(mensaje);
        }
        return;
    }

    if (!profile?.familia_id) {
        mostrarTabUnirse();
        mostrarOnboarding();
        mostrarConfirmacionEnOnboarding(info);
        return;
    }

    // Ya pertenece a una familia: entrar en la app y preguntar en un modal.
    await entrarEnTribu();
    openModal(`
        <div class="modal-header">
            <h3>⛺ Invitación a una tribu</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <p id="invite-confirm-text" style="margin-bottom: 8px;"></p>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">Si ya perteneces a otra familia, su administrador tendrá que quitarte antes de que puedas unirte.</p>
        <div class="modal-footer">
            <button type="button" id="btn-accept-invite-modal" class="btn-primary"></button>
            <button type="button" id="btn-reject-invite-modal" class="btn-secondary">No, gracias</button>
        </div>
    `);
    document.getElementById('invite-confirm-text').innerText = textoConfirmacionInvitacion(info);
    const acceptBtn = document.getElementById('btn-accept-invite-modal');
    acceptBtn.innerText = `Sí, unirme a ${info.familia_nombre}`;
    document.getElementById('btn-reject-invite-modal')?.addEventListener('click', () => {
        closeModal();
        showToast('Invitación descartada');
    });
    acceptBtn.addEventListener('click', async () => {
        acceptBtn.disabled = true;
        acceptBtn.innerText = 'Uniéndote...';
        try {
            const family = await handleJoinTribu(info.token, profile.nombre || getFriendlyUserName());
            closeModal();
            showToast(`🎉 ¡Te has unido a "${family.nombre}"!`);
            await entrarEnTribu();
        } catch (error) {
            closeModal();
            showToast(`⚠️ No se pudo aceptar la invitación: ${error.message}`);
        }
    });
}

async function mostrarApp() {
    if (isPasswordRecovery) {
        showPasswordUpdateForm(currentUser);
        return;
    }

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

    // Si mientras tanto se abrió un enlace de recuperación, no pisar el formulario de nueva contraseña
    if (isPasswordRecovery) return;

    if (error) {
        if (esErrorDeRed(error) && arrancarSinConexion(currentUser)) return;
        onboardingView.classList.add('hidden');
        appView.classList.add('hidden');
        authView.classList.remove('hidden');
        showAuthError(`No se pudo cargar tu perfil: ${traducirErrorAuth(error)}`);
        return;
    }

    currentProfile = profile;
    guardarPerfilSinConexion(profile);
    if (profile?.nombre && !nombreParaInvitacion) nombreParaInvitacion = profile.nombre;

    if (pendingInvite) {
        await procesarInvitacionPendiente(pendingInvite, profile);
        return;
    }

    // Sin perfil o expulsado de su familia (familia_id NULL): crear una tribu o unirse a otra
    if (!profile || !profile.familia_id) {
        resetConfirmacionOnboarding();
        mostrarOnboarding();
        return;
    }

    onboardingView.classList.add('hidden');
    appView.classList.remove('hidden');
    if (headerTribeBadge) headerTribeBadge.classList.remove('hidden');
    salirModoSinConexion();
    await syncFamilyDataFromSupabase();
    renderizarVista('dashboard');
}

async function handleJoinTribu(inviteOrToken, memberName) {
    if (!currentUser) throw new Error('Debes haber iniciado sesión');

    const token = normalizarTokenInvitacion(inviteOrToken);

    const { data, error } = await supabase.rpc('aceptar_invitacion_familia', {
        p_token: token,
        p_nombre: (memberName || getFriendlyUserName()).slice(0, 50),
    });
    if (error) throw new Error(traducirErrorInvitacion(error));

    const profile = Array.isArray(data) ? data[0] : data;
    if (!profile?.familia_id || !profile?.familia_nombre) {
        throw new Error('La invitación no existe, ha caducado o ya no está disponible.');
    }

    currentProfile = {
        id: profile.id,
        familia_id: profile.familia_id,
        nombre: profile.nombre,
        rol: profile.rol,
    };
    descartarInvitacionPendiente();
    return { id: profile.familia_id, nombre: profile.familia_nombre };
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

// Si se cambia el enlace pegado, hay que volver a confirmar a qué familia lleva
joinInviteTokenInput?.addEventListener('input', () => {
    if (invitacionVerificada && joinInviteTokenInput.value.trim() !== invitacionVerificada.token) {
        resetConfirmacionOnboarding();
    }
});

document.getElementById('btn-reject-invite')?.addEventListener('click', () => {
    descartarInvitacionPendiente();
    resetConfirmacionOnboarding();
    if (joinInviteTokenInput) joinInviteTokenInput.value = '';
    onboardingError.classList.add('hidden');
    showToast('Invitación descartada');
});

joinTribuForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    onboardingError.classList.add('hidden');
    btnJoinTribu.disabled = true;
    btnJoinTribu.innerText = 'Comprobando...';

    const nombre = (joinNombreInput.value.trim() || getFriendlyUserName()).slice(0, 50);
    let confirmando = false;

    try {
        const token = normalizarTokenInvitacion(joinInviteTokenInput.value);
        // Primer paso: enseñar a qué familia lleva el enlace; el segundo envío la acepta.
        if (invitacionVerificada?.token !== token) {
            const info = await verInvitacion(token);
            mostrarConfirmacionEnOnboarding(info);
            confirmando = true;
            return;
        }
        btnJoinTribu.innerText = 'Uniéndote...';
        const family = await handleJoinTribu(token, nombre);
        showToast(`🎉 ¡Te has unido a "${family.nombre}"!`);
        await entrarEnTribu();
    } catch (err) {
        onboardingError.innerText = err.message || 'No se pudo unir a la tribu';
        onboardingError.classList.remove('hidden');
    } finally {
        btnJoinTribu.disabled = false;
        if (!confirmando) {
            btnJoinTribu.innerText = invitacionVerificada ? `Sí, unirme a ${invitacionVerificada.familia_nombre}` : 'Unirme a la Tribu';
        }
    }
});

onboardingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    onboardingError.classList.add('hidden');
    btnOnboarding.disabled = true;
    btnOnboarding.innerText = 'Creando...';

    const nombreFamilia = document.getElementById('tribu-nombre').value.trim().slice(0, 80);
    const nombreUsuario = (document.getElementById('tribu-nombre-usuario')?.value.trim() || getFriendlyUserName()).slice(0, 50);
    const dieta = document.getElementById('tribu-dieta').value;
    const flexibilidad = document.getElementById('tribu-flexibilidad').value;

    if (!nombreFamilia) {
        onboardingError.innerText = 'Pon un nombre para tu tribu.';
        onboardingError.classList.remove('hidden');
        btnOnboarding.disabled = false;
        btnOnboarding.innerText = 'Crear Tribu';
        return;
    }

    try {
        const { data, error } = await supabase.rpc('crear_familia_con_admin', {
            p_nombre: nombreFamilia,
            p_dieta_base: dieta,
            p_nivel_flexibilidad: flexibilidad,
            p_nombre_usuario: nombreUsuario,
        });
        if (error) throw error;
        const profile = Array.isArray(data) ? data[0] : data;
        if (!profile?.familia_id || !profile?.id) {
            throw new Error('Supabase no devolvió el perfil de administrador creado.');
        }
        currentProfile = profile;
    } catch (error) {
        onboardingError.innerText = `No se pudo crear la tribu: ${traducirErrorAuth(error)}`;
        onboardingError.classList.remove('hidden');
        btnOnboarding.disabled = false;
        btnOnboarding.innerText = 'Crear Tribu';
        return;
    }

    await entrarEnTribu();
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
    closeModal();
    cerrarModoSupermercado();

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
        if (renderId !== viewRenderId) return;
        if (esErrorDeRed(error)) {
            // Sin red: repetimos la vista con los últimos datos guardados
            if (!modoSinConexion && leerFamiliaSinConexion()) {
                entrarModoSinConexion();
                return renderizarVista(vista);
            }
            mostrarBannerSinConexion();
            mainContent.innerHTML = '<p class="error-text" role="alert">Sin conexión y sin datos guardados para esta vista. Se cargará al volver la conexión.</p>';
            return;
        }
        mainContent.innerHTML = `<p class="error-text" role="alert">${escapeHtml(error.message)}</p>`;
    }
}

async function fetchFamilyData() {
    if (!currentProfile?.familia_id) {
        throw new Error('Tu perfil todavía no está vinculado a una tribu.');
    }
    if (modoSinConexion) {
        const guardado = leerFamiliaSinConexion();
        if (guardado) return guardado;
    }

    const [familyResult, membersResult, tasksResult] = await Promise.all([
        supabase.from('familias').select('id, nombre, dieta_base').eq('id', currentProfile.familia_id).single(),
        supabase.from('usuarios').select('id, nombre, rol').eq('familia_id', currentProfile.familia_id),
        supabase.from('tareas_asignadas')
            .select('id, tarea_id, fecha_objetivo, estado, asignado_a, recurrencia, tareas_catalogo(nombre)')
            .eq('familia_id', currentProfile.familia_id)
            .order('fecha_objetivo', { ascending: true }),
    ]);

    if (familyResult.error) {
        // La familia ya no es visible (p. ej. un admin nos ha quitado): volver a comprobar el perfil
        if (familyResult.error.code === 'PGRST116' && currentUser) {
            const { data: perfil } = await supabase.from('usuarios').select('familia_id').eq('id', currentUser.id).maybeSingle();
            if (!perfil?.familia_id) {
                currentProfile = currentProfile ? { ...currentProfile, familia_id: null } : null;
                if (typeof detenerSincronizacionTiempoReal === 'function') {
                    try { detenerSincronizacionTiempoReal(); } catch {}
                }
                mostrarOnboarding('Ya no perteneces a esta familia. Crea una tribu nueva o únete con una invitación.');
                throw new Error('Ya no perteneces a esta familia.');
            }
        }
        throw familyResult.error;
    }
    if (membersResult.error) throw membersResult.error;

    let tasks = [];
    if (!tasksResult.error && Array.isArray(tasksResult.data)) {
        tasks = tasksResult.data;
        saveToStorage(STORAGE_KEYS.tasks, tasks);
    } else {
        const storedTasks = readFromStorage(STORAGE_KEYS.tasks, []);
        tasks = Array.isArray(storedTasks) ? storedTasks.filter(t => !String(t.id).startsWith('demo-')) : [];
    }

    const familyData = {
        family: familyResult.data,
        members: membersResult.data || [],
        tasks,
    };
    guardarFamiliaSinConexion(familyData);
    return familyData;
}

async function removeFamilyMember(member) {
    if (!member || member.id === currentUser?.id || member.rol === 'Admin') {
        throw new Error('No se puede quitar a este miembro.');
    }

    const memberName = member.nombre || 'este miembro';
    if (!confirm(`¿Quieres quitar a ${memberName} de la familia? Su cuenta de Tribuapp no se eliminará.`)) {
        return false;
    }

    const { data, error } = await supabase.rpc('quitar_miembro_familia', {
        p_usuario_id: member.id,
    });
    if (error) throw error;
    if (data !== true) throw new Error('No se pudo quitar al miembro de la familia.');
    return true;
}

// --- Invitación a la Tribu Modal ---

async function openInviteModal(family, inviteToken = null) {
    if (!family?.id) {
        showToast('No se pudo identificar la familia para crear la invitación.');
        return;
    }
    if (!inviteToken) {
        const { data, error } = await supabase.rpc('crear_invitacion_familia', {
            p_familia_id: family.id,
        });
        if (error) {
            console.error('Error al crear invitación segura:', error);
            showToast(`No se pudo generar el enlace de invitación: ${traducirErrorInvitacion(error)}`);
            return;
        }
        const invitation = Array.isArray(data) ? data[0] : data;
        inviteToken = invitation?.token;
        if (!inviteToken) {
            showToast('Supabase no devolvió un token de invitación.');
            return;
        }
    }

    const publicUrl = getPublicAppUrl();
    const directJoinLink = `${publicUrl.replace(/\/$/, '')}/?invite=${encodeURIComponent(inviteToken)}`;
    const customDeployUrl = localStorage.getItem('tribuapp_custom_deploy_url') || '';

    const html = `
        <div class="modal-header">
            <h3>👥 Invitar a tu Tribu</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            Comparte este enlace solo con las personas que quieras invitar. Al abrirlo, podrán unirse a tu tribu:
        </p>

        <div class="invite-code-box">
            <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Invitación segura</div>
            <div class="invite-code-val">${escapeHtml(family.nombre || 'Mi Hogar')}</div>
            <div style="font-size: 11px; color: var(--primary); margin-top: 6px;">Tribu: ${escapeHtml(family?.nombre || 'Mi Hogar')}</div>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin: -4px 0 14px;">
            El enlace caduca en 7 días y admite hasta 10 usos. Puedes invalidarlo desde «Miembros de la Tribu».
        </p>

        <div style="background: var(--card-secondary-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">🔗 Enlace de acceso:</span>
                ${customDeployUrl ? '<span class="chip" style="font-size: 10px; padding: 2px 6px;">Personalizado</span>' : '<span class="chip" style="font-size: 10px; padding: 2px 6px;">GitHub Pages</span>'}
            </div>
            <div style="font-size: 12px; word-break: break-all; color: var(--text-main); font-family: monospace; background: var(--card-bg); padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 6px;">${escapeHtml(directJoinLink)}</div>
            <div style="font-size: 11px; color: var(--success); font-weight: 600;">🔒 Enlace privado para compartir con familiares</div>
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
            <button type="button" id="btn-copy-invite-link" class="btn-secondary">📋 Copiar enlace de invitación</button>
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
            openInviteModal(family, inviteToken);
        } else {
            showToast('Introduce una URL válida que empiece por https://');
        }
    });

    document.getElementById('btn-reset-custom-url')?.addEventListener('click', () => {
        localStorage.removeItem('tribuapp_custom_deploy_url');
        showToast('Restablecido al enlace de GitHub Pages');
        openInviteModal(family, inviteToken);
    });

    document.getElementById('btn-copy-invite-link')?.addEventListener('click', async () => {
        const text = `⛺ ¡Hola! Te invito a unirte a nuestra tribu familiar "${family?.nombre || 'Familia'}" en Tribuapp.\n\nEnlace seguro (válido durante 7 días): ${directJoinLink}`;
        try {
            await navigator.clipboard.writeText(text);
            showToast('¡Enlace de invitación copiado!');
        } catch {
            showToast('No se pudo copiar. Selecciona y copia el enlace manualmente.');
        }
    });

    document.getElementById('btn-invite-wa')?.addEventListener('click', () => {
        const text = `⛺ ¡Hola! Te invito a unirte a nuestra tribu familiar *${family?.nombre || 'Familia'}* en Tribuapp.\n\n👉 Entra directamente aquí para unirte a la familia (enlace válido 7 días):\n${directJoinLink}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    });
}

btnInviteFamily?.addEventListener('click', async () => {
    try {
        const { family } = await fetchFamilyData();
        openInviteModal(family);
    } catch (error) {
        console.error('No se pudo cargar la familia para invitar:', error);
        showToast(`No se pudo abrir la invitación: ${error.message}`);
    }
});

// --- DASHBOARD VIEW ---

async function renderDashboard(renderId) {
    const [{ family, members, tasks }, localState] = await Promise.all([fetchFamilyData(), getAppState()]);
    if (renderId !== viewRenderId) return;

    const karmaMap = await cargarPuntosFamilia();
    if (renderId !== viewRenderId) return;
    const totalKarma = Object.values(karmaMap).reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);

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
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span class="chip" style="color: #eab308; background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.25); font-weight: 600;" title="Puntos acumulados por la tribu">⭐ ${totalKarma} pts</span>
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
            <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
                <button type="button" id="btn-quick-pantry-review" class="btn-secondary" style="font-size: 12px; padding: 8px 12px; flex: 1;">🛒 Revisar despensa</button>
                <button type="button" id="btn-dash-fridge" class="btn-secondary" style="font-size: 12px; padding: 8px 12px; flex: 1;">🧊 ¿Qué cocino hoy?</button>
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
                        ${currentProfile?.rol === 'Admin' && member.id !== currentUser?.id && member.rol !== 'Admin'
                            ? `<button type="button" class="member-remove-button" data-remove-member="${escapeHtml(member.id)}" aria-label="Quitar a ${escapeHtml(member.nombre || 'este miembro')} de la familia">Quitar</button>`
                            : ''}
                    </div>
                `).join('')}
            </div>
            ${currentProfile?.rol === 'Admin' ? `
                <button type="button" id="btn-revoke-invites" class="btn-secondary" style="margin-top: 12px; font-size: 12px; padding: 8px 12px; width: 100%;">🔒 Invalidar enlaces de invitación</button>
            ` : ''}
        </section>
    `;

    document.getElementById('btn-revoke-invites')?.addEventListener('click', async (event) => {
        const button = event.currentTarget;
        if (!confirm('¿Invalidar todos los enlaces de invitación activos? Quien tenga uno ya no podrá usarlo. Podrás crear uno nuevo con «Invitar».')) return;
        button.disabled = true;
        try {
            const { error } = await supabase.rpc('revocar_invitaciones_familia', { p_familia_id: family.id });
            if (error) throw error;
            showToast('🔒 Enlaces de invitación invalidados');
        } catch (error) {
            console.error('Error al invalidar invitaciones:', error);
            showToast(`⚠️ No se pudieron invalidar los enlaces: ${traducirErrorInvitacion(error)}`);
        } finally {
            button.disabled = false;
        }
    });

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
    document.getElementById('btn-dash-fridge')?.addEventListener('click', openFridgeModal);

    mainContent.querySelectorAll('[data-remove-member]').forEach((button) => {
        button.addEventListener('click', async () => {
            const member = members.find((item) => item.id === button.dataset.removeMember);
            if (!member) {
                showToast('No se encontró al miembro seleccionado.');
                return;
            }

            button.disabled = true;
            try {
                const removed = await removeFamilyMember(member);
                if (!removed) {
                    button.disabled = false;
                    return;
                }
                showToast(`${member.nombre || 'El miembro'} ya no pertenece a la familia.`);
                await renderizarVista('dashboard');
            } catch (error) {
                console.error('Error al quitar miembro de la familia:', error);
                showToast(`No se pudo quitar al miembro: ${traducirErrorAuth(error)}`);
                button.disabled = false;
            }
        });
    });

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

// Crea la tarea en el catálogo de la familia y su asignación. Si falla la asignación,
// borra el catálogo recién creado para no dejar huérfanos. Lanza el error real.
async function crearTareaEnSupabase({ nombre, asignadoA, fecha, recurrencia }) {
    const familiaId = currentProfile?.familia_id;
    if (!familiaId) throw new Error('Tu perfil no está vinculado a una tribu.');

    const { data: catalog, error: catalogError } = await supabase.from('tareas_catalogo')
        .insert({
            familia_id: familiaId,
            nombre,
            recurrencia_sugerida: recurrencia
        })
        .select('id')
        .single();
    if (catalogError) throw catalogError;
    if (!catalog?.id) throw new Error('Supabase no devolvió la tarea creada.');

    const { error: assignmentError } = await supabase.from('tareas_asignadas')
        .insert({
            familia_id: familiaId,
            tarea_id: catalog.id,
            asignado_a: asignadoA,
            fecha_objetivo: fecha,
            recurrencia,
            estado: 'Pendiente'
        });
    if (assignmentError) {
        const { error: cleanupError } = await supabase.from('tareas_catalogo').delete().eq('id', catalog.id);
        if (cleanupError) console.warn('No se pudo deshacer la tarea del catálogo:', cleanupError);
        throw assignmentError;
    }
}

async function completarTarea(taskId) {
    // La BD completa la tarea de forma atómica (sólo si sigue Pendiente) y programa la siguiente
    // ocurrencia si es recurrente. Los puntos y la celebración sólo llegan si el servidor confirma.
    let resultado = null;
    try {
        const { data, error } = await supabase.rpc('completar_tarea', { p_asignacion_id: taskId });
        if (error) throw error;
        resultado = Array.isArray(data) ? data[0] : data;
    } catch (err) {
        console.error('Error al completar tarea en Supabase:', err);
        showToast('⚠️ No se pudo completar la tarea. Revisa tu conexión e inténtalo de nuevo.');
        await renderizarVista(currentView);
        return false;
    }

    if (!resultado?.ok) {
        const motivo = resultado?.motivo === 'ya_completada_o_no_existe'
            ? 'Esta tarea ya estaba completada o se ha eliminado.'
            : 'No se pudo completar la tarea.';
        showToast(`ℹ️ ${motivo} Se ha actualizado la lista.`);
        await renderizarVista(currentView);
        return false;
    }

    const puntos = Number(resultado.puntos) || 10;
    const karma = await cargarPuntosFamilia();
    const totalTribu = Object.values(karma).reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
    triggerConfetti();

    if ('vibrate' in navigator) {
        try { navigator.vibrate([40, 50, 40]); } catch {}
    }

    let mensaje = `🎉 ¡Tarea completada! +${puntos} Puntos Tribu ⭐ (Tribu: ${totalTribu} pts)`;
    if (resultado.siguiente_fecha) {
        const siguiente = new Date(`${resultado.siguiente_fecha}T00:00:00`).toLocaleDateString('es-ES');
        mensaje += ` · Próxima: ${siguiente}`;
    }
    showToast(mensaje);

    await renderizarVista(currentView);

    // Comprobar con los datos ya recargados si todas las tareas de hoy están completadas
    const todayIso = getLocalDateInputValue();
    const tareas = readFromStorage(STORAGE_KEYS.tasks, []);
    const deHoy = Array.isArray(tareas) ? tareas.filter(t => t.fecha_objetivo === todayIso) : [];
    if (deHoy.length && deHoy.every(t => t.estado === 'Completada')) {
        setTimeout(() => {
            showToast('🏆 ¡Todas las tareas de hoy completadas! Medalla de oro para la tribu.');
        }, 800);
    }
    return true;
}

async function eliminarTarea(taskId) {
    try {
        const { data, error } = await supabase.from('tareas_asignadas')
            .delete()
            .eq('id', taskId)
            .select('id');
        if (error) throw error;
        if (!Array.isArray(data) || data.length === 0) {
            showToast('ℹ️ La tarea ya no existe o no tienes permiso para eliminarla.');
        } else {
            showToast('Tarea eliminada');
        }
    } catch (err) {
        console.error('Error al eliminar tarea en Supabase:', err);
        showToast('⚠️ No se pudo eliminar la tarea. Inténtalo de nuevo.');
    }
    await renderizarVista(currentView);
}

async function cargarVistaTareas(renderId) {
    const [{ members, tasks }, karmaMap] = await Promise.all([fetchFamilyData(), cargarPuntosFamilia()]);
    if (renderId !== viewRenderId) return;

    const totalKarma = Object.values(karmaMap).reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
    const sortedMembers = [...members].map(m => ({
        ...m,
        puntos: karmaMap[m.id] || 0
    })).sort((a, b) => b.puntos - a.puntos);

    // Filter tasks
    const mineTasks = tasks.filter(t => t.asignado_a === currentProfile?.id);
    const poolTasks = tasks.filter(t => !t.asignado_a);

    const todayIso = getLocalDateInputValue();
    const tasksForToday = tasks.filter(t => t.fecha_objetivo === todayIso);
    const completedToday = tasksForToday.filter(t => t.estado === 'Completada');
    const pendingToday = tasksForToday.filter(t => t.estado !== 'Completada');
    const todayPercent = tasksForToday.length > 0 ? Math.round((completedToday.length / tasksForToday.length) * 100) : (pendingToday.length === 0 ? 100 : 0);

    let displayTasks = tasks;
    if (currentTaskFilter === 'today') {
        displayTasks = tasksForToday;
    } else if (currentTaskFilter === 'mine') {
        displayTasks = mineTasks;
    } else if (currentTaskFilter === 'pool') {
        displayTasks = poolTasks;
    }

    if (hideCompletedTasks) {
        displayTasks = displayTasks.filter(t => t.estado !== 'Completada');
    }

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
            <button type="button" class="filter-tab ${currentTaskFilter === 'today' ? 'active' : ''}" data-task-filter="today">📅 Solo hoy (${tasksForToday.length})</button>
            <button type="button" class="filter-tab ${currentTaskFilter === 'mine' ? 'active' : ''}" data-task-filter="mine">👤 Mis tareas (${mineTasks.length})</button>
            <button type="button" class="filter-tab ${currentTaskFilter === 'pool' ? 'active' : ''}" data-task-filter="pool">🧺 Bolsa común (${poolTasks.length})</button>
        </div>

        <!-- Opciones de visualización y Gamificación infantil -->
        <div class="task-view-options">
            <label class="toggle-hide-completed" title="Ocultar tareas que ya están hechas para ver solo pendientes">
                <input type="checkbox" id="chk-hide-completed" ${hideCompletedTasks ? 'checked' : ''}>
                <span>👁️ Ocultar completadas</span>
            </label>
            <button type="button" class="task-karma-summary" id="btn-toggle-podium" title="Ver Podio Familiar y Puntos Tribu">
                <span>⭐ <strong>${totalKarma}</strong> Puntos Tribu</span>
                <span style="font-size: 11px; opacity: 0.85;">${showPodiumView ? '▲ Cerrar' : '▼ 🏆 Podio'}</span>
            </button>
        </div>

        ${showPodiumView ? `
            <div class="panel karma-panel" style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="font-size: 14px;">🏆 Podio Familiar de la Tribu</strong>
                    <span style="font-size: 11px; color: var(--text-muted);">+10 pts por tarea</span>
                </div>
                <div class="podium-grid">
                    ${sortedMembers.map((m, idx) => {
                        const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '⭐'));
                        return `
                            <div class="podium-card">
                                <span class="podium-medal">${medal}</span>
                                <span class="podium-name">${escapeHtml(m.nombre)}</span>
                                <span class="podium-points">${m.puntos} pts</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : ''}

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
                    <input type="date" id="nueva-tarea-fecha" class="input-select" value="${todayIso}">
                </div>
            </div>

            <div>
                <label for="nueva-tarea-recurrencia">Repetición</label>
                <select id="nueva-tarea-recurrencia" class="input-select">
                    <option value="Puntual">Puntual (una sola vez)</option>
                    <option value="Diaria">🔄 Diaria (todos los días)</option>
                    <option value="Semanal">🔄 Semanal (cada 7 días)</option>
                    <option value="Quincenal">🔄 Quincenal (cada 14 días)</option>
                    <option value="Mensual">🔄 Mensual (mismo día cada mes)</option>
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
                <p>${hideCompletedTasks ? '✨ ¡Todas las tareas de esta sección están hechas!' : 'No hay tareas en esta sección.'}</p>
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
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <strong>${escapeHtml(task.tareas_catalogo?.nombre || 'Tarea')}</strong>
                            <span class="task-points-badge" title="Puntos al completar">⭐ +10</span>
                            ${isOverdue ? '<span class="badge-overdue">Atrasada</span>' : ''}
                        </div>
                        <div class="today-task-meta" style="margin-top: 4px;">
                            <span>📅 ${escapeHtml(date)}</span>
                            <span>👤 ${escapeHtml(assignedName)}</span>
                            ${task.recurrencia && task.recurrencia !== 'Puntual' ? `<span class="recurrence-badge">🔄 ${escapeHtml(task.recurrencia)}</span>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${completed
                            ? '<span aria-label="Completada" style="color: var(--success); font-weight: bold; font-size: 18px;">✓</span>'
                            : `<button data-complete-task="${escapeHtml(task.id)}" class="btn-primary btn-icon-square" aria-label="Completar tarea" title="Marcar como completada">✓</button>`}
                        <button data-delete-task="${escapeHtml(task.id)}" class="btn-icon-square" style="background: transparent; color: var(--text-muted); border: 1px solid var(--border-color); font-size: 14px; cursor: pointer;" aria-label="Eliminar tarea" title="Eliminar tarea">🗑️</button>
                    </div>
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

    document.getElementById('chk-hide-completed')?.addEventListener('change', (e) => {
        hideCompletedTasks = e.target.checked;
        cargarVistaTareas(renderId);
    });

    document.getElementById('btn-toggle-podium')?.addEventListener('click', () => {
        showPodiumView = !showPodiumView;
        cargarVistaTareas(renderId);
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

    lista.querySelectorAll('[data-delete-task]').forEach((button) => {
        button.addEventListener('click', async () => {
            if (confirm('¿Quieres eliminar esta tarea?')) {
                button.disabled = true;
                await eliminarTarea(button.dataset.deleteTask);
            }
        });
    });

    document.getElementById('form-nueva-tarea').addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = document.getElementById('btn-guardar-tarea');
        const nombre = document.getElementById('nueva-tarea-nombre').value.trim().slice(0, 120);
        const asignadoA = document.getElementById('nueva-tarea-asignado').value || null;
        const fecha = document.getElementById('nueva-tarea-fecha').value || getLocalDateInputValue();
        const recurrencia = document.getElementById('nueva-tarea-recurrencia').value || 'Puntual';

        if (!nombre) {
            alert('El nombre de la tarea es obligatorio.');
            return;
        }

        button.disabled = true;
        button.innerText = 'Guardando...';
        try {
            await crearTareaEnSupabase({ nombre, asignadoA, fecha, recurrencia });
        } catch (error) {
            console.error('Error al crear la tarea:', error);
            showToast(`⚠️ No se pudo crear la tarea: ${error.message || 'error de conexión'}`);
            button.disabled = false;
            button.innerText = 'Guardar Tarea';
            return;
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
        <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
            <span class="day-badge">${escapeHtml(dish.dia)}</span>
            <span class="meal-badge ${dish.tipo === 'Cena' ? 'cena' : 'comida'}">${dish.tipo === 'Cena' ? '🌙 Cena' : '☀️ Comida'}</span>
            <span class="chip" style="font-size: 11px;">⏱️ ${escapeHtml(dish.tiempo || '25 min')}</span>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
            <button type="button" id="btn-chef-steps" class="btn-primary" style="flex: 1; padding: 10px 12px; font-size: 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border: none;">
                👨‍🍳 ¿Cómo se cocina? (Paso a paso IA)
            </button>
            <button type="button" id="btn-swap-recipe-dish" class="btn-secondary" style="padding: 10px 12px; font-size: 12px;">
                🔄 Cambiar plato
            </button>
        </div>

        <div id="chef-steps-container"></div>

        <h4 style="font-size: 14px; margin-bottom: 8px;">Ingredientes clave:</h4>
        <ul style="padding-left: 20px; font-size: 14px; line-height: 1.6; color: var(--text-main); margin-bottom: 16px;">
            ${ingList.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
        </ul>
        <div class="modal-footer">
            <button type="button" id="btn-add-recipe-to-shop" class="btn-primary">🛒 Pasar estos ingredientes a la compra</button>
            <button type="button" class="btn-secondary" data-modal-close>Cerrar</button>
        </div>
    `;

    openModal(html);

    document.getElementById('btn-swap-recipe-dish')?.addEventListener('click', () => {
        openSwapDishModal(dish);
    });

    document.getElementById('btn-chef-steps')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const container = document.getElementById('chef-steps-container');
        if (!container) return;

        btn.disabled = true;
        btn.innerText = '👨‍🍳 Consultando con el Chef Gemini...';
        container.innerHTML = `
            <div style="text-align: center; padding: 16px; background: var(--card-secondary-bg); border-radius: 12px; margin-bottom: 14px;">
                <p style="font-size: 13px; font-weight: 600; color: var(--primary); margin: 0;">Preparando receta y tiempos de cocción...</p>
            </div>
        `;

        try {
            const { data, error } = await supabase.functions.invoke('generate-menu', {
                body: {
                    action: 'recipe_steps',
                    plato: dish.nombre,
                    ingredientes: ingList
                }
            });

            if (error) {
                let message = error.message || 'No se pudo contactar con Gemini.';
                if (error.context instanceof Response) {
                    try {
                        const details = await error.context.clone().json();
                        if (typeof details.error === 'string') message = details.error;
                    } catch {}
                }
                throw new Error(message);
            }
            if (!data?.recipe) throw new Error('No se recibieron los pasos de la receta.');

            const r = data.recipe;
            btn.style.display = 'none';
            container.innerHTML = `
                <div class="chef-steps-box">
                    <div class="chef-badge-row">
                        <span class="chip" style="font-size: 11px;">⏱️ Cocción: ${escapeHtml(r.tiempo || '25 min')}</span>
                        <span class="chip" style="font-size: 11px;">⚡ Dificultad: ${escapeHtml(r.dificultad || 'Media')}</span>
                    </div>
                    <h5 style="margin: 0 0 8px; font-size: 13px; font-weight: 700;">📋 Preparación paso a paso:</h5>
                    <ol style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.55; color: var(--text-main);">
                        ${Array.isArray(r.pasos) ? r.pasos.map(p => `<li style="margin-bottom: 6px;">${escapeHtml(p)}</li>`).join('') : ''}
                    </ol>
                    ${r.truco_chef ? `
                        <div class="chef-tip-box">
                            <span style="font-size: 18px;">💡</span>
                            <div style="font-size: 12px; line-height: 1.45; color: var(--text-main);">
                                <strong>Truco del Chef:</strong> ${escapeHtml(r.truco_chef)}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        } catch (err) {
            console.error('Error al generar receta:', err);
            btn.disabled = false;
            btn.innerText = '👨‍🍳 Reintentar paso a paso con IA';
            container.innerHTML = `
                <p class="error-text" style="margin-bottom: 12px;">Error al obtener la receta: ${escapeHtml(err.message || 'Error de conexión.')}</p>
            `;
        }
    });

    document.getElementById('btn-add-recipe-to-shop')?.addEventListener('click', async () => {
        const realIngredients = listaDeTextos(dish.ingredientes);
        closeModal();
        if (!realIngredients.length) {
            showToast('Este plato no tiene ingredientes registrados.');
            return;
        }
        const added = await anadirProductosACompra(realIngredients.map(nombre => ({ nombre })));
        if (added > 0) showToast(`¡Añadido${added === 1 ? '' : 's'} ${added} ingrediente${added === 1 ? '' : 's'} a la lista de compra!`);
        else if (added === 0) showToast('Esos ingredientes ya estaban en la lista de compra.');
    });
}

function openSwapDishModal(dish) {
    const html = `
        <div class="modal-header">
            <h3>🔄 Cambiar plato con IA</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            Plato actual: <strong>${escapeHtml(dish.nombre)}</strong> (${escapeHtml(dish.tipo)} del ${escapeHtml(dish.dia)}).
        </p>
        <div id="swap-status-box" style="text-align: center; padding: 24px 10px;">
            <p style="font-weight: 700; color: var(--primary); margin-bottom: 4px;">Pensando 3 alternativas con Gemini...</p>
            <p id="swap-diet-text" style="font-size: 12px; color: var(--text-muted);">Buscando opciones equilibradas para la dieta de tu familia.</p>
        </div>
        <div id="swap-error-box" class="error-text hidden" style="margin-bottom: 12px;"></div>
        <div id="swap-results-box" class="hidden"></div>
    `;

    openModal(html);

    (async () => {
        const statusBox = document.getElementById('swap-status-box');
        const errorBox = document.getElementById('swap-error-box');
        const resultsBox = document.getElementById('swap-results-box');

        try {
            const curDiet = dietaParaIA(await obtenerDietaFamilia());
            const dietText = document.getElementById('swap-diet-text');
            if (dietText) dietText.innerText = `Buscando opciones equilibradas para dieta ${curDiet}.`;
            const { data, error } = await supabase.functions.invoke('generate-menu', {
                body: {
                    action: 'swap_dish',
                    dia: dish.dia,
                    tipo: dish.tipo,
                    dieta: curDiet,
                    plato_actual: dish.nombre
                }
            });

            if (error) {
                let message = error.message || 'No se pudo contactar con Gemini.';
                if (error.context instanceof Response) {
                    try {
                        const details = await error.context.clone().json();
                        if (typeof details.error === 'string') message = details.error;
                    } catch {}
                }
                throw new Error(message);
            }
            if (!Array.isArray(data?.alternatives) || !data.alternatives.length) {
                throw new Error('Gemini no devolvió alternativas válidas.');
            }

            statusBox?.classList.add('hidden');
            resultsBox?.classList.remove('hidden');

            resultsBox.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${data.alternatives.map((alt, idx) => `
                        <div class="swap-alt-card">
                            <div class="swap-alt-header">
                                <strong>${escapeHtml(alt.nombre)}</strong>
                                <span class="chip" style="font-size: 11px;">⏱️ ${escapeHtml(alt.tiempo || '25 min')}</span>
                            </div>
                            <div class="swap-alt-ings">
                                🧂 ${escapeHtml(Array.isArray(alt.ingredientes) ? alt.ingredientes.join(', ') : '')}
                            </div>
                            <button type="button" class="btn-primary btn-select-alt" data-alt-idx="${idx}" style="width: 100%; padding: 8px 12px; font-size: 12px;">
                                ✨ Elegir este plato
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;

            resultsBox.querySelectorAll('.btn-select-alt').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const chosen = data.alternatives[Number(btn.dataset.altIdx)];
                    if (!chosen) return;
                    closeModal();
                    const ok = await guardarPlatoEnMenu({
                        dia: dish.dia,
                        tipo: dish.tipo,
                        nombre: chosen.nombre,
                        tiempo: chosen.tiempo || '25 min',
                        ingredientes: listaDeTextos(chosen.ingredientes)
                    });
                    if (ok) showToast(`✨ ¡Plato cambiado a "${chosen.nombre}"!`);
                });
            });
        } catch (err) {
            console.error('Error al cambiar plato:', err);
            statusBox?.classList.add('hidden');
            if (errorBox) {
                errorBox.innerText = `Error: ${err.message || 'No se pudieron generar alternativas.'}`;
                errorBox.classList.remove('hidden');
            }
        }
    })();
}

function getClientCuratedFridgeRecipes(items, tiempoMax = '20 min') {
    const list = items && items.length ? items : ['Huevos', 'Patatas', 'Cebolla'];
    const titleLead = list.slice(0, 2).join(' y ');
    return [
        {
            nombre: `Salteado exprés de ${titleLead}`,
            tiempo: tiempoMax.includes('15') ? '15 min' : '20 min',
            descripcion: 'Plato rápido en sartén a fuego vivo aprovechando al máximo los ingredientes frescos que tienes en casa.',
            ingredientes_usados: list.slice(0, 4),
            ingredientes_extra: ['Aceite de oliva virgen extra', 'Sal y pimienta', '1 diente de ajo'],
            pasos: [
                'Picar los ingredientes en dados homogéneos y laminar el ajo.',
                'Dorar el ajo en una sartén con dos cucharadas de aceite de oliva a fuego medio.',
                'Añadir los ingredientes de más a menos duros y saltear 8-10 minutos hasta que estén dorados y tiernos.',
                'Servir recién hecho con una pizca de pimienta recién molida.'
            ]
        },
        {
            nombre: `Revuelto cremoso con ${list[0] || 'huevos'}`,
            tiempo: '15 min',
            descripcion: 'Cena rápida, nutritiva y reconfortante con textura cremosa y sin nada de desperdicio.',
            ingredientes_usados: list.slice(0, 3),
            ingredientes_extra: ['2 huevos', 'Aceite de oliva', 'Pizca de sal'],
            pasos: [
                'Batir ligeramente los huevos en un cuenco con una pizca de sal.',
                'Saltear los ingredientes en una sartén con un hilo de aceite durante 3-5 minutos.',
                'Verter los huevos batidos, bajar el fuego y remover suavemente con espátula 1 minuto hasta cuajar cremoso.',
                'Acompañar con una rebanada de pan tostado.'
            ]
        },
        {
            nombre: `Tortilla campesina de ${titleLead}`,
            tiempo: '25 min',
            descripcion: 'Receta tradicional española muy saciante, ideal para aprovechar verduras y sobras del frigorífico.',
            ingredientes_usados: list.slice(0, 3),
            ingredientes_extra: ['3-4 huevos frescos', 'Aceite de oliva virgen extra', 'Sal'],
            pasos: [
                'Cortar los ingredientes en láminas finas.',
                'Pochar a fuego suave en sartén con aceite abundante hasta que estén tiernos.',
                'Escurrir el exceso de aceite y mezclar con los huevos batidos durante 2 minutos para que empape.',
                'Cuajar en la sartén 2 minutos por cada lado a fuego medio-alto y servir jugosa.'
            ]
        }
    ];
}

function openFridgeModal() {
    const commonStaples = [
        '🥚 Huevos', '🥔 Patatas', '🧅 Cebolla', '🍅 Tomates', '🧀 Queso',
        '🥦 Calabacín', '🍚 Arroz', '🍝 Pasta', '🐟 Atún en lata', '🍗 Pollo'
    ];
    const selectedChips = new Set(['🥚 Huevos', '🥔 Patatas']);

    const html = `
        <div class="modal-header">
            <h3>🧊 ¿Qué cocino hoy? (Aprovechar nevera)</h3>
            <button class="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            Selecciona lo que tienes en la nevera o despensa y Gemini te propondrá recetas de aprovechamiento rápido:
        </p>

        <form id="form-fridge">
            <label style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Ingredientes comunes (toca para marcar):</label>
            <div class="fridge-chips-grid" id="fridge-chips-container">
                ${commonStaples.map(s => `
                    <button type="button" class="fridge-chip ${selectedChips.has(s) ? 'selected' : ''}" data-chip="${escapeHtml(s)}">
                        ${escapeHtml(s)}
                    </button>
                `).join('')}
            </div>

            <label for="fridge-custom-ing">Otros ingredientes que tengas en casa:</label>
            <input type="text" id="fridge-custom-ing" placeholder="Ej. Medio bote de nata, zanahorias, champiñones..." maxlength="200">

            <div class="form-row-2" style="margin-top: 10px;">
                <div>
                    <label for="fridge-time-limit">Tiempo disponible:</label>
                    <select id="fridge-time-limit" class="input-select">
                        <option value="15 min">⚡ Rápido (15 min)</option>
                        <option value="25 min" selected>⏱️ Normal (25 min)</option>
                        <option value="40 min">🍲 Con calma (40 min)</option>
                    </select>
                </div>
            </div>

            <div id="fridge-status-box" class="hidden" style="text-align: center; padding: 20px 10px;">
                <p style="font-weight: 700; color: var(--primary); margin: 0 0 4px;">🍳 Diseñando recetas de aprovechamiento con Gemini...</p>
                <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Combinando tus ingredientes para evitar desperdicio.</p>
            </div>
            <div id="fridge-error-box" class="error-text hidden" style="margin-bottom: 10px;"></div>

            <div class="modal-footer" id="fridge-footer" style="margin-top: 14px;">
                <button type="submit" class="btn-primary btn-ai">✨ Buscar recetas con IA</button>
                <button type="button" class="btn-secondary" data-modal-close>Cancelar</button>
            </div>
        </form>

        <div id="fridge-results-container" class="hidden"></div>
    `;

    openModal(html);

    const chipsContainer = document.getElementById('fridge-chips-container');
    chipsContainer?.querySelectorAll('.fridge-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.chip;
            if (selectedChips.has(val)) {
                selectedChips.delete(val);
                btn.classList.remove('selected');
            } else {
                selectedChips.add(val);
                btn.classList.add('selected');
            }
        });
    });

    document.getElementById('form-fridge')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customIng = document.getElementById('fridge-custom-ing').value.trim();
        const tiempoMax = document.getElementById('fridge-time-limit').value;
        const statusBox = document.getElementById('fridge-status-box');
        const errorBox = document.getElementById('fridge-error-box');
        const footer = document.getElementById('fridge-footer');
        const resultsContainer = document.getElementById('fridge-results-container');
        const form = document.getElementById('form-fridge');

        const allIngredients = Array.from(selectedChips).map(s => s.replace(/^[^\wáéíóúÁÉÍÓÚñÑ]+/, '').trim());
        if (customIng) allIngredients.push(customIng);

        if (!allIngredients.length) {
            if (errorBox) {
                errorBox.innerText = 'Selecciona al menos un ingrediente o escribe qué tienes en la nevera.';
                errorBox.classList.remove('hidden');
            }
            return;
        }

        if (errorBox) errorBox.classList.add('hidden');
        if (statusBox) statusBox.classList.remove('hidden');
        if (footer) footer.classList.add('hidden');

        let recipes = null;
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT_FRIDGE')), 6000)
            );
            const invokePromise = supabase.functions.invoke('generate-menu', {
                body: {
                    action: 'fridge_recipes',
                    ingredientes: allIngredients.join(', '),
                    tiempo_max: tiempoMax
                }
            });

            const res = await Promise.race([invokePromise, timeoutPromise]);
            if (res?.data?.recipes?.length) {
                recipes = res.data.recipes;
            } else {
                throw new Error(res?.error?.message || 'Error en respuesta de recetas');
            }
        } catch (callErr) {
            console.warn('IA no disponible en nevera o tiempo excedido, usando recetas curadas de aprovechamiento:', callErr);
            recipes = null;
        }

        try {
            const recetasDelChef = !Array.isArray(recipes) || !recipes.length;
            if (recetasDelChef) {
                recipes = getClientCuratedFridgeRecipes(allIngredients, tiempoMax);
                showToast('No se pudo usar la IA; te proponemos recetas del chef.');
            }

            statusBox?.classList.add('hidden');
            form?.classList.add('hidden');
            resultsContainer?.classList.remove('hidden');

            const todayName = getTodayWeekDayName();

            resultsContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 15px;">🍳 ${recipes.length} Recetas sugeridas:</h4>
                    <button type="button" id="btn-fridge-retry" class="text-button" style="font-size: 12px;">← Buscar otras</button>
                </div>
                <div class="fridge-recipes-results">
                    ${recipes.map((r, i) => `
                        <div class="fridge-recipe-card">
                            <div class="fridge-recipe-header">
                                <h4>🍲 ${escapeHtml(r.nombre)}</h4>
                                <span class="chip" style="font-size: 11px;">⏱️ ${escapeHtml(r.tiempo || '20 min')}</span>
                            </div>
                            <p class="fridge-recipe-desc">${escapeHtml(r.descripcion || '')}</p>
                            <div style="font-size: 12px; margin-bottom: 6px;">
                                <strong>Aprovecha:</strong> ${escapeHtml(listaDeTextos(r.ingredientes_usados).join(', '))}
                            </div>
                            ${listaDeTextos(r.ingredientes_extra).length ? `
                                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
                                    <strong>Básicos extra:</strong> ${escapeHtml(listaDeTextos(r.ingredientes_extra).join(', '))}
                                </div>
                            ` : ''}
                            <ol class="fridge-steps-list">
                                ${Array.isArray(r.pasos) ? r.pasos.map(p => `<li>${escapeHtml(p)}</li>`).join('') : ''}
                            </ol>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <button type="button" class="btn-primary btn-assign-fridge" data-fridge-idx="${i}" data-assign-type="Comida" style="flex: 1; padding: 8px 10px; font-size: 12px;">
                                    ☀️ Poner en Comida de hoy (${escapeHtml(todayName)})
                                </button>
                                <button type="button" class="btn-secondary btn-assign-fridge" data-fridge-idx="${i}" data-assign-type="Cena" style="flex: 1; padding: 8px 10px; font-size: 12px;">
                                    🌙 Poner en Cena de hoy (${escapeHtml(todayName)})
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            document.getElementById('btn-fridge-retry')?.addEventListener('click', () => {
                resultsContainer?.classList.add('hidden');
                form?.classList.remove('hidden');
                footer?.classList.remove('hidden');
            });

            resultsContainer.querySelectorAll('.btn-assign-fridge').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const r = recipes[Number(btn.dataset.fridgeIdx)];
                    const tipo = btn.dataset.assignType;
                    if (!r) return;

                    closeModal();
                    const ok = await guardarPlatoEnMenu({
                        dia: todayName,
                        tipo,
                        nombre: r.nombre,
                        tiempo: r.tiempo || '25 min',
                        // ingredientes_extra puede llegar como texto: nunca se trocea en caracteres.
                        ingredientes: [...listaDeTextos(r.ingredientes_usados), ...listaDeTextos(r.ingredientes_extra)]
                    });
                    if (ok) showToast(`🍽️ "${r.nombre}" asignado a la ${tipo.toLowerCase()} de hoy!`);
                });
            });

        } catch (err) {
            console.error('Error al generar recetas de aprovechamiento:', err);
            if (statusBox) statusBox.classList.add('hidden');
            if (footer) footer.classList.remove('hidden');
            if (errorBox) {
                errorBox.innerText = `Error: ${err.message || 'No se pudieron generar recetas.'}`;
                errorBox.classList.remove('hidden');
            }
        }
    });
}

let supermarketWakeLock = null;

function liberarWakeLockSupermercado() {
    if (!supermarketWakeLock) return;
    const lock = supermarketWakeLock;
    supermarketWakeLock = null;
    try { Promise.resolve(lock.release()).catch(() => {}); } catch {}
}

function onSupermercadoKeydown(e) {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    cerrarModoSupermercado({ volverACompra: true });
}

// Cierra el modo supermercado (si está abierto) y libera el Wake Lock
function cerrarModoSupermercado({ volverACompra = false } = {}) {
    liberarWakeLockSupermercado();
    document.removeEventListener('keydown', onSupermercadoKeydown);
    const overlay = document.getElementById('supermarket-modal');
    if (!overlay) return;
    overlay.remove();
    if (modalContainer?.classList.contains('hidden')) appView?.removeAttribute('inert');
    if (volverACompra) {
        renderCompraView();
        document.getElementById('btn-open-supermarket')?.focus();
    }
}

async function openSupermarketMode() {
    if (document.getElementById('supermarket-modal')) return;
    if ('wakeLock' in navigator) {
        try {
            supermarketWakeLock = await navigator.wakeLock.request('screen');
        } catch (e) {
            console.warn('Wake Lock no disponible:', e);
        }
    }

    const overlay = document.createElement('div');
    overlay.className = 'supermarket-overlay';
    overlay.id = 'supermarket-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'supermarket-title');

    function renderSupermarketContent() {
        const state = getAppState();
        const pendingItems = state.shopping.filter(i => !i.comprado);
        const completedItems = state.shopping.filter(i => i.comprado);
        const total = state.shopping.length;
        const percent = total > 0 ? Math.round((completedItems.length / total) * 100) : 100;

        const aislesMap = new Map();
        AISLE_ORDER.forEach(a => aislesMap.set(a, []));
        pendingItems.forEach(item => {
            const sec = item.seccion || getAisleCategory(item.nombre);
            if (!aislesMap.has(sec)) aislesMap.set(sec, []);
            aislesMap.get(sec).push(item);
        });

        let aislesHtml = '';
        aislesMap.forEach((items, aisle) => {
            if (!items.length) return;
            aislesHtml += `
                <div class="supermarket-aisle-block">
                    <div class="supermarket-aisle-title">
                        <span>${AISLE_ICONS[aisle] || '📦'} ${escapeHtml(aisle)}</span>
                        <span>${items.length} pendientes</span>
                    </div>
                    ${items.map(it => `
                        <button type="button" class="supermarket-item-card" data-sm-toggle="${escapeHtml(it.id)}" aria-pressed="false">
                            <span class="supermarket-checkbox" aria-hidden="true">✓</span>
                            <span class="supermarket-item-name">${escapeHtml(it.nombre)}</span>
                            ${it.cantidad ? `<span style="font-size: 13px; color: var(--text-muted);">${escapeHtml(it.cantidad)}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            `;
        });

        // Al repintar se conserva el foco en la tarjeta (o botón) que lo tenía
        const focoPrevio = overlay.contains(document.activeElement)
            ? (document.activeElement.dataset.smToggle || document.activeElement.id || null) : null;

        overlay.innerHTML = `
            <div class="supermarket-header">
                <div class="supermarket-header-top">
                    <div class="supermarket-title-box">
                        <h3 id="supermarket-title">🛒 Supermercado</h3>
                        ${supermarketWakeLock ? `<span class="supermarket-wakelock-pill">🟢 Pantalla encendida</span>` : ''}
                    </div>
                    <button type="button" class="btn-exit-supermarket" id="btn-close-sm">✕ Salir</button>
                </div>
                <div class="supermarket-progress-box">
                    <div class="supermarket-progress-label">
                        <span>Progreso del carrito</span>
                        <span>${completedItems.length} de ${total} (${percent}%)</span>
                    </div>
                    <div class="progress-bar-track">
                        <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
            </div>
            <div class="supermarket-body">
                ${aislesHtml || '<div class="supermarket-empty-state"><p style="font-size: 28px;">🎉</p><h4>¡Carrito completo!</h4><p style="color: var(--text-muted); font-size: 14px;">No quedan productos pendientes por comprar.</p></div>'}

                ${completedItems.length ? `
                    <div class="supermarket-completed-section">
                        <div class="supermarket-aisle-title">
                            <span>✅ Ya en el carrito (${completedItems.length})</span>
                        </div>
                        ${completedItems.map(it => `
                            <button type="button" class="supermarket-item-card done" data-sm-toggle="${escapeHtml(it.id)}" aria-pressed="true">
                                <span class="supermarket-checkbox" aria-hidden="true">✓</span>
                                <span class="supermarket-item-name">${escapeHtml(it.nombre)}</span>
                                ${it.cantidad ? `<span style="font-size: 13px; color: var(--text-muted);">${escapeHtml(it.cantidad)}</span>` : ''}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        overlay.querySelector('#btn-close-sm')?.addEventListener('click', () => {
            cerrarModoSupermercado({ volverACompra: true });
        });

        if (focoPrevio) {
            const destino = [...overlay.querySelectorAll('[data-sm-toggle], #btn-close-sm')]
                .find(el => el.dataset.smToggle === focoPrevio || el.id === focoPrevio);
            destino?.focus({ preventScroll: false });
        }

        overlay.querySelectorAll('[data-sm-toggle]').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.smToggle;
                const item = getAppState().shopping.find(i => i.id === id);
                if (!item) return;
                // marcarProductoComprado repinta el supermercado (overlay.refrescar) y revierte si falla.
                marcarProductoComprado(id, !item.comprado);
            });
        });
    }

    overlay.refrescar = renderSupermarketContent;
    renderSupermarketContent();
    document.body.appendChild(overlay);
    appView?.setAttribute('inert', '');
    document.addEventListener('keydown', onSupermercadoKeydown);
    overlay.querySelector('#btn-close-sm')?.focus();
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
            <button type="button" class="btn-secondary" data-modal-close>Cancelar</button>
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

    document.getElementById('btn-confirm-pantry-to-shop')?.addEventListener('click', async () => {
        const toAdd = [];
        chks.forEach(c => {
            if (c.checked) {
                toAdd.push({
                    nombre: c.dataset.name,
                    seccion: c.dataset.seccion,
                    comprado: false
                });
            }
        });

        closeModal();
        if (!toAdd.length) {
            showToast('¡Todo listo! Tienes todos los ingredientes en casa.');
            return;
        }
        const added = await anadirProductosACompra(toAdd);
        if (added > 0) {
            const repetidos = toAdd.length - added;
            showToast(`¡Añadido${added === 1 ? '' : 's'} ${added} artículo${added === 1 ? '' : 's'} a la lista de compra!${repetidos > 0 ? ` (${repetidos} ya estaba${repetidos === 1 ? '' : 'n'} en la lista)` : ''}`);
        } else if (added === 0) {
            showToast('Todo lo marcado ya estaba en la lista de compra.');
        }
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
    const curDiet = dietaFamiliaCache.familiaId === currentProfile?.familia_id ? dietaParaIA(dietaFamiliaCache.dieta) : 'Mediterránea';
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
                <option value="Saludable y ligera" ${curDiet === 'Saludable y ligera' ? 'selected' : ''}>Baja en grasas, saludable y ligera</option>
                <option value="Familiar con niños" ${curDiet === 'Familiar con niños' ? 'selected' : ''}>Platos caseros que encantan a niños</option>
            </select>

            <label for="ai-preferencias">Preferencias o ingredientes deseados (opcional)</label>
            <input type="text" id="ai-preferencias" placeholder="Ej. Platos rápidos, pescado azul, legumbres..." maxlength="120">

            <div id="ai-status-box" class="hidden" style="text-align: center; padding: 20px 10px;">
                <div style="font-size: 32px;">🧠✨</div>
                <p style="font-weight: 700; margin-top: 10px; color: var(--primary);">Diseñando menú con Gemini...</p>
                <p style="font-size: 12px; color: var(--text-muted);">Calculando variedad de platos y combinaciones de ingredientes.</p>
            </div>
            <p id="ai-error" class="error-text hidden" role="alert"></p>

            <div class="modal-footer" id="ai-modal-footer">
                <button type="submit" class="btn-primary btn-ai">✨ Generar menú inteligente</button>
                <button type="button" class="btn-secondary" data-modal-close>Cancelar</button>
            </div>
        </form>
    `;

    openModal(html);

    // Si la dieta de la familia aún no estaba en caché, la cargamos y la preseleccionamos.
    obtenerDietaFamilia().then((dietaFamilia) => {
        const select = document.getElementById('ai-dieta');
        if (select && !select.dataset.tocado) select.value = dietaParaIA(dietaFamilia);
    });
    document.getElementById('ai-dieta')?.addEventListener('change', (e) => { e.target.dataset.tocado = '1'; });

    document.getElementById('form-ai-menu')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusBox = document.getElementById('ai-status-box');
        const footer = document.getElementById('ai-modal-footer');
        const errorBox = document.getElementById('ai-error');
        const dieta = document.getElementById('ai-dieta').value;
        const preferencias = document.getElementById('ai-preferencias').value.trim();

        if (errorBox) errorBox.classList.add('hidden');
        if (statusBox) statusBox.classList.remove('hidden');
        if (footer) footer.classList.add('hidden');

        let platos;
        let deIA = true;
        try {
            const { data, error } = await supabase.functions.invoke('generate-menu', {
                body: { dieta, preferencias }
            });
            if (error) {
                let message = error.message || 'No se pudo conectar con el generador de menús.';
                if (error.context instanceof Response) {
                    try {
                        const details = await error.context.clone().json();
                        if (typeof details.error === 'string') message = details.error;
                    } catch {
                        // Conserva el mensaje de Functions si el servidor no devolvió JSON.
                    }
                }
                throw new Error(message);
            }
            if (!Array.isArray(data?.menu) || data.menu.length !== 12) {
                throw new Error('Gemini no devolvió los 12 platos esperados. Inténtalo de nuevo.');
            }
            platos = data.menu;
        } catch (err) {
            console.warn('IA no disponible en este momento, usando menú seleccionado del chef:', err);
            // Fallback de alta resiliencia: si Gemini está sobrecargado (503/429) o hay error de red
            platos = getClientCuratedMenu(dieta);
            deIA = false;
        }

        const ok = await guardarMenuCompleto(platos.map(m => ({ ...m, ingredientes: listaDeTextos(m.ingredientes) })));
        if (!ok) {
            if (statusBox) statusBox.classList.add('hidden');
            if (footer) footer.classList.remove('hidden');
            if (errorBox) {
                errorBox.innerText = 'No se pudo guardar el menú en la tribu. Revisa tu conexión e inténtalo de nuevo.';
                errorBox.classList.remove('hidden');
            }
            return;
        }

        showToast(deIA ? '¡Menú semanal creado con éxito!' : 'No se pudo usar la IA; te proponemos un menú del chef.');
        closeModal();
        if (currentView !== 'menus') renderizarVista('menus');

        if (deIA) {
            showServiceWorkerNotification('🍽️ ¡Nuevo menú semanal listo!', {
                body: `Se ha planificado el menú de la tribu (${dieta}) con 12 platos equilibrados.`,
                data: { view: 'menus', url: './' }
            });
        }

        setTimeout(() => {
            openPantryReviewModal();
        }, 600);
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
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
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
                                    <button class="text-button btn-delete-sm" data-view-recipe="${escapeHtml(item.id)}" title="Ver receta y cómo se cocina con IA">👨‍🍳</button>
                                    <button class="text-button btn-delete-sm" data-swap-menu="${escapeHtml(item.id)}" title="Cambiar este plato con IA">🔄</button>
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
                                    <button class="text-button btn-delete-sm" data-view-recipe="${escapeHtml(item.id)}" title="Ver receta y cómo se cocina con IA">👨‍🍳</button>
                                    <button class="text-button btn-delete-sm" data-swap-menu="${escapeHtml(item.id)}" title="Cambiar este plato con IA">🔄</button>
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
            <button type="button" id="btn-open-ai-menu" class="btn-primary btn-ai" style="flex: 1; min-width: 130px; padding: 10px 14px; font-size: 13px;">
                ✨ Menú con IA
            </button>
            <button type="button" id="btn-open-fridge" class="btn-secondary" style="flex: 1; min-width: 130px; padding: 10px 14px; font-size: 13px;">
                🧊 ¿Qué cocino hoy?
            </button>
            <button type="button" id="btn-open-pantry-review" class="btn-secondary" style="padding: 10px 14px; font-size: 13px;">
                🛒 Despensa
            </button>
            <button type="button" id="btn-print-menu" class="btn-secondary" style="padding: 10px 14px; font-size: 13px;" title="Imprimir menú para la nevera">
                🖨️ Imprimir
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

        ${state.menu.length ? '' : `
            <div class="panel" style="text-align: center; margin-bottom: 14px;">
                <p style="font-size: 28px; margin: 0;">🍽️</p>
                <h4 style="margin: 6px 0 4px;">Todavía no hay menú esta semana</h4>
                <p class="local-note" style="margin-bottom: 12px;">Genera un menú semanal completo en un momento o añade los platos a mano.</p>
                <button type="button" id="btn-empty-generate-menu" class="btn-primary btn-ai">✨ Generar menú semanal</button>
            </div>
        `}

        <div class="weekly-days-list">
            ${daysHtml}
        </div>
    `;
    document.getElementById('btn-empty-generate-menu')?.addEventListener('click', openAIGeneratorModal);
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
    document.getElementById('btn-open-fridge')?.addEventListener('click', openFridgeModal);
    document.getElementById('btn-open-pantry-review')?.addEventListener('click', openPantryReviewModal);
    document.getElementById('btn-print-menu')?.addEventListener('click', () => window.print());
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

    document.getElementById('menu-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const nombre = document.getElementById('menu-nombre').value.trim().slice(0, 120);
        const dia = document.getElementById('menu-dia').value;
        const tipo = document.getElementById('menu-tipo').value || 'Comida';
        const tiempo = document.getElementById('menu-tiempo').value.trim() || '25 min';
        const rawIng = document.getElementById('menu-ingredientes').value.trim();
        const ingredientes = rawIng ? rawIng.split(',').map(s => s.trim()).filter(Boolean) : [];

        if (!nombre) {
            document.getElementById('menu-nombre').focus();
            return;
        }

        document.getElementById('menu-form').reset();
        if (await guardarPlatoEnMenu({ nombre, dia, tipo, tiempo, ingredientes })) {
            showToast('Plato guardado');
        }
    });

    mainContent.querySelectorAll('[data-view-recipe]').forEach((button) => {
        button.addEventListener('click', () => {
            const dish = state.menu.find(m => m.id === button.dataset.viewRecipe);
            if (dish) openRecipeModal(dish);
        });
    });

    mainContent.querySelectorAll('[data-swap-menu]').forEach((button) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const dish = state.menu.find(m => m.id === button.dataset.swapMenu);
            if (dish) openSwapDishModal(dish);
        });
    });

    mainContent.querySelectorAll('[data-delete-menu]').forEach((button) => {
        button.addEventListener('click', () => {
            eliminarPlatoDelMenu(button.dataset.deleteMenu);
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
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
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
        aislesHtml = totalItems
            ? '<p class="empty-state">La lista está vacía. ¡Todo comprado o despensa llena!</p>'
            : '<p class="empty-state">Todavía no hay nada en la lista. Añade productos con «+ Producto» o tráelos del menú.</p>';
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

        <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
            <button type="button" id="btn-open-supermarket" class="btn-primary" style="flex: 1; min-width: 130px; padding: 10px 14px; font-size: 13px;">
                🛒 Modo Supermercado
            </button>
            <button type="button" id="btn-share-shop-wa" class="btn-primary btn-whatsapp" style="flex: 1; min-width: 110px; padding: 10px 14px; font-size: 13px;">
                💬 WhatsApp
            </button>
            <button type="button" id="btn-compra-review-pantry" class="btn-secondary" style="flex: 1; min-width: 110px; padding: 10px 14px; font-size: 13px;">
                📋 Traer del Menú
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

    document.getElementById('btn-open-supermarket')?.addEventListener('click', openSupermarketMode);
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
        anadirProductosACompra([{ nombre, cantidad, seccion }]);
    });

    document.getElementById('nueva-compra').addEventListener('input', (event) => event.target.setCustomValidity(''));

    mainContent.querySelectorAll('[data-toggle-shopping]').forEach((input) => {
        input.addEventListener('change', () => {
            marcarProductoComprado(input.dataset.toggleShopping, input.checked);
        });
    });

    mainContent.querySelectorAll('[data-delete-shopping]').forEach((button) => {
        button.addEventListener('click', () => {
            eliminarProductosDeCompra([button.dataset.deleteShopping]);
        });
    });

    document.getElementById('btn-limpiar-comprados')?.addEventListener('click', () => {
        const removedIds = getAppState().shopping.filter((item) => item.comprado).map((item) => item.id);
        eliminarProductosDeCompra(removedIds);
    });
}

// --- BACKUP & EXPORT ---

function addBackupControls(container) {
    container.insertAdjacentHTML('beforeend', `
        <section class="panel backup-panel" aria-labelledby="backup-title">
            <h4 id="backup-title">Copia de seguridad</h4>
            <p>El menú y la compra se guardan en tu tribu y se comparten con todos sus miembros. Descarga una copia para conservarlos o restaurarlos más adelante.</p>
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
            if (!window.confirm('Restaurar una copia sustituirá el menú y la lista de compra actuales de toda la tribu. ¿Quieres continuar?')) {
                status.innerText = 'Restauración cancelada.';
                return;
            }
            status.innerText = 'Restaurando la copia en la tribu...';
            // Ids nuevos: la copia puede venir de otro dispositivo, de otra tribu o de la demo.
            restoredState.shopping = restoredState.shopping.map(item => ({ ...item, id: crypto.randomUUID() }));
            // En la tribu sólo cabe un plato por día y tipo: si la copia trae varios, gana el último.
            restoredState.menu = Array.from(new Map(restoredState.menu.map(m => [`${m.dia}|${m.tipo}`, m])).values());
            const previousState = getAppState();
            if (!saveAppState(restoredState)) {
                status.innerText = 'No se pudo guardar la copia en este dispositivo.';
                status.classList.add('error-text');
                return;
            }
            const uploadError = await restaurarCopiaEnSupabase(restoredState);
            if (uploadError) {
                // Sin guardar en la tribu, la copia no se aplica: volvemos al estado anterior.
                saveAppState(previousState);
                await syncFamilyDataFromSupabase();
                refrescarVistasDeDatos({ forzar: true });
                mostrarErrorGuardado('No se pudo restaurar la copia en la tribu.', uploadError);
                const failedStatus = document.getElementById('backup-status');
                if (failedStatus) {
                    failedStatus.innerText = 'No se pudo completar la restauración en la tribu. Se muestran los datos que hay ahora en la tribu; inténtalo de nuevo.';
                    failedStatus.classList.add('error-text');
                }
                return;
            }
            refrescarVistasDeDatos({ forzar: true });
            const refreshedStatus = document.getElementById('backup-status');
            if (refreshedStatus) refreshedStatus.innerText = 'Copia restaurada correctamente en la tribu.';
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
        showPasswordUpdateForm(session?.user || null);
        return;
    }

    if (event === 'SIGNED_OUT') {
        cerrarSesionLocal();
    }
});

// --- Modo sin conexión ---
// El service worker se registra en register-sw.js. Aquí guardamos el último perfil y
// los datos de la familia para poder arrancar y navegar sin red.
const OFFLINE_KEYS = {
    perfil: 'tribuapp-offline-perfil',
    familia: 'tribuapp-offline-familia',
};
const SUPABASE_AUTH_KEY = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
const OFFLINE_BANNER_TEXT = 'Sin conexión: mostrando los últimos datos guardados';
let modoSinConexion = false;

function esErrorDeRed(error) {
    if (!navigator.onLine) return true;
    const texto = `${error?.name || ''} ${error?.message || error || ''}`;
    return /Failed to fetch|NetworkError|Load failed|fetch failed|Network request failed|AuthRetryableFetchError/i.test(texto);
}

function leerJsonLocal(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

function guardarJsonLocal(key, value) {
    try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('No se pudieron guardar los datos sin conexión:', error);
    }
}

function guardarPerfilSinConexion(profile) {
    if (!currentUser?.id) return;
    if (!profile?.familia_id) {
        guardarJsonLocal(OFFLINE_KEYS.perfil, null);
        guardarJsonLocal(OFFLINE_KEYS.familia, null);
        return;
    }
    guardarJsonLocal(OFFLINE_KEYS.perfil, {
        userId: currentUser.id,
        email: currentUser.email || '',
        perfil: profile,
        guardadoEn: Date.now(),
    });
}

function guardarFamiliaSinConexion({ family, members, tasks }) {
    if (!currentUser?.id || !currentProfile?.familia_id) return;
    guardarJsonLocal(OFFLINE_KEYS.familia, {
        userId: currentUser.id,
        familiaId: currentProfile.familia_id,
        family,
        members,
        tasks,
        guardadoEn: Date.now(),
    });
}

function leerFamiliaSinConexion() {
    const guardado = leerJsonLocal(OFFLINE_KEYS.familia);
    if (!guardado?.family || guardado.userId !== currentUser?.id || guardado.familiaId !== currentProfile?.familia_id) {
        return null;
    }
    return {
        family: guardado.family,
        members: Array.isArray(guardado.members) ? guardado.members : [],
        tasks: Array.isArray(guardado.tasks) ? guardado.tasks : [],
    };
}

// Usuario de la sesión que supabase-js guarda en localStorage (sin tocar la red)
function leerUsuarioSesionGuardada() {
    const sesion = leerJsonLocal(SUPABASE_AUTH_KEY);
    return sesion?.user || sesion?.currentSession?.user || null;
}

function mostrarBannerSinConexion(texto = OFFLINE_BANNER_TEXT) {
    let banner = document.getElementById('offline-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'offline-banner';
        banner.className = 'alert-banner';
        banner.setAttribute('role', 'status');
        mainContent.parentNode.insertBefore(banner, mainContent);
    }
    banner.innerText = `📡 ${texto}`;
}

function ocultarBannerSinConexion() {
    document.getElementById('offline-banner')?.remove();
}

function entrarModoSinConexion() {
    modoSinConexion = true;
    mostrarBannerSinConexion();
}

function salirModoSinConexion() {
    modoSinConexion = false;
    ocultarBannerSinConexion();
    document.getElementById('offline-view')?.classList.add('hidden');
}

function mostrarPantallaSinConexion() {
    authView.classList.add('hidden');
    onboardingView.classList.add('hidden');
    appView.classList.add('hidden');
    let pantalla = document.getElementById('offline-view');
    if (!pantalla) {
        pantalla = document.createElement('div');
        pantalla.id = 'offline-view';
        pantalla.className = 'view-container';
        pantalla.innerHTML = `
            <div class="auth-card">
                <h1>⛺ Tribuapp</h1>
                <h2>📡 Sin conexión</h2>
                <p role="status">No hay conexión a internet y este dispositivo todavía no tiene datos de tu tribu guardados. Conéctate y pulsa Reintentar.</p>
                <button type="button" id="btn-offline-retry" class="btn-primary">Reintentar</button>
            </div>`;
        // Mismo centrado que #auth-view (vía CSSOM para no depender de estilos inline)
        Object.assign(pantalla.style, { justifyContent: 'center', alignItems: 'center', padding: '20px' });
        pantalla.querySelector('#btn-offline-retry').style.marginTop = '16px';
        document.body.insertBefore(pantalla, appView);
        pantalla.querySelector('#btn-offline-retry').addEventListener('click', reintentarConexion);
    }
    pantalla.classList.remove('hidden');
}

// Muestra la app con el último perfil guardado. Devuelve false si no hay sesión guardada
// (entonces se sigue el flujo normal hacia el login).
function arrancarSinConexion(usuario = null) {
    const user = usuario || leerUsuarioSesionGuardada();
    if (!user?.id) return false;

    const guardado = leerJsonLocal(OFFLINE_KEYS.perfil);
    if (!guardado?.perfil?.familia_id || guardado.userId !== user.id) {
        mostrarPantallaSinConexion();
        return true;
    }

    if (currentUser?.id !== user.id) setCurrentUser(user);
    currentProfile = guardado.perfil;
    document.getElementById('offline-view')?.classList.add('hidden');
    authView.classList.add('hidden');
    onboardingView.classList.add('hidden');
    appView.classList.remove('hidden');
    entrarModoSinConexion();

    const familia = leerFamiliaSinConexion();
    if (headerTribeBadge && familia?.family?.nombre) {
        headerTribeBadge.innerText = `⛺ ${familia.family.nombre}`;
        headerTribeBadge.classList.remove('hidden');
    }
    renderizarVista(currentView || 'dashboard');
    return true;
}

async function reintentarConexion() {
    const boton = document.getElementById('btn-offline-retry');
    if (boton) {
        boton.disabled = true;
        boton.innerText = 'Conectando...';
    }
    try {
        await checkSession();
    } finally {
        if (boton) {
            boton.disabled = false;
            boton.innerText = 'Reintentar';
        }
        if ([authView, onboardingView, appView].some((view) => !view.classList.contains('hidden'))) {
            document.getElementById('offline-view')?.classList.add('hidden');
        }
    }
}

// Al volver la red: recargamos sesión, perfil y datos, y volvemos a la vista en la que estaba
async function resincronizarTrasConexion() {
    const vista = currentView || 'dashboard';
    salirModoSinConexion();
    await checkSession();
    if (vista !== 'dashboard' && currentProfile && !appView.classList.contains('hidden')) {
        renderizarVista(vista);
    }
}

window.addEventListener('online', () => {
    const pantalla = document.getElementById('offline-view');
    if (pantalla && !pantalla.classList.contains('hidden')) {
        reintentarConexion();
    } else if (modoSinConexion || document.getElementById('offline-banner')) {
        resincronizarTrasConexion();
    }
});

window.addEventListener('offline', () => {
    if (appView.classList.contains('hidden') || !currentProfile) return;
    if (leerFamiliaSinConexion()) entrarModoSinConexion();
    else mostrarBannerSinConexion('Sin conexión: los cambios no se guardarán hasta que vuelva la red');
});


initTheme();
initNotifications();
initFab();
checkSession();
