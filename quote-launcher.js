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
@media (max-width:768px){.ql-btn,.ql-opt{padding:10px 16px;font-size:.66rem}}\
@media (prefers-reduced-motion:reduce){.ql-btn,.ql-opt,.ql-opts,.ql.open .ql-opts{transition:none}.ql-opts{transform:none}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var form = document.getElementById('contact');
  var quoteHref = form ? '#contact' : '/#contact';

  var root = document.createElement('div');
  root.className = 'ql';
  root.innerHTML =
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

  // Visibility: hidden while the form is in view; on desktop also hidden until past the hero.
  var formInView = false;
  var pastHero = true;
  var desktop = window.matchMedia ? window.matchMedia('(min-width: 769px)') : { matches: false };
  var hero = document.querySelector('main > section, main > header');

  function update() {
    var hide = formInView || (desktop.matches && !pastHero);
    if (hide && isOpen) setOpen(false);
    root.hidden = hide;
  }
  function checkHero() {
    var bottom = hero ? hero.getBoundingClientRect().bottom : window.innerHeight;
    pastHero = bottom <= 0;
    update();
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; checkHero(); });
  }, { passive: true });
  window.addEventListener('resize', checkHero);

  if (form && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      formInView = entries[0].isIntersecting;
      update();
    }, { threshold: 0 }).observe(form.querySelector('form') || form);
  }
  checkHero();
})();
