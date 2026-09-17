(function(){
  const RELEASES_URL = '../data/releases.json';
  const ARTIST_URL = 'https://open.spotify.com/intl-es/artist/2qz3CdLXAjrTe1vjYwjmmd';

  // Formatter para fechas en es-ES
  function formatDate(dateStr, precision) {
    const date = new Date(dateStr + 'T00:00:00Z');
    if (precision === 'year') {
      return date.getUTCFullYear().toString();
    } else if (precision === 'month') {
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', timeZone: 'UTC' });
    } else {
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    }
  }

  // Crear una tarjeta para cada release
  function createCard(release) {
    const col = document.createElement('div');
    col.className = 'col-12';

    const card = document.createElement('div');
    card.className = 'card h-100 border-0';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const title = document.createElement('h5');
    title.className = 'card-title mb-1';
    title.textContent = release.name;

    const dateText = document.createElement('p');
    dateText.className = 'card-text text-muted small mb-3';
    dateText.textContent = formatDate(release.release_date, release.release_date_precision);

    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'music-embed';
    iframeContainer.innerHTML =
      '<iframe src="https://open.spotify.com/embed/album/' + release.id + '?utm_source=generator" ' +
      'width="100%" height="152" frameborder="0" ' +
      'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" ' +
      'loading="lazy" title="' + release.name + '"></iframe>';

    cardBody.appendChild(title);
    cardBody.appendChild(dateText);
    cardBody.appendChild(iframeContainer);
    card.appendChild(cardBody);
    col.appendChild(card);

    return col;
  }

  function renderFallback(grid, message, isError) {
    grid.innerHTML =
      '<div class="col-12 text-center py-5">' +
        '<p class="' + (isError ? 'text-danger' : 'text-muted') + '">' + message + '</p>' +
        '<a href="' + ARTIST_URL + '" target="_blank" rel="noopener" class="btn btn-outline-light btn-sm">Ver en Spotify</a>' +
      '</div>';
  }

  // Cargar releases y renderizar
  function init() {
    const grid = document.getElementById('musicGrid');
    if (!grid) return;

    fetch(RELEASES_URL)
      .then(function(res) { return res.json(); })
      .then(function(releases) {
        releases.sort(function(a, b) { return new Date(b.release_date) - new Date(a.release_date); });

        if (!releases.length) {
          renderFallback(grid, 'No hay lanzamientos disponibles.', false);
          return;
        }

        releases.forEach(function(release) {
          grid.appendChild(createCard(release));
        });
      })
      .catch(function(err) {
        console.error('Error cargando releases:', err);
        renderFallback(grid, 'Error cargando los lanzamientos.', true);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
