// Long-form guides: /guides/ hub plus one page per file in content/guides/.
//
// Each guide file starts with an HTML comment holding JSON metadata:
//   title, description, eyebrow, icon, published, updated,
//   keywords   phrases matched against automation titles to pick examples
//   category   function category used when keywords find too few examples
//   keyPoints  short summary bullets shown above the article
//   faq        [[question, answerHtml], ...] rendered visibly with FAQPage schema
//   path       optional URL override (the original /resources/ articles keep theirs)
//   solutionCategory  optional solutions category slug; its solutions are listed below the article
// The body is plain HTML; <h2> headings get ids and feed the table of contents.

const fs = require("fs");
const path = require("path");
const { ROOT, SITE_URL, escapeHtml, slugify, writeFile, truncate } = require("../lib/util");
const L = require("../lib/layout");
const { icon } = L;
const { card, guideCard } = require("./automations");

const GUIDES_DIR = path.join(ROOT, "content", "guides");

// Topic groups for the guides hub and the resource center. Every guide's
// metadata names one of these keys in `group`.
const GROUPS = [
  ["fundamentals", "Automation fundamentals", "compass"],
  ["how-to", "How to automate", "listCheck"],
  ["ai", "AI and agents", "sparkles"],
  ["playbooks", "Workflow playbooks", "zap"],
  ["platforms", "Platforms and ROI", "calculator"],
  ["systems", "Choosing business systems", "building"],
];

function formatDate(iso) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function load(cat) {
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".html"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(GUIDES_DIR, file), "utf8");
      const m = raw.match(/^<!--([\s\S]*?)-->\s*/);
      if (!m) throw new Error("content/guides/" + file + " is missing its metadata comment");
      const meta = JSON.parse(m[1]);
      const slug = file.replace(/\.html$/, "");
      if (!GROUPS.some(([k]) => k === meta.group)) throw new Error("content/guides/" + file + " has an unknown group: " + meta.group);
      const toc = [];
      const body = raw.slice(m[0].length).replace(/<h2>([\s\S]*?)<\/h2>/g, (all, inner) => {
        const text = inner.replace(/<[^>]+>/g, "");
        const id = slugify(text);
        toc.push([id, text]);
        return '<h2 id="' + id + '">' + inner + "</h2>";
      });
      // Checklists are written as plain <li> items; add the check icons here.
      const bodyWithIcons = body.replace(/<ul class="lj-checklist">([\s\S]*?)<\/ul>/g, (all, items) =>
        '<ul class="lj-checklist">' + items.replace(/<li>([\s\S]*?)<\/li>/g, "<li>" + icon("checkCircle") + "<span>$1</span></li>") + "</ul>"
      );
      const extra = (meta.keyPoints || []).join(" ") + " " + (meta.faq || []).map((f) => f.join(" ")).join(" ");
      const words = (body + " " + extra).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
      return Object.assign(
        {
          slug,
          url: meta.path || "/guides/" + slug + "/",
          body: bodyWithIcons,
          toc,
          words,
          readMinutes: Math.max(3, Math.round(words / 230)),
          order: meta.order == null ? 100 : meta.order,
        },
        meta
      );
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

// Example automations for a guide: keyword matches first, spread across
// industries, then the guide's category as a fallback.
function examples(g, cat) {
  const out = [];
  const used = new Set();
  const kws = (g.keywords || []).map((k) => k.toLowerCase());
  const matches = cat.automations.filter((a) => kws.some((k) => a.title.toLowerCase().indexOf(k) !== -1));
  matches.forEach((a) => {
    if (out.length < 6 && !used.has(a.industry)) {
      out.push(a);
      used.add(a.industry);
    }
  });
  matches.forEach((a) => {
    if (out.length < 6 && out.indexOf(a) === -1) out.push(a);
  });
  if (g.category) {
    cat.categoryBySlug[g.category].items.forEach((a) => {
      if (out.length < 6 && out.indexOf(a) === -1 && !used.has(a.industry)) {
        out.push(a);
        used.add(a.industry);
      }
    });
  }
  return out;
}

