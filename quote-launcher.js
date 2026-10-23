/* Quote launcher: small round button (bottom-right) that opens a panel with three ways to get a quote.
   Never opens on its own. Hidden while the enquiry form is on screen. First-party, no dependencies. */
(function () {
  var PHONE_DISPLAY = '0414 438 169';
  var PHONE_RAW = '0414438169';

  var css = '\
.ql{position:fixed;right:16px;bottom:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:90;font-family:"Inter",sans-serif}\
.ql[hidden]{display:none}\
.ql-btn{width:48px;height:48px;border-radius:50%;border:1px solid rgba(8,8,8,.15);background:#fff;color:#080808;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.45);transition:background .2s,transform .15s}\
.ql-btn:hover{background:#C8C3BC}\
.ql-btn:active{transform:scale(.96)}\
.ql-btn:focus-visible,.ql-close:focus-visible,.ql-opt:focus-visible{outline:2px solid #C8C3BC;outline-offset:3px}\
.ql-btn svg{width:22px;height:22px}\
.ql-panel{position:absolute;right:0;bottom:60px;width:min(300px,calc(100vw - 32px));background:#161616;border:1px solid #242424;padding:20px 18px 18px;box-shadow:0 8px 32px rgba(0,0,0,.55)}\
.ql-panel[hidden]{display:none}\
.ql-title{font-size:.9rem;line-height:1.5;color:#E8E8E8;font-weight:400;margin:0 28px 14px 0}\
.ql-close{position:absolute;top:6px;right:6px;width:36px;height:36px;background:none;border:none;color:#8a8a8a;cursor:pointer;font-size:1.3rem;line-height:1}\
.ql-close:hover{color:#fff}\
.ql-opt{display:block;width:100%;box-sizing:border-box;margin:0 0 8px;padding:13px 14px;text-align:center;text-decoration:none;font-family:"Oswald",sans-serif;font-weight:400;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;background:none;border:1px solid #383838;color:#E8E8E8;cursor:pointer;transition:background .2s,color .2s,border-color .2s}\
.ql-opt:last-child{margin-bottom:0}\
.ql-opt:hover{border-color:#8a8a8a;color:#fff}\
.ql-opt-primary{background:#fff;border-color:#fff;color:#080808}\
.ql-opt-primary:hover{background:#C8C3BC;border-color:#C8C3BC;color:#080808}\
@media (prefers-reduced-motion:reduce){.ql-btn{transition:none}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var form = document.getElementById('contact');
  var quoteHref = form ? '#contact' : '/#contact';

  var root = document.createElement('div');
  root.className = 'ql';
  root.innerHTML =
    '<div class="ql-panel" id="ql-panel" role="dialog" aria-label="Get a quote" hidden>' +
      '<button type="button" class="ql-close" aria-label="Close">&times;</button>' +
      '<p class="ql-title">Need a free quote? Pick the easiest option:</p>' +
      '<a class="ql-opt ql-opt-primary" href="' + quoteHref + '" data-ql-quote>Get a free quote</a>' +
      '<a class="ql-opt" href="tel:' + PHONE_RAW + '">Call ' + PHONE_DISPLAY + '</a>' +
      '<a class="ql-opt" href="sms:' + PHONE_RAW + '">Text us</a>' +
    '</div>' +
    '<button type="button" class="ql-btn" aria-label="Get a free quote" aria-expanded="false" aria-controls="ql-panel">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12z"/></svg>' +
    '</button>';
  document.body.appendChild(root);

  var btn = root.querySelector('.ql-btn');
  var panel = root.querySelector('.ql-panel');

  function setOpen(open, returnFocus) {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) root.querySelector('.ql-opt').focus();
    else if (returnFocus) btn.focus();
  }

  btn.addEventListener('click', function () { setOpen(panel.hidden); });
  root.querySelector('.ql-close').addEventListener('click', function () { setOpen(false, true); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) setOpen(false, true);
  });
  document.addEventListener('click', function (e) {
    if (!panel.hidden && !root.contains(e.target)) setOpen(false);
  });

  root.querySelector('[data-ql-quote]').addEventListener('click', function (e) {
    setOpen(false);
    if (!form) return; // other pages follow the /#contact link
    e.preventDefault();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#contact');
  });

  // Hide the launcher while the enquiry form is in view.
  if (form && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible) setOpen(false);
      root.hidden = visible;
    }, { threshold: 0 }).observe(form.querySelector('form') || form);
  }
})();
