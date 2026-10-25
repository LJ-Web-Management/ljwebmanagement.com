// Free calculators and tools:
//   /tools/                     hub
//   /tools/<calculator>/        one page per calculator in content/tools.js
//   /tools/automation-priority-scorer/
//   /tools/ai-prompt-library/   prompts from content/prompts.json
// The calculators run in assets/js/tools.js; this file renders the inputs,
// result panels, explainers and FAQs.

const fs = require("fs");
const path = require("path");
const { ROOT, SITE_URL, escapeHtml, writeFile, slugify } = require("../lib/util");
const L = require("../lib/layout");
const { icon } = L;
const TOOLS = require("../../content/tools");

const PROMPTS = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "prompts.json"), "utf8"));

// Everything listed on the /tools/ hub, including the ROI calculator that
// lives at its original URL.
function list() {
  return [
    {
      slug: "roi-calculator",
      url: "/roi-calculator/",
      name: "Automation ROI Calculator",
      icon: "calculator",
      tag: "Calculator",
      text: "See how many hours and dollars your team's manual work costs every month, and what automation could give back.",
    },
  ]
    .concat(TOOLS.calculators.map((c) => ({ slug: c.slug, url: "/tools/" + c.slug + "/", name: c.name, icon: c.icon, tag: "Calculator", text: c.card })))
    .concat([
      { slug: "automation-priority-scorer", url: "/tools/automation-priority-scorer/", name: TOOLS.scorer.name, icon: "listCheck", tag: "Planner", text: TOOLS.scorer.card },
      { slug: "ai-prompt-library", url: "/tools/ai-prompt-library/", name: "AI Prompt Library", icon: "message", tag: "Library", text: "Copy-and-paste AI prompts for email, sales, marketing, support, operations, and planning automations, " + PROMPTS.prompts.length + " in all." },
    ]);
}

function crumbsFor(name, url) {
  return L.breadcrumbs([
    ["Home", "/"],
    ["Resources", "/resources/"],
    ["Free Tools", "/tools/"],
  ].concat(name ? [[name, url]] : []));
}

function webApp(name, url, description) {
  return {
    "@type": "WebApplication",
    "@id": SITE_URL + url + "#app",
    name,
    url: SITE_URL + url,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": SITE_URL + "/#organization" },
  };
}

function field(f) {
  const id = "lj-f-" + f.name;
  const hint = f.hint ? "<small>" + f.hint + "</small>" : "";
  if (f.type === "select") {
    return (
      '<div class="lj-calc-field"><label for="' + id + '">' + f.label + "</label>" +
      '<select class="lj-input" id="' + id + '" name="' + f.name + '">' +
      f.options.map(([v, t]) => '<option value="' + v + '"' + (String(v) === String(f.value) ? " selected" : "") + ">" + t + "</option>").join("") +
      "</select>" + hint + "</div>"
    );
  }
  if (f.type === "number") {
    return (
      '<div class="lj-calc-field"><label for="' + id + '">' + f.label + "</label>" +
      '<div class="lj-num">' + (f.prefix ? "<span>" + f.prefix + "</span>" : "") +
      '<input type="number" inputmode="decimal" id="' + id + '" name="' + f.name + '" value="' + f.value + '" min="' + (f.min == null ? 0 : f.min) + '"' + (f.max != null ? ' max="' + f.max + '"' : "") + ' step="' + (f.step || "any") + '">' +
      (f.suffix ? "<span>" + f.suffix + "</span>" : "") + "</div>" + hint + "</div>"
    );
  }
  return (
    '<div class="lj-calc-field"><label for="' + id + '">' + f.label + ' <output data-lj-show="' + f.name + '" for="' + id + '"></output></label>' +
    '<input type="range" id="' + id + '" name="' + f.name + '" min="' + f.min + '" max="' + f.max + '" step="' + (f.step || 1) + '" value="' + f.value + '" data-fmt="' + (f.fmt || "num") + '">' +
    hint + "</div>"
  );
}

