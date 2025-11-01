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

  function hideBlock() {
    if (!rightBlock || !hasShown) return;
    rightBlock.classList.remove('is-visible');
    rightBlock.classList.add('is-hidden');
  }

  function updateState() {
    if (!rightBlock) return;

    if (isPastTrigger()) {
      if (!rightBlock.classList.contains('is-visible')) {
        showBlock();
      }
    } else if (rightBlock.classList.contains('is-visible')) {
      hideBlock();
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
  var fadeBlocks;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var shownSet = new WeakSet();

  function show(el) {
    el.classList.remove('is-hidden');
    el.classList.add('is-visible');
    shownSet.add(el);
  }

  function hide(el) {
    if (!shownSet.has(el)) return;
    el.classList.remove('is-visible');
    el.classList.add('is-hidden');
  }

  function initObserver() {
    if (!('IntersectionObserver' in window)) return null;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
        } else {
          hide(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -100px 0px' });

    fadeBlocks.forEach(function (el) { observer.observe(el); });

    return observer;
  }

  function checkFallback() {
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    var triggerPoint = Math.max(0, viewportHeight * 0.85 - 100);

    fadeBlocks.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var isVisible = rect.top <= triggerPoint && rect.bottom >= 0;

      if (isVisible) {
        show(el);
      } else {
        hide(el);
      }
    });
  }

  function init() {
    fadeBlocks = Array.prototype.slice.call(document.querySelectorAll('.fade-in-up'));
    if (!fadeBlocks.length) return;

    if (reduceMotion) {
      fadeBlocks.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    if (initObserver()) {
      return;
    }

    checkFallback();
    window.addEventListener('scroll', checkFallback, { passive: true });
    window.addEventListener('resize', checkFallback);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
