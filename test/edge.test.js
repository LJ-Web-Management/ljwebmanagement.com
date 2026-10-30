// The generated CloudFront Function: content negotiation, error bodies,
// headers, and the CloudFront limits it has to fit in.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const { EDGE, loadEdge, requestEvent, startServer } = require("./helpers");
const { MAX_BYTES } = require("../build/lib/edge");

const edge = loadEdge();
const BROWSER = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
const req = (uri, accept, method) => edge.handler(requestEvent(uri, accept ? { accept } : {}, method));

test("fits CloudFront Functions limits", () => {
  const code = fs.readFileSync(EDGE, "utf8");
  assert.ok(Buffer.byteLength(code) <= MAX_BYTES, "over 10 KB");
  assert.doesNotMatch(code, /__[A-Z0-9_]+__/, "unfilled placeholder");
  // Plain ES5 syntax, which both CloudFront JavaScript runtimes accept.
  assert.doesNotMatch(code, /=>|\b(let|const|class|async|await)\s/);
});

test("Markdown requests are rewritten to the page's twin", () => {
  assert.strictEqual(req("/", "text/markdown").uri, "/index.md");
  assert.strictEqual(req("/faq/", "text/markdown, text/html;q=0.9").uri, "/faq/index.md");
  assert.strictEqual(req("/faq", "text/markdown").uri, "/faq/index.md");
  assert.strictEqual(req("/index.html", "text/markdown").uri, "/index.md");
  assert.strictEqual(req("/automations/real-estate/", "text/x-markdown").uri, "/automations/real-estate/index.md");
});

test("browsers and HTML-first clients keep getting HTML", () => {
  assert.strictEqual(req("/", BROWSER).uri, "/");
  assert.strictEqual(req("/", "text/html").uri, "/");
  assert.strictEqual(req("/", "text/html, text/markdown;q=0.5").uri, "/");
  assert.strictEqual(req("/", "text/markdown;q=0").uri, "/");
  assert.strictEqual(req("/", "").uri, "/");
  assert.strictEqual(req("/assets/css/site.css", "text/markdown").uri, "/assets/css/site.css");
  assert.strictEqual(req("/llms.txt", "text/markdown").uri, "/llms.txt");
});

test("unknown pages get a Markdown 404 when Markdown is asked for", () => {
  const r = req("/__ora-404-probe-7j45ppdr", "text/markdown");
  assert.strictEqual(r.statusCode, 404);
  assert.match(r.headers["content-type"].value, /^text\/markdown/);
  assert.strictEqual(r.headers.vary.value, "Accept");
  assert.ok(r.body.data.length >= 20);
  assert.ok(r.body.data.startsWith("# 404 Not Found"));
  assert.ok(r.body.data.includes("`/__ora-404-probe-7j45ppdr`"));
  assert.ok(r.body.data.includes("https://www.ljwebmanagement.com/llms.txt"));
  assert.ok(r.body.data.includes("https://www.ljwebmanagement.com/sitemap.xml"));
  // Untrusted path characters are stripped before they reach the body.
  assert.ok(!req("/x<script>`$&", "text/markdown").body.data.includes("<script>"));
  // HTML requests for unknown pages still go to the origin's HTML 404.
  assert.strictEqual(req("/__ora-404-probe-7j45ppdr", BROWSER).uri, "/__ora-404-probe-7j45ppdr");
});

test("API: known files pass, unknown paths get a JSON 404, writes get a JSON 405", () => {
  assert.strictEqual(req("/api/v1/index.json").uri, "/api/v1/index.json");
  assert.strictEqual(req("/api/v1/").uri, "/api/v1/index.json");
  assert.strictEqual(req("/api/v1/industries/real-estate.json").uri, "/api/v1/industries/real-estate.json");
  const nf = req("/api/v1/industries/nope.json", "application/json");
  assert.strictEqual(nf.statusCode, 404);
  assert.match(nf.headers["content-type"].value, /^application\/json/);
  const body = JSON.parse(nf.body.data);
  assert.deepStrictEqual(Object.keys(body.error), ["status", "code", "message", "hint", "docs"]);
  assert.strictEqual(body.error.status, 404);
  assert.strictEqual(body.error.code, "not_found");
  assert.match(body.error.hint, /index\.json/);
  const post = req("/api/v1/index.json", "", "POST");
  assert.strictEqual(post.statusCode, 405);
  assert.strictEqual(post.headers.allow.value, "GET, HEAD, OPTIONS");
  assert.strictEqual(JSON.parse(post.body.data).error.code, "method_not_allowed");
});

