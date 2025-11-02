(function () {
  var rightBlock;
  var hasShown = false;
  var scrollTrigger = 150;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getScrollY() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function isPastTrigger() {
    return getScrollY() >= scrollTrigger;
  }

  function showBlock() {
    if (!rightBlock) return;
    hasShown = true;
    rightBlock.classList.remove('is-hidden');
    rightBlock.classList.add('is-visible');
  }

  function updateState() {
    if (!rightBlock) return;

    if (isPastTrigger()) {
      if (!rightBlock.classList.contains('is-visible')) {
        showBlock();
      }
    }
  }

  function init() {
    rightBlock = document.querySelector('.fade-in-right');
    if (!rightBlock) return;

    if (reduceMotion) {
      rightBlock.classList.add('is-visible');
      return;
    }

    if (isPastTrigger()) {
      showBlock();
    }

    window.addEventListener('scroll', updateState, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var observerSupported = 'IntersectionObserver' in window;
  var state = new WeakMap();
  var fallbackItems = [];

  function getExtraOffset(el) {
    var value = parseInt(el.getAttribute('data-extra-offset'), 10);
    return isNaN(value) ? 0 : Math.max(0, value);
  }

  function show(el) {
    if (state.get(el)) return;
    el.classList.remove('is-hidden');
    el.classList.add('is-visible');
    state.set(el, true);
  }

  function initObserverForElement(el) {
    var extra = getExtraOffset(el);
    var margin = -120 - extra;

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px ' + margin + 'px 0px' });

    observer.observe(el);
  }

  function checkFallback() {
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var baseTrigger = Math.max(0, viewportHeight * 0.85 - 120);

    fallbackItems = fallbackItems.filter(function (item) {
      if (state.get(item.el)) {
        return false;
      }

      var triggerPoint = baseTrigger - item.extra;
      var rect = item.el.getBoundingClientRect();

      if (rect.top <= triggerPoint && rect.bottom >= 0) {
        show(item.el);
        return false;
      }

      return true;
    });

    if (!fallbackItems.length) {
      window.removeEventListener('scroll', checkFallback);
      window.removeEventListener('resize', checkFallback);
    }
  }

  function initFallback(elements) {
    fallbackItems = elements.map(function (el) {
      return { el: el, extra: getExtraOffset(el) };
    });

    checkFallback();
    window.addEventListener('scroll', checkFallback, { passive: true });
    window.addEventListener('resize', checkFallback);
  }

  function init() {
  var elements = Array.prototype.slice.call(document.querySelectorAll('.fade-in-up, .fade-in-left-scroll'));
    if (!elements.length) return;

    if (reduceMotion) {
      elements.forEach(show);
      return;
    }

    if (observerSupported) {
      elements.forEach(initObserverForElement);
      return;
    }

    initFallback(elements);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
