// Registro del service worker fuera del módulo principal: así se registra
// aunque app.js (o una de sus dependencias) no llegue a cargar.
(function () {
    if (!('serviceWorker' in navigator)) return;

    // Si la página ya estaba controlada, un cambio de controlador significa
    // que se ha activado una versión nueva: avisamos para recargar.
    const habiaControlador = !!navigator.serviceWorker.controller;

    function avisarNuevaVersion() {
        if (document.getElementById('sw-update-banner')) return;
        const banner = document.createElement('div');
        banner.id = 'sw-update-banner';
        banner.className = 'alert-banner';
        banner.setAttribute('role', 'status');
        Object.assign(banner.style, {
            position: 'fixed', left: '16px', right: '16px', bottom: '88px',
            zIndex: '1000', justifyContent: 'space-between',
        });
        const texto = document.createElement('span');
        texto.textContent = 'Nueva versión disponible.';
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'text-button';
        boton.textContent = 'Recargar';
        boton.addEventListener('click', () => window.location.reload());
        banner.append(texto, boton);
        document.body.appendChild(banner);
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (habiaControlador) avisarNuevaVersion();
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
            console.warn('Service worker registration failed:', err);
        });
    });
})();
