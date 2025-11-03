(function(){
  function markLoaded(){
    var docEl = document.documentElement;
    if (docEl && !docEl.classList.contains('page-loaded')) {
      docEl.classList.add('page-loaded');
    }
    if (document.body && !document.body.classList.contains('page-loaded')) {
      document.body.classList.add('page-loaded');
    }
  }
  if (document.readyState === 'complete') {
    markLoaded();
  } else {
    window.addEventListener('load', markLoaded, { once: true });
  }
})();
