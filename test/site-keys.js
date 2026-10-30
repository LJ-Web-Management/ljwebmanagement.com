// Paths the edge function must know about, read from the built site.
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./helpers");

function walk(dir, rel, out, name) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    if (e.isDirectory()) {
      if (!rel && [".git", ".github", ".well-known", "assets", "build", "content", "infra", "node_modules", "test", "api"].includes(e.name)) return;
      walk(path.join(dir, e.name), rel + "/" + e.name, out, name);
    } else if (name.test(e.name)) out.push(rel + "/" + e.name);
  });
  return out;
}

const twinKeys = () => walk(ROOT, "", [], /^index\.md$/);
const pageFiles = () => walk(ROOT, "", [], /^index\.html$/);
const apiKeys = () => walk(path.join(ROOT, "api", "v1"), "/api/v1", [], /\.json$/);

module.exports = { twinKeys, pageFiles, apiKeys };
