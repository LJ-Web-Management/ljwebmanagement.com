/* LJ Web Management interactive tools (main site only).
   Calculators, quizzes and assessments, course progress, the automation
   priority scorer and copy buttons. Pages opt in with data attributes; the
   markup comes from build/pages/tools.js, quizzes.js and learn.js. */
(function () {
  'use strict';

  var doc = document;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  // localStorage wrapper: store(key) reads, store(key, value) writes,
  // store(key, null) removes. Private windows and blocked storage fail quietly.
  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      return null;
    }
    return null;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var ARROW = '<svg class="lj-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';

  var fmt = {
    usd: function (n) { return (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US'); },
    usdc: function (n) {
      var digits = Math.abs(n) < 0.1 ? 4 : 2;
      return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: digits });
    },
    num: function (n) { return Math.round(n).toLocaleString('en-US'); },
    num1: function (n) { return n.toLocaleString('en-US', { maximumFractionDigits: 1 }); },
    pct: function (n) { return Math.round(n) + '%'; },
    min: function (n) { return Math.round(n) + ' min'; },
    hrs: function (n) { return n.toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' hrs'; },
    days: function (n) { return Math.round(n) + (Math.round(n) === 1 ? ' day' : ' days'); },
    raw: function (n) { return String(n); }
  };

  /* ---------- Calculators ---------- */

  var PER_YEAR = { day: 250, week: 52, month: 12 };
  var CALCS = {
    'time-savings': function (v) {
      var runs = v.times * (PER_YEAR[v.per] || 52) * v.people;
      var hours = runs * v.minutes / 60;
      var saved = hours * v.share / 100;
      var money = saved * v.rate;
      return {
        moneyYear: fmt.usd(money),
        moneyMonth: fmt.usd(money / 12) + ' per month',
        hoursNow: fmt.num(hours),
        hoursSaved: fmt.num(saved),
        daysSaved: fmt.num(saved / 8),
        runs: fmt.num(runs),
        threeYear: fmt.usd(money * 3)
      };
    },
    'lead-response': function (v) {
      var deals = v.leads * v.close / 100;
      var newClose = Math.min(100, v.close * (1 + v.lift / 100));
      var newDeals = v.leads * newClose / 100;
      var extra = (newDeals - deals) * v.value;
      return {
        extraYear: fmt.usd(extra * 12),
        extraMonth: fmt.usd(extra) + ' per month',
        dealsNow: fmt.num1(deals),
        dealsNew: fmt.num1(newDeals),
        closeNew: newClose.toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%',
        perPoint: fmt.usd(v.leads * v.value * 0.01 * 12)
      };
    },
    'no-show': function (v) {
      var perYear = v.appts * 52;
      var missed = perYear * v.rate / 100;
      var lost = missed * v.value;
      var recovered = lost * v.cut / 100;
      var callHours = perYear * v.callMin / 60;
      return {
        recoveredYear: fmt.usd(recovered),
        recoveredMonth: fmt.usd(recovered / 12) + ' per month',
        lostNow: fmt.usd(lost),
        missedNow: fmt.num(missed),
        missedNew: fmt.num(missed * (1 - v.cut / 100)),
        callHours: fmt.num(callHours)
      };
    },
    'late-payment': function (v) {
      var daily = v.revenue * 12 / 365;
      var tied = daily * v.days;
      var freed = daily * Math.max(0, v.days - v.target);
      var chase = v.chase * 52 * v.rate;
      return {
        freed: fmt.usd(freed),
        tiedNow: fmt.usd(tied),
        tiedNew: fmt.usd(daily * Math.min(v.days, v.target)),
        financing: fmt.usd(freed * v.interest / 100),
        chaseCost: fmt.usd(chase),
        chaseHours: fmt.num(v.chase * 52)
      };
    },
    'ai-cost': function (v) {
      var tokIn = v.wordsIn / 0.75;
      var tokOut = v.wordsOut / 0.75;
      var perReq = tokIn / 1e6 * v.priceIn + tokOut / 1e6 * v.priceOut;
      var month = perReq * v.perDay * v.days;
      var human = v.humanMin / 60 * v.rate * v.perDay * v.days;
      return {
        month: month < 100 ? fmt.usdc(month) : fmt.usd(month),
        perRequest: fmt.usdc(perReq),
        tokens: fmt.num(tokIn + tokOut),
        year: month * 12 < 100 ? fmt.usdc(month * 12) : fmt.usd(month * 12),
        human: fmt.usd(human),
        ratio: month > 0 ? fmt.num(human / month) + 'x' : 'n/a'
      };
    },
    'payback': function (v) {
      var monthly = v.hours * v.rate + v.revenue - v.running;
      var months = monthly > 0 ? v.build / monthly : Infinity;
      var first = monthly * 12 - v.build;
      var three = monthly * 36 - v.build;
      var invested = v.build + v.running * 36;
      return {
        payback: isFinite(months) ? (months < 1 ? 'Under 1 month' : fmt.num1(months) + ' months') : 'Does not pay back',
        monthly: fmt.usd(monthly) + ' net benefit per month',
        firstYear: fmt.usd(first),
        threeYear: fmt.usd(three),
        roi: invested > 0 ? fmt.num((monthly * 36 + v.running * 36 - invested) / invested * 100) + '%' : 'n/a'
      };
    }
  };

  $$('[data-lj-calc]').forEach(function (form) {
    var calc = CALCS[form.getAttribute('data-lj-calc')];
    if (!calc) return;
    var inputs = $$('input, select', form);
    var update = function () {
      var v = {};
      inputs.forEach(function (el) {
        var n = parseFloat(el.value);
        v[el.name] = el.tagName === 'SELECT' && isNaN(n) ? el.value : (isNaN(n) ? 0 : n);
        var out = $('[data-lj-show="' + el.name + '"]', form);
        if (out) out.textContent = (fmt[el.getAttribute('data-fmt')] || fmt.raw)(v[el.name]);
      });
      var res = calc(v);
      Object.keys(res).forEach(function (k) {
        $$('[data-out="' + k + '"]', form).forEach(function (el) { el.textContent = res[k]; });
      });
    };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    update();
  });

  /* ---------- Quizzes and assessments ---------- */

  function scrollIntoViewIfNeeded(el) {
    var r = el.getBoundingClientRect();
    if (r.top < 80 || r.top > window.innerHeight * 0.6) {
      var y = window.pageYOffset + r.top - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  function resultScore(cfg, answers) {
    var total = 0;
    var max = 0;
    var dims = {};
    cfg.questions.forEach(function (q, i) {
      var top = Math.max.apply(null, q.options.map(function (o) { return o.s; }));
      var got = answers[i] == null ? 0 : q.options[answers[i]].s;
      total += got;
      max += top;
      if (q.dim) {
        dims[q.dim] = dims[q.dim] || { got: 0, max: 0 };
        dims[q.dim].got += got;
        dims[q.dim].max += top;
      }
    });
    var pct = Math.round(total / max * 100);
    var band = cfg.bands.filter(function (b) { return pct >= b.min; }).pop();
    var areas = (cfg.dims || []).map(function (d) {
      var s = dims[d.key] || { got: 0, max: 1 };
      return { d: d, pct: Math.round(s.got / s.max * 100) };
    });
    var weakest = areas.slice().sort(function (a, b) { return a.pct - b.pct; }).slice(0, 2);
    return '<div class="lj-result-head">' +
      '<div class="lj-score-ring" style="--p:' + pct + '"><strong>' + pct + '</strong><span>out of 100</span></div>' +
      '<div><span class="lj-eyebrow">Your result</span><h2>' + esc(band.title) + '</h2><p>' + band.text + '</p></div></div>' +
      (areas.length ? '<h3 class="lj-result-sub">Your score by area</h3><ul class="lj-bars">' + areas.map(function (a) {
        return '<li><span>' + esc(a.d.name) + '</span><span class="lj-bar"><span style="width:' + a.pct + '%"></span></span><strong>' + a.pct + '%</strong></li>';
      }).join('') + '</ul>' +
      '<h3 class="lj-result-sub">Where to focus next</h3><div class="lj-result-tips">' + weakest.map(function (a) {
        return '<div class="lj-result-tip"><strong>' + esc(a.d.name) + '</strong><p>' + a.d.advice + '</p>' +
          (a.d.link ? '<a class="lj-link-arrow" href="' + a.d.link[1] + '">' + esc(a.d.link[0]) + ' ' + ARROW + '</a>' : '') + '</div>';
      }).join('') + '</div>' : '') +
      ctaRow(band.cta);
  }

  function resultKnowledge(cfg, answers) {
    var right = 0;
    var missed = [];
    cfg.questions.forEach(function (q, i) {
      if (answers[i] === q.answer) right += 1;
      else missed.push(q);
    });
    var pct = Math.round(right / cfg.questions.length * 100);
    var band = cfg.bands.filter(function (b) { return pct >= b.min; }).pop();
    var review = [];
    missed.forEach(function (q) {
      if (q.link && review.every(function (r) { return r[1] !== q.link[1]; })) review.push(q.link);
    });
    return '<div class="lj-result-head">' +
      '<div class="lj-score-ring" style="--p:' + pct + '"><strong>' + right + '/' + cfg.questions.length + '</strong><span>correct</span></div>' +
      '<div><span class="lj-eyebrow">Your result</span><h2>' + esc(band.title) + '</h2><p>' + band.text + '</p></div></div>' +
      (review.length ? '<h3 class="lj-result-sub">Brush up on what you missed</h3><ul class="lj-result-links">' + review.slice(0, 5).map(function (l) {
        return '<li><a class="lj-link-arrow" href="' + l[1] + '">' + esc(l[0]) + ' ' + ARROW + '</a></li>';
      }).join('') + '</ul>' : '') +
      ctaRow(band.cta);
  }

  function resultPicker(cfg, answers) {
    var totals = {};
    var max = {};
    Object.keys(cfg.outcomes).forEach(function (k) { totals[k] = 0; max[k] = 0; });
    cfg.questions.forEach(function (q, i) {
      Object.keys(cfg.outcomes).forEach(function (k) {
        max[k] += Math.max.apply(null, q.options.map(function (o) { return (o.w && o.w[k]) || 0; }));
      });
      if (answers[i] == null) return;
      var w = q.options[answers[i]].w || {};
      Object.keys(w).forEach(function (k) { totals[k] += w[k]; });
    });
    var ranked = Object.keys(cfg.outcomes).sort(function (a, b) { return totals[b] / max[b] - totals[a] / max[a]; });
    var card = function (k, label) {
      var o = cfg.outcomes[k];
      var pct = Math.round(totals[k] / max[k] * 100);
      return '<div class="lj-result-tip' + (label === 'Best match' ? ' lj-result-tip--top' : '') + '"><span class="lj-tag lj-tag--cyan">' + label + ' &middot; ' + pct + '% fit</span><strong>' + esc(o.name) + '</strong><p>' + o.text + '</p>' +
        (o.link ? '<a class="lj-link-arrow" href="' + o.link[1] + '">' + esc(o.link[0]) + ' ' + ARROW + '</a>' : '') + '</div>';
    };
    return '<div class="lj-result-head lj-result-head--plain"><div><span class="lj-eyebrow">Your result</span><h2>' + esc(cfg.resultTitle || 'Your best fit') + '</h2><p>' + (cfg.resultText || '') + '</p></div></div>' +
      '<div class="lj-result-tips">' + card(ranked[0], 'Best match') + card(ranked[1], 'Runner-up') + '</div>' +
      ctaRow(cfg.cta);
  }

  function ctaRow(cta) {
    return '<div class="lj-btn-row lj-result-actions">' + (cta || []).map(function (c, i) {
      return '<a class="lj-btn ' + (i === 0 ? 'lj-btn-primary' : 'lj-btn-ghost') + '" href="' + c[1] + '">' + esc(c[0]) + (i === 0 ? ' ' + ARROW : '') + '</a>';
    }).join('') + '<button type="button" class="lj-quiz-retake" data-lj-quiz-retake>Retake</button></div>';
  }

  $$('[data-lj-quiz]').forEach(function (root) {
    var data = $('script[type="application/json"]', root);
    if (!data) return;
    var cfg = JSON.parse(data.textContent);
    var steps = $$('.lj-quiz-step', root);
    var n = cfg.questions.length;
    var bar = $('.lj-progress-bar', root);
    var back = $('[data-lj-quiz-back]', root);
    var counter = $('[data-lj-quiz-count]', root);
    var top = $('.lj-quiz-top', root);
    var result = $('[data-lj-quiz-result]', root);
    var answers = [];
    var cur = 0;

    function go(i, focus) {
      cur = i;
      steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      if (bar) bar.style.width = Math.round(Math.min(i, n) / n * 100) + '%';
      if (back) back.hidden = i === 0 || i > n;
      if (top) top.hidden = i === 0 || i > n;
      if (counter) counter.textContent = i > 0 && i <= n ? 'Question ' + i + ' of ' + n : '';
      if (focus !== false) {
        var h = $('h2, legend', steps[i]);
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        scrollIntoViewIfNeeded(root);
      }
    }

    function finish() {
      var html = cfg.type === 'knowledge' ? resultKnowledge(cfg, answers) : cfg.type === 'picker' ? resultPicker(cfg, answers) : resultScore(cfg, answers);
      result.innerHTML = html;
      go(n + 1);
    }

    function next() {
      if (cur >= n) finish();
      else go(cur + 1);
    }

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-lj-quiz-start]')) { go(1); return; }
      if (e.target.closest('[data-lj-quiz-next]')) { next(); return; }
      if (e.target.closest('[data-lj-quiz-back]')) { go(Math.max(0, cur - 1)); return; }
      if (e.target.closest('[data-lj-quiz-retake]')) {
        answers = [];
        $$('.lj-quiz-opt', root).forEach(function (b) {
          b.classList.remove('is-picked', 'is-correct', 'is-wrong');
          b.disabled = false;
          b.setAttribute('aria-pressed', 'false');
        });
        $$('[data-lj-quiz-feedback]', root).forEach(function (f) { f.hidden = true; f.innerHTML = ''; });
        $$('[data-lj-quiz-next]', root).forEach(function (b) { b.hidden = true; });
        go(1);
        return;
      }
      var opt = e.target.closest('.lj-quiz-opt');
      if (!opt || opt.disabled) return;
      var step = opt.closest('.lj-quiz-step');
      var qi = parseInt(step.getAttribute('data-q'), 10);
      var oi = parseInt(opt.getAttribute('data-o'), 10);
      var q = cfg.questions[qi];
      var opts = $$('.lj-quiz-opt', step);
      answers[qi] = oi;
      if (cfg.type === 'knowledge') {
        var ok = oi === q.answer;
        opts.forEach(function (b, j) {
          b.disabled = true;
          if (j === q.answer) b.classList.add('is-correct');
          if (j === oi && !ok) b.classList.add('is-wrong');
        });
        var fb = $('[data-lj-quiz-feedback]', step);
        fb.innerHTML = '<strong>' + (ok ? 'Correct.' : 'Not quite.') + '</strong> ' + q.why;
        fb.className = 'lj-quiz-feedback ' + (ok ? 'is-right' : 'is-wrong');
        fb.hidden = false;
        var nb = $('[data-lj-quiz-next]', step);
        nb.hidden = false;
        nb.focus({ preventScroll: true });
      } else {
        opts.forEach(function (b) {
          b.classList.toggle('is-picked', b === opt);
          b.setAttribute('aria-pressed', b === opt ? 'true' : 'false');
        });
        setTimeout(next, 220);
      }
    });

    go(0, false);
  });

  /* ---------- Course progress ---------- */

  var LEARN_KEY = 'lj-learn';
  var progress = store(LEARN_KEY) || {};

  // Course outlines and lesson lists: tick finished lessons, fill the
  // progress bar and point the start button at the next unfinished lesson.
  function refreshCourses() {
    $$('[data-lj-course]').forEach(function (course) {
      var items = $$('[data-lj-lesson-item]', course);
      var count = 0;
      var nextUrl = null;
      items.forEach(function (li) {
        var url = li.getAttribute('data-lj-lesson-item');
        var isDone = !!progress[url];
        li.classList.toggle('is-done', isDone);
        if (isDone) count += 1;
        else if (!nextUrl) nextUrl = url;
      });
      if (!items.length) return;
      var text = $('[data-lj-progress-text]', course);
      var bar = $('[data-lj-progress-fill]', course);
      var cont = $('[data-lj-continue]', course);
      if (text) text.textContent = count === items.length ? 'Course complete. Nice work!' : count + ' of ' + items.length + ' lessons complete';
      if (bar) bar.style.width = Math.round(count / items.length * 100) + '%';
      if (cont && count > 0 && nextUrl) {
        cont.href = nextUrl;
        cont.firstChild.textContent = 'Continue the course ';
      }
    });
  }

  $$('[data-lj-lesson]').forEach(function (lesson) {
    var url = lesson.getAttribute('data-lj-lesson');
    var qs = $$('.lj-check-q', lesson);
    var done = $('[data-lj-lesson-done]', lesson);
    var markBtn = $('[data-lj-complete]', lesson);
    var answered = 0;
    var correct = 0;

    function complete() {
      progress[url] = 1;
      store(LEARN_KEY, progress);
      if (done) done.hidden = false;
      if (markBtn) markBtn.hidden = true;
      refreshCourses();
    }
    if (progress[url]) complete();

    qs.forEach(function (q) {
      var answer = parseInt(q.getAttribute('data-answer'), 10);
      var opts = $$('.lj-quiz-opt', q);
      var why = $('.lj-check-why', q);
      opts.forEach(function (b, j) {
        b.addEventListener('click', function () {
          if (b.disabled) return;
          var ok = j === answer;
          opts.forEach(function (o, k) {
            o.disabled = true;
            if (k === answer) o.classList.add('is-correct');
            if (k === j && !ok) o.classList.add('is-wrong');
          });
          if (why) {
            why.hidden = false;
            why.className = 'lj-check-why lj-quiz-feedback ' + (ok ? 'is-right' : 'is-wrong');
            why.insertAdjacentHTML('afterbegin', '<strong>' + (ok ? 'Correct.' : 'Not quite.') + '</strong> ');
          }
          answered += 1;
          if (ok) correct += 1;
          if (answered === qs.length) {
            var score = $('[data-lj-check-score]', lesson);
            if (score) score.textContent = 'You got ' + correct + ' of ' + qs.length + ' right.';
            complete();
          }
        });
      });
    });
    if (markBtn) markBtn.addEventListener('click', complete);
  });

  refreshCourses();

  /* ---------- Automation priority scorer ---------- */

  $$('[data-lj-scorer]').forEach(function (root) {
    var KEY = 'lj-scorer';
    var body = $('tbody', root);
    var tpl = $('template', root);
    var rank = $('[data-lj-scorer-rank]', root);
    var factors = $$('thead th[data-factor]', root).length;

    function rows() { return $$('tr', body); }

    function read() {
      return rows().map(function (tr) {
        return {
          name: $('input', tr).value,
          s: $$('select', tr).map(function (s) { return parseInt(s.value, 10); })
        };
      });
    }

    function render() {
      var data = read();
      rows().forEach(function (tr, i) {
        var total = data[i].s.reduce(function (a, b) { return a + b; }, 0);
        var cell = $('[data-total]', tr);
        cell.textContent = total;
        cell.className = total >= 18 ? 'is-high' : total >= 13 ? 'is-mid' : 'is-low';
      });
      var named = data.map(function (d, i) { return { name: d.name.trim() || 'Task ' + (i + 1), total: d.s.reduce(function (a, b) { return a + b; }, 0) }; });
      named.sort(function (a, b) { return b.total - a.total; });
      rank.innerHTML = named.map(function (d, i) {
        var label = d.total >= 18 ? 'Automate first' : d.total >= 13 ? 'Good candidate' : 'Not yet';
        var cls = d.total >= 18 ? 'is-high' : d.total >= 13 ? 'is-mid' : 'is-low';
        return '<li class="' + cls + '"><span class="lj-rank-n">' + (i + 1) + '</span><span class="lj-rank-name">' + esc(d.name) + '</span><span class="lj-rank-score">' + d.total + '/' + factors * 5 + '</span><span class="lj-rank-label">' + label + '</span></li>';
      }).join('');
      store(KEY, data);
    }

    function addRow(d) {
      var tr = tpl.content.firstElementChild.cloneNode(true);
      if (d) {
        $('input', tr).value = d.name;
        $$('select', tr).forEach(function (s, i) { if (d.s[i]) s.value = d.s[i]; });
      }
      body.appendChild(tr);
      return tr;
    }

    var saved = store(KEY);
    var initial = saved && saved.length ? saved : JSON.parse(root.getAttribute('data-lj-scorer'));
    initial.forEach(addRow);

    root.addEventListener('input', render);
    root.addEventListener('change', render);
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-lj-scorer-add]')) {
        var tr = addRow();
        render();
        $('input', tr).focus();
      } else if (e.target.closest('[data-lj-scorer-remove]')) {
        if (rows().length > 1) e.target.closest('tr').remove();
        render();
      } else if (e.target.closest('[data-lj-scorer-reset]')) {
        store(KEY, null);
        body.innerHTML = '';
        JSON.parse(root.getAttribute('data-lj-scorer')).forEach(addRow);
        render();
      }
    });
    render();
  });

  /* ---------- Copy buttons ---------- */

  $$('[data-lj-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = doc.getElementById(btn.getAttribute('data-lj-copy'));
      if (!target) return;
      var text = target.innerText.trim();
      var label = $('span', btn) || btn;
      var original = label.textContent;
      var done = function () {
        label.textContent = 'Copied';
        btn.classList.add('is-copied');
        setTimeout(function () { label.textContent = original; btn.classList.remove('is-copied'); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
      } else {
        fallback(text);
        done();
      }
    });
  });

  function fallback(text) {
    var ta = doc.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    doc.body.appendChild(ta);
    ta.select();
    try { doc.execCommand('copy'); } catch (e) { /* nothing else to try */ }
    doc.body.removeChild(ta);
  }
})();
