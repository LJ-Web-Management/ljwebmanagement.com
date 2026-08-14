(function () {
  'use strict';

  function closeOffcanvas(el) {
    if (!el || !el.classList.contains('show')) return;
    el.classList.add('hiding');
    el.classList.remove('show');
    el.setAttribute('aria-hidden', 'true');
    el.removeAttribute('aria-modal');
    el.removeAttribute('role');
    var backdrop = document.querySelector('.offcanvas-backdrop');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.removeProperty('overflow');
    var toggler = document.querySelector('[data-bs-toggle="offcanvas"][data-bs-target="#' + el.id + '"]');
    window.setTimeout(function () {
      el.classList.remove('hiding');
      if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      if (toggler) toggler.focus();
    }, 300);
  }

  function openOffcanvas(el) {
    if (!el || el.classList.contains('show')) return;
    var backdrop = document.createElement('div');
    backdrop.className = 'offcanvas-backdrop fade';
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    el.classList.add('showing');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('role', 'dialog');
    el.removeAttribute('aria-hidden');
    // force a reflow so the browser commits the pre-show state before we
    // flip to .show, otherwise the transform/opacity transitions don't run
    void el.offsetHeight;
    void backdrop.offsetHeight;
    backdrop.classList.add('show');
    el.classList.remove('showing');
    el.classList.add('show');
    var closeBtn = el.querySelector('[data-bs-dismiss="offcanvas"]');
    if (closeBtn) closeBtn.focus();
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-bs-toggle="offcanvas"]');
    if (toggle) {
      var target = document.querySelector(toggle.getAttribute('data-bs-target'));
      openOffcanvas(target);
      return;
    }
    var dismiss = e.target.closest('[data-bs-dismiss="offcanvas"]');
    if (dismiss) {
      closeOffcanvas(dismiss.closest('.offcanvas'));
      return;
    }
    if (e.target.classList.contains('offcanvas-backdrop')) {
      closeOffcanvas(document.querySelector('.offcanvas.show'));
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeOffcanvas(document.querySelector('.offcanvas.show'));
    }
  });
})();
