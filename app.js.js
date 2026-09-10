// ==========================================
// CONFIGURACIÓN SUPABASE
// ==========================================
// TODO: Reemplaza esto con los datos de tu proyecto Supabase
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_CLAVE_ANON';

// Inicializar cliente (descomentar cuando pongas las claves)
// const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// REFERENCIAS AL DOM
// ==========================================
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const authForm = document.getElementById('auth-form');
const btnLogout = document.getElementById('btn-logout');
const navItems = document.querySelectorAll('.nav-item');
const viewTitle = document.getElementById('view-title');
const mainContent = document.getElementById('main-content');

// ==========================================
// LÓGICA DE INTERFAZ Y NAVEGACIÓN
// ==========================================

// Simular login por ahora (hasta conectar Supabase)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Aquí iría: const { data, error } = await supabase.auth.signInWithPassword(...)
    
    // Simulación de éxito visual
    authView.classList.add('hidden');
    appView.classList.remove('hidden');
});

// Simular logout
btnLogout.addEventListener('click', async () => {
    // Aquí iría: await supabase.auth.signOut();
    appView.classList.add('hidden');
    authView.classList.remove('hidden');
});

// Sistema de enrutado simple por pestañas
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // 1. Quitar 'active' de todos los botones
        navItems.forEach(nav => nav.classList.remove('active'));
        // 2. Poner 'active' al pulsado
        item.classList.add('active');
        
        // 3. Cambiar título y renderizar vista
        const targetView = item.getAttribute('data-target');
        viewTitle.innerText = targetView.charAt(0).toUpperCase() + targetView.slice(1);
        
        renderizarVista(targetView);
    });
});

// Renderizado dinámico de módulos
function renderizarVista(vista) {
    switch(vista) {
        case 'dashboard':
            mainContent.innerHTML = `<h3>Resumen</h3><p>Tu hogar al día.</p>`;
            break;
        case 'tareas':
            mainContent.innerHTML = `<h3>Tareas</h3><p>Aquí irá el reparto inteligente.</p>`;
            break;
        case 'menus':
            mainContent.innerHTML = `<h3>Menú Semanal</h3><p>Conectando con Gemini...</p>`;
            break;
        case 'compra':
            mainContent.innerHTML = `<h3>Lista de la compra</h3><p>Revisa tu despensa.</p>`;
            break;
    }
}