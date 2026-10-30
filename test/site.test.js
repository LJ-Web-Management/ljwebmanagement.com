// Checks on the committed build output: machine-readable files, the JSON
// API against its OpenAPI schemas, structured data, and discovery links.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./helpers");
const { twinKeys, pageFiles, apiKeys } = require("./site-keys");

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const SITE = "https://www.ljwebmanagement.com";

// Minimal JSON Schema check for the subset openapi.json uses. Objects are
// strict: every key must be declared, so the spec cannot fall behind.
function validate(value, schema, spec, where) {
  if (schema.$ref) return validate(value, spec.components.schemas[schema.$ref.split("/").pop()], spec, where);
  const fail = (msg) => assert.fail(where + ": " + msg);
  switch (schema.type) {
    case "object":
      if (typeof value !== "object" || value === null || Array.isArray(value)) fail("expected object");
      (schema.required || []).forEach((k) => k in value || fail("missing " + k));
      Object.keys(value).forEach((k) => {
        if (!schema.properties[k]) fail("undeclared property " + k);
        validate(value[k], schema.properties[k], spec, where + "." + k);
      });
      break;
    case "array":
      if (!Array.isArray(value)) fail("expected array");
      value.forEach((v, i) => validate(v, schema.items, spec, where + "[" + i + "]"));
      break;
    case "integer":
      if (!Number.isInteger(value) || value < (schema.minimum ?? -Infinity)) fail("expected integer");
      break;
    case "string":
      if (typeof value !== "string") fail("expected string");
      if (schema.enum && !schema.enum.includes(value)) fail("not in enum: " + value);
      if (schema.format === "uri" && !/^https?:\/\//.test(value)) fail("expected absolute URI: " + value);
      break;
    default:
      fail("untyped schema");
  }
}

test("every page has a Markdown twin and links to it", () => {
  const pages = pageFiles();
  const twins = new Set(twinKeys());
  assert.ok(pages.length > 1000);
  pages.forEach((p) => assert.ok(twins.has(p.replace(/\.html$/, ".md")), "no twin for " + p));
  assert.strictEqual(twins.size, pages.length, "orphan twins");
  assert.match(read("index.html"), /<link rel="alternate" type="text\/markdown" href="\/index.md">/);
  const md = read("index.md");
  assert.ok(md.length > 1000 && !/<(div|span|svg|script)\b/.test(md));
});

test("sitemap.xml lists every indexable page with lastmod", () => {
  const xml = read("sitemap.xml");
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  const urls = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map((m) => m[1]);
  assert.strictEqual(urls.length, (xml.match(/<url>/g) || []).length, "every <url> has loc and lastmod");
  assert.strictEqual(new Set(urls).size, urls.length, "duplicate URLs");
  urls.forEach((u) => {
    assert.ok(u.startsWith(SITE + "/"), u);
    assert.ok(fs.existsSync(path.join(ROOT, u.slice(SITE.length), "index.html")), "missing page " + u);
  });
  assert.ok(urls.includes(SITE + "/developers/"));
  assert.ok(Buffer.byteLength(xml) < 50 * 1024 * 1024 && urls.length <= 50000);
  assert.match(read("robots.txt"), /^Sitemap: https:\/\/www\.ljwebmanagement\.com\/sitemap\.xml$/m);
});

test("openapi.json: unique operation IDs, typed schemas, every API file valid", () => {
  const spec = JSON.parse(read("openapi.json"));
  assert.strictEqual(spec.openapi, "3.0.3");
  const ids = new Set();
  const ops = Object.entries(spec.paths);
  assert.ok(ops.length >= 10);
  ops.forEach(([p, item]) => {
    const op = item.get;
    assert.match(op.operationId, /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/);
    assert.ok(!ids.has(op.operationId), "duplicate " + op.operationId);
    ids.add(op.operationId);
    assert.ok(op.summary && op.description, p);
    const ok = op.responses["200"].content["application/json"].schema.$ref;
    const err = op.responses["404"].content["application/json"].schema.$ref;
    assert.ok(spec.components.schemas[ok.split("/").pop()], ok);
    assert.strictEqual(err, "#/components/schemas/Error");
    (p.match(/\{(\w+)\}/g) || []).forEach((name) => {
      const prm = op.parameters.find((x) => "{" + x.name + "}" === name);
      assert.ok(prm && prm.required && prm.schema.type === "string" && prm.schema.enum.length, p + " " + name);
    });
  });
  Object.entries(spec.components.schemas).forEach(([name, s]) => {
    const walk = (x, w) => {
      if (x.$ref) return assert.ok(spec.components.schemas[x.$ref.split("/").pop()], w);
      assert.ok(x.type && x.description !== undefined, w + " untyped or undescribed");
      if (x.properties) Object.entries(x.properties).forEach(([k, v]) => walk(v, w + "." + k));
      if (x.items) walk(x.items, w + "[]");
    };
    walk(s, name);
  });

  // Every concrete file matches its path's response schema, and every
  // file is reachable from the spec.
  const files = apiKeys();
  const covered = new Set();
  ops.forEach(([p, item]) => {
    const schema = item.get.responses["200"].content["application/json"].schema;
    const prm = item.get.parameters ? item.get.parameters[0].schema.enum : [null];
    prm.forEach((v) => {
      const file = v === null ? p : p.replace(/\{\w+\}/, v);
      assert.ok(files.includes(file), "spec path has no file: " + file);
      validate(JSON.parse(read(file.slice(1))), schema, spec, file);
      covered.add(file);
    });
  });
  assert.deepStrictEqual(files.filter((f) => !covered.has(f)), [], "files missing from the spec");
});

test("API index lists the same operations as openapi.json", () => {
  const spec = JSON.parse(read("openapi.json"));
  const index = JSON.parse(read("api/v1/index.json"));
  assert.deepStrictEqual(index.endpoints.map((e) => e.operationId), Object.values(spec.paths).map((x) => x.get.operationId));
  index.endpoints.forEach((e) => assert.ok(spec.paths[e.path], e.path));
});

test("discovery files point at the API and docs", () => {
  const catalog = JSON.parse(read(".well-known/api-catalog"));
  const entry = catalog.linkset[0];
  assert.strictEqual(entry.anchor, SITE + "/api/v1/");
  assert.strictEqual(entry["service-desc"][0].href, SITE + "/openapi.json");
  assert.strictEqual(entry["service-doc"][0].href, SITE + "/developers/");
  const plugin = JSON.parse(read(".well-known/ai-plugin.json"));
  assert.strictEqual(plugin.api.url, SITE + "/openapi.json");
  const llms = read("llms.txt");
  ["/developers/", "/api/v1/index.json", "/openapi.json", "/.well-known/api-catalog", "/sitemap.xml"].forEach((p) => assert.ok(llms.includes("](" + SITE + p + ")"), p));
  assert.match(llms, /LJ Web Management Developer API/);
});

test("homepage links the docs and carries complete Organization JSON-LD", () => {
  const html = read("index.html");
  assert.match(html, /<a class="lj-link-arrow" href="\/developers\/">/);
  assert.match(html, /<link rel="service-desc" type="application\/vnd.oai.openapi\+json" href="\/openapi.json">/);
  assert.match(html, /<link rel="api-catalog" href="\/.well-known\/api-catalog">/);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const nodes = blocks.flatMap((b) => b["@graph"] || [b]);
  const org = nodes.find((n) => [].concat(n["@type"]).includes("Organization"));
  assert.ok(org, "no Organization node");
  assert.ok(org.name && org.url && org.description && org.logo && org.sameAs.length);
  assert.strictEqual(org.address["@type"], "PostalAddress");
  assert.ok(org.address.streetAddress && org.address.addressLocality && org.address.postalCode);
  assert.ok(org.contactPoint.length >= 1);
  org.contactPoint.forEach((c) => {
    assert.strictEqual(c["@type"], "ContactPoint");
    assert.ok(c.contactType && c.email && c.telephone);
  });
});

test("developers page documents auth, endpoints, examples and errors", () => {
  const html = read("developers/index.html");
  assert.match(html, /<h1>LJ Web Management developer API and docs<\/h1>/);
  ["Authentication", "Endpoints", "Example requests", "Errors", "Markdown for AI agents"].forEach((t) => assert.ok(html.includes(t), t));
  JSON.parse(read("openapi.json")) && Object.values(JSON.parse(read("openapi.json")).paths).forEach((x) => assert.ok(html.includes("<code>" + x.get.operationId + "</code>")));
  assert.match(read("docs/index.html"), /url=\/developers\//);
});

test("no em dashes in generated agent-facing files", () => {
  ["llms.txt", "openapi.json", "index.md", "developers/index.html", "developers/index.md", "infra/cloudfront-functions/edge.js"].concat(apiKeys().map((k) => k.slice(1))).forEach((f) => assert.ok(!read(f).includes("\u2014"), f));
});
