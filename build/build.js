// Builds the main site. Run with `npm run build` (Node 18+, no dependencies).
//
// Sources:
//   content/automations.json   every automation (industry, function, tools, copy)
//   content/taxonomy.js        function categories, tool pages, industry copy
//   content/guides/*.html      long-form guides (metadata in a leading comment)
//   content/pages/*.html       static page bodies (home, how it works, ...)
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
  // Remove automation detail folders from a previous build so renamed or
  // deleted automations do not linger as stale pages.
  const dir = path.join(ROOT, "automations");
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((name) => {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) fs.rmSync(p, { recursive: true, force: true });
  });
}

function main() {
  checkNav();
  cleanGenerated();
  const guideList = guides.load(catalog);
  const guidesBySlug = Object.fromEntries(guideList.map((g) => [g.slug, g]));

  const auto = automations.build(catalog, guidesBySlug);
  guides.build(guideList, catalog, latestPosts);
  pages.build(catalog, guideList);
  seo.build(catalog, guideList, auto);

  writeFile(
    "assets/data/search-index.js",
    "window.LJ_SEARCH_INDEX=" +
      JSON.stringify(
        []
          .concat(pages.searchEntries())
          .concat(guides.searchEntries(guideList))
          .concat(automations.searchEntries(catalog))
      ).replace(/</g, "\\u003c") +
      ";\n"
  );

  console.log(
    "Built " + catalog.automations.length + " automation pages, " + catalog.industries.length + " industries, " +
      catalog.categories.length + " functions, " + catalog.tools.length + " tools, " + guideList.length + " guides."
  );
}

main();
