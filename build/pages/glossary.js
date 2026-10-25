// /glossary/: plain-English definitions of automation and AI terms from
// content/glossary.json, grouped A to Z, filterable, with DefinedTermSet
// schema so each term can be cited on its own (#term-slug anchors).

const fs = require("fs");
const path = require("path");
const { ROOT, SITE_URL, escapeHtml, slugify, writeFile } = require("../lib/util");
const L = require("../lib/layout");
const { icon } = L;

function load() {
  const g = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "glossary.json"), "utf8"));
  g.terms.forEach((t) => (t.slug = slugify(t.term)));
  g.terms.sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
  return g;
}

function plain(html) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function build(g) {
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Resources", "/resources/"],
    ["Glossary", "/glossary/"],
  ]);
  const groups = {};
  g.terms.forEach((t) => {
    const letter = /^[a-z]/i.test(t.term) ? t.term[0].toUpperCase() : "#";
    (groups[letter] = groups[letter] || []).push(t);
  });
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const az =
    '<nav class="lj-az" aria-label="Jump to letter">' +
    letters.map((l) => (groups[l] ? '<a href="#letter-' + l.toLowerCase() + '">' + l + "</a>" : '<span aria-hidden="true">' + l + "</span>")).join("") +
    "</nav>";
  const body = Object.keys(groups)
    .sort()
    .map(
      (l) =>
        '<section class="lj-gloss-group" data-lj-group id="letter-' + l.toLowerCase() + '"><h2>' + l + "</h2><dl>" +
        groups[l]
          .map(
            (t) =>
              '<div class="lj-term" id="' + t.slug + '" data-lj-item data-text="' + escapeHtml((t.term + " " + (t.aka || "") + " " + plain(t.def)).toLowerCase()) + '">' +
              "<dt>" + escapeHtml(t.term) + (t.aka ? " <small>" + escapeHtml(t.aka) + "</small>" : "") + "</dt>" +
              "<dd>" + t.def + (t.link ? ' <a class="lj-link-arrow" href="' + t.link[1] + '">' + escapeHtml(t.link[0]) + " " + icon("arrowRight") + "</a>" : "") + "</dd></div>"
          )
          .join("") +
        "</dl></section>"
    )
    .join("");

  const main =
    L.hero({ crumbs, eyebrow: "Glossary", title: "Automation and AI glossary", lead: g.lead }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container lj-container--narrow" data-lj-filter data-lj-noun="terms">
    <div class="lj-filter-bar">
      <div class="lj-input-wrap">${icon("search")}<input class="lj-input" type="search" placeholder="Search ${g.terms.length} terms" aria-label="Search the glossary" data-lj-filter-q></div>
      <span class="lj-filter-status" data-lj-filter-status aria-live="polite">${g.terms.length} terms</span>
    </div>
    ${az}
    ${body}
    <p class="lj-empty-state" data-lj-filter-empty hidden>No terms match that search. Try a shorter word, or <a href="/resources/">browse the resource center</a>.</p>
  </div>
</section>
<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Go deeper</span><h2>Learn the concepts in context</h2></div>
      <a class="lj-link-arrow" href="/learn/">Free courses ${icon("arrowRight")}</a>
    </div>
    ${L.linkList(g.related)}
  </div>
</section>`;

  writeFile(
    "glossary/index.html",
    L.page({
      path: "/glossary/",
      title: "Automation & AI Glossary: " + g.terms.length + " Terms in Plain English | LJ Web Management",
      description: "Plain-English definitions of " + g.terms.length + " business automation and AI terms, from API and webhook to AI agent, RPA, LLM, and workflow automation.",
      active: "resources",
      jsonLd: [
        {
          "@type": "DefinedTermSet",
          "@id": SITE_URL + "/glossary/#set",
          name: "Automation and AI Glossary",
          url: SITE_URL + "/glossary/",
          publisher: { "@id": SITE_URL + "/#organization" },
          hasDefinedTerm: g.terms.map((t) => ({
            "@type": "DefinedTerm",
            "@id": SITE_URL + "/glossary/#" + t.slug,
            name: t.term,
            alternateName: t.aka || undefined,
            description: plain(t.def),
            url: SITE_URL + "/glossary/#" + t.slug,
            inDefinedTermSet: { "@id": SITE_URL + "/glossary/#set" },
          })),
        },
        crumbs.schema,
      ],
      main,
    })
  );
}

function searchEntries(g) {
  return g.terms.map((t) => ["Term", t.term, "Glossary", "/glossary/#" + t.slug, (t.aka || "") + " " + plain(t.def).slice(0, 160)]);
}

module.exports = { load, build, searchEntries };
