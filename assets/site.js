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

  // Human / AI process toggle on automations pages
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.lj-mode-btn');
    if (!btn) return;
    var group = btn.closest('.lj-mode-toggle');
    var list = document.querySelector('.lj-cat-list');
    if (!group || !list) return;
    var buttons = group.querySelectorAll('.lj-mode-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('is-active');
      buttons[i].setAttribute('aria-pressed', 'false');
    }
    btn.classList.add('is-active');
    btn.setAttribute('aria-pressed', 'true');
    list.classList.toggle('lj-view-human', btn.getAttribute('data-lj-mode') === 'human');
  });

  // Expand / collapse every automation on an industry page at once
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.lj-expand-all');
    if (!btn) return;
    var list = document.querySelector('.lj-cat-list');
    if (!list) return;
    var items = list.querySelectorAll('.lj-cat-item');
    var expand = btn.getAttribute('data-state') !== 'expanded';
    for (var i = 0; i < items.length; i++) {
      items[i].open = expand;
    }
    btn.setAttribute('data-state', expand ? 'expanded' : 'collapsed');
    btn.textContent = expand ? 'Collapse All' : 'Expand All';
  });

  // Briefly highlight a solution card when arriving via a #anchor link
  if (window.location.hash) {
    var target = document.querySelector('.lj-sol-item' + window.location.hash);
    if (target) {
      target.classList.add('lj-sol-highlight');
      target.addEventListener('animationend', function () {
        target.classList.remove('lj-sol-highlight');
      }, { once: true });
    }
  }
})();
