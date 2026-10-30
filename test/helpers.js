// Shared helpers for the tests: load the generated edge function the way
// CloudFront runs it, and a tiny local stand-in for CloudFront + S3 so the
// same curl-style checks used against production can run offline.

const fs = require("fs");
const http = require("http");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const EDGE = path.join(ROOT, "infra", "cloudfront-functions", "edge.js");

function loadEdge() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(EDGE, "utf8"), sandbox, { filename: EDGE });
  return sandbox;
}

// CloudFront Function event for a viewer request.
function requestEvent(uri, headers, method) {
  const h = {};
  Object.entries(headers || {}).forEach(([k, v]) => (h[k.toLowerCase()] = { value: v }));
  return { version: "1.0", context: { eventType: "viewer-request" }, request: { method: method || "GET", uri, querystring: {}, headers: h, cookies: {} } };
}

const TYPES = { ".html": "text/html", ".md": "text/markdown", ".json": "application/json", ".txt": "text/plain", ".xml": "application/xml", ".js": "application/javascript", ".css": "text/css" };

// Mimics the production path: viewer-request function, then S3 (website
// endpoint: "/" and "/dir/" serve index.html, missing keys serve 404.html
// with status 404), then the viewer-response function for non-error
// responses. Upload content types match .github/workflows/deploy.yml.
function startServer() {
  const edge = loadEdge();
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const headers = {};
    Object.entries(req.headers).forEach(([k, v]) => (headers[k] = v));
    const ev = requestEvent(url.pathname, headers, req.method);
    const out = edge.handler(ev);
    if (out.statusCode) {
      const h = {};
      Object.entries(out.headers || {}).forEach(([k, v]) => (h[k] = v.value));
      res.writeHead(out.statusCode, h);
      return res.end(out.body ? out.body.data : "");
    }
    let key = out.uri;
    if (key.endsWith("/")) key += "index.html";
    let file = path.join(ROOT, decodeURIComponent(key));
    let status = 200;
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(ROOT, "404.html");
      status = 404;
    }
    const type = key === "/.well-known/api-catalog" && status === 200 ? "application/linkset+json" : TYPES[path.extname(file)] || "application/octet-stream";
    const response = { statusCode: status, headers: { "content-type": { value: type }, vary: { value: "Accept-Encoding" } } };
    const final = status < 400 ? edge.handler({ version: "1.0", context: { eventType: "viewer-response" }, request: out, response }) : response;
    const h = {};
    Object.entries(final.headers).forEach(([k, v]) => (h[k] = v.value));
    res.writeHead(final.statusCode, h);
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, base: "http://127.0.0.1:" + server.address().port })));
}

module.exports = { ROOT, EDGE, loadEdge, requestEvent, startServer };
