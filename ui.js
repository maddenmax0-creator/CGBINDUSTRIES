/* Shared UI behaviour: floating nav (shrink on scroll, services dropdown, mobile sheet, active link)
   and window.CGBUI.modal(), the popup engine used by the exit modal and the gallery lightbox.
   First-party, no dependencies. */
(function () {
  var root = document.documentElement;

  // ══ NAV ══
  var nav = document.querySelector('nav');
  var ticking = false;
  function onScroll() {
    ticking = false;
    root.classList.toggle('nav-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Mark the link for the current page (service pages live in the Services dropdown)
  var path = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/(.)\/$/, '$1');
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (a) {
    var h = a.getAttribute('href');
    if (h && h.charAt(0) === '/' && h.indexOf('#') < 0 && h.replace(/(.)\/$/, '$1') === path) a.setAttribute('aria-current', 'page');
  });

  // Desktop Services dropdown
  var dd = document.querySelector('.nav-dd');
  if (dd) {
    var ddBtn = dd.querySelector('.nav-dd-toggle');
    if (dd.querySelector('[aria-current]')) ddBtn.classList.add('is-active');
    var setDd = function (open) { dd.classList.toggle('open', open); ddBtn.setAttribute('aria-expanded', open); };
    ddBtn.addEventListener('click', function () { setDd(!dd.classList.contains('open')); });
    dd.addEventListener('focusout', function (e) { if (!dd.contains(e.relatedTarget)) setDd(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dd.classList.contains('open')) { setDd(false); ddBtn.focus(); }
    });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) setDd(false); });
  }

  // Mobile sheet
  var burger = document.getElementById('nav-burger');
  var sheet = document.getElementById('mobile-menu');
  if (burger && sheet) {
    var mddBtn = document.getElementById('mobile-dd-toggle');
    var mddList = document.getElementById('mobile-dd-list');
    if (mddList) mddList.hidden = false; // visibility is handled in CSS so the list can animate
    if (mddBtn && mddList && mddList.querySelector('[aria-current]')) mddBtn.classList.add('is-active');
    var setSheet = function (open, returnFocus) {
      sheet.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) sheet.removeAttribute('inert'); else sheet.setAttribute('inert', '');
      if (!open && returnFocus) burger.focus();
    };
    setSheet(false);
    burger.addEventListener('click', function () { setSheet(!sheet.classList.contains('open')); });
    sheet.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setSheet(false); }); });
    if (mddBtn && mddList) {
      mddBtn.addEventListener('click', function () {
        var open = mddBtn.getAttribute('aria-expanded') !== 'true';
        mddBtn.setAttribute('aria-expanded', open);
        mddList.classList.toggle('open', open);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('open')) setSheet(false, true);
    });
    document.addEventListener('click', function (e) {
      if (sheet.classList.contains('open') && !sheet.contains(e.target) && !burger.contains(e.target)) setSheet(false);
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 768 && sheet.classList.contains('open')) setSheet(false); });
  }

  // Highlight the in-page section being read (home page anchors only)
  if ('IntersectionObserver' in window) {
    var spy = [];
    document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta), .mobile-menu a[href^="#"]:not(.mobile-cta)').forEach(function (a) {
      var sec = document.getElementById(a.getAttribute('href').slice(1));
      if (sec) spy.push({ a: a, sec: sec });
    });
    if (spy.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          spy.forEach(function (s) {
            if (s.sec !== en.target) return;
            if (en.isIntersecting) s.a.setAttribute('aria-current', 'location');
            else if (s.a.getAttribute('aria-current') === 'location') s.a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      spy.forEach(function (s) { io.observe(s.sec); });
    }
  }

  // ══ POPUP ENGINE ══
  // CGBUI.modal(el, opts): el is a .ui-modal that is a direct child of <body> and contains a .ui-dialog.
  // Fade + slide/scale handled in CSS (is-open). Here: scroll lock without a scrollbar jump, Esc / backdrop /
  // [data-modal-close] to close, focus moved in, trapped, and returned to the opener on close.
  var stack = [];
  var locks = 0;
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function lockScroll() {
    if (locks++) return;
    // html.ui-locked reserves the scrollbar gutter where supported; pad by hand elsewhere
    var gutter = window.CSS && CSS.supports && CSS.supports('scrollbar-gutter', 'stable');
    var sbw = window.innerWidth - root.clientWidth;
    if (!gutter && sbw > 0) root.style.paddingRight = sbw + 'px';
    root.classList.add('ui-locked');
  }
  function unlockScroll() {
    if (--locks > 0) return;
    locks = 0;
    root.classList.remove('ui-locked');
    root.style.paddingRight = '';
  }
  function focusables(el) {
    return Array.prototype.filter.call(el.querySelectorAll(FOCUSABLE), function (n) { return n.offsetParent !== null || n === document.activeElement; });
  }

  function modal(el, opts) {
    opts = opts || {};
    var api = { el: el, isOpen: false };
    var dialog = el.querySelector('.ui-dialog') || el;
    var opener = null;
    var inerted = [];
    var pressedOnBackdrop = false;
    if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
    el.setAttribute('inert', '');

    api.open = function (from) {
      if (api.isOpen) return;
      api.isOpen = true;
      opener = from || document.activeElement;
      Array.prototype.forEach.call(document.body.children, function (n) {
        if (n === el || /^(SCRIPT|STYLE|LINK|NOSCRIPT)$/.test(n.tagName) || n.hasAttribute('inert')) return;
        n.setAttribute('inert', '');
        inerted.push(n);
      });
      el.removeAttribute('inert');
      lockScroll();
      stack.push(api);
      void el.offsetWidth; // commit the closed styles so the open transition runs
      el.classList.add('is-open');
      var first = el.querySelector('[data-autofocus]') || focusables(dialog)[0] || dialog;
      first.focus({ preventScroll: true });
      if (opts.onOpen) opts.onOpen();
    };

    api.close = function (returnFocus) {
      if (!api.isOpen) return;
      api.isOpen = false;
      el.classList.remove('is-open');
      el.setAttribute('inert', '');
      stack.splice(stack.indexOf(api), 1);
      inerted.forEach(function (n) { n.removeAttribute('inert'); });
      inerted = [];
      unlockScroll();
      if (returnFocus !== false && opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
      opener = null;
      if (opts.onClose) opts.onClose();
    };

    el.addEventListener('pointerdown', function (e) { pressedOnBackdrop = e.target === el || e.target.hasAttribute('data-backdrop'); });
    el.addEventListener('click', function (e) {
      var closer = e.target.closest && e.target.closest('[data-modal-close]');
      if (closer || ((e.target === el || e.target.hasAttribute('data-backdrop')) && pressedOnBackdrop)) api.close();
      pressedOnBackdrop = false;
    });
    api.focusables = function () { return focusables(dialog); };
    return api;
  }

  document.addEventListener('keydown', function (e) {
    var top = stack[stack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); top.close(); return; }
    if (e.key === 'Tab') {
      var f = top.focusables();
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (!top.el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && (document.activeElement === first || document.activeElement.classList.contains('ui-dialog'))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.CGBUI = { modal: modal, reducedMotion: function () { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } };
})();
