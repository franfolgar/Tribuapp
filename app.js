// Importamos Supabase directamente desde el CDN para módulos ES
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ==========================================
// 1. CONFIGURACIÓN SUPABASE
// ==========================================
const SUPABASE_URL = 'https://TU_URL_DE_SUPABASE.supabase.co';
const SUPABASE_ANON_KEY = 'TU_CLAVE_ANONIMA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. REFERENCIAS AL DOM
// ==========================================
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnLogout = document.getElementById('btn-logout');
const navItems = document.querySelectorAll('.nav-item');
const viewTitle = document.getElementById('view-title');
const mainContent = document.getElementById('main-content');
const btnSubmit = document.getElementById('btn-login');

// Estado global de la app
let currentUser = null;

// ==========================================
// 3. LÓGICA DE AUTENTICACIÓN (LOGIN / REGISTRO)
// ==========================================

// Comprobar si ya hay una sesión iniciada al abrir Tribuap
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        mostrarApp();
    }
}
checkSession(); // Ejecutar al cargar la página

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    btnSubmit.innerText = 'Cargando...';

    const email = emailInput.value;
    const password = passwordInput.value;

    // 1. Intentamos iniciar sesión
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        // Si falla porque no existe, intentamos registrarlo automáticamente
        if (error.message.includes('Invalid login credentials')) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
            
            if (signUpError) {
                authError.innerText = 'Error al registrar: ' + signUpError.message;
                authError.classList.remove('hidden');
            } else {
                // Registro exitoso
                currentUser = signUpData.user;
                alert('¡Bienvenido a Tribuap! Cuenta creada con éxito.');
                mostrarApp();
            }
        } else {
            // Otro tipo de error (ej. contraseña corta)
            authError.innerText = error.message;
            authError.classList.remove('hidden');
        }
    } else {
        // Login exitoso
        currentUser = data.user;
        mostrarApp();
    }
    
    btnSubmit.innerText = 'Entrar / Registrarse';
});

btnLogout.addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    mostrarAuth();
});

// ==========================================
// 4. FUNCIONES DE INTERFAZ
// ==========================================
function mostrarApp() {
    authView.classList.add('hidden');
    appView.classList.remove('hidden');
    renderizarVista('dashboard'); // Cargar la vista inicial
}

function mostrarAuth() {
    appView.classList.add('hidden');
    authView.classList.remove('hidden');
    authForm.reset();
}

// ==========================================
// 5. NAVEGACIÓN Y VISTAS
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
    // Aquí es donde en el futuro haremos las consultas a la base de datos
    switch(vista) {
        case 'dashboard':
            mainContent.innerHTML = `
                <h3>¡Hola!</h3>
                <p>Tu ID de usuario es: <br><small>${currentUser.id}</small></p>
                <p>Pronto veremos aquí el estado de tu casa.</p>
            `;
            break;
        case 'tareas':
            mainContent.innerHTML = `<h3>Tareas de la Tribu</h3><p>Cargando tareas pendientes...</p>`;
            break;
        case 'menus':
            mainContent.innerHTML = `<h3>Menú Evolutivo</h3><p>Conectando con la IA...</p>`;
            break;
        case 'compra':
            mainContent.innerHTML = `<h3>Despensa y Compra</h3><p>Revisando ingredientes...</p>`;
            break;
    }
}
