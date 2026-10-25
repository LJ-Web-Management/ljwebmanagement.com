// Machine-readable outputs: sitemap.xml, llms.txt, llms-full.txt and the
// /crawl/ plain-text page. The hand-written intros for the llms files live
// in content/llms-intro.md and content/llms-full-intro.md.

const fs = require("fs");
const path = require("path");
const { ROOT, SITE_URL, BLOG_URL, escapeHtml, writeFile, formatNumber } = require("../lib/util");

const today = new Date().toISOString().slice(0, 10);

function text(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function sitemap(cat, guides, auto) {
  const urls = [];
  const add = (p, freq, priority) => urls.push({ loc: SITE_URL + p, freq, priority });
  add("/", "daily", "1.0");
  add("/automations/", "weekly", "0.9");
  add("/appointment/", "monthly", "0.9");
  add("/how-it-works/", "monthly", "0.8");
  add("/solutions/", "monthly", "0.8");
  add("/guides/", "weekly", "0.8");
  add("/faq/", "monthly", "0.7");
  add("/roi-calculator/", "monthly", "0.7");
  add("/quiz/", "monthly", "0.7");
  add("/contactus/", "monthly", "0.6");
  cat.categories.forEach((c) => add(c.url, "weekly", "0.8"));
  cat.industries.forEach((i) => add(i.url, "weekly", "0.8"));
  cat.tools.forEach((t) => add(t.url, "weekly", "0.6"));
  guides.forEach((g) => add(g.url, "monthly", "0.8"));
  for (let p = 2; p <= auto.pages; p++) add("/automations/page/" + p + "/", "weekly", "0.4");
  cat.automations.forEach((a) => add(a.url, "monthly", "0.6"));
  add("/privacy-policy/", "yearly", "0.3");
  add("/terms-of-service/", "yearly", "0.3");

  writeFile(
    "sitemap.xml",
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map((u) => "  <url>\n    <loc>" + u.loc + "</loc>\n    <lastmod>" + today + "</lastmod>\n    <changefreq>" + u.freq + "</changefreq>\n    <priority>" + u.priority + "</priority>\n  </url>").join("\n") +
      "\n</urlset>\n"
  );
  return urls.length;
}

function llms(cat, guides) {
  const intro = fs.readFileSync(path.join(ROOT, "content", "llms-intro.md"), "utf8").trim();
  const total = formatNumber(cat.automations.length);
  const out = [
    intro,
    "",
    "## Core Pages",
    "",
    "- [Home](" + SITE_URL + "/): Overview of what LJ Web Management does and how automation engagements start.",
    "- [How It Works](" + SITE_URL + "/how-it-works/): Explains the process from consultation to flat quote to delivery.",
    "- [Automations](" + SITE_URL + "/automations/): Searchable catalog of " + total + "+ done-for-you automations, organized by business function, industry, and tool. Every automation has its own page with step-by-step detail.",
    "- [Solutions](" + SITE_URL + "/solutions/): Platform-scale offerings, including custom websites, CRM, ERP implementation and integration, booking, field service, billing, help desk, inventory, HR and payroll, BI reporting, customer portals, marketplaces, managed SaaS, LMS deployment, and restaurant POS systems.",
    "- [Guides](" + SITE_URL + "/guides/): Step-by-step playbooks for common automation projects.",
    "- [FAQ](" + SITE_URL + "/faq/): Answers to common questions about pricing, timelines, how automations are scoped, and what AI adoption means for a team.",
    "- [ROI Calculator](" + SITE_URL + "/roi-calculator/): Estimates hours and dollars lost monthly to manual work, and the savings automation could return.",
    "- [Find Your Match Quiz](" + SITE_URL + "/quiz/): A short quiz that matches a business's biggest bottleneck to the right automation or solution.",
    "- [Book a Consultation](" + SITE_URL + "/appointment/): Schedule a free consultation to scope an automation project.",
    "- [Contact Us](" + SITE_URL + "/contactus/): General contact information and inquiry form.",
    "- [Blog](" + BLOG_URL + "/): Daily articles on AI and business automation.",
    "",
    "## Automations by Business Function",
    "",
  ];
  cat.categories.forEach((c) => out.push("- [" + c.name + "](" + SITE_URL + c.url + "): " + c.short + " (" + c.items.length + " automations)"));
  out.push("", "## Guides", "");
  guides.forEach((g) => out.push("- [" + g.title + "](" + SITE_URL + g.url + "): " + g.description));
  out.push(
    "",
    "## Full detail",
    "",
    "- [llms-full.txt](" + SITE_URL + "/llms-full.txt): Extended reference with every business function, industry, and integration in the catalog, the solution descriptions, and the full FAQ, in plain text for AI systems and answer engines.",
    "- [/crawl](" + SITE_URL + "/crawl/): Plain-text rendering of llms-full.txt for AI crawlers that request a specific crawl path.",
    "- [openapi.json](" + SITE_URL + "/openapi.json): OpenAPI description of this site's read-only reference endpoints (llms.txt, llms-full.txt, sitemap.xml, /crawl/, /faq/, /automations/).",
    "- [/.well-known/ai-plugin.json](" + SITE_URL + "/.well-known/ai-plugin.json): AI tool manifest pointing to the OpenAPI description above.",
    "",
    "## Company Info",
    "",
    "- Address: 1108 E 9th St., Lockport, IL 60441",
    "- Phone: +1-877-559-3268",
    "- Email: info@ljwebmanagement.com",
    "- Social: LinkedIn https://www.linkedin.com/company/ljwebmanagement/, Instagram https://www.instagram.com/ljwebmanagement/, X https://x.com/lj_web_mgmt",
    "",
    "## Optional",
    "",
    "- [Privacy Policy](" + SITE_URL + "/privacy-policy/)",
    "- [Terms of Service](" + SITE_URL + "/terms-of-service/)",
    ""
  );
  writeFile("llms.txt", out.join("\n"));
}

function llmsFull(cat, guides) {
  const intro = fs.readFileSync(path.join(ROOT, "content", "llms-full-intro.md"), "utf8").trim();
  const sols = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "solutions.json"), "utf8"));
  const faq = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "faq.json"), "utf8"));
  const out = [intro, "", "## Platform-Scale Solutions (" + sols.length + ")"];
  sols.forEach((s) => out.push("- **" + s.name + "**: " + s.text));
  out.push("", "## Automation Catalog", "Every automation has its own page at " + SITE_URL + "/automations/<industry>/<automation>/ with a step-by-step description, the tools it connects, and the manual process it replaces.", "", "### By business function (" + cat.categories.length + ")");
  cat.categories.forEach((c) => out.push("- " + c.name + " (" + c.items.length + "): " + SITE_URL + c.url));
  out.push("", "### By industry (" + cat.industries.length + ")");
  cat.industries.forEach((i) => out.push("- " + i.name + " (" + i.items.length + "): " + SITE_URL + i.url + " " + i.card));
  out.push("", "### By tool (" + cat.tools.length + ")");
  cat.tools.forEach((t) => out.push("- " + t.name + " (" + t.items.length + "): " + SITE_URL + t.url));
  out.push("", "## Frequently Asked Questions");
  faq.forEach((g) =>
    g.items.forEach(([q, a]) => {
      out.push("**Q: " + q + "**", "A: " + text(a), "");
    })
  );
  out.push("## Guides", "");
  guides.forEach((g) => out.push("- " + g.title + ": " + SITE_URL + g.url));
  out.push(
    "",
    "## Key URLs",
    "- Home: " + SITE_URL + "/",
    "- How It Works: " + SITE_URL + "/how-it-works/",
    "- Automations catalog: " + SITE_URL + "/automations/",
    "- Guides: " + SITE_URL + "/guides/",
    "- Solutions: " + SITE_URL + "/solutions/",
    "- FAQ: " + SITE_URL + "/faq/",
    "- ROI Calculator: " + SITE_URL + "/roi-calculator/",
    "- Find Your Match Quiz: " + SITE_URL + "/quiz/",
    "- Book a Consultation: " + SITE_URL + "/appointment/",
    "- Contact: " + SITE_URL + "/contactus/",
    "- Blog: " + BLOG_URL + "/",
    "- Privacy Policy: " + SITE_URL + "/privacy-policy/",
    "- Terms of Service: " + SITE_URL + "/terms-of-service/",
    ""
  );
  const body = out.join("\n");
  writeFile("llms-full.txt", body);

  writeFile(
    "crawl/index.html",
    '<!DOCTYPE html>\n<html lang="en-US">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<meta name="description" content="Plain-text reference for AI systems and answer engines: LJ Web Management company facts, solutions, automation catalog, and FAQ.">\n' +
      '<link rel="icon" href="/assets/favicon.ico">\n<meta name="robots" content="noindex, follow">\n<title>Crawl Reference | LJ Web Management</title>\n' +
      '<link rel="canonical" href="' + SITE_URL + '/crawl/">\n' +
      "<style>body{font-family:monospace;font-size:16px;white-space:pre-wrap;max-width:860px;margin:40px auto;padding:0 20px;line-height:1.5;color:#16202e;}</style>\n</head>\n<body>\n" +
      escapeHtml(body).replace(/'/g, "&#x27;") +
      "</body>\n</html>\n"
  );
}

function build(cat, guides, auto) {
  const n = sitemap(cat, guides, auto);
  llms(cat, guides);
  llmsFull(cat, guides);
  console.log("  sitemap.xml: " + n + " URLs");
}

module.exports = { build };
