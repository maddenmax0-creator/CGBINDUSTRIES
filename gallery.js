/* Gallery lightbox for the photo grid: arrows, swipe, Esc, focus handling via CGBUI.modal (see /ui.js).
   Each .photo link points at the full-size image, so the grid still works without JavaScript. */
(function () {
  var tiles = Array.prototype.slice.call(document.querySelectorAll('#photo-grid .photo'));
  if (!tiles.length || !window.CGBUI) return;

  var ARROW = function (d) { return '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="' + d + '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };
  var el = document.createElement('div');
  el.className = 'ui-modal ui-lightbox';
  el.innerHTML =
    '<div class="ui-dialog" role="dialog" aria-modal="true" aria-label="Photo gallery">' +
      '<div class="lb-stage" data-backdrop><img class="lb-img" alt="" draggable="false" /></div>' +
      '<button type="button" class="lb-btn lb-close" data-modal-close data-autofocus aria-label="Close gallery">' + ARROW('M4 4l10 10M14 4 4 14') + '</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">' + ARROW('M11 3 5 9l6 6') + '</button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Next photo">' + ARROW('M7 3l6 6-6 6') + '</button>' +
      '<div class="lb-meta"><div class="lb-count" aria-live="polite"></div><p class="lb-cap"></p></div>' +
    '</div>';
  document.body.appendChild(el);

  var img = el.querySelector('.lb-img');
  var count = el.querySelector('.lb-count');
  var cap = el.querySelector('.lb-cap');
  var idx = 0;
  var modal = CGBUI.modal(el, { onClose: function () { if (tiles[idx]) tiles[idx].focus(); } });

  function preload(i) { var n = tiles.length; var p = new Image(); p.src = tiles[(i + n) % n].href; }

  function show(i, dir) {
    var n = tiles.length;
    idx = (i + n) % n;
    var t = tiles[idx];
    var thumb = t.querySelector('img');
    var swap = function () {
      img.src = t.href;
      img.alt = thumb ? thumb.alt : '';
      img.width = +t.dataset.w || 0;
      img.height = +t.dataset.h || 0;
      count.textContent = (idx + 1) + ' / ' + n;
      cap.textContent = t.dataset.caption || '';
      img.classList.remove('is-dragging');
      img.style.transform = dir ? 'translateX(' + (dir * 32) + 'px)' : '';
      requestAnimationFrame(function () { requestAnimationFrame(function () { img.classList.remove('is-out'); img.style.transform = ''; }); });
    };
    if (!dir) { swap(); } else {
      img.classList.add('is-out');
      setTimeout(swap, CGBUI.reducedMotion() ? 0 : 120);
    }
    preload(idx + 1); preload(idx - 1);
  }
  function step(d) { show(idx + d, d); }

  tiles.forEach(function (t, i) {
    t.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; // let "open in new tab" through
      e.preventDefault();
      show(i, 0);
      modal.open(t);
    });
  });
  el.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
  el.querySelector('.lb-next').addEventListener('click', function () { step(1); });
  document.addEventListener('keydown', function (e) {
    if (!modal.isOpen) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  // Swipe: drag the photo sideways, release past 50px to change photo
  var stage = el.querySelector('.lb-stage');
  var sx = 0, sy = 0, dx = 0, tracking = false, horizontal = false;
  stage.addEventListener('pointerdown', function (e) {
    if (e.button) return;
    tracking = true; horizontal = false; sx = e.clientX; sy = e.clientY; dx = 0;
  });
  stage.addEventListener('pointermove', function (e) {
    if (!tracking) return;
    dx = e.clientX - sx;
    if (!horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - sy)) {
      horizontal = true;
      img.classList.add('is-dragging');
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    }
    if (horizontal) img.style.transform = 'translateX(' + dx + 'px)';
  });
  function end() {
    if (!tracking) return;
    tracking = false;
    img.classList.remove('is-dragging');
    if (horizontal && Math.abs(dx) > 50) { step(dx < 0 ? 1 : -1); } else { img.style.transform = ''; }
    if (horizontal) stage.addEventListener('click', swallow, { capture: true, once: true }); // a drag must not count as a backdrop click
    horizontal = false;
  }
  function swallow(e) { e.stopPropagation(); }
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
})();
