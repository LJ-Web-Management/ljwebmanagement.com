// Platform solutions: /solutions/ hub, one page per category at
// /solutions/<category>/ and one page per solution at
// /solutions/<category>/<solution>/.
//
// Content lives in content/solutions/<category>.json. Each file holds the
// category (slug, name, icon, order, short, intro, guide) and its solutions:
//   id, name, tagline, text   names and copy
//   for                       who it is for (short phrases)
//   features                  [[title, text], ...] shown as a feature grid
//   problems                  manual pain points it removes
//   integrations              tools it commonly connects
//   keywords                  phrases matched against automation titles
//   faq                       [[question, answer], ...] in plain text

const fs = require("fs");
const path = require("path");
const { ROOT, SITE_URL, escapeHtml, writeFile, truncate } = require("../lib/util");
const L = require("../lib/layout");
const { icon } = L;
const { card, guideCard } = require("./automations");

const DIR = path.join(ROOT, "content", "solutions");

// Icon per solution; anything missing falls back to its category's icon.
const ICONS = {
  "custom-website": "layers", "ecommerce-store": "box", "landing-pages-funnels": "target", "local-seo-listings": "pin",
  "website-ai-chat": "bot", "web-accessibility": "user", "custom-crm": "target", "marketing-automation": "megaphone",
  "email-sms-marketing": "mail", "quote-proposal": "file", "reputation-management": "star", "loyalty-referral": "award",
  "booking-scheduling": "calendar", "help-desk-ticketing": "help", "customer-portal": "user", "omnichannel-inbox": "message",
  "ai-phone-receptionist": "phone", "knowledge-base": "bookOpen", "field-service": "tool", "inventory-warehouse": "box",
  "project-management": "listCheck", "fleet-asset-tracking": "pin", "procurement-vendor": "receipt", "obsolescence-management": "clock",
  "membership-billing": "users", "invoicing-accounts-receivable": "receipt", "accounts-payable-expense": "dollar",
  "online-payments-checkout": "dollar", "month-end-close": "calculator", "erp-integration": "building",
  "systems-integration-api": "plug", "legacy-modernization": "zap", "document-management-esignature": "pen",
  "compliance-risk-management": "shield", "hr-payroll": "userPlus", "recruiting-ats": "userPlus",
  "staff-scheduling-time-clock": "clock", "employee-portal-intranet": "grid", "lms-deployment": "school",
  "bi-reporting": "chart", "data-warehouse-pipelines": "layers", "custom-ai-agents": "sparkles",
  "document-ai-extraction": "copy", "forecasting-predictive-analytics": "trend", "restaurant-pos": "receipt",
  "marketplace-platform": "plug", "property-management-platform": "building", "custom-saas-development": "lightbulb",
  "mobile-app-development": "phone", "managed-saas": "shield",
};

const DELIVERY = [
  ["Free discovery call", "We learn how your team works today, what tools you use, and what success looks like."],
  ["Scope and flat quote", "You get a written scope and one all-in price. Nothing starts until you approve it."],
  ["Build and integrate", "We configure or build the system and connect it to the tools you already use."],
  ["Train and launch", "Your team is trained on real scenarios, data is migrated, and we go live together."],
  ["Support and improve", "We monitor, fix, and keep improving the system as your business grows."],
];

function load() {
  const cats = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => a.order - b.order);
  const seen = new Set();
  cats.forEach((c) => {
    c.url = "/solutions/" + c.slug + "/";
    c.solutions.forEach((s) => {
      if (seen.has(s.id)) throw new Error("Duplicate solution id: " + s.id);
      seen.add(s.id);
      s.cat = c;
      s.url = c.url + s.id + "/";
      s.icon = ICONS[s.id] || c.icon;
    });
  });
  return cats;
}

function all(cats) {
  return cats.reduce((out, c) => out.concat(c.solutions), []);
}

const p = (t) => "<p>" + escapeHtml(t) + "</p>";

function solutionCard(s, showCat) {
  return (
    '<a class="lj-card lj-ccard" href="' + s.url + '">' +
    '<div class="lj-ccard-top"><span class="lj-card-icon">' + icon(s.icon) + "</span>" +
    (showCat ? '<span class="lj-count">' + escapeHtml(s.cat.name) + "</span>" : "") +
    "</div><h3>" + escapeHtml(s.name) + "</h3><p>" + escapeHtml(s.tagline) + "</p>" +
    '<div class="lj-card-foot"><span class="lj-link-arrow">View solution ' + icon("arrowRight") + "</span></div></a>"
  );
}

