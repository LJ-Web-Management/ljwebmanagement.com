(function () {
  'use strict';

  /* Sticky nav hairline: only appears once content actually scrolls beneath it */
  var nav = document.getElementById('siteNav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();

/* ---------- FAQ accordion: opens on hover (mouse/trackpad devices only) ---------- */
(function () {
  'use strict';
  var items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  var supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  items.forEach(function (item) {
    item.open = false;
    if (!supportsHover) return; // touch devices keep the native tap-to-toggle behavior
    item.addEventListener('mouseenter', function () { item.open = true; });
    item.addEventListener('mouseleave', function () { item.open = false; });
    var summary = item.querySelector('summary');
    if (summary) summary.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();

/* ---------- Course catalog (courses/index.html) ---------- */
(function () {
  'use strict';
  var grid = document.getElementById('courseGrid');
  if (!grid) return;

  var state = { category: 'All', query: '' };
  var data = null;

  var segWrap = document.getElementById('catalogSeg');
  var searchInput = document.getElementById('catalogSearch');
  var countEl = document.getElementById('catalogCount');
  var scrim = document.getElementById('courseModalScrim');
  var sheet = document.getElementById('courseModalSheet');

  function levelClass(level) {
    return 'is-level-' + level.toLowerCase();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderSegments() {
    var cats = ['All'].concat(data.categories);
    segWrap.innerHTML = cats.map(function (c) {
      return '<button type="button" data-cat="' + escapeHtml(c) + '" class="' + (c === state.category ? 'active' : '') + '">' + escapeHtml(c) + '</button>';
    }).join('');
  }

  function matches(course) {
    var inCategory = state.category === 'All' || course.category === state.category;
    var q = state.query.trim().toLowerCase();
    var inQuery = !q || (course.title + ' ' + course.summary + ' ' + course.category).toLowerCase().indexOf(q) !== -1;
    return inCategory && inQuery;
  }

  function renderGrid() {
    var list = data.courses.filter(matches);
    countEl.textContent = list.length + (list.length === 1 ? ' course' : ' courses');
    if (!list.length) {
      grid.innerHTML = '<div class="course-empty">No courses match that search. Try a different keyword or category.</div>';
      return;
    }
    grid.innerHTML = list.map(function (c) {
      return (
        '<button type="button" class="course-card" data-slug="' + escapeHtml(c.slug) + '">' +
          '<div class="course-card-top">' +
            '<span class="tag">' + escapeHtml(c.category) + '</span>' +
            '<span class="tag ' + levelClass(c.level) + '">' + escapeHtml(c.level) + '</span>' +
          '</div>' +
          '<h3>' + escapeHtml(c.title) + '</h3>' +
          '<p class="summary">' + escapeHtml(c.summary) + '</p>' +
          '<div class="course-meta">' + escapeHtml(c.duration) + ' &middot; Self-paced</div>' +
          '<div class="course-card-bottom">' +
            '<span class="course-price font-num">$' + c.price + '</span>' +
            '<span class="tag is-accent">View course</span>' +
          '</div>' +
        '</button>'
      );
    }).join('');
  }

  function openModal(course) {
    sheet.innerHTML =
      '<button type="button" class="modal-close" id="courseModalClose" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<h2>' + escapeHtml(course.title) + '</h2>' +
      '<div class="modal-tags">' +
        '<span class="tag">' + escapeHtml(course.category) + '</span>' +
        '<span class="tag ' + levelClass(course.level) + '">' + escapeHtml(course.level) + '</span>' +
        '<span class="tag">' + escapeHtml(course.duration) + '</span>' +
      '</div>' +
      '<p class="desc">' + escapeHtml(course.description) + '</p>' +
      '<h4>What you\'ll learn</h4>' +
      '<ul class="outcome-list">' +
        course.outcomes.map(function (o) {
          return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' + escapeHtml(o) + '</li>';
        }).join('') +
      '</ul>' +
      '<div class="modal-enroll">' +
        '<h4>Enroll &middot; $' + course.price + '</h4>' +
        '<a href="../appointment" class="btn btn-primary btn-block">Book an Appointment</a>' +
        '<p class="modal-buy-note">Book a quick appointment and we\'ll get your payment link and course access set up.</p>' +
      '</div>';
    scrim.classList.add('open');
    scrim.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('courseModalClose').addEventListener('click', closeModal);
  }

  function closeModal() {
    scrim.classList.remove('open');
    scrim.setAttribute('aria-hidden', 'true');
    document.body.style.removeProperty('overflow');
  }

  scrim.addEventListener('click', function (e) { if (e.target === scrim) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.course-card');
    if (!card) return;
    var course = data.courses.filter(function (c) { return c.slug === card.getAttribute('data-slug'); })[0];
    if (course) openModal(course);
  });

  segWrap.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    state.category = btn.getAttribute('data-cat');
    renderSegments();
    renderGrid();
  });

  searchInput.addEventListener('input', function () {
    state.query = searchInput.value;
    renderGrid();
  });

  function injectCourseSchema(courses) {
    var itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListElement': courses.map(function (c, i) {
        return {
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'Course',
            'name': c.title,
            'description': c.description,
            'url': 'https://www.ljwebmanagement.com/courses#' + c.slug,
            'provider': {
              '@type': 'EducationalOrganization',
              '@id': 'https://www.ljwebmanagement.com/#organization',
              'name': 'LJ Web Management',
              'url': 'https://www.ljwebmanagement.com/'
            },
            'educationalLevel': c.level,
            'timeRequired': c.duration,
            'offers': {
              '@type': 'Offer',
              'price': c.price,
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock',
              'category': 'Paid'
            }
          }
        };
      })
    };
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(itemList);
    document.head.appendChild(script);
  }

  fetch('/assets/courses-data.json')
    .then(function (r) { return r.json(); })
    .then(function (json) {
      data = json;
      renderSegments();
      renderGrid();
      injectCourseSchema(json.courses);

      var hash = decodeURIComponent(window.location.hash.replace('#', ''));
      if (hash) {
        var match = data.courses.filter(function (c) { return c.slug === hash; })[0];
        if (match) openModal(match);
      }
    })
    .catch(function () {
      grid.innerHTML = '<div class="course-empty">Courses failed to load. Please refresh the page.</div>';
    });
})();