function buildGuide(g, all, cat, solutionCats) {
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Resources", "/resources/"],
    ["Guides", "/guides/"],
    [g.title, g.url],
  ]);
  const faq = g.faq && g.faq.length ? L.faq(g.faq) : null;
  const picks = examples(g, cat);
  const solCat = g.solutionCategory ? solutionCats.find((c) => c.slug === g.solutionCategory) : null;
  if (g.solutionCategory && !solCat) throw new Error("content/guides/" + g.slug + ".html has an unknown solutionCategory: " + g.solutionCategory);
  // Related guides: any named in the metadata first, then the same topic
  // group, then the same business function.
  const named = (g.related || []).map((slug) => all.find((x) => x.slug === slug)).filter(Boolean);
  const rank = (x) => (x.group === g.group ? 0 : 2) + (x.category === g.category ? 0 : 1);
  const related = named.concat(all.filter((x) => x !== g && named.indexOf(x) === -1).sort((a, b) => rank(a) - rank(b))).slice(0, 3);
  const updated = g.updated || g.published;
  const share = encodeURIComponent(SITE_URL + g.url);
  const shareTitle = encodeURIComponent(g.title);

  const main = `
<header class="lj-article-hero">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">${escapeHtml(g.eyebrow || "Guide")}</span>
    <h1>${escapeHtml(g.title)}</h1>
    <p class="lj-lead">${escapeHtml(g.description)}</p>
    <div class="lj-article-meta">
      <span class="lj-author"><img src="/assets/lj-logo-80.webp" width="36" height="36" alt=""><span>LJ Web Management<small>Automation team</small></span></span>
      <span>${icon("calendar")}Updated <time datetime="${updated}">${formatDate(updated)}</time></span>
      <span>${icon("clock")}${g.readMinutes} min read</span>
    </div>
  </div>
</header>
<div class="lj-container">
  <div class="lj-article-layout">
    <article class="lj-prose">
      ${g.keyPoints ? '<div class="lj-keypoints"><p>Key takeaways</p><ul>' + g.keyPoints.map((k) => "<li>" + k + "</li>").join("") + "</ul></div>" : ""}
      ${g.body}
      ${faq ? '<h2 id="faq">Frequently asked questions</h2>' + faq.html : ""}
      <div class="lj-article-footer">
        <div class="lj-share"><span>Share this guide</span>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">${icon("linkedin")}</a>
          <a href="https://x.com/intent/post?url=${share}&amp;text=${shareTitle}" target="_blank" rel="noopener" aria-label="Share on X">${icon("xlogo")}</a>
          <a href="mailto:?subject=${shareTitle}&amp;body=${share}" aria-label="Share by email">${icon("mail")}</a>
        </div>
      </div>
    </article>
    <aside class="lj-article-aside" aria-label="On this page">
      ${g.toc.length > 2 ? '<nav class="lj-toc" aria-label="Table of contents"><p>On this page</p><ol>' + g.toc.map(([id, t]) => '<li><a href="#' + id + '">' + escapeHtml(t) + "</a></li>").join("") + (faq ? '<li><a href="#faq">FAQ</a></li>' : "") + "</ol></nav>" : ""}
      ${g.tools ? '<div class="lj-aside-tools"><p>Free tools for this</p>' + L.linkList(g.tools) + "</div>" : ""}
      <div class="lj-aside-cta"><strong>Want this built for you?</strong>We scope it on a free call and quote a flat price before any work starts.<a class="lj-btn lj-btn-accent lj-btn-sm" href="/appointment/">Book a Free Consultation</a></div>
    </aside>
  </div>
</div>
${solCat ? `<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Solutions</span><h2>${escapeHtml(solCat.name)} we build</h2></div>
      <a class="lj-link-arrow" href="${solCat.url}">View the category ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${solCat.solutions.map((s) => '<a class="lj-card lj-ccard" href="' + s.url + '"><div class="lj-ccard-top"><span class="lj-card-icon">' + icon(s.icon) + "</span></div><h3>" + escapeHtml(s.name) + "</h3><p>" + escapeHtml(s.tagline) + '</p><div class="lj-card-foot"><span class="lj-link-arrow">View solution ' + icon("arrowRight") + "</span></div></a>").join("")}</div>
  </div>
</section>` : ""}
${!solCat && picks.length ? `<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Put it into practice</span><h2>Automations that do this for you</h2></div>
      <a class="lj-link-arrow" href="/automations/">Browse all automations ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${picks.map((a) => card(a, "industry")).join("")}</div>
  </div>
