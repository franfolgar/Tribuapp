// Importamos Supabase directamente desde el CDN para módulos ES
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://skdlkrcdwhxfuwukvoce.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UIZX50yoepGiITkC2hREFQ_elTXm7hV';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEYS = {
    app: 'tribuapp-state',
};

const defaultState = {
    shopping: [],
    menu: [],
};
const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Fin de semana'];
const BACKUP_VERSION = 1;
const MAX_BACKUP_FILE_SIZE = 1_000_000;
const MAX_BACKUP_ITEMS = 500;

const authView = document.getElementById('auth-view');
const onboardingView = document.getElementById('onboarding-view');
const appView = document.getElementById('app-view');
const mainContent = document.getElementById('main-content');
const viewTitle = document.getElementById('view-title');

const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnSubmit = document.getElementById('btn-login');
const btnAuthMode = document.getElementById('btn-auth-mode');
const btnResetPassword = document.getElementById('btn-reset-password');
const authMessage = document.getElementById('auth-message');
const passwordUpdateForm = document.getElementById('password-update-form');
const passwordUpdateError = document.getElementById('password-update-error');

const onboardingForm = document.getElementById('onboarding-form');
const btnOnboarding = document.getElementById('btn-onboarding');
const onboardingError = document.getElementById('onboarding-error');
const btnLogout = document.getElementById('btn-logout');
const navItems = document.querySelectorAll('.nav-item');

let currentUser = null;
let currentProfile = null;
let authMode = 'login';
let currentView = 'dashboard';
let viewRenderId = 0;

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
    return {
        shopping: Array.isArray(stored.shopping) ? stored.shopping : defaultState.shopping,
        menu: Array.isArray(stored.menu) ? stored.menu : defaultState.menu,
    };
}

function saveAppState(state) {
    if (saveToStorage(STORAGE_KEYS.app, state)) return true;
    showContentError('No se pudo guardar en este dispositivo. Comprueba el espacio disponible y los permisos del navegador.');
    return false;
}

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
    passwordInput.autocomplete = isSignup ? 'new-password' : 'current-password';
    btnAuthMode.innerText = isSignup ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
    btnResetPassword.classList.toggle('hidden', isSignup);
    authError.classList.add('hidden');
    authMessage.classList.add('hidden');
}

btnAuthMode.addEventListener('click', () => {
    updateAuthMode(authMode === 'login' ? 'signup' : 'login');
});

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
    btnSubmit.innerText = authMode === 'signup' ? 'Creando cuenta...' : 'Iniciando sesión...';

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
        showAuthError('Debes rellenar correo y contraseña.');
        btnSubmit.disabled = false;
        btnSubmit.innerText = authMode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión';
        return;
    }

    try {
        if (authMode === 'signup') {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            if (data.session && data.user) {
                setCurrentUser(data.user);
                await mostrarApp();
            } else {
                updateAuthMode('login');
                showAuthMessage('Si la cuenta es nueva, revisa tu correo para confirmar la dirección. Si ya tenías cuenta, inicia sesión.');
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (!data.user) throw new Error('Supabase no devolvió el usuario autenticado.');
            setCurrentUser(data.user);
            await mostrarApp();
        }
    } catch (error) {
        showAuthError(error.message || 'No se pudo completar la operación de autenticación.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = authMode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión';
    }
});

btnLogout.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            showAuthError(`No se pudo cerrar sesión: ${error.message}`);
            return;
        }
    } catch (error) {
        showAuthError(`No se pudo cerrar sesión: ${error.message}`);
        return;
    }

    setCurrentUser(null);
    currentProfile = null;
    authForm.reset();
    authView.classList.remove('hidden');
    onboardingView.classList.add('hidden');
    appView.classList.add('hidden');
    authError.classList.add('hidden');
});

async function mostrarApp() {
    authView.classList.add('hidden');

    if (!currentUser) {
        authView.classList.remove('hidden');
        onboardingView.classList.add('hidden');
        appView.classList.add('hidden');
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
        onboardingView.classList.remove('hidden');
        appView.classList.add('hidden');
        return;
    }

    onboardingView.classList.add('hidden');
    appView.classList.remove('hidden');
    renderizarVista('dashboard');
}

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
        if (createdFamilyId) {
            try {
                const { data: deletedFamily, error: cleanupError } = await supabase
                    .from('familias')
                    .delete()
                    .eq('id', createdFamilyId)
                    .select('id')
                    .maybeSingle();
                if (cleanupError) throw cleanupError;
                if (!deletedFamily) {
                    throw new Error('Supabase no confirmó la eliminación de la familia.');
                }
            } catch (cleanupError) {
                message += ` No se pudo eliminar la familia incompleta (${cleanupError.message}); contacta con el administrador antes de volver a intentarlo.`;
            }
        }
        onboardingError.innerText = message;
        onboardingError.classList.remove('hidden');
        btnOnboarding.disabled = false;
        btnOnboarding.innerText = 'Crear Tribu';
        return;
    }

    onboardingView.classList.add('hidden');
    appView.classList.remove('hidden');
    await renderizarVista('dashboard');
    btnOnboarding.disabled = false;
    btnOnboarding.innerText = 'Crear Tribu';
    onboardingForm.reset();
});