function categoryCard(c) {
  return (
    '<a class="lj-card lj-ccard" href="' + c.url + '">' +
    '<div class="lj-ccard-top"><span class="lj-card-icon">' + icon(c.icon) + '</span><span class="lj-count">' + c.solutions.length + " solutions</span></div>" +
    "<h3>" + escapeHtml(c.name) + "</h3><p>" + escapeHtml(c.short) + "</p>" +
    '<div class="lj-card-foot"><span class="lj-link-arrow">Explore ' + icon("arrowRight") + "</span></div></a>"
  );
}

// Automations from the catalog whose titles match the solution's keywords,
// one per industry first so the examples show range.
function examples(s, catalog, n) {
  const kws = (s.keywords || []).map((k) => k.toLowerCase());
  const matches = catalog.automations.filter((a) => kws.some((k) => a.title.toLowerCase().indexOf(k) !== -1));
  const out = [];
  const used = new Set();
  matches.forEach((a) => {
    if (out.length < n && !used.has(a.industry)) {
      out.push(a);
      used.add(a.industry);
    }
  });
  matches.forEach((a) => {
    if (out.length < n && out.indexOf(a) === -1) out.push(a);
  });
  return out;
}

function faqItems(list) {
  return list.map(([q, a]) => [q, p(a)]);
}

/* ---------------------------------------------------------------------- */
/* Solution page                                                            */
/* ---------------------------------------------------------------------- */

