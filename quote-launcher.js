/* Enquire button: fixed bottom-right, expands upward into three ways to get a quote.
   Never opens on its own. Hidden while the enquiry form is on screen, and on desktop until the
   visitor scrolls past the hero (the nav already has a quote button there). First-party, no dependencies. */
(function () {
  var PHONE_DISPLAY = '0414 438 169';
  var PHONE_RAW = '0414438169';

  var css = '\
.ql{position:fixed;right:16px;bottom:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:90;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-family:"Inter",sans-serif}\
.ql[hidden]{display:none}\
.ql-btn,.ql-opt{display:block;box-sizing:border-box;background:#fff;color:#080808;border:none;border-radius:0;cursor:pointer;text-decoration:none;text-align:center;font-family:"Inter",sans-serif;font-size:.7rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;line-height:1.2;padding:12px 22px;box-shadow:0 4px 18px rgba(0,0,0,.45);transition:background .2s,transform .15s}\
.ql-btn:hover,.ql-opt:hover{background:#C8C3BC}\
.ql-btn:active,.ql-opt:active{transform:scale(.98)}\
.ql-btn:focus-visible,.ql-opt:focus-visible{outline:2px solid #C8C3BC;outline-offset:3px}\
.ql-opts{display:flex;flex-direction:column;gap:8px;align-self:stretch;opacity:0;visibility:hidden;transform:translateY(10px);transition:opacity .2s ease-out,transform .2s ease-out,visibility 0s linear .2s}\
.ql.open .ql-opts{opacity:1;visibility:visible;transform:none;transition:opacity .2s ease-out,transform .2s ease-out,visibility 0s}\
@keyframes ql-pulse{from{box-shadow:0 0 0 0 rgba(255,255,255,.6),0 4px 18px rgba(0,0,0,.45)}to{box-shadow:0 0 0 12px rgba(255,255,255,0),0 4px 18px rgba(0,0,0,.45)}}\
.ql-btn.ql-pulse{animation:ql-pulse .28s ease-out 1}\
.ql-teaser{position:relative;box-sizing:border-box;width:240px;max-width:calc(100vw - 32px);background:#161616;border:1px solid #242424;padding:16px 38px 14px 16px;box-shadow:0 8px 28px rgba(0,0,0,.55);opacity:0;visibility:hidden;transform:translateY(10px);transition:opacity .22s ease-out,transform .22s ease-out,visibility 0s linear .22s}\
.ql-teaser.show{opacity:1;visibility:visible;transform:none;transition:opacity .22s ease-out,transform .22s ease-out,visibility 0s}\
.ql-teaser[hidden]{display:none}\
.ql-teaser-title{margin:0 0 12px;font-family:"Oswald",sans-serif;font-weight:400;font-size:.9rem;line-height:1.35;letter-spacing:.06em;text-transform:uppercase;color:#fff}\
.ql-teaser .ql-opt{box-shadow:none;white-space:nowrap;padding-left:14px;padding-right:14px}\
.ql-x{position:absolute;top:2px;right:2px;width:36px;height:36px;background:none;border:none;color:#8a8a8a;font-size:1.3rem;line-height:1;cursor:pointer}\
.ql-x:hover{color:#fff}\
.ql-x:focus-visible{outline:2px solid #C8C3BC;outline-offset:-2px}\
.ql-modal{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.72);opacity:0;visibility:hidden;transition:opacity .22s ease-out,visibility 0s linear .22s;font-family:"Inter",sans-serif}\
.ql-modal.show{opacity:1;visibility:visible;transition:opacity .22s ease-out,visibility 0s}\
.ql-dialog{position:relative;box-sizing:border-box;width:100%;max-width:440px;background:#161616;border:1px solid #242424;padding:44px 36px 32px;text-align:center;transform:translateY(12px);transition:transform .22s ease-out}\
.ql-modal.show .ql-dialog{transform:none}\
.ql-dialog-title{margin:0 0 24px;font-family:"Oswald",sans-serif;font-weight:400;font-size:1.7rem;line-height:1.2;letter-spacing:.04em;text-transform:uppercase;color:#fff}\
.ql-dialog .ql-opt{display:block;width:100%;box-shadow:none;padding:14px 22px}\
.ql-nothanks{display:inline-block;margin-top:14px;background:none;border:none;padding:10px 12px;cursor:pointer;font-family:"Inter",sans-serif;font-size:.7rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#8a8a8a}\
.ql-nothanks:hover{color:#fff}\
.ql-nothanks:focus-visible{outline:2px solid #C8C3BC;outline-offset:2px}\
@media (max-width:768px){.ql-btn,.ql-opt{padding:10px 16px;font-size:.66rem}.ql-teaser{width:200px;padding:12px 34px 12px 12px}.ql-teaser-title{font-size:.78rem;margin-bottom:10px}}\
@media (prefers-reduced-motion:reduce){.ql-btn,.ql-opt,.ql-opts,.ql.open .ql-opts,.ql-teaser,.ql-teaser.show,.ql-modal,.ql-modal.show,.ql-dialog{transition:none}.ql-opts,.ql-teaser,.ql-dialog{transform:none}.ql-btn.ql-pulse{animation:none}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var form = document.getElementById('contact');
  var quoteHref = form ? '#contact' : '/#contact';

  var root = document.createElement('div');
  root.className = 'ql';
  var HEADLINE = 'Dirty concrete ruining your kerb appeal?';
  root.innerHTML =
    '<div class="ql-teaser" role="region" aria-label="Quote offer" hidden>' +
      '<button type="button" class="ql-x" aria-label="Close">&times;</button>' +
      '<p class="ql-teaser-title">' + HEADLINE + '</p>' +
      '<button type="button" class="ql-opt" data-ql-teaser-cta>Get a free quote</button>' +
    '</div>' +
    '<div class="ql-opts" id="ql-opts">' +
      '<a class="ql-opt" href="' + quoteHref + '" data-ql-quote>Get a free quote</a>' +
      '<a class="ql-opt" href="tel:' + PHONE_RAW + '">Call ' + PHONE_DISPLAY + '</a>' +
      '<a class="ql-opt" href="sms:' + PHONE_RAW + '">Text us</a>' +
    '</div>' +
    '<button type="button" class="ql-btn" aria-expanded="false" aria-controls="ql-opts">Enquire</button>';
  document.body.appendChild(root);

  var btn = root.querySelector('.ql-btn');
  var opts = root.querySelector('.ql-opts');
  var isOpen = false;

  function setOpen(open, returnFocus) {
    isOpen = open;
    root.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) opts.removeAttribute('inert'); else opts.setAttribute('inert', '');
    if (!open && returnFocus) btn.focus();
  }
  setOpen(false);

  btn.addEventListener('click', function (e) {
    setOpen(!isOpen);
    if (isOpen && e.detail === 0) root.querySelector('.ql-opt').focus(); // keyboard activation
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) setOpen(false, true);
  });
  document.addEventListener('click', function (e) {
    if (isOpen && !root.contains(e.target)) setOpen(false);
  });

  root.querySelector('[data-ql-quote]').addEventListener('click', function (e) {
    setOpen(false);
    if (!form) return; // other pages follow the /#contact link
    e.preventDefault();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#contact');
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
    else { teaser.classList.remove('show'); setTimeout(function () { if (!teaserOn) teaser.hidden = true; }, 240); }
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
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

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

  // ── Exit-intent modal (desktop with a mouse only, once per visit) ──
  var fineHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 769px)');
  if (fineHover && fineHover.matches && !seen('cgb_exit')) {
    var modal = document.createElement('div');
    modal.className = 'ql-modal';
    modal.setAttribute('inert', '');
    modal.innerHTML =
      '<div class="ql-dialog" role="dialog" aria-modal="true" aria-labelledby="ql-modal-title">' +
        '<h2 class="ql-dialog-title" id="ql-modal-title">' + HEADLINE + '</h2>' +
        '<a class="ql-opt" href="' + quoteHref + '" data-ql-modal-cta>Get a free quote</a>' +
        '<button type="button" class="ql-nothanks">No thanks</button>' +
      '</div>';
    document.body.appendChild(modal);
    var modalOn = false;
    var lastFocus = null;
    var pageStart = Date.now();

    function setModal(show) {
      modalOn = show;
      modal.classList.toggle('show', show);
      if (show) {
        lastFocus = document.activeElement;
        modal.removeAttribute('inert');
        modal.querySelector('[data-ql-modal-cta]').focus();
      } else {
        modal.setAttribute('inert', '');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }
    }
    modal.querySelector('.ql-nothanks').addEventListener('click', function () { setModal(false); });
    modal.addEventListener('click', function (e) { if (e.target === modal) setModal(false); });
    document.addEventListener('keydown', function (e) {
      if (!modalOn) return;
      if (e.key === 'Escape') { setModal(false); return; }
      if (e.key === 'Tab') { // keep focus inside the dialog
        var f = modal.querySelectorAll('a,button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    modal.querySelector('[data-ql-modal-cta]').addEventListener('click', function (e) {
      lastFocus = null;
      setModal(false);
      if (!form) return;
      e.preventDefault();
      form.scrollIntoView({ behavior: reduceMotion && reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', '#contact');
    });

    document.addEventListener('mouseout', function (e) {
      if (e.relatedTarget || e.clientY > 0 || modalOn || seen('cgb_exit')) return;
      if (Date.now() - pageStart < 3000 || formInView) return; // ignore instant exits and visitors already at the form
      mark('cgb_exit');
      setTeaser(false);
      setOpen(false);
      setModal(true);
    });
  }
})();
