/*
  contacto.js
  - Maneja validación del formulario
  - Envía por mailto (por defecto) o EmailJS (si config se proporciona)
*/

(() => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitSpinner = document.getElementById('submitSpinner');
  const alertSuccess = document.getElementById('formAlertSuccess');
  const alertError = document.getElementById('formAlertError');

  // Config por defecto (se puede sobreescribir con window.EMAILJS_CONFIG desde config.emailjs.js)
  const defaultConfig = {
    method: 'mailto', // 'mailto' | 'emailjs'
    toEmail: 'daydreamssmusic@gmail.com',
    emailjs: {
      publicKey: '', // p.ej. 'YOUR_PUBLIC_KEY'
      serviceId: '', // p.ej. 'service_xxx'
      templateId: '', // p.ej. 'template_xxx'
    },
  };

  // Si el integrador define window.EMAILJS_CONFIG, fusionamos y por defecto cambiamos a 'emailjs'
  const integratorCfg = (typeof window !== 'undefined' && window.EMAILJS_CONFIG) || {};
  const config = {
    ...defaultConfig,
    ...integratorCfg,
    emailjs: { ...defaultConfig.emailjs, ...(integratorCfg.emailjs || {}) },
  };
  if (
    integratorCfg.emailjs &&
    (integratorCfg.emailjs.publicKey || integratorCfg.emailjs.serviceId || integratorCfg.emailjs.templateId)
  ) {
    config.method = integratorCfg.method || 'emailjs';
  }

  function show(el) { el.classList.remove('d-none'); }
  function hide(el) { el.classList.add('d-none'); }
  function startLoading() {
    submitBtn.disabled = true;
    show(submitSpinner);
  }
  function stopLoading() {
    submitBtn.disabled = false;
    hide(submitSpinner);
  }
  function resetAlerts() {
    hide(alertSuccess);
    hide(alertError);
  }

  // Sin adjuntos: no hay validación extra

  function buildMailto({ name, email, phone, message }) {
    const subject = `Nuevo mensaje de ${name}`;
    const bodyLines = [
      `Nombre: ${name}`,
      `Correo: ${email}`,
      phone ? `Teléfono: ${phone}` : null,
      '',
      'Mensaje:',
      message,
    ].filter(Boolean);

    const body = bodyLines.join('%0D%0A'); // CRLF encoded for mailto
    const mailtoUrl = `mailto:${encodeURIComponent(config.toEmail)}?subject=${encodeURIComponent(subject)}&body=${body}`;
    return mailtoUrl;
  }

  async function sendWithEmailJS(formEl) {
    const { publicKey, serviceId, templateId, useProxy, apiBase } = config.emailjs;

    // Aseguramos que el destino y la fecha vayan en el formulario para que la plantilla pueda usarlos
    const toEmailInput = formEl.querySelector('#to_email');
    if (toEmailInput) toEmailInput.value = config.toEmail || '';
    const sentAtInput = formEl.querySelector('#sent_at');
    if (sentAtInput) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const formatted = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      sentAtInput.value = formatted;
    }

    // Opción A: Proxy/Worker (no expone claves en cliente)
    if (useProxy && apiBase) {
      const fd = new FormData(formEl);
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/email`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Fallo proxy email (${res.status}): ${txt}`);
      }
      return true;
    }

    // Opción B: Cliente EmailJS (requiere claves en cliente)
    if (!window.emailjs) throw new Error('EmailJS no está disponible');
    if (!publicKey || !serviceId || !templateId) {
      throw new Error('Faltan credenciales de EmailJS en la configuración');
    }
    emailjs.init({ publicKey });
    return emailjs.sendForm(serviceId, templateId, formEl);
  }

  function validateForm() {
    // Bootstrap validation UI
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return false;
    }
    return true;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetAlerts();

    if (!validateForm()) return;

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const message = document.getElementById('message').value.trim();

    startLoading();

    try {
      if (config.method === 'emailjs') {
        await sendWithEmailJS(form);
        show(alertSuccess);
        form.reset();
        form.classList.remove('was-validated');
      } else {
        // mailto fallback
        const url = buildMailto({ name, email, phone, message });
        // Abrimos el cliente de correo del usuario
        window.location.href = url;
        show(alertSuccess);
      }
    } catch (err) {
      console.error(err);
      show(alertError);
    } finally {
      stopLoading();
    }
  });
})();
