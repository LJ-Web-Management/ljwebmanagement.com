// Quizzes and assessments:
//   /quizzes/            hub (also lists the original /quiz/ match quiz)
//   /quizzes/<slug>/     one page per file in content/quizzes/*.json
// Quiz types, scored in assets/js/tools.js:
//   score      options carry points; result is a 0-100 score with bands and
//              per-area bars (`dims`)
//   knowledge  one correct answer per question, explained after each pick
//   picker     options add weight to `outcomes`; best and runner-up shown

const fs = require("fs");
const path = require("path");
const { ROOT, SITE_URL, escapeHtml, writeFile } = require("../lib/util");
const L = require("../lib/layout");
const { icon } = L;
const { lower } = require("./tools");

const DIR = path.join(ROOT, "content", "quizzes");

function load() {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const q = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
      q.slug = f.replace(/\.json$/, "");
      q.url = "/quizzes/" + q.slug + "/";
      return q;
    })
    .sort((a, b) => a.order - b.order);
}

// Hub listing, with the original match quiz added at the end.
function list(quizzes) {
  return quizzes
    .map((q) => ({ url: q.url, name: q.name, icon: q.icon, tag: q.tag, minutes: q.minutes, card: q.card }))
    .concat([
      {
        url: "/quiz/",
        name: "Automation Match Quiz",
        icon: "compass",
        tag: "Quiz",
        minutes: 2,
        card: "Answer three quick questions about your biggest bottleneck and get matched to the right automation or platform solution.",
      },
    ]);
}

function crumbsFor(name, url) {
  return L.breadcrumbs([
    ["Home", "/"],
    ["Resources", "/resources/"],
    ["Quizzes", "/quizzes/"],
  ].concat(name ? [[name, url]] : []));
}

