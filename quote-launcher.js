/* Enquire button: fixed bottom-right, expands upward into a contact menu (call, text, email, quote).
   Never opens on its own. Hidden while the enquiry form is on screen, and on desktop until the visitor scrolls
   past the hero (the nav already has a quote button there). Also owns the one-off teaser card and the desktop
   exit-intent popup. Styles live in /ui.css, the popup engine in /ui.js. First-party, no dependencies. */
(function () {
  // ── Contact details (same values as the contact section, JSON-LD and footer) ──
  var PHONE_DISPLAY = '0414 438 169';
  var PHONE_RAW = '0414438169';
  var EMAIL = 'cgbindustries@outlook.com.au';

  var ICON = {
    chat:  '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v7a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V13h-.5A1.5 1.5 0 0 1 3 11.5v-7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 4.5l11 11M15.5 4.5l-11 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    call:  '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.2 3h2.3l1.2 3.4-1.6 1.1a8.6 8.6 0 0 0 4.4 4.4l1.1-1.6 3.4 1.2v2.3A1.8 1.8 0 0 1 14.2 15 11.2 11.2 0 0 1 5 5.8 1.8 1.8 0 0 1 5.2 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    sms:   '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v6a1.5 1.5 0 0 1-1.5 1.5H8.5L5 16v-3h-.5A1.5 1.5 0 0 1 3 11.5v-6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 8h6M7 10.5h3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    email: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="4.5" width="14" height="11" rx="1.8" stroke="currentColor" stroke-width="1.5"/><path d="m3.8 5.8 6.2 4.7 6.2-4.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    quote: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.8h6.2L15 6.6v9.6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3.8a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M11 2.8v4h4M6.8 10.2h6.4M6.8 13h4.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  var form = document.getElementById('contact');
  var quoteHref = form ? '#contact' : '/#contact';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  function goToForm(e) {
    if (!form) return; // other pages follow the /#contact link
    e.preventDefault();
    form.scrollIntoView({ behavior: reduceMotion && reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#contact');
  }

  function opt(href, icon, label, extra) {
    return '<a class="ql-opt' + (extra && extra.primary ? ' ql-opt-primary' : '') + '" href="' + href + '"' + (extra && extra.attrs ? ' ' + extra.attrs : '') + '>' +
      '<span>' + label + '</span><span class="ql-opt-ico">' + icon + '</span></a>';
  }

  var root = document.createElement('div');
  root.className = 'ql';
  var HEADLINE = 'Dirty concrete ruining your kerb appeal?';
  var items = [
    opt('tel:' + PHONE_RAW, ICON.call, 'Call ' + PHONE_DISPLAY),
    opt('sms:' + PHONE_RAW, ICON.sms, 'Text us'),
    opt('mailto:' + EMAIL, ICON.email, 'Email us'),
    opt(quoteHref, ICON.quote, 'Get a free quote', { primary: true, attrs: 'data-ql-quote' })
  ];
  root.innerHTML =
    '<div class="ql-teaser" role="region" aria-label="Quote offer" hidden>' +
      '<button type="button" class="ql-x" aria-label="Close">&times;</button>' +
      '<p class="ql-teaser-title">' + HEADLINE + '</p>' +
      '<button type="button" class="ui-btn" data-ql-teaser-cta>Get a free quote</button>' +
    '</div>' +
    '<ul class="ql-opts" id="ql-opts" aria-label="Contact options">' +
      items.map(function (h, i) { return '<li style="--i:' + (items.length - 1 - i) + '">' + h + '</li>'; }).join('') +
    '</ul>' +
    '<button type="button" class="ql-btn" aria-expanded="false" aria-controls="ql-opts">' +
      '<span class="ql-ico">' + ICON.chat.replace('<svg', '<svg class="ql-ico-chat"') + ICON.close.replace('<svg', '<svg class="ql-ico-x"') + '</span>' +
      '<span class="ql-label">Enquire</span>' +
    '</button>';
  document.body.appendChild(root);

  var btn = root.querySelector('.ql-btn');
  var label = root.querySelector('.ql-label');
  var opts = root.querySelector('.ql-opts');
  var isOpen = false;

  function setOpen(open, returnFocus) {
    isOpen = open;
    root.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    label.textContent = open ? 'Close' : 'Enquire';
    if (open) opts.removeAttribute('inert'); else opts.setAttribute('inert', '');
    if (!open && returnFocus) btn.focus();
  }
  setOpen(false);

  btn.addEventListener('click', function (e) {
    setOpen(!isOpen);
    if (isOpen && e.detail === 0) opts.querySelector('a').focus(); // keyboard activation
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) setOpen(false, true);
  });
  document.addEventListener('click', function (e) {
    if (isOpen && !root.contains(e.target)) setOpen(false);
  });
  opts.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    setOpen(false);
    if (a.hasAttribute('data-ql-quote')) goToForm(e);
  });

  // ── Session helpers (storage can throw in private windows) ──
  function seen(key) { try { return sessionStorage.getItem(key) === '1'; } catch (e) { return false; } }
  function mark(key) { try { sessionStorage.setItem(key, '1'); } catch (e) {} }

  // ── Teaser card ──
  var teaser = root.querySelector('.ql-teaser');
  var teaserOn = false;
  var teaserDue = false;
  var teaserDone = seen('cgb_teaser');

  function setTeaser(show) {
    teaserOn = show;
    if (show) { teaser.hidden = false; void teaser.offsetWidth; teaser.classList.add('show'); }
    else { teaser.classList.remove('show'); setTimeout(function () { if (!teaserOn) teaser.hidden = true; }, 320); }
  }
  teaser.querySelector('.ql-x').addEventListener('click', function () { setTeaser(false); });
  teaser.querySelector('[data-ql-teaser-cta]').addEventListener('click', function () {
    setTeaser(false);
    setOpen(true);
  });
  btn.addEventListener('click', function () { if (teaserOn) setTeaser(false); });

  function maybeShowTeaser() {
    if (!teaserDue || teaserDone || teaserOn || isOpen || root.hidden || footerInView) return;
    teaserDone = true;
    mark('cgb_teaser');
    setTeaser(true);
  }
  if (!teaserDone) {
    setTimeout(function () { teaserDue = true; update(); }, 15000);
  }
  function checkScrollDepth() {
    if (teaserDue || teaserDone) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY / max >= 0.5) { teaserDue = true; update(); }
  }

  // ── Visibility: hidden while the form is in view; on desktop also hidden until past the hero ──
  root.hidden = true; // first update() reveals it, which triggers the one-off pulse
  var formInView = false;
  var footerInView = false;
  var pastHero = true;
  var shownOnce = false;
  var desktop = window.matchMedia ? window.matchMedia('(min-width: 769px)') : { matches: false };
  var hero = document.querySelector('main > section, main > header');

  function update() {
    var hide = formInView || (desktop.matches && !pastHero);
    if (hide && isOpen) setOpen(false);
    if (hide && teaserOn) setTeaser(false);
    if (!hide && root.hidden && !shownOnce) {
      shownOnce = true;
      btn.classList.add('ql-pulse');
      btn.addEventListener('animationend', function () { btn.classList.remove('ql-pulse'); }, { once: true });
    }
    root.hidden = hide;
    if (footerInView && teaserOn) setTeaser(false);
    maybeShowTeaser();
  }
  function checkHero() {
    var bottom = hero ? hero.getBoundingClientRect().bottom : window.innerHeight;
    pastHero = bottom <= 0;
    checkScrollDepth();
    update();
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; checkHero(); });
  }, { passive: true });
  window.addEventListener('resize', checkHero);

  if ('IntersectionObserver' in window) {
    if (form) {
      new IntersectionObserver(function (entries) {
        formInView = entries[0].isIntersecting;
        update();
      }, { threshold: 0 }).observe(form.querySelector('form') || form);
    }
    var footer = document.querySelector('footer');
    if (footer) {
      new IntersectionObserver(function (entries) {
        footerInView = entries[0].isIntersecting;
        update();
      }, { threshold: 0 }).observe(footer);
    }
  }
  checkHero();

  // ── Exit-intent popup (desktop with a mouse only, once per visit) ──
  var fineHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 769px)');
  if (fineHover && fineHover.matches && !seen('cgb_exit') && window.CGBUI) {
    var el = document.createElement('div');
    el.className = 'ui-modal';
    el.innerHTML =
      '<div class="ui-dialog" role="dialog" aria-modal="true" aria-labelledby="ui-exit-title">' +
        '<button type="button" class="ui-dialog-close" data-modal-close aria-label="Close">' + ICON.close + '</button>' +
        '<h2 class="ui-dialog-title" id="ui-exit-title">' + HEADLINE + '</h2>' +
        '<a class="ui-btn" href="' + quoteHref + '" data-autofocus data-ql-modal-cta>Get a free quote</a>' +
        '<button type="button" class="ui-nothanks" data-modal-close>No thanks</button>' +
      '</div>';
    document.body.appendChild(el);
    var popup = CGBUI.modal(el);
    var pageStart = Date.now();

    el.querySelector('[data-ql-modal-cta]').addEventListener('click', function (e) {
      popup.close(false);
      goToForm(e);
    });

    document.addEventListener('mouseout', function (e) {
      if (e.relatedTarget || e.clientY > 0 || popup.isOpen || seen('cgb_exit')) return;
      if (Date.now() - pageStart < 3000 || formInView) return; // ignore instant exits and visitors already at the form
      mark('cgb_exit');
      setTeaser(false);
      setOpen(false);
      popup.open(btn);
    });
  }
})();
