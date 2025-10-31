// Copia este archivo a config.youtube.js y rellena tu API Key
// Opción A) Proveer channelId y dejar que el script calcule el uploads playlist
// Opción B) Proveer directamente uploadsPlaylistId
// Restringe la API Key por dominio (HTTP referrers) en Google Cloud.

window.YT_CONFIG = window.YT_CONFIG || {
  // IMPORTANTE: No publiques tu API Key real en el repositorio.
  // Rellena estos campos localmente ANTES de subir, o usa un proxy/worker server-side.
  apiKey: '', // p.ej. 'AIzaSy...'
  channelId: 'UCMRGk5iv_2V4yBeK1gs6_RQ', // Tu channelId público (está bien publicarlo)
  // uploadsPlaylistId: 'UUxxxxxxxxxxxxxxxx', // opcional si ya lo sabes
  // Si despliegas un Worker/Function, define aquí su base URL (p.ej. 'https://<tu-worker>.workers.dev/api')
  apiBase: '',
  // Establece a true para usar youtube-nocookie.com en el iframe (privacidad mejorada)
  // Puedes sobreescribir esto en config.youtube.local.js
  privacyEnhanced: false,
};