function results(r) {
  return (
    '<div class="lj-calc-results" aria-live="polite">' +
    "<h2>" + r.title + "</h2>" +
    '<div class="lj-calc-metric lj-calc-metric--hero"><span>' + r.hero[1] + '</span><strong data-out="' + r.hero[0] + '">&nbsp;</strong>' + (r.hero[2] ? '<span data-out="' + r.hero[2] + '"></span>' : "") + "</div>" +
    '<div class="lj-calc-metrics">' + r.metrics.map(([k, label]) => '<div class="lj-calc-metric"><span>' + label + '</span><strong data-out="' + k + '">&nbsp;</strong></div>').join("") + "</div>" +
    '<p class="lj-calc-note">' + r.note + "</p>" +
    '<a class="lj-btn lj-btn-accent" href="/appointment/">' + (r.cta || "Talk Through Your Numbers") + " " + icon("arrowRight") + "</a>" +
    "</div>"
  );
}

// Shared lower half of every tool page: explainer, FAQ, related links.
function lower(o, faq) {
  return `<section class="lj-section">
  <div class="lj-container lj-container--narrow">
    <div class="lj-prose">${o.explainer}${faq ? '<h2 id="faq">Frequently asked questions</h2>' + faq.html : ""}</div>
  </div>
</section>
<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Keep going</span><h2>Related guides and tools</h2></div>
      <a class="lj-link-arrow" href="/resources/">All free resources ${icon("arrowRight")}</a>
    </div>
    ${L.linkList(o.related)}
  </div>
</section>`;
}

