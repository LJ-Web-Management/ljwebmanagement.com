// Loads the automation catalog (content/automations.json plus the
// editorial copy in content/taxonomy.js) and derives everything the page
// builders need: URLs, teasers, per-industry/category/tool groupings and
// related-automation lookups.

const fs = require("fs");
const path = require("path");
const { ROOT, truncate, sentences } = require("./util");
const taxonomy = require("../../content/taxonomy");

function load() {
  const automations = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "automations.json"), "utf8"));
  const base = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "industries-base.json"), "utf8")).industries;

  const categories = taxonomy.categories.map((c) => Object.assign({ url: "/automations/category/" + c.slug + "/", items: [] }, c));
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const industries = base.map((ind) => {
    const copy = taxonomy.industries[ind.slug];
    if (!copy) throw new Error("Missing industry copy in content/taxonomy.js for " + ind.slug);
    const adj = taxonomy.industryAdjectives[ind.slug];
    if (!adj) throw new Error("Missing industry adjective in content/taxonomy.js for " + ind.slug);
    return Object.assign({ url: "/automations/" + ind.slug + "/", items: [], adj }, ind, copy);
  });
  const industryBySlug = Object.fromEntries(industries.map((i) => [i.slug, i]));

  const tools = taxonomy.tools.map((t) => Object.assign({ url: "/automations/tools/" + t.slug + "/", items: [] }, t));
  const toolByTag = Object.fromEntries(tools.map((t) => [t.tag, t]));

  const seen = new Set();
  automations.forEach((a, i) => {
    a.index = i;
    a.ind = industryBySlug[a.industry];
    a.cat = categoryBySlug[a.category];
    if (!a.ind) throw new Error("Unknown industry " + a.industry + " on " + a.title);
    if (!a.cat) throw new Error("Unknown category " + a.category + " on " + a.title);
    a.url = a.ind.url + a.slug + "/";
    if (seen.has(a.url)) throw new Error("Duplicate automation URL " + a.url);
    seen.add(a.url);
    a.steps = sentences(a.automated);
    a.teaser = truncate(a.steps[0] || a.automated, 150);
    a.ind.items.push(a);
    a.cat.items.push(a);
    a.toolPages = a.toolTags.map((t) => toolByTag[t]).filter(Boolean);
    a.toolPages.forEach((t) => t.items.push(a));
  });

  // Role lookup for "more for this role" links (exact role name).
  const byRole = {};
  automations.forEach((a) => {
    (byRole[a.role] = byRole[a.role] || []).push(a);
  });

  function related(a, limit) {
    const picked = [];
    const add = (x) => {
      if (x !== a && picked.indexOf(x) === -1 && picked.length < limit) picked.push(x);
    };
    a.ind.items.filter((x) => x.category === a.category).forEach(add);
    (byRole[a.role] || []).forEach(add);
    // Same category in other industries, spread across the list so
    // neighbouring pages do not all link to the same handful.
    const others = a.cat.items.filter((x) => x.industry !== a.industry);
    for (let k = 0; k < others.length && picked.length < limit; k++) {
      add(others[(a.index * 7 + k * 13) % others.length]);
    }
    a.ind.items.forEach(add);
    return picked;
  }

  return { automations, industries, industryBySlug, categories, categoryBySlug, tools, toolByTag, byRole, related };
}

module.exports = { load };
