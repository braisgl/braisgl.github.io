(function(){
  function applyOffset(){
    var header = document.querySelector('header');
    if(!header) return;
    var h = header.offsetHeight;
    document.body.style.paddingTop = h + 'px';
    document.documentElement.style.setProperty('--header-height', h + 'px');
    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    header.style.paddingRight = scrollbarWidth + 'px';
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyOffset);
  } else {
    applyOffset();
  }
  window.addEventListener('resize', applyOffset);
})();