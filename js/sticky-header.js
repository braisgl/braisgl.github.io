(function(){
  function applyOffset(){
    var header = document.querySelector('header');
    if(!header) return;
    document.body.style.paddingTop = header.offsetHeight + 'px';
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyOffset);
  } else {
    applyOffset();
  }
  window.addEventListener('resize', applyOffset);
})();