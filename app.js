// Importamos Supabase directamente desde el CDN para módulos ES
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ==========================================
// 1. CONFIGURACIÓN SUPABASE
// ==========================================
const SUPABASE_URL = 'https://skdlkrcdwhxfuwukvoce.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UIZX50yoepGiITkC2hREFQ_elTXm7hV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. REFERENCIAS AL DOM
// ==========================================
// Vistas
const authView = document.getElementById('auth-view');
const onboardingView = document.getElementById('onboarding-view');
const appView = document.getElementById('app-view');
const mainContent = document.getElementById('main-content');
const viewTitle = document.getElementById('view-title');

// Formularios e inputs
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnSubmit = document.getElementById('btn-login');

const onboardingForm = document.getElementById('onboarding-form');
const btnOnboarding = document.getElementById('btn-onboarding');

// Navegación y acciones
const btnLogout = document.getElementById('btn-logout');
const navItems = document.querySelectorAll('.nav-item');

// Estado global de la app
let currentUser = null;

// ==========================================
// 3. INICIALIZACIÓN Y SESIÓN
// ==========================================
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        mostrarApp();
    }
}
checkSession();

// ==========================================
// 4. LÓGICA DE AUTENTICACIÓN (LOGIN / REGISTRO)
// ==========================================
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    btnSubmit.innerText = 'Cargando...';

    const email = emailInput.value;
    const password = passwordInput.value;

    // 1. Intentamos iniciar sesión
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        // Si falla, intentamos registrarlo automáticamente
        if (error.message.includes('Invalid login credentials')) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
            
            if (signUpError) {
                authError.innerText = 'Error al registrar: ' + signUpError.message;
                authError.classList.remove('hidden');
            } else {
                currentUser = signUpData.user;
                alert('¡Bienvenido a Tribuapp! Cuenta creada con éxito.');
                mostrarApp();
            }
        } else {
            authError.innerText = error.message;
            authError.classList.remove('hidden');
        }
    } else {
        currentUser = data.user;
        mostrarApp();
    }
    
    btnSubmit.innerText = 'Entrar / Registrarse';
});

btnLogout.addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    appView.classList.add('hidden');
    onboardingView.classList.add('hidden');
    authView.classList.remove('hidden');
    authForm.reset();
});

// ==========================================
// 5. FLUJO DE ONBOARDING (CREAR FAMILIA)
// ==========================================
async function mostrarApp() {
    authView.classList.add('hidden');
    
    // Comprobar si el usuario ya tiene su perfil creado en la tabla 'usuarios'
    const { data: usuarioPerfil, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', currentUser.id)
        .single();

    if (!usuarioPerfil) {
        // Es un usuario nuevo sin tribu asignada
        onboardingView.classList.remove('hidden');
    } else {
        // Ya tiene tribu, entra directo a la app
        onboardingView.classList.add('hidden');
        appView.classList.remove('hidden');
        renderizarVista('dashboard');
    }
}

onboardingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnOnboarding.innerText = 'Creando...';

    const nombreFamilia = document.getElementById('tribu-nombre').value;
    const dieta = document.getElementById('tribu-dieta').value;
    const flexibilidad = document.getElementById('tribu-flexibilidad').value;

    // 1. Crear la Familia
    const { data: familiaData, error: familiaError } = await supabase
        .from('familias')
        .insert([{ 
            nombre: nombreFamilia, 
            dieta_base: dieta, 
            nivel_flexibilidad: flexibilidad 
        }])
        .select()
        .single();

    if (familiaError) {
        alert('Error al crear la familia: ' + familiaError.message);
        btnOnboarding.innerText = 'Crear Tribu';
        return;
    }

    // 2. Crear el Usuario como Admin de esa Familia
    const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert([{ 
            id: currentUser.id, 
            familia_id: familiaData.id, 
            nombre: currentUser.email.split('@')[0], 
            rol: 'Admin'
        }]);

    if (!usuarioError) {
        onboardingView.classList.add('hidden');
        appView.classList.remove('hidden');
        renderizarVista('dashboard');
    } else {
        alert('Error al enlazar el usuario: ' + usuarioError.message);
        btnOnboarding.innerText = 'Crear Tribu';
    }
});

// ==========================================
// 6. NAVEGACIÓN Y RENDERIZADO DE VISTAS
// ==========================================
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const targetView = item.getAttribute('data-target');
        viewTitle.innerText = targetView.charAt(0).toUpperCase() + targetView.slice(1);
        renderizarVista(targetView);
    });
});