navItems.forEach((item) => {
    item.addEventListener('click', () => {
        navItems.forEach((nav) => nav.classList.remove('active'));
        item.classList.add('active');
        navItems.forEach((nav) => nav.setAttribute('aria-current', nav === item ? 'page' : 'false'));

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
            showContentError(`No se pudieron cargar los datos: ${error.message}`);
        }
    }
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

function showContentError(message) {
    mainContent.innerHTML = `<p class="error-text" role="alert">${escapeHtml(message)}</p>`;
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

    const failed = [familyResult, membersResult, tasksResult].find((result) => result.error);
    if (failed) throw failed.error;

    return {
        family: familyResult.data,
        members: membersResult.data || [],
        tasks: tasksResult.data || [],
    };
}

async function renderDashboard(renderId) {
    const [{ family, members, tasks }, localState] = await Promise.all([fetchFamilyData(), getAppState()]);
    if (renderId !== viewRenderId) return;
    const pendingTasks = tasks.filter((task) => task.estado !== 'Completada');
    const nextTask = pendingTasks[0];
    const nextTaskText = nextTask
        ? `${nextTask.tareas_catalogo?.nombre || 'Tarea'} · ${nextTask.fecha_objetivo ? new Date(`${nextTask.fecha_objetivo}T00:00:00`).toLocaleDateString('es-ES') : 'Sin fecha'}`
        : 'Todo está al día';

    mainContent.innerHTML = `
        <div class="dashboard-header">
            <div>
                <p class="eyebrow">Resumen de la tribu</p>
                <h3>${escapeHtml(family.nombre)}</h3>
            </div>
            <span class="chip">${escapeHtml(family.dieta_base || 'Sin dieta')}</span>
        </div>
        <div class="dashboard-grid">
            <article class="stat-card"><span>Pendientes</span><strong>${pendingTasks.length}</strong></article>
            <article class="stat-card"><span>Completadas</span><strong>${tasks.length - pendingTasks.length}</strong></article>
            <article class="stat-card"><span>Compra</span><strong>${localState.shopping.filter((item) => !item.comprado).length}</strong></article>
        </div>
        <div class="panel"><h4>Próxima prioridad</h4><p>${escapeHtml(nextTaskText)}</p></div>
        <div class="panel">
            <h4>Miembros</h4>
            <div class="member-list">${members.map((member) => `
                <div class="member-pill">
                    <span class="member-avatar">${escapeHtml((member.nombre || 'T').charAt(0).toUpperCase())}</span>
                    <span>${escapeHtml(member.nombre || 'Miembro')}</span>
                </div>`).join('')}
            </div>
        </div>`;
}

async function cargarVistaTareas(renderId) {
    const { members, tasks } = await fetchFamilyData();
    if (renderId !== viewRenderId) return;
    mainContent.innerHTML = `
        <div class="section-header">
            <h3>Tareas de la Tribu</h3>
            <button id="btn-nueva-tarea" class="btn-primary btn-inline">+ Asignar</button>
        </div>

        <form id="form-nueva-tarea" class="panel hidden">
            <label for="nueva-tarea-nombre">Tarea</label>
            <input type="text" id="nueva-tarea-nombre" placeholder="Ej. Fregar los platos" maxlength="120" required>
            <label for="nueva-tarea-asignado">Asignar a</label>
            <select id="nueva-tarea-asignado" class="input-select">
                <option value="">Bolsa común (Cualquiera)</option>
                ${members.map((member) => `<option value="${escapeHtml(member.id)}">${escapeHtml(member.nombre)}</option>`).join('')}
            </select>
            <label for="nueva-tarea-fecha">Fecha límite</label>
            <input type="date" id="nueva-tarea-fecha" class="input-select" required>
            <button id="btn-guardar-tarea" type="submit" class="btn-primary">Guardar Tarea</button>
        </form>

        <div id="lista-tareas" class="task-list"></div>
    `;

    const lista = document.getElementById('lista-tareas');
    if (!tasks.length) {
        lista.innerHTML = '<p class="empty-state">¡Todo limpio! No hay tareas pendientes.</p>';
    } else {
        lista.innerHTML = tasks.map((task) => {
            const assignedName = members.find((member) => member.id === task.asignado_a)?.nombre || 'Bolsa común';
            const date = task.fecha_objetivo
                ? new Date(`${task.fecha_objetivo}T00:00:00`).toLocaleDateString('es-ES')
                : 'Sin fecha';
            const completed = task.estado === 'Completada';
            return `
                <div class="task-card ${completed ? 'completed' : ''}">
                    <div>
                        <strong>${escapeHtml(task.tareas_catalogo?.nombre || 'Tarea')}</strong>
                        <small>📅 ${escapeHtml(date)} | 👤 ${escapeHtml(assignedName)}</small>
                    </div>
                    ${completed
                        ? '<span aria-label="Completada">✓</span>'
                        : `<button data-complete-task="${escapeHtml(task.id)}" class="btn-primary btn-icon-square" aria-label="Completar tarea">✓</button>`}
                </div>
            `;
        }).join('');
    }

    document.getElementById('btn-nueva-tarea').addEventListener('click', () => {
        const form = document.getElementById('form-nueva-tarea');
        form.classList.toggle('hidden');
        const fechaInput = document.getElementById('nueva-tarea-fecha');
        const today = getLocalDateInputValue();
        fechaInput.min = today;
        fechaInput.value = today;
    });

    lista.querySelectorAll('[data-complete-task]').forEach((button) => {
        button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                const { data, error } = await supabase.from('tareas_asignadas')
                    .update({ estado: 'Completada' })
                    .eq('id', button.dataset.completeTask)
                    .eq('familia_id', currentProfile.familia_id)
                    .select('id')
                    .maybeSingle();
                if (error) throw error;
                if (!data) throw new Error('La tarea ya no existe o no tienes permiso para modificarla.');
                await renderizarVista(currentView);
            } catch (error) {
                button.disabled = false;
                showContentError(`No se pudo completar la tarea: ${error.message}`);
            }
        });
    });

    document.getElementById('form-nueva-tarea').addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = document.getElementById('btn-guardar-tarea');
        const nombre = document.getElementById('nueva-tarea-nombre').value.trim();
        const asignadoA = document.getElementById('nueva-tarea-asignado').value || null;
        const fecha = document.getElementById('nueva-tarea-fecha').value;

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
            if (assignmentError) {
                const { error: cleanupError } = await supabase.from('tareas_catalogo')
                    .delete()
                    .eq('id', catalog.id)
                    .eq('familia_id', currentProfile.familia_id);
                if (cleanupError) {
                    throw new Error(`No se pudo asignar la tarea (${assignmentError.message}) y tampoco limpiar la entrada de catálogo (${cleanupError.message}).`);
                }
                throw assignmentError;
            }
            await renderizarVista(currentView);
        } catch (error) {
            showContentError(`No se pudo guardar la tarea: ${error.message}`);
            button.disabled = false;
            button.innerText = 'Guardar Tarea';
        }

    });
}

