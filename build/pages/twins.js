// Markdown twins: an index.md next to every built index.html, holding the
// page's <main> as Markdown. The edge function serves it for
// `Accept: text/markdown`, and each page links to it with
// <link rel="alternate" type="text/markdown">. Runs after every other
// builder so it sees the final HTML.

const fs = require("fs");
const path = require("path");
const { ROOT } = require("../lib/util");
const { pageToMarkdown } = require("../lib/markdown");

// Source and tooling folders that hold no pages.
const SKIP_DIRS = new Set([".git", ".github", ".well-known", "assets", "build", "content", "infra", "node_modules", "test", "api"]);

function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    if (e.isDirectory()) {
      if (dir === ROOT && SKIP_DIRS.has(e.name)) return;
      walk(path.join(dir, e.name), out);
    } else if (e.name === "index.html" || e.name === "index.md") {
      out.push(path.join(dir, e.name));
    }
  });
  return out;
}

// Writes every twin, deletes twins whose page is gone, and returns the
// site paths of the twins (for the edge function's list of known paths).
function build() {
  const keys = [];
  const found = walk(ROOT, []);
  found.forEach((file) => {
    const dir = path.dirname(file);
    if (file.endsWith("index.md")) {
      if (!fs.existsSync(path.join(dir, "index.html"))) fs.rmSync(file);
      return;
    }
    const html = fs.readFileSync(file, "utf8");
    // /crawl/ is llms-full.txt (already Markdown) wrapped in a bare page.
    const md = path.relative(ROOT, dir) === "crawl" ? fs.readFileSync(path.join(ROOT, "llms-full.txt"), "utf8") : pageToMarkdown(html);
    fs.writeFileSync(path.join(dir, "index.md"), md);
    keys.push("/" + path.relative(ROOT, path.join(dir, "index.md")).split(path.sep).join("/"));
  });
  keys.sort();
  console.log("  markdown twins: " + keys.length);
  return keys;
}

module.exports = { build };
