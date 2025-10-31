/*
  media.js
  - Renderiza un reproductor principal (iframe YouTube)
  - Muestra el resto de vídeos en dos columnas
  - Fuente de datos:
    * Por defecto: una lista mínima (fallback)
    * Si existe window.YT_CONFIG (apiKey + channelId o uploadsPlaylistId),
      cargamos todos los vídeos del canal vía YouTube Data API v3
  - Nota: restringe la API Key por dominio (HTTP referrers) en Google Cloud.
*/

(function () {
  const els = {
    frame: document.getElementById('activeVideoFrame'),
    title: document.getElementById('activeVideoTitle'),
    desc: document.getElementById('activeVideoDesc'),
    grid: document.getElementById('videoGrid'),
    open: document.getElementById('openOnYouTube'),
    note: document.getElementById('playerFallbackNote'),
  };
  const cfg = (typeof window !== 'undefined' && window.YT_CONFIG) || {};

  function ytThumb(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  }

  function setActive(video, opts) {
    const shouldScroll = !!(opts && opts.scroll);
    if (!video) return;
  // Prefer standard youtube.com embed with explicit origin to satisfy identity checks
    const isFile = window.location.protocol === 'file:';
    const privacyEnhanced = !!(cfg && cfg.privacyEnhanced);
    const embedHost = privacyEnhanced ? 'https://www.youtube-nocookie.com/embed' : 'https://www.youtube.com/embed';
    let urlEmbed;
    if (isFile) {
      // En modo file:// algunos navegadores bloquean el Referer; probamos sin origin
      urlEmbed = `${embedHost}/${video.id}?rel=0&modestbranding=1&iv_load_policy=3`;
    } else {
      const originParam = encodeURIComponent(window.location.origin);
      urlEmbed = `${embedHost}/${video.id}?rel=0&modestbranding=1&iv_load_policy=3&origin=${originParam}`;
    }
    els.frame.src = urlEmbed;
    const t = video.title || '';
    els.title.textContent = t;
  // Texto secundario eliminado: limpiar si existiera el nodo
  if (els.desc) els.desc.textContent = '';
    if (els.open) els.open.href = `https://www.youtube.com/watch?v=${video.id}`;

    // Fallback básico: si en 3s no hubo onload del iframe, mostramos la nota
    if (els.note) {
      els.note.classList.add('d-none');
      let loaded = false;
      const onLoad = () => { loaded = true; els.note.classList.add('d-none'); els.frame.removeEventListener('load', onLoad); };
      els.frame.addEventListener('load', onLoad, { once: true });
      setTimeout(() => {
        if (!loaded) {
          els.note.textContent = isFile
            ? 'Para reproducir el vídeo embebido, abre la web desde http://localhost (no desde file://). Usa un servidor local o despliega a Pages.'
            : 'Si el reproductor no carga, usa el enlace Abrir en YouTube.';
          els.note.classList.remove('d-none');
        }
      }, 3000);
    }
    // Scroll to the main player when requested (e.g., after clicking a thumbnail)
    if (shouldScroll) {
      const target = document.querySelector('.active-video-section') || els.frame;
      // Center the player section in the viewport for better focus
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function createCard(video) {
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-lg-4';
    const card = document.createElement('div');
    card.className = 'card h-100 border-0';

    const thumb = document.createElement('img');
    thumb.className = 'card-img-top';
    thumb.src = video.thumbnail || ytThumb(video.id);
    thumb.alt = video.title || 'Miniatura';
    thumb.style.cursor = 'pointer';
  thumb.addEventListener('click', () => setActive(video, { scroll: true }));

    const body = document.createElement('div');
    body.className = 'card-body';

    const h5 = document.createElement('h5');
    h5.className = 'card-title';
    h5.textContent = video.title || '';

    body.appendChild(h5);
    card.appendChild(thumb);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function renderList(videos, activeId) {
    els.grid.innerHTML = '';
    videos
      .filter((v) => v.id !== activeId)
      .forEach((v) => els.grid.appendChild(createCard(v)));
  }

  // Fallback mínimo por si falla la API
  const fallbackVideos = [];

  async function fetchYouTubeVideos() {
    const apiKey = cfg.apiKey;
    const apiBase = cfg.apiBase; // Si está definido, usaremos el proxy en lugar de googleapis.com
    const channelId = cfg.channelId;
    const uploadsPlaylistId = cfg.uploadsPlaylistId;
    if (!apiKey || (!channelId && !uploadsPlaylistId)) {
      if (!apiBase) {
        console.warn('Falta apiKey o channelId/uploadsPlaylistId en YT_CONFIG y no hay apiBase');
        return null;
      }
    }

    async function fetchJson(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
      return res.json();
    }

    // Obtener uploads playlist si solo tenemos channelId
    let playlistId = uploadsPlaylistId;
    if (!playlistId && channelId) {
      const chUrl = apiBase
        ? `${apiBase}/yt/channels?part=contentDetails&id=${encodeURIComponent(channelId)}`
        : `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
      const chData = await fetchJson(chUrl);
      playlistId = chData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!playlistId) throw new Error('No se encontró uploads playlist');
    }

    const videos = [];
    let pageToken = '';
    // Traemos hasta 100 (dos páginas de 50)
    for (let i = 0; i < 2; i++) {
      const plUrl = apiBase
        ? `${apiBase}/yt/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(playlistId)}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`
        : `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const plData = await fetchJson(plUrl);
      (plData.items || []).forEach((it) => {
        const sn = it.snippet;
        const id = sn?.resourceId?.videoId;
        if (!id) return;
        videos.push({
          id,
          title: sn?.title || '',
          description: sn?.description || '',
          thumbnail: sn?.thumbnails?.medium?.url || ytThumb(id),
        });
      });
      pageToken = plData.nextPageToken || '';
      if (!pageToken) break;
    }
    // Filtrar shorts (<= 60s) obteniendo duraciones en lote
    try {
      const filtered = await filterOutShortsByDuration(videos, apiKey);
      return filtered;
    } catch (e) {
      console.warn('No se pudo filtrar Shorts, devolviendo lista completa', e);
      return videos;
    }
  }

  // Convierte duración ISO8601 (PT#H#M#S) a segundos
  function isoToSeconds(iso) {
    const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '');
    if (!m) return 0;
    const h = parseInt(m[1] || '0', 10);
    const min = parseInt(m[2] || '0', 10);
    const s = parseInt(m[3] || '0', 10);
    return h * 3600 + min * 60 + s;
  }

  async function filterOutShortsByDuration(videos, apiKey) {
    const apiBase = cfg.apiBase;
    const ids = videos.map(v => v.id).filter(Boolean);
    const chunks = [];
    for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));

    const mapDur = new Map();
    for (const chunk of chunks) {
      const url = apiBase
        ? `${apiBase}/yt/videos?part=contentDetails&id=${encodeURIComponent(chunk.join(','))}`
        : `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${chunk.join(',')}&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al obtener duraciones');
      const data = await res.json();
      (data.items || []).forEach(it => {
        const id = it.id;
        const dur = isoToSeconds(it?.contentDetails?.duration || '');
        mapDur.set(id, dur);
      });
    }

    return videos.filter(v => (mapDur.get(v.id) || 0) > 60);
  }

  async function init() {
    try {
  let videos = await fetchYouTubeVideos();
  if (!videos || !videos.length) videos = fallbackVideos;

  // Elegir el último subido (la API de uploads suele traer el más reciente primero)
  const active = videos && videos.length ? videos[0] : null;
      if (active) setActive(active);
      renderList(videos || [], active ? active.id : null);
    } catch (e) {
      console.error(e);
      // Fallback
      const active = (fallbackVideos && fallbackVideos.length) ? fallbackVideos[0] : null;
      if (active) setActive(active);
      renderList(fallbackVideos || [], active ? active.id : null);
    }

    // Parallax centralizado en hero.js
  }

  init();
})();
