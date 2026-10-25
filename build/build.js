// Builds the main site. Run with `npm run build` (Node 18+, no dependencies).
//
// Sources:
//   content/automations.json   every automation (industry, function, tools, copy)
//   content/taxonomy.js        function categories, tool pages, industry copy
//   content/guides/*.html      long-form guides (metadata in a leading comment)
//   content/learn/<course>/    free courses: course.json plus one file per lesson
//   content/quizzes/*.json     quizzes and assessments
//   content/tools.js           calculators and the priority scorer
//   content/prompts.json       the AI prompt library
//   content/glossary.json      glossary terms
//   content/pages/*.html       static page bodies (legal pages, quiz script)
// Output is written straight into the repo root, which the deploy workflow
// syncs to S3 as is.

const fs = require("fs");
const path = require("path");
const { ROOT, writeFile } = require("./lib/util");
const chrome = require("./lib/chrome");
const catalog = require("./lib/catalog").load();
const automations = require("./pages/automations");
const guides = require("./pages/guides");
const pages = require("./pages/static");
const seo = require("./pages/seo");
const learn = require("./pages/learn");
const quizzes = require("./pages/quizzes");
const tools = require("./pages/tools");
const glossary = require("./pages/glossary");
const resources = require("./pages/resources");
const { latestPosts } = require("./lib/blogfeed");

function checkNav() {
  // The shared chrome carries its own copy of the category names so it can
  // be dropped into the blog repo unchanged; make sure it has not drifted.
  chrome.NAV_CATEGORIES.forEach(([slug, name]) => {
    const c = catalog.categoryBySlug[slug];
    if (!c || c.name !== name) throw new Error("build/lib/chrome.js NAV_CATEGORIES is out of sync for " + slug);
  });
  chrome.NAV_INDUSTRIES.forEach(([slug]) => {
    if (!catalog.industryBySlug[slug]) throw new Error("build/lib/chrome.js NAV_INDUSTRIES has unknown industry " + slug);
  });
}

function cleanGenerated() {
  // Remove generated folders from a previous build so renamed or deleted
  // automations, guides, lessons, quizzes and tools do not linger as stale
  // pages. Every folder listed here is fully generated.
  ["automations", "guides", "resources", "learn", "quizzes", "tools", "glossary"].forEach((top) => {
    const dir = path.join(ROOT, top);
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach((name) => {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) fs.rmSync(p, { recursive: true, force: true });
    });
  });
}

function main() {
  checkNav();
  cleanGenerated();
  const guideList = guides.load(catalog);
  const guidesBySlug = Object.fromEntries(guideList.map((g) => [g.slug, g]));

  const courseList = learn.load();
  const quizData = quizzes.load();
  const quizList = quizzes.list(quizData);
  const toolList = tools.list();
  const terms = glossary.load();
  const extra = { courses: courseList, quizzes: quizList, tools: toolList, glossary: terms };

  const auto = automations.build(catalog, guidesBySlug);
  guides.build(guideList, catalog, latestPosts);
  learn.build(courseList);
  quizzes.build(quizData, toolList);
  tools.build(quizList);
  glossary.build(terms);
  resources.build(Object.assign({ guides: guideList, latestPosts }, extra));
  pages.build(catalog, guideList, extra);
  seo.build(catalog, guideList, auto, extra);

  writeFile(
    "assets/data/search-index.js",
    "window.LJ_SEARCH_INDEX=" +
      JSON.stringify(
        []
          .concat(pages.searchEntries())
          .concat(guides.searchEntries(guideList))
          .concat(learn.searchEntries(courseList))
          .concat(quizzes.searchEntries(quizData))
          .concat(tools.searchEntries())
          .concat(glossary.searchEntries(terms))
          .concat(automations.searchEntries(catalog))
      ).replace(/</g, "\\u003c") +
      ";\n"
  );

  console.log(
    "Built " + catalog.automations.length + " automation pages, " + catalog.industries.length + " industries, " +
      catalog.categories.length + " functions, " + catalog.tools.length + " tools, " + guideList.length + " guides, " +
      courseList.length + " courses, " + quizData.length + " quizzes, " + toolList.length + " free tools, " + terms.terms.length + " glossary terms."
  );
}

main();