function calculatorPage(c) {
  const url = "/tools/" + c.slug + "/";
  const crumbs = crumbsFor(c.name, url);
  const faq = c.faq && c.faq.length ? L.faq(c.faq) : null;
  const main =
    L.hero({ crumbs, eyebrow: "Free calculator", title: c.title, lead: c.lead }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <form class="lj-tool-card lj-tool-card--wide lj-calc" data-lj-calc="${c.calc}" novalidate>
      <div class="lj-calc-inputs">${c.fields.map(field).join("")}</div>
      ${results(c.results)}
    </form>
  </div>
</section>
${lower(c, faq)}`;
  writeFile(
    url.slice(1) + "index.html",
    L.page({
      path: url,
      title: c.seoTitle + " | LJ Web Management",
      description: c.description,
      active: "resources",
      jsonLd: [webApp(c.name, url, c.description), crumbs.schema].concat(faq ? [faq.schema] : []),
      endScripts: L.toolsScript(),
      main,
    })
  );
}

function scorerPage() {
  const s = TOOLS.scorer;
  const url = "/tools/automation-priority-scorer/";
  const crumbs = crumbsFor(s.name, url);
  const faq = L.faq(s.faq);
  const select = (label) =>
    '<td><select class="lj-input" aria-label="' + label + '">' + [1, 2, 3, 4, 5].map((n) => '<option value="' + n + '"' + (n === 3 ? " selected" : "") + ">" + n + "</option>").join("") + "</select></td>";
  const main =
    L.hero({ crumbs, eyebrow: "Free planning tool", title: s.title, lead: s.lead }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <div class="lj-tool-card lj-tool-card--wide lj-scorer" data-lj-scorer="${escapeHtml(JSON.stringify(s.examples))}">
      <div class="lj-tool-card-body">
        <div class="lj-scorer-head">
          <div><h2>Score your tasks</h2><p>Rate each task from 1 (low) to 5 (high) on every factor. Your list saves in this browser.</p></div>
          <div class="lj-btn-row"><button type="button" class="lj-btn lj-btn-primary lj-btn-sm" data-lj-scorer-add>Add a task</button><button type="button" class="lj-btn lj-btn-ghost lj-btn-sm" data-lj-scorer-reset>Reset to examples</button></div>
        </div>
        <div class="lj-table-scroll">
          <table class="lj-scorer-table">
            <thead><tr><th scope="col">Task</th>${s.factors.map((f) => '<th scope="col" data-factor><span title="' + escapeHtml(f[1]) + '">' + f[0] + "</span></th>").join("")}<th scope="col">Total</th><th scope="col"><span class="lj-sr-only">Remove</span></th></tr></thead>
            <tbody></tbody>
          </table>
          <template><tr><td><input class="lj-input" type="text" placeholder="Describe the task" aria-label="Task name"></td>${s.factors.map((f) => select(f[0])).join("")}<td data-total></td><td><button type="button" class="lj-scorer-x" data-lj-scorer-remove aria-label="Remove task">${icon("close")}</button></td></tr></template>
        </div>
        <dl class="lj-scorer-key">${s.factors.map((f) => "<div><dt>" + f[0] + "</dt><dd>" + f[1] + "</dd></div>").join("")}</dl>
      </div>
      <div class="lj-scorer-result">
        <h2>Your automation shortlist</h2>
        <ol class="lj-rank" data-lj-scorer-rank aria-live="polite"></ol>
        <p class="lj-calc-note">18 or more out of 25: automate first. 13 to 17: a good candidate once the basics are done. Under 13: leave it manual for now.</p>
        <a class="lj-btn lj-btn-accent" href="/appointment/">Review My List With an Expert ${icon("arrowRight")}</a>
      </div>
    </div>
  </div>
</section>
${lower(s, faq)}`;
  writeFile(
    url.slice(1) + "index.html",
    L.page({
      path: url,
      title: s.seoTitle + " | LJ Web Management",
      description: s.description,
      active: "resources",
      jsonLd: [webApp(s.name, url, s.description), crumbs.schema, faq.schema],
      endScripts: L.toolsScript(),
      main,
    })
  );
}

function promptLibrary() {
  const url = "/tools/ai-prompt-library/";
  const crumbs = crumbsFor("AI Prompt Library", url);
  const cats = PROMPTS.categories;
  const faq = L.faq(PROMPTS.faq);
  const cards = PROMPTS.prompts
    .map((p, i) => {
      const id = "prompt-" + slugify(p.title);
      const text = (p.title + " " + p.use + " " + p.prompt + " " + cats[p.cat]).toLowerCase();
      return (
        '<article class="lj-prompt" data-lj-item data-cat="' + p.cat + '" data-text="' + escapeHtml(text) + '">' +
        '<div class="lj-prompt-head"><span class="lj-tag lj-tag--cyan">' + escapeHtml(cats[p.cat]) + "</span>" +
        '<button type="button" class="lj-copy" data-lj-copy="' + id + '-text">' + icon("copy") + "<span>Copy</span></button></div>" +
        '<h3 id="' + id + '">' + escapeHtml(p.title) + "</h3><p>" + escapeHtml(p.use) + "</p>" +
        '<pre id="' + id + '-text" class="lj-prompt-text">' + escapeHtml(p.prompt) + "</pre></article>"
      );
    })
    .join("");
  const counts = {};
  PROMPTS.prompts.forEach((p) => (counts[p.cat] = (counts[p.cat] || 0) + 1));
  const main =
    L.hero({ crumbs, eyebrow: "Free prompt library", title: "AI prompts for business automation", lead: PROMPTS.lead }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container" data-lj-filter data-lj-noun="prompts">
    <div class="lj-filter-bar">
      <div class="lj-input-wrap">${icon("search")}<input class="lj-input" type="search" placeholder="Search prompts" aria-label="Search prompts" data-lj-filter-q></div>
      <span class="lj-filter-status" data-lj-filter-status aria-live="polite">${PROMPTS.prompts.length} prompts</span>
    </div>
    <div class="lj-filter-chips lj-mb" role="group" aria-label="Filter by category">
      <button type="button" class="lj-chip" data-lj-filter-cat="" aria-pressed="true">All <span class="lj-chip-count">${PROMPTS.prompts.length}</span></button>
      ${Object.keys(cats).map((k) => '<button type="button" class="lj-chip" data-lj-filter-cat="' + k + '" aria-pressed="false">' + escapeHtml(cats[k]) + ' <span class="lj-chip-count">' + counts[k] + "</span></button>").join("")}
    </div>
    <div class="lj-prompt-grid">${cards}</div>
    <p class="lj-empty-state" data-lj-filter-empty hidden>No prompts match that search. Try a different word or pick another category.</p>
  </div>
</section>
${lower({ explainer: PROMPTS.explainer, related: PROMPTS.related }, faq)}`;
  writeFile(
    url.slice(1) + "index.html",
    L.page({
      path: url,
      title: "AI Prompt Library for Business Automation (Free) | LJ Web Management",
      description: "Free, copy-and-paste AI prompts for small business email, sales, marketing, customer support, operations, and automation planning, with tips for reliable results.",
      active: "resources",
      jsonLd: [
        {
          "@type": "CollectionPage",
          "@id": SITE_URL + url + "#page",
          name: "AI Prompt Library for Business Automation",
          url: SITE_URL + url,
          isAccessibleForFree: true,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: PROMPTS.prompts.length,
            itemListElement: PROMPTS.prompts.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: SITE_URL + url + "#prompt-" + slugify(p.title) })),
          },
        },
        crumbs.schema,
        faq.schema,
      ],
      endScripts: L.toolsScript(),
      main,
    })
  );
}

function hub(quizList) {
  const crumbs = crumbsFor();
  const all = list();
  const main =
    L.hero({
      crumbs,
      eyebrow: "Free tools",
      title: "Free automation calculators and tools",
      lead: "Put real numbers on manual work, missed leads, no-shows, late payments, and AI costs, then decide what to automate first. No sign-up, nothing to install.",
    }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <div class="lj-grid lj-grid-3">${all.map((t) => L.rcard({ href: t.url, icon: t.icon, tag: t.tag, title: t.name, text: t.text, cta: t.tag === "Library" ? "Browse prompts" : "Open the tool" })).join("")}</div>
  </div>
</section>
<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Quizzes and assessments</span><h2>Not sure where you stand?</h2></div>
      <a class="lj-link-arrow" href="/quizzes/">All quizzes ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${quizList.slice(0, 3).map((q) => L.rcard({ href: q.url, icon: q.icon, tag: q.tag, meta: q.minutes + " min", title: q.name, text: q.card, cta: "Start" })).join("")}</div>
  </div>
</section>`;
  writeFile(
    "tools/index.html",
    L.page({
      path: "/tools/",
      title: "Free Automation Calculators & Tools | LJ Web Management",
      description: "Free business automation calculators: ROI, time savings, lead response, no-show cost, late payments, AI cost, payback period, plus a task priority scorer and AI prompt library.",
      active: "resources",
      jsonLd: [
        {
          "@type": "CollectionPage",
          "@id": SITE_URL + "/tools/#page",
          name: "Free Automation Calculators and Tools",
          url: SITE_URL + "/tools/",
          mainEntity: { "@type": "ItemList", itemListElement: all.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: SITE_URL + t.url, name: t.name })) },
        },
        crumbs.schema,
      ],
      main,
    })
  );
}

function build(quizList) {
  TOOLS.calculators.forEach(calculatorPage);
  scorerPage();
  promptLibrary();
  hub(quizList);
}

function searchEntries() {
  return list()
    .filter((t) => t.slug !== "roi-calculator")
    .map((t) => [t.tag === "Calculator" ? "Calculator" : "Tool", t.name, t.tag === "Calculator" ? "Free calculator" : "Free tool", t.url, t.text]);
}

module.exports = { build, list, lower, searchEntries, PROMPTS };
