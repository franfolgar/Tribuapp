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
            mainContent.innerHTML = `
                <h3>¡Hola de nuevo!</h3>
                <p>Todo listo para organizar tu hogar.</p>
            `;
            break;
        case 'tareas':
            mainContent.innerHTML = `<h3>Tareas de la Tribu</h3><p>Cargando panel de tareas...</p>`;
            break;
        case 'menus':
            mainContent.innerHTML = `<h3>Menú Evolutivo</h3><p>Conectando con la Inteligencia Artificial...</p>`;
            break;
        case 'compra':
            mainContent.innerHTML = `<h3>Despensa</h3><p>Generando lista de la compra...</p>`;
            break;
    }
}
