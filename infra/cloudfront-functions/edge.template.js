// CloudFront Function (cloudfront-js-2.0) for www.ljwebmanagement.com.
// Template: `npm run build` fills in the __PLACEHOLDERS__ and writes
// edge.js next to this file. Deploy edge.js, never this file; see
// infra/README.md. Associate the same function with both the Viewer Request
// and Viewer Response events of the default cache behavior.
//
// Viewer request:
//   - /docs and /api answer with a 301 to /developers/.
//   - /api/v1/ serves the API index.
//   - Unknown /api/ paths get a JSON 404 (or 405 for non-GET methods).
//   - Accept: text/markdown is served the page's Markdown twin
//     (/path/index.md); a page that does not exist gets a Markdown 404.
// Viewer response:
//   - Vary: Accept on every negotiable page (HTML or Markdown).
//   - Correct Content-Type for Markdown twins, the API, and the API catalog.
//
// Whether a path exists is checked against a Bloom filter of every Markdown
// twin and API file, built from the site at build time. A false positive
// (about 1 percent) only means an unknown path falls through to the normal
// HTML 404 page.

var SITE = "https://www.ljwebmanagement.com";
var BLOOM_BITS = __BLOOM_BITS__;
var BLOOM_HASHES = __BLOOM_HASHES__;
var BLOOM = "__BLOOM__";
var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function fnv(s, seed) {
  var h = seed >>> 0;
  for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h;
}

function bit(n) {
  var c = B64.indexOf(BLOOM.charAt(Math.floor(n / 6)));
  return (c >> (5 - (n % 6))) & 1;
}

function known(key) {
  var a = fnv(key, 2166136261);
  var b = (fnv(key, 3735928559) | 1) >>> 0;
  for (var i = 0; i < BLOOM_HASHES; i++) {
    if (!bit((a + i * b) % BLOOM_BITS)) return false;
  }
  return true;
}

// Quality of a media type in an Accept header (0 when absent).
function quality(accept, type) {
  var best = 0;
  var found = false;
  var parts = accept.split(",");
  for (var i = 0; i < parts.length; i++) {
    var bits = parts[i].trim().split(";");
    if (bits[0].trim() !== type) continue;
    var q = 1;
    for (var j = 1; j < bits.length; j++) {
      var kv = bits[j].trim().split("=");
      if (kv[0] === "q") q = parseFloat(kv[1]);
    }
    if (!(q >= 0)) q = 0;
    if (!found || q > best) best = q;
    found = true;
  }
  return best;
}

function wantsMarkdown(accept) {
  var md = Math.max(quality(accept, "text/markdown"), quality(accept, "text/x-markdown"));
  return md > 0 && md >= quality(accept, "text/html");
}

function markdownKey(uri) {
  if (uri.charAt(uri.length - 1) === "/") return uri + "index.md";
  if (/\.html$/.test(uri)) return uri.replace(/\.html$/, ".md");
  if (/\.[A-Za-z0-9]+$/.test(uri.slice(uri.lastIndexOf("/")))) return null;
  return uri + "/index.md";
}

function safePath(uri) {
  return uri.slice(0, 200).replace(/[^A-Za-z0-9\/._~%-]/g, "");
}

function reply(status, text, type, body, extra) {
  var headers = {
    "content-type": { value: type },
    "cache-control": { value: "public, max-age=300" },
    vary: { value: "Accept" },
  };
  for (var k in extra) headers[k] = { value: extra[k] };
  return { statusCode: status, statusDescription: text, headers: headers, body: { encoding: "text", data: body } };
}

function apiError(status, code, message, extra) {
  var text = status === 405 ? "Method Not Allowed" : "Not Found";
  var body = {
    error: {
      status: status,
      code: code,
      message: message,
      hint: "Start from " + SITE + "/api/v1/index.json, which lists every endpoint, or see the OpenAPI description at " + SITE + "/openapi.json.",
      docs: SITE + "/developers/",
    },
  };
  var headers = { "access-control-allow-origin": "*" };
  for (var k in extra) headers[k] = extra[k];
  return reply(status, text, "application/json; charset=utf-8", JSON.stringify(body, null, 2) + "\n", headers);
}

function markdown404(uri) {
  return reply(404, "Not Found", "text/markdown; charset=utf-8", __MARKDOWN_404__.replace("{path}", safePath(uri)), {});
}

function onRequest(request) {
  var uri = request.uri;
  var headers = request.headers;

  if (/^\/(docs|api)\/?$/.test(uri)) {
    return { statusCode: 301, statusDescription: "Moved Permanently", headers: { location: { value: "/developers/" }, "cache-control": { value: "public, max-age=3600" } } };
  }

  if (uri === "/api/v1" || uri === "/api/v1/") uri = request.uri = "/api/v1/index.json";
  if (uri.indexOf("/api/") === 0) {
    if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
      return apiError(405, "method_not_allowed", "The API is read-only. Use GET.", { allow: "GET, HEAD, OPTIONS" });
    }
    if (!known(uri)) return apiError(404, "not_found", "No API resource exists at " + safePath(uri) + ".", {});
    return request;
  }

  var accept = headers.accept ? headers.accept.value.toLowerCase() : "";
  if (accept && wantsMarkdown(accept)) {
    var key = markdownKey(uri);
    if (key === null) return request;
    if (!known(key)) return markdown404(uri);
    request.uri = key;
  }
  return request;
}

function addVary(headers, value) {
  var cur = headers.vary ? headers.vary.value : "";
  var seen = cur.toLowerCase().split(/\s*,\s*/);
  var out = cur ? [cur] : [];
  var add = value.split(", ");
  for (var i = 0; i < add.length; i++) if (seen.indexOf(add[i].toLowerCase()) === -1) out.push(add[i]);
  headers.vary = { value: out.join(", ") };
}

function onResponse(request, response) {
  var headers = response.headers;
  var uri = request.uri;
  var type = headers["content-type"] ? headers["content-type"].value : "";
  if (/\.md$/.test(uri) || type.indexOf("text/markdown") === 0) {
    headers["content-type"] = { value: "text/markdown; charset=utf-8" };
    addVary(headers, "Accept, Accept-Encoding");
    var page = uri.replace(/index\.md$/, "").replace(/\.md$/, ".html");
    headers.link = { value: "<" + SITE + page + '>; rel="canonical"' };
  } else if (uri.indexOf("/api/") === 0) {
    if (/\.json$/.test(uri)) headers["content-type"] = { value: "application/json; charset=utf-8" };
    headers["access-control-allow-origin"] = { value: "*" };
  } else if (uri === "/.well-known/api-catalog") {
    headers["content-type"] = { value: 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"' };
    headers["access-control-allow-origin"] = { value: "*" };
  } else if (type.indexOf("text/html") === 0) {
    addVary(headers, "Accept, Accept-Encoding");
    var md = markdownKey(uri === "/index.html" ? "/" : uri);
    if (md) headers.link = { value: "<" + md + '>; rel="alternate"; type="text/markdown"' };
  }
  return response;
}

function handler(event) {
  if (event.context && event.context.eventType === "viewer-response") return onResponse(event.request, event.response);
  return onRequest(event.request);
}