function getLocalDateInputValue(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderMenuView() {
    const state = getAppState();

    mainContent.innerHTML = `
        <div class="section-header">
            <div>
                <h3>Menú semanal</h3>
                <p class="local-note">Guardado en este dispositivo</p>
            </div>
            <button id="btn-agregar-menu" class="btn-primary btn-inline">+ Idea</button>
        </div>

        <form id="menu-form" class="panel hidden">
            <label for="menu-nombre">Plato</label>
            <input type="text" id="menu-nombre" placeholder="Ej. Risotto de setas" maxlength="120" required>
            <label for="menu-dia">Día</label>
            <select id="menu-dia" class="input-select">
                ${WEEK_DAYS.map((day) => `<option value="${day}">${day}</option>`).join('')}
            </select>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Guardar plato</button>
                <button type="button" id="btn-cancelar-menu" class="btn-secondary">Cancelar</button>
            </div>
        </form>

        <div class="menu-list">
            ${state.menu.length ? state.menu.map((item) => `
                <div class="menu-card">
                    <div>
                        <span class="day-badge">${escapeHtml(item.dia)}</span>
                        <strong>${escapeHtml(item.nombre)}</strong>
                    </div>
                    <button class="text-button" data-delete-menu="${escapeHtml(item.id)}" aria-label="Eliminar ${escapeHtml(item.nombre)}">Eliminar</button>
                </div>
            `).join('') : '<p class="empty-state">Todavía no hay platos. Añade ideas para planificar la semana.</p>'}
        </div>
    `;
    addBackupControls(mainContent);

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

        if (!nombre) {
            document.getElementById('menu-nombre').focus();
            return;
        }

        const state = getAppState();
        state.menu.push({ id: crypto.randomUUID(), nombre, dia });
        if (!saveAppState(state)) return;
        document.getElementById('menu-form').reset();
        renderMenuView();
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

function renderCompraView() {
    const state = getAppState();
    const pendingItems = state.shopping.filter((item) => !item.comprado);
    const completedItems = state.shopping.filter((item) => item.comprado);

    mainContent.innerHTML = `
        <div class="section-header">
            <div>
                <h3>Lista de la compra</h3>
                <p class="local-note">Guardada en este dispositivo · ${pendingItems.length} pendiente${pendingItems.length === 1 ? '' : 's'}</p>
            </div>
            <button id="btn-agregar-compra" class="btn-primary btn-inline">+ Item</button>
        </div>

        <form id="shop-form" class="panel hidden">
            <label for="nueva-compra">Producto</label>
            <input type="text" id="nueva-compra" placeholder="Ej. Yogur griego" maxlength="120" required>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Añadir a la lista</button>
                <button type="button" id="btn-cancelar-compra" class="btn-secondary">Cancelar</button>
            </div>
        </form>

        <div class="shopping-list">
            ${pendingItems.length ? pendingItems.map((item) => `
                <div class="shopping-item ${item.comprado ? 'done' : ''}">
                    <label>
                        <input type="checkbox" data-toggle-shopping="${escapeHtml(item.id)}">
                        <span>${escapeHtml(item.nombre)}</span>
                    </label>
                    <button class="text-button" data-delete-shopping="${escapeHtml(item.id)}" aria-label="Eliminar ${escapeHtml(item.nombre)}">Eliminar</button>
                </div>
            `).join('') : '<p class="empty-state">La lista está vacía. ¡Todo comprado!</p>'}
        </div>
        ${completedItems.length ? `
            <details class="completed-section">
                <summary>Comprados (${completedItems.length})</summary>
                <div class="shopping-list">${completedItems.map((item) => `
                    <div class="shopping-item done">
                        <label>
                            <input type="checkbox" data-toggle-shopping="${escapeHtml(item.id)}" checked>
                            <span>${escapeHtml(item.nombre)}</span>
                        </label>
                        <button class="text-button" data-delete-shopping="${escapeHtml(item.id)}" aria-label="Eliminar ${escapeHtml(item.nombre)}">Eliminar</button>
                    </div>`).join('')}
                </div>
                <button id="btn-limpiar-comprados" class="btn-secondary">Quitar comprados</button>
            </details>` : ''}
    `;
    addBackupControls(mainContent);

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
        state.shopping.push({ id: crypto.randomUUID(), nombre, comprado: false });
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
    if (backup.version !== BACKUP_VERSION) {
        throw new Error('La versión de la copia no es compatible.');
    }
    if (!Array.isArray(backup.shopping) || !Array.isArray(backup.menu)) {
        throw new Error('La copia debe incluir las listas del menú y la compra.');
    }
    if (backup.shopping.length > MAX_BACKUP_ITEMS || backup.menu.length > MAX_BACKUP_ITEMS) {
        throw new Error(`Cada lista admite como máximo ${MAX_BACKUP_ITEMS} elementos.`);
    }

    const shopping = backup.shopping.map((item) => {
        if (!item || typeof item.id !== 'string' || !item.id || typeof item.nombre !== 'string' ||
            !item.nombre.trim() || item.nombre.length > 120 || typeof item.comprado !== 'boolean') {
            throw new Error('La copia contiene un producto con datos no válidos.');
        }
        return { id: item.id, nombre: item.nombre.trim(), comprado: item.comprado };
    });
    const menu = backup.menu.map((item) => {
        if (!item || typeof item.id !== 'string' || !item.id || typeof item.nombre !== 'string' ||
            !item.nombre.trim() || item.nombre.length > 120 || !WEEK_DAYS.includes(item.dia)) {
            throw new Error('La copia contiene un plato con datos no válidos.');
        }
        return { id: item.id, nombre: item.nombre.trim(), dia: item.dia };
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
    }
});

checkSession();
