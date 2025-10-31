// Copia este archivo a `config.emailjs.js` y rellena las credenciales reales de EmailJS.
// Este archivo define window.EMAILJS_CONFIG que será leído por contacto.js

window.EMAILJS_CONFIG = window.EMAILJS_CONFIG || {
  // Deja method sin forzar; el script usará "mailto" por defecto cuando no haya credenciales válidas
  // method: 'emailjs',
  toEmail: 'daydreamssmusic@gmail.com',
  emailjs: {
    // IMPORTANTE: No publiques estas credenciales en el repositorio.
    publicKey: '',      // p.ej. 'xYzAbC123...'
    serviceId: '',      // p.ej. 'service_abc123'
    templateId: '',     // p.ej. 'template_xyz789'
    // Si usas proxy/Worker, no necesitas exponer estas claves en cliente.
    useProxy: false,
    apiBase: '', // p.ej. 'https://<tu-worker>.workers.dev/api'
  },
};