test("conventional docs URLs redirect to /developers/", () => {
  ["/docs", "/docs/", "/api", "/api/"].forEach((u) => {
    const r = req(u, BROWSER);
    assert.strictEqual(r.statusCode, 301, u);
    assert.strictEqual(r.headers.location.value, "/developers/");
  });
});

test("Bloom filter knows every real path and few fake ones", () => {
  const { twinKeys, apiKeys } = require("./site-keys");
  twinKeys().concat(apiKeys()).forEach((k) => assert.ok(edge.known(k), k));
  let fp = 0;
  for (let i = 0; i < 5000; i++) if (edge.known("/missing-" + i + "/index.md")) fp++;
  assert.ok(fp / 5000 < 0.02, "false positive rate " + fp / 5000);
});

test("viewer response adds Vary: Accept and fixes content types", () => {
  const resp = (uri, type, vary) =>
    edge.handler({ context: { eventType: "viewer-response" }, request: { uri, headers: {} }, response: { statusCode: 200, headers: Object.assign({ "content-type": { value: type } }, vary ? { vary: { value: vary } } : {}) } }).headers;
  const html = resp("/", "text/html", "accept-encoding");
  assert.strictEqual(html.vary.value, "accept-encoding, Accept");
  assert.strictEqual(html.link.value, '</index.md>; rel="alternate"; type="text/markdown"');
  const md = resp("/index.md", "binary/octet-stream");
  assert.strictEqual(md["content-type"].value, "text/markdown; charset=utf-8");
  assert.strictEqual(md.vary.value, "Accept, Accept-Encoding");
  assert.strictEqual(md.link.value, '<https://www.ljwebmanagement.com/>; rel="canonical"');
  const api = resp("/api/v1/index.json", "binary/octet-stream");
  assert.strictEqual(api["content-type"].value, "application/json; charset=utf-8");
  assert.strictEqual(api["access-control-allow-origin"].value, "*");
  assert.match(resp("/.well-known/api-catalog", "binary/octet-stream")["content-type"].value, /^application\/linkset\+json/);
  assert.strictEqual(resp("/assets/css/site.css", "text/css").vary, undefined);
});

test("end to end through a local CloudFront + S3 stand-in", async () => {
  const { server, base } = await startServer();
  try {
    const md = await fetch(base + "/", { headers: { accept: "text/markdown" } });
    assert.strictEqual(md.status, 200);
    assert.match(md.headers.get("content-type"), /^text\/markdown/);
    assert.match(md.headers.get("vary"), /\bAccept\b/);
    assert.match(await md.text(), /^Questions\?[\s\S]*# Cut through the delay/);

    const html = await fetch(base + "/", { headers: { accept: BROWSER } });
    assert.match(html.headers.get("content-type"), /^text\/html/);
    assert.match(html.headers.get("vary"), /\bAccept\b/);
    assert.match(await html.text(), /^<!DOCTYPE html>/);

    const nf = await fetch(base + "/__ora-404-probe-7j45ppdr", { headers: { accept: "text/markdown" } });
    assert.strictEqual(nf.status, 404);
    assert.match(nf.headers.get("content-type"), /^text\/markdown/);

    const nfHtml = await fetch(base + "/__ora-404-probe-7j45ppdr", { headers: { accept: BROWSER } });
    assert.strictEqual(nfHtml.status, 404);
    assert.match(await nfHtml.text(), /Page Not Found/);

    const apiNf = await fetch(base + "/api/v1/missing.json");
    assert.strictEqual(apiNf.status, 404);
    assert.strictEqual((await apiNf.json()).error.code, "not_found");

    const idx = await fetch(base + "/api/v1/index.json");
    assert.strictEqual(idx.status, 200);
    assert.strictEqual(idx.headers.get("access-control-allow-origin"), "*");
    assert.ok((await idx.json()).endpoints.length >= 10);
  } finally {
    server.closeAllConnections();
    server.close();
  }
});