function buildSolution(s, catalog, guidesBySlug) {
  const c = s.cat;
  const crumbs = L.breadcrumbs([["Home", "/"], ["Solutions", "/solutions/"], [c.name, c.url], [s.name, s.url]]);
  const faq = L.faq(faqItems(s.faq));
  const picks = examples(s, catalog, 3);
  const siblings = c.solutions.filter((x) => x !== s).slice(0, 3);
  const guide = guidesBySlug[c.guide];

  const main = `
<section class="lj-page-hero">
  <div class="lj-container">
    ${crumbs.html}
    <div class="lj-split lj-split--hero">
      <div>
        <span class="lj-eyebrow lj-eyebrow--pill">${escapeHtml(c.name)}</span>
        <h1>${escapeHtml(s.name)}</h1>
        <p class="lj-lead">${escapeHtml(s.tagline)}</p>
        <div class="lj-tag-row">
          <a class="lj-tag lj-tag--cyan" href="${c.url}">${icon(c.icon)}${escapeHtml(c.name)}</a>
          ${s.integrations.slice(0, 4).map((t) => '<span class="lj-tag lj-tag--outline">' + escapeHtml(t) + "</span>").join("")}
        </div>
      </div>
      <aside class="lj-spec" aria-label="Solution summary">
        <dl>
          <div><dt>Category</dt><dd><a href="${c.url}">${escapeHtml(c.name)}</a></dd></div>
          <div><dt>Best for</dt><dd>${escapeHtml(s.for[0])}</dd></div>
          <div><dt>Connects</dt><dd>${escapeHtml(s.integrations.slice(0, 3).join(", "))}, and more</dd></div>
          <div><dt>Pricing</dt><dd>Flat, upfront quote after a free consult</dd></div>
        </dl>
        <a class="lj-btn lj-btn-primary" href="/appointment/">Talk to Us About This ${icon("arrowRight")}</a>
        <a class="lj-btn lj-btn-ghost" href="/contactus/">Ask a Question</a>
        <p class="lj-spec-note">Scoped to your tools, team, and workflow.</p>
      </aside>
    </div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    <div class="lj-split">
      <div>
        <span class="lj-eyebrow">Overview</span>
        <h2>What ${escapeHtml(s.name.replace(/ \(.*\)$/, ""))} includes</h2>
        ${p(s.text)}
        <h3 class="lj-h3 lj-mt">Who it's for</h3>
        <ul class="lj-checklist">${s.for.map((f) => "<li>" + icon("check") + "<span>" + escapeHtml(f) + "</span></li>").join("")}</ul>
      </div>
      <div class="lj-sticky">
        <span class="lj-eyebrow">Works with</span>
        <ul class="lj-tools-list">${s.integrations.map((t) => "<li>" + icon("plug") + "<span>" + escapeHtml(t) + "</span></li>").join("")}</ul>
        <p class="lj-muted" style="font-size:14px;margin-top:14px">Using different software? We build around what you already have whenever it makes sense.</p>
      </div>
    </div>
  </div>
</section>

<section class="lj-section lj-section--mist">
  <div class="lj-container">
    ${L.sectionHead("Key features", "What you get", "")}
    <div class="lj-features" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))">${s.features.map(([t, d]) => '<div><span class="lj-card-icon lj-card-icon--soft">' + icon("checkCircle") + "</span><h3>" + escapeHtml(t) + "</h3><p>" + escapeHtml(d) + "</p></div>").join("")}</div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    ${L.sectionHead("Before and after", "The problems this solves", "")}
    <div class="lj-compare">
      <div class="lj-compare-col lj-compare-before">
        <h3>${icon("xCircle")}Without it</h3>
        <ul class="lj-checklist">${s.problems.map((x) => "<li>" + icon("xCircle") + "<span>" + escapeHtml(x) + "</span></li>").join("")}</ul>
      </div>
      <div class="lj-compare-col lj-compare-after">
        <h3>${icon("checkCircle")}With it</h3>
        <ul class="lj-checklist">${s.features.slice(0, 4).map(([t]) => "<li>" + icon("check") + "<span>" + escapeHtml(t) + "</span></li>").join("")}</ul>
      </div>
    </div>
  </div>
</section>

<section class="lj-section lj-section--mist">
  <div class="lj-container lj-container--narrow">
    ${L.sectionHead("How we deliver it", "From first call to fully running", "")}
    <ol class="lj-steps">${DELIVERY.map(([t, d]) => '<li><div class="lj-steps-body"><p><strong>' + t + ".</strong> " + d + "</p></div></li>").join("")}</ol>
  </div>
</section>

${picks.length ? `<section class="lj-section">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Start smaller</span><h2>Related automations</h2></div>
      <a class="lj-link-arrow" href="/automations/">Browse all automations ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${picks.map((a) => card(a, "industry")).join("")}</div>
  </div>
</section>` : ""}

<section class="lj-section${picks.length ? " lj-section--mist" : ""}">
  <div class="lj-container lj-container--narrow">
    ${L.sectionHead("FAQ", escapeHtml(s.name) + " questions", "")}
    ${faq.html}
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Keep exploring</span><h2>More in ${escapeHtml(c.name)}</h2></div>
      <a class="lj-link-arrow" href="${c.url}">All ${c.solutions.length} in this category ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${siblings.map((x) => solutionCard(x)).join("")}</div>
    ${guide ? '<div class="lj-mt-lg"><span class="lj-eyebrow">Learn more</span><div class="lj-grid lj-grid-2 lj-mt">' + guideCard(guide) + "</div></div>" : ""}
  </div>
</section>`;

  const service = {
    "@type": "Service",
    "@id": SITE_URL + s.url + "#service",
    name: s.name,
    description: s.text,
    serviceType: s.name,
    category: c.name,
    url: SITE_URL + s.url,
    provider: { "@id": SITE_URL + "/#organization" },
    areaServed: { "@type": "Country", name: "United States" },
    audience: { "@type": "BusinessAudience", audienceType: s.for.join("; ") },
  };

  writeFile(
    s.url.slice(1) + "index.html",
    L.page({
      path: s.url,
      title: s.name + " | LJ Web Management",
      description: truncate(s.tagline + " " + s.text, 158),
      active: "solutions",
      jsonLd: [service, crumbs.schema, faq.schema],
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Category page                                                            */
/* ---------------------------------------------------------------------- */

function buildCategory(c, cats, guidesBySlug) {
  const crumbs = L.breadcrumbs([["Home", "/"], ["Solutions", "/solutions/"], [c.name, c.url]]);
  const faq = L.faq(faqItems(c.solutions.map((s) => s.faq[0])));
  const guide = guidesBySlug[c.guide];
  const others = cats.filter((x) => x !== c);

  const main = `
<section class="lj-page-hero lj-page-hero--dark">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">${c.solutions.length} solutions</span>
    <h1>${escapeHtml(c.name)}</h1>
    <p class="lj-lead">${escapeHtml(c.intro)}</p>
    <div class="lj-btn-row"><a class="lj-btn lj-btn-accent" href="/appointment/">Book a Free Consultation ${icon("arrowRight")}</a>${guide ? '<a class="lj-btn lj-btn-light" href="' + guide.url + '">Read the guide</a>' : ""}</div>
  </div>
</section>
<section class="lj-section">
  <div class="lj-container">
    <div class="lj-grid lj-grid-3">${c.solutions.map((s) => solutionCard(s)).join("")}</div>
  </div>
</section>
${guide ? `<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Free guide</span><h2>Plan it before you buy it</h2></div>
      <a class="lj-link-arrow" href="/guides/">All guides ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-2">${guideCard(guide)}</div>
  </div>
</section>` : ""}
<section class="lj-section">
  <div class="lj-container lj-container--narrow">
    ${L.sectionHead("FAQ", escapeHtml(c.name) + " questions", "")}
    ${faq.html}
  </div>
</section>
<section class="lj-section lj-section--mist">
  <div class="lj-container">
    ${L.sectionHead("Other categories", "Explore more solutions", "")}
    <div class="lj-grid lj-grid-3">${others.map(categoryCard).join("")}</div>
  </div>
</section>`;

  writeFile(
    c.url.slice(1) + "index.html",
    L.page({
      path: c.url,
      title: c.name + " Solutions | LJ Web Management",
      description: truncate(c.short, 158),
      active: "solutions",
      jsonLd: [
        {
          "@type": "ItemList",
          name: c.name + " solutions",
          itemListElement: c.solutions.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: SITE_URL + s.url, name: s.name })),
        },
        crumbs.schema,
        faq.schema,
      ],
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Hub                                                                      */
/* ---------------------------------------------------------------------- */

function buildHub(cats, guidesBySlug) {
  const list = all(cats);
  const crumbs = L.breadcrumbs([["Home", "/"], ["Solutions", "/solutions/"]]);
  const guides = cats.map((c) => guidesBySlug[c.guide]).filter(Boolean);
  // Old links pointed at /solutions/#<id>; send them to the solution's page.
  const redirects = Object.fromEntries(list.map((s) => [s.id, s.url]));

  const sections = cats
    .map(
      (c, i) => `
<section class="lj-section${i % 2 ? " lj-section--mist" : ""}" id="${c.slug}">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">${icon(c.icon)} ${c.solutions.length} solutions</span><h2>${escapeHtml(c.name)}</h2><p>${escapeHtml(c.short)}</p></div>
      <a class="lj-link-arrow" href="${c.url}">View category ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${c.solutions.map((s) => solutionCard(s)).join("")}</div>
  </div>
</section>`
    )
    .join("");

  const main = `
<section class="lj-page-hero lj-page-hero--dark">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">${list.length} platform solutions</span>
    <h1>Full-scale systems, <span class="lj-gradient-text">not just single automations</span></h1>
    <p class="lj-lead">Beyond individual role-based automations, these are the systems your business runs on: websites, CRMs, ERPs, billing, field service, HR, data, and AI. We help you choose, build, and connect them so your team works from one integrated backbone instead of disconnected tools.</p>
    <div class="lj-btn-row"><a class="lj-btn lj-btn-accent" href="/appointment/">Book a Free Consultation ${icon("arrowRight")}</a><a class="lj-btn lj-btn-light" href="/automations/">See Role-Based Automations</a></div>
  </div>
</section>
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <nav class="lj-chip-row" aria-label="Jump to a category">${cats.map((c) => '<a class="lj-chip" href="#' + c.slug + '">' + escapeHtml(c.name) + ' <span class="lj-chip-count">' + c.solutions.length + "</span></a>").join("")}</nav>
  </div>
</section>
${sections}
<section class="lj-section">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Free guides</span><h2>Learn before you invest</h2><p>Plain-English guides to choosing, planning, and rolling out each kind of system.</p></div>
      <a class="lj-link-arrow" href="/guides/">All guides ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${guides.map((g) => guideCard(g)).join("")}</div>
  </div>
</section>
<script>(function(){var r=${JSON.stringify(redirects)};var h=location.hash.slice(1);if(r[h])location.replace(r[h]);})();</script>`;

  writeFile(
    "solutions/index.html",
    L.page({
      path: "/solutions/",
      title: "Business Software & Automation Solutions | LJ Web Management",
      description: truncate("Explore " + list.length + " platform solutions from LJ Web Management: websites, CRM, marketing, booking, field service, billing, ERP, HR, BI, AI agents, and custom software.", 158),
      active: "solutions",
      jsonLd: [
        {
          "@type": "ItemList",
          name: "LJ Web Management platform solutions",
          itemListElement: list.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Service", name: s.name, description: s.tagline, url: SITE_URL + s.url, provider: { "@id": SITE_URL + "/#organization" } } })),
        },
        crumbs.schema,
      ],
      main,
    })
  );
}

function build(cats, catalog, guidesBySlug) {
  const solutionsDir = path.join(ROOT, "solutions");
  if (fs.existsSync(solutionsDir)) {
    fs.readdirSync(solutionsDir).forEach((name) => {
      const p2 = path.join(solutionsDir, name);
      if (fs.statSync(p2).isDirectory()) fs.rmSync(p2, { recursive: true, force: true });
    });
  }
  all(cats).forEach((s) => buildSolution(s, catalog, guidesBySlug));
  cats.forEach((c) => buildCategory(c, cats, guidesBySlug));
  buildHub(cats, guidesBySlug);
}

function searchEntries(cats) {
  return cats
    .map((c) => ["Solution", c.name, c.solutions.length + " platform solutions", c.url, c.short])
    .concat(all(cats).map((s) => ["Solution", s.name, s.cat.name, s.url, s.tagline + " " + s.integrations.join(" ") + " " + s.keywords.join(" ")]));
}

module.exports = { load, all, build, searchEntries };
