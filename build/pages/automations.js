// Automation catalog pages:
//   /automations/                              hub (search, functions, industries, tools, directory page 1)
//   /automations/page/N/                       directory pages 2..N
//   /automations/<industry>/                   industry pages
//   /automations/<industry>/<automation>/      one page per automation
//   /automations/category/<function>/          business-function pages
//   /automations/tools/<tool>/                 integration pages

const { SITE_URL, escapeHtml, writeFile, formatNumber, truncate } = require("../lib/util");
const L = require("../lib/layout");
const { icon } = L;

const PAGE_SIZE = 50;

function industrySvg(ind) {
  return '<svg class="lj-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ind.icon + "</svg>";
}

function countBy(items, key) {
  const m = new Map();
  items.forEach((x) => {
    const k = key(x);
    m.set(k, (m.get(k) || 0) + 1);
  });
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

function listSentence(arr) {
  if (arr.length <= 1) return arr.join("");
  return arr.slice(0, -1).join(", ") + (arr.length > 2 ? "," : "") + " and " + arr[arr.length - 1];
}

// Automation card. `meta` picks what the footer shows: the business
// function (on industry and tool pages) or the industry (on function pages).
function card(a, meta) {
  const text = [a.title, a.role, a.ind.name, a.cat.name].concat(a.toolTags).join(" ").toLowerCase();
  const metaHtml =
    meta === "industry"
      ? '<span class="lj-acard-meta">' + industrySvg(a.ind) + escapeHtml(a.ind.name) + "</span>"
      : '<span class="lj-acard-meta">' + icon(a.cat.icon) + escapeHtml(a.cat.name) + "</span>";
  return (
    '<a class="lj-card lj-acard" href="' + a.url + '" data-lj-item data-cat="' + a.category + '" data-ind="' + a.industry + '" data-text="' + escapeHtml(text) + '">' +
    '<span class="lj-acard-role">' + escapeHtml(a.role) + "</span>" +
    "<h3>" + escapeHtml(a.title) + "</h3>" +
    "<p>" + escapeHtml(a.teaser) + "</p>" +
    '<div class="lj-card-foot">' + metaHtml + '<span class="lj-card-arrow">' + icon("arrowRight") + "</span></div>" +
    "</a>"
  );
}

function categoryCard(c) {
  return (
    '<a class="lj-card lj-ccard" href="' + c.url + '">' +
    '<div class="lj-ccard-top"><span class="lj-card-icon">' + icon(c.icon) + '</span><span class="lj-count">' + c.items.length + " automations</span></div>" +
    "<h3>" + escapeHtml(c.name) + "</h3><p>" + escapeHtml(c.short) + "</p>" +
    '<div class="lj-card-foot"><span class="lj-link-arrow">Explore ' + icon("arrowRight") + "</span></div>" +
    "</a>"
  );
}

function industryTile(ind) {
  return (
    '<a class="lj-itile" href="' + ind.url + '"><span class="lj-itile-icon">' + industrySvg(ind) + "</span><span><strong>" +
    escapeHtml(ind.name) + "</strong><small>" + ind.items.length + " automations</small></span></a>"
  );
}

function guideCard(g, label) {
  return (
    '<a class="lj-card lj-gcard" href="' + g.url + '">' +
    '<span class="lj-gcard-top"><span class="lj-card-icon lj-card-icon--soft">' + icon(g.icon || "book") + '</span><span class="lj-post-card-meta"><span class="lj-tag lj-tag--cyan">' + (label || "Guide") + "</span><span>" + g.readMinutes + " min read</span></span></span>" +
    "<h3>" + escapeHtml(g.title) + "</h3><p>" + escapeHtml(truncate(g.description, 140)) + "</p>" +
    '<span class="lj-link-arrow">Read the guide ' + icon("arrowRight") + "</span></a>"
  );
}

// Filter bar: search box plus either category chips or a select.
function filterBar(opts) {
  const chips = opts.chips
    ? '<div class="lj-filter-chips" role="group" aria-label="Filter by business function">' +
      '<button type="button" class="lj-chip" data-lj-filter-cat="" aria-pressed="true">All <span class="lj-chip-count">' + opts.total + "</span></button>" +
      opts.chips.map(([key, label, n]) => '<button type="button" class="lj-chip" data-lj-filter-cat="' + key + '" aria-pressed="false">' + escapeHtml(label) + ' <span class="lj-chip-count">' + n + "</span></button>").join("") +
      "</div>"
    : "";
  return (
    '<div class="lj-filter-bar">' +
    '<div class="lj-input-wrap">' + icon("search") + '<label class="lj-sr-only" for="lj-filter-q">' + opts.label + "</label>" +
    '<input class="lj-input" id="lj-filter-q" type="search" placeholder="' + opts.placeholder + '" data-lj-filter-q autocomplete="off"></div>' +
    '<p class="lj-filter-status" data-lj-filter-status aria-live="polite">' + opts.total + " automations</p>" +
    "</div>" + chips
  );
}

function emptyState() {
  return '<p class="lj-empty-state" data-lj-filter-empty hidden>No automations match that search. Try a broader term, or <a href="/appointment/">tell us what you need</a> and we will scope it.</p>';
}

/* ---------------------------------------------------------------------- */
/* Automation detail page                                                  */
/* ---------------------------------------------------------------------- */

function toolLink(toolString, cat) {
  const t = cat.tools.find((tp) => toolString.toLowerCase().indexOf(tp.tag.toLowerCase()) !== -1);
  const label = escapeHtml(toolString);
  return t ? '<a href="' + t.url + '">' + label + "</a>" : label;
}

function buildDetail(a, cat) {
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Automations", "/automations/"],
    [a.ind.name, a.ind.url],
    [a.title, a.url],
  ]);
  const tagNames = a.toolTags.filter((t) => t !== "Zapier" && t !== "Make.com");
  const connects = tagNames.length ? listSentence(tagNames.slice(0, 3)) : listSentence(a.toolTags.slice(0, 2));
  const lead =
    "A done-for-you " + a.ind.adj + " automation built for the " + escapeHtml(a.role) + ", connecting " + escapeHtml(connects) + " so the work below happens on its own.";
  const description = truncate(a.title + " for " + a.ind.name.toLowerCase() + ": " + a.steps[0], 158);
  const related = cat.related(a, 6);

  const steps = a.steps
    .map((s) => '<li><div class="lj-steps-body"><p>' + escapeHtml(s) + "</p></div></li>")
    .join("");

  const main = `
<section class="lj-page-hero">
  <div class="lj-container">
    ${crumbs.html}
    <div class="lj-split lj-split--hero">
      <div>
        <span class="lj-eyebrow lj-eyebrow--pill">${escapeHtml(a.ind.name)} automation</span>
        <h1>${escapeHtml(a.title)}</h1>
        <p class="lj-lead">${lead}</p>
        <div class="lj-tag-row">
          <a class="lj-tag lj-tag--cyan" href="${a.cat.url}">${icon(a.cat.icon)}${escapeHtml(a.cat.name)}</a>
          <a class="lj-tag" href="${a.ind.url}">${escapeHtml(a.ind.name)}</a>
          ${a.toolPages.slice(0, 3).map((t) => '<a class="lj-tag lj-tag--outline" href="' + t.url + '">' + escapeHtml(t.tag) + "</a>").join("")}
        </div>
      </div>
      <aside class="lj-spec" aria-label="Automation summary">
        <dl>
          <div><dt>Built for</dt><dd>${escapeHtml(a.role)}</dd></div>
          <div><dt>Industry</dt><dd><a href="${a.ind.url}">${escapeHtml(a.ind.name)}</a></dd></div>
          <div><dt>Business function</dt><dd><a href="${a.cat.url}">${escapeHtml(a.cat.name)}</a></dd></div>
          <div><dt>Connects</dt><dd>${a.tools.length} tools you may already use</dd></div>
          <div><dt>Pricing</dt><dd>Flat, upfront quote after a free consult</dd></div>
        </dl>
        <a class="lj-btn lj-btn-primary" href="/appointment/">Get This Automation Built ${icon("arrowRight")}</a>
        <a class="lj-btn lj-btn-ghost" href="/contactus/">Ask a Question</a>
        <p class="lj-spec-note">Tailored to your exact tools and workflow.</p>
      </aside>
    </div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    <div class="lj-split">
      <div>
        <span class="lj-eyebrow">How it works</span>
        <h2>What this automation does, step by step</h2>
        <ol class="lj-steps">${steps}</ol>
      </div>
      <div class="lj-sticky">
        <span class="lj-eyebrow">Tools it connects</span>
        <ul class="lj-tools-list">${a.tools.map((t) => "<li>" + icon("plug") + "<span>" + toolLink(t, cat) + "</span></li>").join("")}</ul>
        <p class="lj-muted" style="font-size:14px;margin-top:14px">Using different software? We build around what you already have, so you never have to switch tools to automate.</p>
      </div>
    </div>
  </div>
</section>

<section class="lj-section lj-section--mist">
  <div class="lj-container">
    ${L.sectionHead("Before and after", "The manual way vs. the automated way", "")}
    <div class="lj-compare">
      <div class="lj-compare-col lj-compare-before">
        <h3>${icon("xCircle")}Without automation</h3>
        <p>${escapeHtml(a.manual)}</p>
      </div>
      <div class="lj-compare-col lj-compare-after">
        <h3>${icon("checkCircle")}With this automation</h3>
        <ul class="lj-checklist">${a.cat.benefits.map((b) => "<li>" + icon("check") + "<span>" + escapeHtml(b) + "</span></li>").join("")}</ul>
      </div>
    </div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Related automations</span><h2>Often built alongside this one</h2></div>
      <a class="lj-link-arrow" href="${a.ind.url}">All ${a.ind.items.length} ${escapeHtml(a.ind.name)} automations ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${related.map((r) => card(r, r.industry === a.industry ? "category" : "industry")).join("")}</div>
  </div>
</section>`;

  const service = {
    "@type": "Service",
    "@id": SITE_URL + a.url + "#service",
    name: a.title,
    description: a.automated,
    serviceType: a.cat.name + " automation",
    category: a.ind.name,
    url: SITE_URL + a.url,
    provider: { "@id": SITE_URL + "/#organization" },
    areaServed: { "@type": "Country", name: "United States" },
    audience: { "@type": "BusinessAudience", audienceType: a.role + ", " + a.ind.name },
  };

  writeFile(
    a.url.slice(1) + "index.html",
    L.page({
      path: a.url,
      title: a.title + " for " + a.ind.name + " | LJ Web Management",
      description,
      active: "automations",
      jsonLd: [service, crumbs.schema],
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Industry page                                                           */
/* ---------------------------------------------------------------------- */

function buildIndustry(ind, cat, guidesBySlug) {
  const n = ind.items.length;
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Automations", "/automations/"],
    [ind.name, ind.url],
  ]);
  const cats = countBy(ind.items, (a) => a.category).map(([slug, c]) => [slug, cat.categoryBySlug[slug].name, c]);
  const roles = countBy(ind.items, (a) => a.role);
  const toolCounts = countBy(
    ind.items.flatMap((a) => a.toolPages),
    (t) => t.slug
  ).slice(0, 8);
  const topTools = toolCounts.map(([slug]) => cat.tools.find((t) => t.slug === slug));
  const topCatNames = cats.slice(0, 3).map((c) => c[1].toLowerCase());
  const topRoles = roles.slice(0, 3).map((r) => r[0]);

  const faqItems = [
    [
      "What " + ind.adj + " workflows can be automated?",
      "<p>The " + n + " " + ind.adj + " automations in our catalog cover " + escapeHtml(listSentence(topCatNames)) + ", among other areas, for roles like " +
        escapeHtml(listSentence(topRoles)) + ". Popular starting points include " +
        ind.items.slice(0, 3).map((a) => '<a href="' + a.url + '">' + escapeHtml(a.title) + "</a>").join(", ") + ".</p>",
    ],
    [
      "Do I need to replace my current " + ind.adj + " software?",
      "<p>No. Every automation is built around the tools you already use. " +
        (topTools.length ? "The integrations that come up most often in " + ind.adj + " automations are " + escapeHtml(listSentence(topTools.slice(0, 4).map((t) => t.tag))) + ", " : "") +
        "but we connect whatever CRM, scheduling, accounting, or field software you run today.</p>",
    ],
    [
      "How much does " + (/^[aeiou]/i.test(ind.adj) ? "an " : "a ") + ind.adj + " automation cost?",
      "<p>We don't publish a price list because every automation is scoped to your tools and workflow. After a free consultation you get a flat, all-in quote before any work starts, with no hourly billing and no hidden fees.</p>",
    ],
    [
      "How long does it take to set one up?",
      "<p>Simple, single-workflow automations typically go live within days. Multi-system integrations take longer. Either way, you receive a clear scope and timeline before development begins, so there are no surprises.</p>",
    ],
  ];
  const faq = L.faq(faqItems);

  const guideSlugs = Array.from(new Set(cats.map(([slug]) => cat.categoryBySlug[slug].guide))).slice(0, 3);
  const guides = guideSlugs.map((s) => guidesBySlug[s]).filter(Boolean);

  const main = `
<section class="lj-page-hero">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-hero-icon">${industrySvg(ind)}</span>
    <h1>${escapeHtml(ind.name)} Automations</h1>
    <p class="lj-lead">${escapeHtml(ind.intro)}</p>
    <div class="lj-hero-meta">
      <div><strong>${n}</strong> ready-to-build automations</div>
      <div><strong>${roles.length}</strong> roles covered</div>
      <div><strong>${cats.length}</strong> business functions</div>
    </div>
    <div class="lj-btn-row">
      <a class="lj-btn lj-btn-primary" href="/appointment/">Book a Free Consultation ${icon("arrowRight")}</a>
      <a class="lj-btn lj-btn-ghost" href="/how-it-works/">How Our Process Works</a>
    </div>
  </div>
</section>

<section class="lj-section" data-lj-filter>
  <div class="lj-container">
    <h2 class="lj-sr-only">All ${escapeHtml(ind.name)} automations</h2>
    ${filterBar({ total: n, chips: cats, label: "Search " + ind.name + " automations", placeholder: "Search by task, role, or tool" })}
    <div class="lj-grid lj-grid-3 lj-mt-lg">${ind.items.map((a) => card(a, "category")).join("")}</div>
    ${emptyState()}
  </div>
</section>

${topTools.length ? `<section class="lj-section lj-section--mist lj-section--tight">
  <div class="lj-container">
    ${L.sectionHead("Integrations", "Tools these " + escapeHtml(ind.adj) + " automations connect", "Zapier or Make.com sits in the middle of nearly every workflow. These are the apps they connect most often for " + escapeHtml(ind.adj) + " teams.")}
    <div class="lj-chip-row" style="justify-content:center">${toolCounts.map(([slug, c]) => { const t = cat.tools.find((x) => x.slug === slug); return '<a class="lj-chip" href="' + t.url + '">' + escapeHtml(t.tag) + ' <span class="lj-chip-count">' + c + "</span></a>"; }).join("")}</div>
  </div>
</section>` : ""}

<section class="lj-section">
  <div class="lj-container lj-container--narrow">
    ${L.sectionHead("FAQ", escapeHtml(ind.name) + " automation questions", "")}
    ${faq.html}
  </div>
</section>

${guides.length ? `<section class="lj-section lj-section--mist">
  <div class="lj-container">
    ${L.sectionHead("Guides", "Learn how these workflows work", "")}
    <div class="lj-grid lj-grid-3">${guides.map((g) => guideCard(g)).join("")}</div>
  </div>
</section>` : ""}`;

  const collection = {
    "@type": "CollectionPage",
    "@id": SITE_URL + ind.url + "#page",
    name: ind.name + " Automations",
    url: SITE_URL + ind.url,
    description: ind.intro,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: n,
      itemListElement: ind.items.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: SITE_URL + a.url, name: a.title })),
    },
  };

  writeFile(
    ind.url.slice(1) + "index.html",
    L.page({
      path: ind.url,
      title: ind.name + " Automation: " + n + " Done-for-You Workflows | LJ Web Management",
      description: truncate(n + " done-for-you " + ind.adj + " automations: " + ind.card.replace(/\.$/, "").toLowerCase() + ". Flat, upfront quotes.", 158),
      active: "automations",
      jsonLd: [collection, crumbs.schema, faq.schema],
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Business-function (category) page                                       */
/* ---------------------------------------------------------------------- */

function buildCategory(c, cat, guidesBySlug) {
  const n = c.items.length;
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Automations", "/automations/"],
    [c.name, c.url],
  ]);
  const items = c.items.slice().sort((x, y) => x.ind.name.localeCompare(y.ind.name) || x.title.localeCompare(y.title));
  const inds = countBy(items, (a) => a.industry).map(([slug, k]) => [slug, cat.industryBySlug[slug].name, k]);
  const guide = guidesBySlug[c.guide];
  const others = cat.categories.filter((x) => x !== c);

  const main = `
<section class="lj-page-hero">
  <div class="lj-container">
    ${crumbs.html}
    <div class="lj-split lj-split--hero">
      <div>
        <span class="lj-hero-icon">${icon(c.icon)}</span>
        <h1>${escapeHtml(c.name)} Automations</h1>
        <p class="lj-lead">${escapeHtml(c.short)}</p>
        ${c.intro.map((p) => "<p>" + escapeHtml(p) + "</p>").join("")}
        <div class="lj-btn-row">
          <a class="lj-btn lj-btn-primary" href="/appointment/">Book a Free Consultation ${icon("arrowRight")}</a>
          ${guide ? '<a class="lj-btn lj-btn-ghost" href="' + guide.url + '">Read the Guide</a>' : ""}
        </div>
      </div>
      <aside class="lj-spec" aria-label="What these automations deliver">
        <span class="lj-eyebrow">What you get</span>
        <ul class="lj-checklist">${c.benefits.map((b) => "<li>" + icon("checkCircle") + "<span>" + escapeHtml(b) + "</span></li>").join("")}</ul>
        <p class="lj-spec-note" style="text-align:left;margin-top:18px"><strong>${n}</strong> automations across <strong>${inds.length}</strong> industries</p>
      </aside>
    </div>
  </div>
</section>

<section class="lj-section" data-lj-filter>
  <div class="lj-container">
    <h2 class="lj-sr-only">All ${escapeHtml(c.name)} automations</h2>
    <div class="lj-filter-bar">
      <div class="lj-input-wrap">${icon("search")}<label class="lj-sr-only" for="lj-filter-q">Search ${escapeHtml(c.name)} automations</label><input class="lj-input" id="lj-filter-q" type="search" placeholder="Search by task, role, or tool" data-lj-filter-q autocomplete="off"></div>
      <div><label class="lj-sr-only" for="lj-filter-ind">Filter by industry</label>
      <select class="lj-input" id="lj-filter-ind" data-lj-filter-select><option value="">All industries (${n})</option>${inds.map(([slug, name, k]) => '<option value="' + slug + '">' + escapeHtml(name) + " (" + k + ")</option>").join("")}</select></div>
      <p class="lj-filter-status" data-lj-filter-status aria-live="polite">${n} automations</p>
    </div>
    <div class="lj-grid lj-grid-3 lj-mt-lg">${items.map((a) => card(a, "industry")).join("")}</div>
    ${emptyState()}
  </div>
</section>

<section class="lj-section lj-section--mist lj-section--tight">
  <div class="lj-container">
    ${L.sectionHead("Other business functions", "Explore more automation categories", "")}
    <div class="lj-chip-row" style="justify-content:center">${others.map((o) => '<a class="lj-chip" href="' + o.url + '">' + icon(o.icon) + escapeHtml(o.name) + ' <span class="lj-chip-count">' + o.items.length + "</span></a>").join("")}</div>
  </div>
</section>`;

  const collection = {
    "@type": "CollectionPage",
    "@id": SITE_URL + c.url + "#page",
    name: c.name + " Automations",
    url: SITE_URL + c.url,
    description: c.short,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: n,
      itemListElement: items.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: SITE_URL + a.url, name: a.title })),
    },
  };

  writeFile(
    c.url.slice(1) + "index.html",
    L.page({
      path: c.url,
      title: c.name + " Automations: " + n + " Workflows by Industry | LJ Web Management",
      description: truncate(c.short + " Browse " + n + " done-for-you automations across " + inds.length + " industries.", 158),
      active: "automations",
      jsonLd: [collection, crumbs.schema],
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Tool page                                                               */
/* ---------------------------------------------------------------------- */

function buildTool(t, cat) {
  const n = t.items.length;
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Automations", "/automations/"],
    [t.name + " Automations", t.url],
  ]);
  const cats = countBy(t.items, (a) => a.category).map(([slug, k]) => [slug, cat.categoryBySlug[slug].name, k]);
  const inds = countBy(t.items, (a) => a.industry).slice(0, 6).map(([slug]) => cat.industryBySlug[slug]);
  const others = cat.tools.filter((x) => x !== t);

  const main = `
<section class="lj-page-hero">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-hero-icon">${icon("plug")}</span>
    <h1>${escapeHtml(t.name)} Automations</h1>
    <p class="lj-lead">${escapeHtml(t.blurb)}</p>
    <p>${n} automations in our catalog use ${escapeHtml(t.tag)}, most often in ${escapeHtml(listSentence(inds.map((i) => i.name)))}.</p>
    <div class="lj-btn-row">
      <a class="lj-btn lj-btn-primary" href="/appointment/">Automate ${escapeHtml(t.tag)} With Us ${icon("arrowRight")}</a>
      <a class="lj-btn lj-btn-ghost" href="/automations/">Browse All Automations</a>
    </div>
  </div>
</section>

<section class="lj-section" data-lj-filter>
  <div class="lj-container">
    <h2 class="lj-sr-only">${escapeHtml(t.tag)} automations</h2>
    ${filterBar({ total: n, chips: cats, label: "Search " + t.tag + " automations", placeholder: "Search by task, role, or industry" })}
    <div class="lj-grid lj-grid-3 lj-mt-lg">${t.items.map((a) => card(a, "industry")).join("")}</div>
    ${emptyState()}
  </div>
</section>

<section class="lj-section lj-section--mist lj-section--tight">
  <div class="lj-container">
    ${L.sectionHead("More integrations", "Automations by tool", "")}
    <div class="lj-chip-row" style="justify-content:center">${others.map((o) => '<a class="lj-chip" href="' + o.url + '">' + escapeHtml(o.tag) + ' <span class="lj-chip-count">' + o.items.length + "</span></a>").join("")}</div>
  </div>
</section>`;

  writeFile(
    t.url.slice(1) + "index.html",
    L.page({
      path: t.url,
      title: t.name + " Automations: " + n + " Business Workflows | LJ Web Management",
      description: truncate(n + " done-for-you business automations that use " + t.tag + ". " + t.blurb, 158),
      active: "automations",
      jsonLd: [crumbs.schema],
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Hub and directory                                                       */
/* ---------------------------------------------------------------------- */

function directoryOrder(cat) {
  return cat.automations.slice().sort((x, y) => x.title.localeCompare(y.title) || x.ind.name.localeCompare(y.ind.name));
}

function pagination(current, total) {
  const href = (p) => (p === 1 ? "/automations/#directory" : "/automations/page/" + p + "/");
  let out = '<nav class="lj-pagination" aria-label="Automation directory pages">';
  if (current > 1) out += '<a href="' + href(current - 1) + '" rel="prev" aria-label="Previous page">' + icon("arrowLeft") + "</a>";
  for (let p = 1; p <= total; p++) {
    out += p === current ? '<span aria-current="page">' + p + "</span>" : '<a href="' + href(p) + '">' + p + "</a>";
  }
  if (current < total) out += '<a href="' + href(current + 1) + '" rel="next" aria-label="Next page">' + icon("arrowRight") + "</a>";
  return out + "</nav>";
}

function buildHub(cat) {
  const all = directoryOrder(cat);
  const pages = Math.ceil(all.length / PAGE_SIZE);
  const total = formatNumber(cat.automations.length);
  const industries = cat.industries.slice().sort((a, b) => a.name.localeCompare(b.name));

  const main = `
<section class="lj-page-hero lj-page-hero--dark lj-page-hero--center">
  <div class="lj-container">
    <span class="lj-eyebrow lj-eyebrow--pill">Automation catalog</span>
    <h1>${total}+ business automations, <span class="lj-gradient-text">organized by what they do</span></h1>
    <p class="lj-lead" style="margin-inline:auto">Every automation is done-for-you and scoped to a specific job, from a real estate agent's showing follow-up to a bookkeeper's month-end close. Find yours by business function, industry, or the tools you already use.</p>
    <div style="max-width:620px;margin:30px auto 0">
      <button type="button" class="lj-hero-search" data-lj-search-open aria-label="Search all automations">${icon("search")}<span class="lj-hero-search-text">Try &ldquo;appointment reminders&rdquo; or &ldquo;QuickBooks&rdquo;</span><span class="lj-btn lj-btn-primary lj-btn-sm">Search</span></button>
    </div>
    <div class="lj-hero-quick" style="justify-content:center">
      <span>Jump to:</span><a href="#functions">Business functions</a><a href="#industries">Industries</a><a href="#tools">Tools</a><a href="#directory">A to Z directory</a>
    </div>
  </div>
</section>

<section class="lj-section" id="functions">
  <div class="lj-container">
    ${L.sectionHead("Browse by business function", "What do you want to stop doing by hand?", "Every automation is filed under the part of the business it improves, so you can compare approaches across industries.")}
    <div class="lj-grid lj-grid-3">${cat.categories.map(categoryCard).join("")}
      <a class="lj-card lj-card--dark" href="/contactus/">
        <span class="lj-card-icon">${icon("sparkles")}</span>
        <h3>Need something custom?</h3>
        <p>The catalog is a starting point. Tell us the workflow and we'll scope it, even if it's not listed here.</p>
        <div class="lj-card-foot"><span class="lj-link-arrow">Tell us what to automate ${icon("arrowRight")}</span></div>
      </a>
    </div>
  </div>
</section>

<section class="lj-section lj-section--mist" id="industries">
  <div class="lj-container">
    ${L.sectionHead("Browse by industry", cat.industries.length + " industries, each with role-specific workflows", "Pick your industry to see automations written for the roles on your team.")}
    <div class="lj-grid lj-grid-auto-sm">${industries.map(industryTile).join("")}</div>
  </div>
</section>

<section class="lj-section lj-section--tight" id="tools">
  <div class="lj-container">
    ${L.sectionHead("Browse by tool", "Built on the apps you already pay for", "Zapier or Make.com connects nearly every automation. These are the other tools they plug into most often.")}
    <div class="lj-chip-row" style="justify-content:center">${cat.tools.map((t) => '<a class="lj-chip" href="' + t.url + '">' + escapeHtml(t.tag) + ' <span class="lj-chip-count">' + t.items.length + "</span></a>").join("")}</div>
  </div>
</section>

<section class="lj-section lj-section--mist" id="directory">
  <div class="lj-container">
    ${L.sectionHead("A to Z directory", "Every automation, alphabetically", "Page 1 of " + pages + ". Use search above to jump straight to a task, role, or tool.")}
    <div class="lj-grid lj-grid-3">${all.slice(0, PAGE_SIZE).map((a) => card(a, "industry")).join("")}</div>
    ${pagination(1, pages)}
  </div>
</section>`;

  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Automations", "/automations/"],
  ]);

  writeFile(
    "automations/index.html",
    L.page({
      path: "/automations/",
      title: "Business Automation Catalog: " + total + "+ Done-for-You Workflows | LJ Web Management",
      description: "Browse " + total + "+ done-for-you business automations by business function, industry, and tool. Each one is scoped to a real role and quoted at a flat price.",
      active: "automations",
      jsonLd: [
        {
          "@type": "CollectionPage",
          "@id": SITE_URL + "/automations/#page",
          name: "Business Automation Catalog",
          url: SITE_URL + "/automations/",
          hasPart: cat.categories.map((c) => ({ "@type": "CollectionPage", name: c.name + " Automations", url: SITE_URL + c.url })),
        },
        crumbs.schema,
      ],
      main,
    })
  );

  for (let p = 2; p <= pages; p++) {
    const slice = all.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
    const path = "/automations/page/" + p + "/";
    const pc = L.breadcrumbs([
      ["Home", "/"],
      ["Automations", "/automations/"],
      ["Directory page " + p, path],
    ]);
    const first = slice[0].title;
    const last = slice[slice.length - 1].title;
    writeFile(
      path.slice(1) + "index.html",
      L.page({
        path,
        title: "Automation Directory, Page " + p + " of " + pages + " | LJ Web Management",
        description: truncate("Done-for-you business automations A to Z, page " + p + " of " + pages + ": " + first + " through " + last + ".", 158),
        active: "automations",
        jsonLd: [pc.schema],
        main: `
<section class="lj-page-hero">
  <div class="lj-container">
    ${pc.html}
    <h1>Automation Directory: Page ${p} of ${pages}</h1>
    <p class="lj-lead">${escapeHtml(first)} through ${escapeHtml(last)}. Prefer to browse by topic? Start from a <a href="/automations/#functions">business function</a> or <a href="/automations/#industries">industry</a>.</p>
  </div>
</section>
<section class="lj-section">
  <div class="lj-container">
    <h2 class="lj-sr-only">Automations on this page</h2>
    <div class="lj-grid lj-grid-3">${slice.map((a) => card(a, "industry")).join("")}</div>
    ${pagination(p, pages)}
  </div>
</section>`,
      })
    );
  }
  return pages;
}

function searchEntries(cat) {
  const out = [];
  cat.categories.forEach((c) => out.push(["Category", c.name, c.items.length + " automations", c.url, c.short]));
  cat.industries.forEach((i) => out.push(["Industry", i.name + " Automations", i.items.length + " automations", i.url, i.card]));
  cat.tools.forEach((t) => out.push(["Tool", t.name + " Automations", t.items.length + " automations", t.url, t.tag]));
  cat.automations.forEach((a) => out.push(["Automation", a.title, a.ind.name + " · " + a.role, a.url, a.cat.name + " " + a.toolTags.join(" ")]));
  return out;
}

function build(cat, guidesBySlug) {
  cat.automations.forEach((a) => buildDetail(a, cat));
  cat.industries.forEach((ind) => buildIndustry(ind, cat, guidesBySlug));
  cat.categories.forEach((c) => buildCategory(c, cat, guidesBySlug));
  cat.tools.forEach((t) => buildTool(t, cat));
  const pages = buildHub(cat);
  return { pages };
}

module.exports = { build, card, categoryCard, industryTile, industrySvg, guideCard, searchEntries, PAGE_SIZE };
