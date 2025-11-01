(function(){
  function toNumber(val, def){
    var n = parseFloat(val);
    return isNaN(n) ? def : n;
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
      // Si el hero contiene una imagen central (.media-hero__img), no animamos su background
      // para evitar que "se desplace todo el hero" y mantener el fixed de los laterales.
      if (h.querySelector('.media-hero__img') || h.classList.contains('media-hero--aniversario') || h.classList.contains('media-hero--todos')) {
        // Limpia cualquier backgroundPosition inline de ejecuciones anteriores
        if (h.style && h.style.backgroundPosition) h.style.backgroundPosition = '';
      } else {
        applyParallax(h);
      }
    }
    // Parallax suave para la imagen central del hero (si existe)
    var imgs = document.querySelectorAll('.media-hero__img');
    for (var j=0;j<imgs.length;j++) {
      var img = imgs[j];
      var r = img.getBoundingClientRect();
      var sc = Math.min(Math.max(-r.top, 0), r.height + window.innerHeight);
      var speed = 0.15; // más sutil que el fondo
      var rawOffset = sc * speed;
      // Limitar el desplazamiento para que nunca se descubra el fondo difuminado
      var maxShift = Math.max(16, r.height * 0.05); // 16px o 5% del alto, lo que sea mayor
      var offset = Math.min(rawOffset, maxShift);
      // Aplica una ligera escala para cubrir siempre al desplazar
      img.style.transform = 'translateY(' + (-offset) + 'px) scale(1.06)';
      img.style.willChange = 'transform';
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
  // Offset fijo: usar la posición inicial para anclar el apoyo al pie del hero en reposo
  if (!center.dataset.initTop) { center.dataset.initTop = String(hr.top); }
  var initTop = parseFloat(center.dataset.initTop || '0');
      var offsetPx = (initTop - hr.top); // equivalente al scroll dentro del hero
      center.style.backgroundPosition = '50% calc(100% + ' + offsetPx + 'px)';
    }
  }
  function updateHeroWidth(){
    var img = document.querySelector('.media-hero .media-hero__img');
    if (img) {
      var w = img.getBoundingClientRect().width;
      if (w && w > 0) {
        document.documentElement.style.setProperty('--hero-content-width', w + 'px');
      }
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
      center.dataset.initTop = String(hr.top);
    }
    onScroll();
    updateHeroWidth();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function(){ onScroll(); updateHeroWidth(); });
    var img = document.querySelector('.media-hero .media-hero__img');
    if (img && !img.complete) {
      img.addEventListener('load', updateHeroWidth, { once: true });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
