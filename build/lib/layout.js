// Page shell for the main site: <head>, shared header and footer, and the
// small shared components (breadcrumbs, cards, FAQ) used by every builder.

const chrome = require("./chrome");
const { SITE_URL, escapeHtml, fileHash, jsonLd, truncate } = require("./util");

const SHARE_IMAGE = SITE_URL + "/assets/social-share.png";
const YEAR = new Date().getFullYear();

let assetVersions = null;
function versions() {
  if (!assetVersions) {
    assetVersions = { css: fileHash("assets/css/site.css"), js: fileHash("assets/js/site.js") };
  }
  return assetVersions;
}

function head(opts) {
  const v = versions();
  const title = escapeHtml(opts.title);
  const description = escapeHtml(opts.description);
  const canonical = opts.canonical || SITE_URL + opts.path;
  const ogImage = opts.ogImage || SHARE_IMAGE;
  const lines = [
    "<!DOCTYPE html>",
    '<html lang="en-US">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>" + title + "</title>",
    '<meta name="description" content="' + description + '">',
  ];
  if (opts.robots) lines.push('<meta name="robots" content="' + opts.robots + '">');
  if (!opts.noCanonical) lines.push('<link rel="canonical" href="' + canonical + '">');
  lines.push(
    '<meta property="og:type" content="' + (opts.ogType || "website") + '">',
    '<meta property="og:site_name" content="LJ Web Management">',
    '<meta property="og:title" content="' + title + '">',
    '<meta property="og:description" content="' + description + '">',
    '<meta property="og:url" content="' + canonical + '">',
    '<meta property="og:image" content="' + ogImage + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + title + '">',
    '<meta name="twitter:description" content="' + description + '">',
    '<meta name="twitter:image" content="' + ogImage + '">',
    '<meta name="theme-color" content="#081426">',
    '<link rel="icon" href="/assets/favicon.ico" sizes="any">',
    '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">',
    '<link rel="alternate" type="application/rss+xml" title="LJ Web Management Blog" href="' + chrome.BLOG_URL + '/feed.xml">',
    '<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="/assets/fonts/sora-latin.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="stylesheet" href="/assets/css/site.css?v=' + v.css + '">',
    "<script>document.documentElement.classList.add('lj-js')</script>",
    '<script src="/assets/js/site.js?v=' + v.js + '" defer></script>'
  );
  if (opts.extraHead) lines.push(opts.extraHead);
  lines.push(jsonLd([chrome.ORGANIZATION].concat(opts.jsonLd || [])));
  lines.push(chrome.analytics(), "</head>");
  return lines.join("\n");
}

// Script tag for the interactive tools engine (calculators, quizzes, course
// progress), loaded only on the pages that use it.
function toolsScript() {
  return '<script src="/assets/js/tools.js?v=' + fileHash("assets/js/tools.js") + '" defer></script>';
}

// Full page. `opts.main` is the inner HTML of <main>.
function page(opts) {
  return [
    head(opts),
    '<body class="' + (opts.bodyClass || "") + '">',
    chrome.header({ base: "", active: opts.active }),
    '<main id="main" tabindex="-1">',
    opts.main,
    "</main>",
    chrome.footer({ base: "", year: YEAR }),
    opts.endScripts || "",
    chrome.chatWidget(),
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

// Breadcrumb trail plus its BreadcrumbList schema node.
// `items` is [[name, path], ...]; the last item is the current page.
function breadcrumbs(items) {
  const html =
    '<nav class="lj-breadcrumbs" aria-label="Breadcrumb"><ol>' +
    items
      .map(([name, p], i) =>
        i === items.length - 1
          ? '<li><span aria-current="page">' + escapeHtml(truncate(name, 70)) + "</span></li>"
          : '<li><a href="' + p + '">' + escapeHtml(name) + "</a></li>"
      )
      .join("") +
    "</ol></nav>";
  const schema = {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, p], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: SITE_URL + p,
    })),
  };
  return { html, schema };
}

// Visible FAQ list plus the matching FAQPage schema node. Answers are HTML.
function faq(items) {
  const html =
    '<div class="lj-faq">' +
    items
      .map(
        ([q, a]) =>
          "<details><summary>" + escapeHtml(q) + '</summary><div class="lj-faq-answer">' + a + "</div></details>"
      )
      .join("") +
    "</div>";
  const schema = {
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() },
    })),
  };
  return { html, schema };
}

function sectionHead(eyebrow, title, text, cls) {
  return (
    '<div class="lj-section-head' + (cls ? " " + cls : "") + '">' +
    (eyebrow ? '<span class="lj-eyebrow">' + eyebrow + "</span>" : "") +
    "<h2>" + title + "</h2>" +
    (text ? "<p>" + text + "</p>" : "") +
    "</div>"
  );
}

// Light page hero used by the resource pages. `title` and `lead` are HTML.
function hero(o) {
  return (
    '<section class="lj-page-hero' + (o.center === false ? "" : " lj-page-hero--center") + '"><div class="lj-container">' +
    (o.crumbs ? o.crumbs.html : "") +
    (o.eyebrow ? '<span class="lj-eyebrow lj-eyebrow--pill">' + o.eyebrow + "</span>" : "") +
    "<h1>" + o.title + "</h1>" +
    (o.lead ? '<p class="lj-lead">' + o.lead + "</p>" : "") +
    (o.extra || "") +
    "</div></section>"
  );
}

// Resource card (course, quiz, calculator, guide): icon, tag, title, text.
function rcard(o) {
  return (
    '<a class="lj-card lj-gcard" href="' + o.href + '">' +
    '<span class="lj-gcard-top"><span class="lj-card-icon lj-card-icon--soft">' + chrome.icon(o.icon || "book") + '</span><span class="lj-post-card-meta"><span class="lj-tag lj-tag--cyan">' + escapeHtml(o.tag) + "</span>" + (o.meta ? "<span>" + escapeHtml(o.meta) + "</span>" : "") + "</span></span>" +
    "<h3>" + escapeHtml(o.title) + "</h3><p>" + escapeHtml(truncate(o.text, 150)) + "</p>" +
    '<span class="lj-link-arrow">' + escapeHtml(o.cta || "Open") + " " + chrome.icon("arrowRight") + "</span></a>"
  );
}

// Compact list of related links: [[title, href, iconName], ...].
function linkList(items) {
  return (
    '<ul class="lj-link-list">' +
    items.map(([t, href, ic]) => '<li><a href="' + href + '">' + chrome.icon(ic || "arrowRight") + "<span>" + escapeHtml(t) + "</span></a></li>").join("") +
    "</ul>"
  );
}



module.exports = {
  YEAR,
  SHARE_IMAGE,
  head,
  page,
  breadcrumbs,
  faq,
  sectionHead,
  hero,
  rcard,
  toolsScript,
  linkList,
  icon: chrome.icon,
};