function quizPage(q) {
  const crumbs = crumbsFor(q.name, q.url);
  const faq = q.faq && q.faq.length ? L.faq(q.faq) : null;
  const n = q.questions.length;
  const cfg = {
    type: q.type,
    questions: q.questions.map((x) => {
      const o = { options: x.options };
      ["answer", "why", "dim", "link"].forEach((k) => {
        if (x[k] != null) o[k] = x[k];
      });
      return o;
    }),
    dims: q.dims,
    bands: q.bands,
    outcomes: q.outcomes,
    cta: q.cta,
    resultTitle: q.resultTitle,
    resultText: q.resultText,
  };
  const steps = q.questions
    .map((x, i) => {
      const opts = x.options
        .map((o, j) => '<button type="button" class="lj-quiz-opt" data-o="' + j + '" aria-pressed="false"><span>' + escapeHtml(typeof o === "string" ? o : o.t) + "</span>" + icon("arrowRight") + "</button>")
        .join("");
      return (
        '<div class="lj-quiz-step" data-q="' + i + '">' +
        "<h2>" + escapeHtml(x.q) + "</h2>" +
        (x.help ? '<p class="lj-quiz-help">' + escapeHtml(x.help) + "</p>" : "") +
        '<div class="lj-quiz-opts">' + opts + "</div>" +
        (q.type === "knowledge"
          ? '<div class="lj-quiz-feedback" data-lj-quiz-feedback hidden></div><button type="button" class="lj-btn lj-btn-primary" data-lj-quiz-next hidden>' + (i === n - 1 ? "See my score" : "Next question") + " " + icon("arrowRight") + "</button>"
          : "") +
        "</div>"
      );
    })
    .join("");

  const main =
    L.hero({ crumbs, eyebrow: q.eyebrow, title: q.title, lead: q.lead }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <div class="lj-tool-card lj-quiz" data-lj-quiz>
      <script type="application/json">${JSON.stringify(cfg).replace(/</g, "\\u003c")}</script>
      <div class="lj-progress"><div class="lj-progress-bar"></div></div>
      <div class="lj-tool-card-body">
        <div class="lj-quiz-top"><button type="button" class="lj-quiz-back" data-lj-quiz-back hidden>${icon("arrowLeft")} Back</button><span class="lj-quiz-count" data-lj-quiz-count></span></div>
        <div class="lj-quiz-step is-active">
          <span class="lj-eyebrow">${n} questions &middot; about ${q.minutes} minutes</span>
          <h2>${escapeHtml(q.intro.title)}</h2>
          <p>${q.intro.text}</p>
          ${q.intro.bullets ? '<ul class="lj-checklist">' + q.intro.bullets.map((b) => "<li>" + icon("checkCircle") + "<span>" + b + "</span></li>").join("") + "</ul>" : ""}
          <button type="button" class="lj-btn lj-btn-primary lj-btn-lg" data-lj-quiz-start>${escapeHtml(q.intro.button || "Start")} ${icon("arrowRight")}</button>
        </div>
        ${steps}
        <div class="lj-quiz-step lj-quiz-step--result"><div data-lj-quiz-result aria-live="polite"></div></div>
      </div>
    </div>
  </div>
</section>
${lower(q, faq)}`;

  const jsonLd = [
    {
      "@type": q.type === "knowledge" ? "Quiz" : "WebApplication",
      "@id": SITE_URL + q.url + "#quiz",
      name: q.name,
      url: SITE_URL + q.url,
      description: q.description,
      isAccessibleForFree: true,
      publisher: { "@id": SITE_URL + "/#organization" },
    },
    crumbs.schema,
  ];
  if (q.type !== "knowledge") Object.assign(jsonLd[0], { applicationCategory: "BusinessApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } });
  else Object.assign(jsonLd[0], { educationalLevel: "Beginner", about: q.about || "Business automation" });
  if (faq) jsonLd.push(faq.schema);

  writeFile(
    q.url.slice(1) + "index.html",
    L.page({
      path: q.url,
      title: q.seoTitle + " | LJ Web Management",
      description: q.description,
      active: "resources",
      jsonLd,
      endScripts: L.toolsScript(),
      main,
    })
  );
}

function hub(quizzes, tools) {
  const crumbs = crumbsFor();
  const all = list(quizzes);
  const main =
    L.hero({
      crumbs,
      eyebrow: "Quizzes and assessments",
      title: "Free automation and AI quizzes",
      lead: "Find out how ready your business is for AI, test what you know about automation, and get matched to the right platform. Every quiz takes under five minutes and shows your result instantly.",
    }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <div class="lj-grid lj-grid-3">${all.map((q) => L.rcard({ href: q.url, icon: q.icon, tag: q.tag, meta: q.minutes + " min", title: q.name, text: q.card, cta: "Start" })).join("")}</div>
  </div>
</section>
<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Free calculators</span><h2>Put numbers on it</h2></div>
      <a class="lj-link-arrow" href="/tools/">All tools ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">${tools.slice(0, 3).map((t) => L.rcard({ href: t.url, icon: t.icon, tag: t.tag, title: t.name, text: t.text, cta: "Open the tool" })).join("")}</div>
  </div>
</section>`;
  writeFile(
    "quizzes/index.html",
    L.page({
      path: "/quizzes/",
      title: "Free AI & Automation Quizzes and Assessments | LJ Web Management",
      description: "Free AI readiness assessment, automation knowledge quiz, platform picker, and more. See how ready your business is for AI and automation in under five minutes.",
      active: "resources",
      jsonLd: [
        {
          "@type": "CollectionPage",
          "@id": SITE_URL + "/quizzes/#page",
          name: "AI and Automation Quizzes",
          url: SITE_URL + "/quizzes/",
          mainEntity: { "@type": "ItemList", itemListElement: all.map((q, i) => ({ "@type": "ListItem", position: i + 1, url: SITE_URL + q.url, name: q.name })) },
        },
        crumbs.schema,
      ],
      main,
    })
  );
}

function build(quizzes, tools) {
  quizzes.forEach(quizPage);
  hub(quizzes, tools);
}

function searchEntries(quizzes) {
  return quizzes.map((q) => ["Quiz", q.name, q.tag + " · " + q.minutes + " min", q.url, q.card + " " + (q.keywords || "")]);
}

module.exports = { load, list, build, searchEntries };
