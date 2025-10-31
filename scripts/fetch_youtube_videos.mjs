// Usage:
// 1) Copy scripts/youtube.config.example.json to scripts/youtube.config.json
// 2) Fill in apiKey and channelId
// 3) Run with Node 18+:  node ./scripts/fetch_youtube_videos.mjs
//    Optionally override with env vars: YT_API_KEY, YT_CHANNEL_ID
// Output: writes ./data/videos.json with { videos: [...] }

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'videos.json');
const CONFIG_FILE = path.join(__dirname, 'youtube.config.json');

const DEFAULT_VIDEO_ID = 'pKEuPaKHNag';

async function readConfig() {
  let cfg = {};
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf8');
    cfg = JSON.parse(raw);
  } catch (e) {
    // ignore if missing
  }
  return {
    apiKey: process.env.YT_API_KEY || cfg.apiKey,
    channelId: process.env.YT_CHANNEL_ID || cfg.channelId,
    uploadsPlaylistId: process.env.YT_UPLOADS_PLAYLIST_ID || cfg.uploadsPlaylistId,
  };
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${url}: ${text}`);
  }
  return res.json();
}

async function getUploadsPlaylistId({ apiKey, channelId, uploadsPlaylistId }) {
  if (uploadsPlaylistId) return uploadsPlaylistId;
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const data = await fetchJson(url);
  const id = data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!id) throw new Error('No se pudo obtener el uploadsPlaylistId');
  return id;
}

async function fetchAllPlaylistItems({ apiKey, playlistId, maxPages = 10 }) {
  const videos = [];
  let pageToken = '';
  for (let i = 0; i < maxPages; i++) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const data = await fetchJson(url);
    for (const it of data.items || []) {
      const sn = it.snippet;
      const id = sn?.resourceId?.videoId;
      if (!id) continue;
      videos.push({
        id,
        title: sn?.title || '',
        description: sn?.description || '',
        thumbnail: sn?.thumbnails?.medium?.url || `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      });
    }
    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }
  return videos;
}

async function writeVideosJson(videos) {
  const out = { videos };
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
}

async function main() {
  const cfg = await readConfig();
  if (!cfg.apiKey || (!cfg.channelId && !cfg.uploadsPlaylistId)) {
    console.error('Faltan datos. Define YT_API_KEY y YT_CHANNEL_ID (o YT_UPLOADS_PLAYLIST_ID) o crea scripts/youtube.config.json');
    process.exit(1);
  }

  const playlistId = await getUploadsPlaylistId(cfg);
  const videos = await fetchAllPlaylistItems({ apiKey: cfg.apiKey, playlistId });

  // Orden opcional: por fecha descendente ya viene habitual en playlistItems; si no, se podría invertir

  // Asegurar que el video por defecto exista y quede en la lista (si no está, lo añadimos al principio)
  if (!videos.some((v) => v.id === DEFAULT_VIDEO_ID)) {
    videos.unshift({
      id: DEFAULT_VIDEO_ID,
      title: 'Daydream Sessions - Video destacado',
      description: '',
      thumbnail: `https://img.youtube.com/vi/${DEFAULT_VIDEO_ID}/mqdefault.jpg`,
    });
  }

  await writeVideosJson(videos);
  console.log(`Escrito ${videos.length} vídeos en ${path.relative(ROOT, DATA_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