</section>` : ""}
<section class="lj-section">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Keep reading</span><h2>More automation guides</h2></div>
      <a class="lj-link-arrow" href="/guides/">All guides ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${related.map((g) => guideCard(g)).join("")}</div>
  </div>
</section>`;

  const article = {
    "@type": "Article",
    "@id": SITE_URL + g.url + "#article",
    headline: g.title,
    description: g.description,
    image: L.SHARE_IMAGE,
    datePublished: g.published,
    dateModified: updated,
    wordCount: g.words,
    author: { "@id": SITE_URL + "/#organization" },
    publisher: { "@id": SITE_URL + "/#organization" },
    mainEntityOfPage: SITE_URL + g.url,
    inLanguage: "en-US",
  };

  writeFile(
    g.url.slice(1) + "index.html",
    L.page({
      path: g.url,
      title: (g.seoTitle || g.title) + " | LJ Web Management",
      description: truncate(g.description, 158),
      ogType: "article",
      active: "resources",
      extraHead: '<meta property="article:published_time" content="' + g.published + '"><meta property="article:modified_time" content="' + updated + '">',
      jsonLd: [article, crumbs.schema].concat(faq ? [faq.schema] : []),
      main,
    })
  );
}

function buildHub(all, latestPosts) {
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Resources", "/resources/"],
    ["Guides", "/guides/"],
  ]);
  const main = `
<section class="lj-page-hero lj-page-hero--center">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">Automation guides</span>
    <h1>Practical playbooks for <span class="lj-gradient-text--ink">automating your business</span></h1>
    <p class="lj-lead">${all.length} free guides to workflow automation, AI, and the processes that save small teams the most time, from how to automate your business to lead follow-up, invoicing, reporting, and AI agents. Written from the automations we build every week.</p>
  </div>
</section>
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <div class="lj-chip-row lj-guide-jump">${GROUPS.map(([k, name]) => '<a class="lj-chip" href="#' + k + '">' + name + ' <span class="lj-chip-count">' + all.filter((g) => g.group === k).length + "</span></a>").join("")}</div>
    ${GROUPS.map(([k, name, ic]) => '<h2 class="lj-group-title" id="' + k + '"><span class="lj-card-icon">' + icon(ic) + "</span>" + name + "</h2>" + '<div class="lj-grid lj-grid-3">' + all.filter((g) => g.group === k).map((g) => guideCard(g, g.order === 1 ? "Start here" : g.eyebrow === name ? "Guide" : g.eyebrow)).join("") + "</div>").join("")}
  </div>
</section>
<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">From the blog</span><h2>Fresh ideas, published daily</h2></div>
      <a class="lj-link-arrow" href="https://blog.ljwebmanagement.com/">Visit the blog ${icon("arrowRight")}</a>
    </div>
    ${latestPosts(3)}
  </div>
</section>`;

  writeFile(
    "guides/index.html",
    L.page({
      path: "/guides/",
      title: "Automation & AI Guides: How to Automate Your Business | LJ Web Management",
      description: "Free guides to workflow automation, AI, and RPA: how to automate emails, invoices, reports, data entry, customer support, and more, from the team that builds them.",
      active: "resources",
      jsonLd: [
        {
          "@type": "CollectionPage",
          "@id": SITE_URL + "/guides/#page",
          name: "Business Automation Guides",
          url: SITE_URL + "/guides/",
          mainEntity: { "@type": "ItemList", itemListElement: all.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: SITE_URL + g.url, name: g.title })) },
        },
        crumbs.schema,
      ],
      endScripts: '<script src="https://blog.ljwebmanagement.com/assets/js/latest-posts.js" defer></script>',
      main,
    })
  );
}

function build(all, cat, latestPosts, solutionCats) {
  all.forEach((g) => buildGuide(g, all, cat, solutionCats || []));
  buildHub(all, latestPosts);
}

function searchEntries(all) {
  return all.map((g) => ["Guide", g.title, (g.eyebrow || "Guide") + " · " + g.readMinutes + " min read", g.url, (g.keywords || []).join(" ") + " " + g.description]);
}

module.exports = { load, build, searchEntries, formatDate, GROUPS };
