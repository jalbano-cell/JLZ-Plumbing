(function () {
  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reveal-on-scroll
  var revealEls = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // Bottom padding so the sticky mobile call bar never covers content
  var callBar = document.querySelector('.mobile-call-bar');
  if (callBar) {
    var setPadding = function () {
      var isVisible = getComputedStyle(callBar).display !== 'none';
      document.body.style.paddingBottom = isVisible ? (callBar.offsetHeight + 'px') : '';
    };
    setPadding();
    window.addEventListener('resize', setPadding);
  }

  // Auto-advancing gallery carousel
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel-track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.carousel-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.carousel-dot'));
    var prevBtn = root.querySelector('.carousel-prev');
    var nextBtn = root.querySelector('.carousel-next');
    var toggleBtn = root.querySelector('.carousel-toggle');
    var toggleIcon = toggleBtn ? toggleBtn.querySelector('use') : null;
    if (!track || slides.length === 0) return;

    var index = 0;
    var timer = null;
    var playing = !reduceMotion;
    var INTERVAL = 4000;

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-selected', String(i === index));
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function start() {
      stop();
      if (!playing) return;
      timer = setInterval(next, INTERVAL);
    }

    function setPlaying(next) {
      playing = next;
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
        if (toggleIcon) toggleIcon.setAttribute('href', playing ? '#icon-pause' : '#icon-play');
      }
      if (playing) start(); else stop();
    }

    prevBtn && prevBtn.addEventListener('click', function () { prev(); start(); });
    nextBtn && nextBtn.addEventListener('click', function () { next(); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); start(); });
    });
    toggleBtn && toggleBtn.addEventListener('click', function () { setPlaying(!playing); });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', function () { if (playing) start(); });
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', function () { if (playing) start(); });

    render();
    setPlaying(playing);
  });
})();