function renderizarVista(vista) {
    switch(vista) {
        case 'dashboard':
            mainContent.innerHTML = `<h3>¡Hola de nuevo!</h3><p>Todo listo para organizar tu hogar.</p>`;
            break;
        case 'tareas':
            cargarVistaTareas(); // Aquí llamamos a la base de datos real
            break;
        case 'menus':
            mainContent.innerHTML = `<h3>Menú Evolutivo</h3><p>Conectando con la Inteligencia Artificial...</p>`;
            break;
        case 'compra':
            mainContent.innerHTML = `<h3>Despensa</h3><p>Generando lista de la compra...</p>`;
            break;
    }
}
        case 'compra':
            mainContent.innerHTML = `<h3>Despensa</h3><p>Generando lista de la compra...</p>`;
            break;
    }
}
// ==========================================
// 7. LÓGICA DE TAREAS
// ==========================================
async function cargarVistaTareas() {
    // Pintamos la interfaz base
    mainContent.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h3>Tareas de la Tribu</h3>
            <button id="btn-nueva-tarea" class="btn-primary" style="width:auto; padding:8px 16px; margin:0;">+ Asignar</button>
        </div>
        
        <div id="form-nueva-tarea" class="auth-card hidden" style="margin-bottom: 20px; max-width:100%;">
            <input type="text" id="nueva-tarea-nombre" placeholder="Ej. Fregar los platos" required>
            <select id="nueva-tarea-asignado" class="input-select">
                <option value="">Bolsa común (Cualquiera)</option>
            </select>
            <input type="date" id="nueva-tarea-fecha" class="input-select" required>
            <button id="btn-guardar-tarea" class="btn-primary">Guardar Tarea</button>
        </div>

        <div id="lista-tareas">Cargando tareas...</div>
    `;

    // 1. Obtenemos tu ID de familia
    const { data: userData } = await supabase.from('usuarios').select('familia_id').eq('id', currentUser.id).single();
    const familiaId = userData.familia_id;

    // 2. Cargamos los miembros de tu familia en el desplegable
    const { data: miembros } = await supabase.from('usuarios').select('id, nombre').eq('familia_id', familiaId);
    const selectAsignado = document.getElementById('nueva-tarea-asignado');
    miembros.forEach(m => {
        selectAsignado.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
    });

    // 3. Pintamos la lista de tareas
    cargarListaTareas(familiaId, miembros);

    // 4. Activamos los botones del formulario
    document.getElementById('btn-nueva-tarea').addEventListener('click', () => {
        document.getElementById('form-nueva-tarea').classList.toggle('hidden');
        document.getElementById('nueva-tarea-fecha').valueAsDate = new Date(); // Pone la fecha de hoy por defecto
    });

    document.getElementById('btn-guardar-tarea').addEventListener('click', async () => {
        const nombre = document.getElementById('nueva-tarea-nombre').value;
        const asignadoA = document.getElementById('nueva-tarea-asignado').value;
        const fecha = document.getElementById('nueva-tarea-fecha').value;
        
        if(!nombre || !fecha) return alert('El nombre y la fecha son obligatorios');
        document.getElementById('btn-guardar-tarea').innerText = 'Guardando...';

        // Guardamos la tarea en el catálogo y la asignamos
        const { data: catalogo } = await supabase.from('tareas_catalogo')
            .insert([{ familia_id: familiaId, nombre: nombre }]).select().single();
        
        await supabase.from('tareas_asignadas')
            .insert([{ familia_id: familiaId, tarea_id: catalogo.id, asignado_a: asignadoA || null, fecha_objetivo: fecha }]);
        
        // Refrescamos la vista
        document.getElementById('form-nueva-tarea').classList.add('hidden');
        document.getElementById('btn-guardar-tarea').innerText = 'Guardar Tarea';
        document.getElementById('nueva-tarea-nombre').value = '';
        cargarListaTareas(familiaId, miembros);
    });
}

async function cargarListaTareas(familiaId, miembros) {
    const lista = document.getElementById('lista-tareas');
    
    // Traemos las tareas pendientes
    const { data: tareas } = await supabase
        .from('tareas_asignadas')
        .select('id, fecha_objetivo, estado, asignado_a, tareas_catalogo(nombre)')
        .eq('familia_id', familiaId)
        .eq('estado', 'Pendiente')
        .order('fecha_objetivo', { ascending: true });

    if(!tareas || tareas.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:20px;">¡Todo limpio! No hay tareas pendientes.</p>';
        return;
    }

    lista.innerHTML = tareas.map(t => {
        const nombreAsignado = miembros.find(m => m.id === t.asignado_a)?.nombre || 'Cualquiera (Bolsa común)';
        const fechaFormateada = new Date(t.fecha_objetivo).toLocaleDateString('es-ES');
        
        return `
        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:10px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong style="display:block; margin-bottom:4px;">${t.tareas_catalogo.nombre}</strong>
                <small style="color:var(--text-muted);">📅 ${fechaFormateada} | 👤 ${nombreAsignado}</small>
            </div>
            <button onclick="completarTarea('${t.id}')" class="btn-primary" style="width:40px; height:40px; padding:0; border-radius:8px;">✓</button>
        </div>
        `;
    }).join('');
}

// Hacemos global la función de completar para que el HTML pueda llamarla
window.completarTarea = async function(tareaId) {
    await supabase.from('tareas_asignadas').update({ estado: 'Completada' }).eq('id', tareaId);
    document.querySelector('[data-target="tareas"]').click(); 
}
