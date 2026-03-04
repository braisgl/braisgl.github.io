(function(){
  function toNumber(val, def){
    var n = parseFloat(val);
    return isNaN(n) ? def : n;
  }
  function getScrollY(){
    if (typeof window.scrollY === 'number') return window.scrollY;
    if (typeof window.pageYOffset === 'number') return window.pageYOffset;
    var doc = document.documentElement || document.body;
    return doc ? doc.scrollTop : 0;
  }
  function applyParallax(el){
    var cropTop = toNumber(el.getAttribute('data-crop-top'), 0.0);
    var speed = toNumber(el.getAttribute('data-speed'), 0.4);
    var rect = el.getBoundingClientRect();
    var base = rect.height * cropTop;
    var sc = Math.min(Math.max(-rect.top, 0), rect.height + window.innerHeight);
    var offset = sc * speed;
    el.style.backgroundPosition = 'center ' + (-(base + offset)) + 'px';
  }
  function onScroll(){
    var heroes = document.querySelectorAll('.media-hero');
    for (var i=0;i<heroes.length;i++) {
      var h = heroes[i];
      // El hero aniversario usa capas internas (.media-hero__center), no parallax de fondo
      if (h.classList.contains('media-hero--aniversario')) {
        if (h.style && h.style.backgroundPosition) h.style.backgroundPosition = '';
      } else {
        applyParallax(h);
      }
    }
    // Simular efecto fixed para el centro del hero aniversario (3/5 ancho)
    var centers = document.querySelectorAll('.media-hero--aniversario .media-hero__center');
    for (var k=0;k<centers.length;k++) {
      var center = centers[k];
      var hero = center.closest('.media-hero');
      if (!hero) continue;
      var hr = hero.getBoundingClientRect();
      // Base: mantener el elemento centrado en X y su Y unida al hero
      center.style.transform = 'translate(-50%, 0)';
      // Usa la posición absoluta del hero como referencia para simular background fixed
      var scrollY = getScrollY();
  if (!center.dataset.initTop) { center.dataset.initTop = String(scrollY + hr.top); }
  var initTop = parseFloat(center.dataset.initTop || '0');
  if (!Number.isFinite(initTop)) { initTop = scrollY + hr.top; }
      var offsetPx = initTop - hr.top; // desplazamiento equivalente al scroll acumulado
      center.style.backgroundPosition = '50% calc(100% + ' + offsetPx + 'px)';
    }
  }

  function init(){
    // Capturar posición inicial del hero aniversario para anclar la base del fondo al pie
    var centers = document.querySelectorAll('.media-hero--aniversario .media-hero__center');
    for (var k=0;k<centers.length;k++) {
      var center = centers[k];
      var hero = center.closest('.media-hero');
      if (!hero) continue;
      var hr = hero.getBoundingClientRect();
      center.dataset.initTop = String(getScrollY() + hr.top);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init, { once: true });
  }
})();
