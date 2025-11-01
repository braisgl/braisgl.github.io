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
    for (var i=0;i<heroes.length;i++) applyParallax(heroes[i]);
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
