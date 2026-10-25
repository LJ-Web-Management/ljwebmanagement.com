// /resources/: the free resource center. One page that links every guide
// (grouped by topic), course, quiz, calculator, the glossary, the prompt
// library and the latest blog posts.

const { SITE_URL, escapeHtml, writeFile } = require("../lib/util");
const L = require("../lib/layout");
const { icon } = L;
const { GROUPS } = require("./guides");

function tile(href, ic, title, sub) {
  return '<a class="lj-itile" href="' + href + '"><span class="lj-itile-icon">' + icon(ic) + "</span><span><strong>" + escapeHtml(title) + "</strong><small>" + escapeHtml(sub) + "</small></span></a>";
}

function build({ guides, courses, quizzes, tools, glossary, latestPosts }) {
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Resources", "/resources/"],
  ]);
  const lessons = courses.reduce((a, c) => a + c.lessons.length, 0);
  const find = (url) => guides.find((g) => g.url === url);
  const pillar = find("/guides/how-to-automate-your-business/") || guides[0];
  const readiness = quizzes.find((q) => q.url === "/quizzes/ai-readiness-assessment/") || quizzes[0];
  const stats = [
    [guides.length, "in-depth guides"],
    [courses.length + " courses", lessons + " lessons"],
    [quizzes.length, "quizzes and assessments"],
    [tools.length, "calculators and tools"],
    [glossary.terms.length, "glossary terms"],
  ];
  const popular = ["Workflow automation", "AI agent", "API", "Webhook", "Trigger", "Large language model (LLM)", "Robotic process automation (RPA)", "Prompt", "CRM", "Human in the loop", "Zapier", "Retrieval-augmented generation (RAG)"]
    .map((name) => glossary.terms.find((t) => t.term === name))
    .filter(Boolean);

  const topicCols = GROUPS.map(([key, name, ic]) => {
    const items = guides.filter((g) => g.group === key);
    if (!items.length) return "";
    return (
      '<div class="lj-topic"><h3>' + '<span class="lj-card-icon lj-card-icon--soft">' + icon(ic) + "</span>" + escapeHtml(name) + "</h3><ul>" +
      items.map((g) => '<li><a href="' + g.url + '">' + escapeHtml(g.title) + "</a></li>").join("") +
      "</ul></div>"
    );
  }).join("");

  const main = `
<section class="lj-page-hero lj-page-hero--center">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">Free resource center</span>
    <h1>Everything you need to <span class="lj-gradient-text--ink">automate your business</span></h1>
    <p class="lj-lead">Free guides, courses, quizzes, calculators, and a plain-English glossary covering workflow automation, AI, and everything in between. Learn how to automate, decide what to automate first, and put numbers on the payoff.</p>
    <div class="lj-hero-search-wrap"><button type="button" class="lj-hero-search" data-lj-search-open aria-label="Search guides, lessons, tools, and terms">${icon("search")}<span class="lj-hero-search-text">Search guides, lessons, tools, and terms</span><span class="lj-btn lj-btn-primary lj-btn-sm">Search</span></button></div>
    <ul class="lj-res-stats">${stats.map(([n, t]) => "<li><strong>" + n + "</strong><span>" + t + "</span></li>").join("")}</ul>
  </div>
</section>
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--left"><span class="lj-eyebrow">Start here</span><h2>New to automation? Begin with these three</h2></div>
    <div class="lj-grid lj-grid-3">
      ${L.rcard({ href: courses[0].url, icon: courses[0].icon, tag: "Free course", meta: courses[0].lessons.length + " lessons", title: courses[0].name, text: courses[0].description, cta: "Start learning" })}
      ${L.rcard({ href: readiness.url, icon: readiness.icon, tag: readiness.tag, meta: readiness.minutes + " min", title: readiness.name, text: readiness.card, cta: "Take the assessment" })}
      ${L.rcard({ href: pillar.url, icon: pillar.icon, tag: "Guide", meta: pillar.readMinutes + " min read", title: pillar.title, text: pillar.description, cta: "Read the guide" })}
    </div>
  </div>
</section>
<section class="lj-section lj-section--mist" id="guides">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Guides by topic</span><h2>${guides.length} guides, from the basics to AI agents</h2></div>
      <a class="lj-link-arrow" href="/guides/">All guides ${icon("arrowRight")}</a>
    </div>
    <div class="lj-topics">${topicCols}</div>
  </div>
</section>
<section class="lj-section" id="courses">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Free courses</span><h2>Learn it step by step</h2></div>
      <a class="lj-link-arrow" href="/learn/">All courses ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-2">${courses.map((c) => L.rcard({ href: c.url, icon: c.icon, tag: "Free course · " + c.level, meta: c.lessons.length + " lessons", title: c.name, text: c.description, cta: "View the course" })).join("")}</div>
  </div>
</section>
<section class="lj-section lj-section--mist" id="tools">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split"><div><span class="lj-eyebrow">Quizzes and assessments</span><h2>See where you stand</h2></div><a class="lj-link-arrow" href="/quizzes/">All quizzes ${icon("arrowRight")}</a></div>
    <div class="lj-grid lj-grid-auto-sm">${quizzes.map((q) => tile(q.url, q.icon, q.name, q.tag + " · " + q.minutes + " min")).join("")}</div>
    <div class="lj-section-head lj-section-head--split lj-res-sub"><div><span class="lj-eyebrow">Calculators and tools</span><h2>Put numbers on it</h2></div><a class="lj-link-arrow" href="/tools/">All tools ${icon("arrowRight")}</a></div>
    <div class="lj-grid lj-grid-auto-sm">${tools.map((t) => tile(t.url, t.icon, t.name, t.tag)).join("")}</div>
  </div>
</section>
<section class="lj-section" id="glossary">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Glossary</span><h2>Automation and AI terms, in plain English</h2></div>
      <a class="lj-link-arrow" href="/glossary/">All ${glossary.terms.length} terms ${icon("arrowRight")}</a>
    </div>
    <div class="lj-chip-row">${popular.map((t) => '<a class="lj-chip" href="/glossary/#' + t.slug + '">' + escapeHtml(t.term) + "</a>").join("")}</div>
  </div>
</section>
<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">From the blog</span><h2>Fresh AI and automation ideas, published daily</h2></div>
      <a class="lj-link-arrow" href="https://blog.ljwebmanagement.com/">Visit the blog ${icon("arrowRight")}</a>
    </div>
    ${latestPosts(3)}
  </div>
</section>`;

  const parts = []
    .concat(courses.map((c) => [c.name, c.url]))
    .concat(quizzes.map((q) => [q.name, q.url]))
    .concat(tools.map((t) => [t.name, t.url]))
    .concat([["Automation and AI Glossary", "/glossary/"]])
    .concat(guides.map((g) => [g.title, g.url]));

  writeFile(
    "resources/index.html",
    L.page({
      path: "/resources/",
      title: "Free Automation & AI Resource Center: Guides, Courses, Tools | LJ Web Management",
      description: "Free workflow automation and AI learning resources: " + guides.length + " guides, " + courses.length + " courses, quizzes, calculators, an AI prompt library, and a " + glossary.terms.length + "-term glossary.",
      active: "resources",
      jsonLd: [
        {
          "@type": "CollectionPage",
          "@id": SITE_URL + "/resources/#page",
          name: "Automation and AI Resource Center",
          url: SITE_URL + "/resources/",
          description: "Free guides, courses, quizzes, calculators, and a glossary for learning business automation and AI.",
          isAccessibleForFree: true,
          publisher: { "@id": SITE_URL + "/#organization" },
          mainEntity: { "@type": "ItemList", itemListElement: parts.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, url: SITE_URL + url })) },
        },
        crumbs.schema,
      ],
      endScripts: '<script src="https://blog.ljwebmanagement.com/assets/js/latest-posts.js" defer></script>',
      main,
    })
  );
}

module.exports = { build };
