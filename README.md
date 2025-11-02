# Daydream Sessions Web

Sitio estático con Bootstrap para el proyecto Daydream Sessions: páginas de Inicio, Vídeo (YouTube) y Contacto.

## Configuración de claves (evitar exposición)

Nunca publiques claves reales en el repositorio. Este proyecto incluye archivos de configuración con marcadores de posición:

- `js/config.youtube.js` → Define `window.YT_CONFIG` con `apiKey` y `channelId`.
- `js/config.emailjs.js` → Define `window.EMAILJS_CONFIG` con `toEmail` y credenciales de EmailJS.

Ambos archivos contienen valores vacíos por diseño. Para desarrollo local, rellena tus valores en tu copia local sin comprometer claves reales. Si ya publicaste claves, rota y restringe.

### YouTube Data API v3

1. Rota la API Key expuesta en Google Cloud Console.
2. Crea una nueva API Key y restringe por HTTP referrers (dominios exactos):
   - `https://<tu-usuario>.github.io/<repo>/` (GitHub Pages)
   - `https://<tu-dominio>/*` (Cloudflare Pages o dominio propio)
3. En `js/config.youtube.js` pon:
   - `apiKey: 'TU_API_KEY'` (no la publiques)
   - `channelId: 'TU_CHANNEL_ID'`

Alternativa más segura: usar un proxy/worker server-side (Cloudflare Workers/Pages Functions) que firme las peticiones y oculte la API Key.

### EmailJS

- Por defecto, el formulario usa `mailto` (no requiere claves).
- Si quieres enviar con EmailJS, rellena `publicKey`, `serviceId` y `templateId` en `js/config.emailjs.js` localmente.
- En planes gratuitos puede que no puedas restringir orígenes; considera un backend propio (SMTP/App Password o Worker) si necesitas ocultar la clave por completo.

## Desarrollo

- Abre `index.html` o `html/media.html`/`html/contacto.html` en un servidor local (por ejemplo, con la extensión Live Server) para evitar problemas de `file://`.
- Asegúrate de que `js/config.youtube.js` y `js/config.emailjs.js` existen (aunque sea con placeholders).

## Despliegue

- GitHub Pages: publica el repositorio; asegúrate de NO subir claves reales.
- Cloudflare Pages: idem. Si usas Workers/Functions para la API de YouTube o el envío de email, configura las variables de entorno allí.

## Seguridad

- Si una clave se expuso en el historial del repo, rotarla SIEMPRE. Opcionalmente, reescribe el historial con BFG o `git filter-repo` para eliminarla, pero la rotación es el paso crítico.

## Notas técnicas

- `js/media.js` manejará la ausencia de `apiKey` mostrando un listado vacío sin romper la página.
- El reproductor añade `origin` al `iframe` para reducir problemas de identidad del embed.
- El formulario de contacto no admite adjuntos (simplificado para fiabilidad y límites de tamaño).

## TODO

- Crear tarjetas en popup del equipo
- Arreglar formatos en las fotos, encuadres, recortes y responsividad
- Videos de otros proyectos
