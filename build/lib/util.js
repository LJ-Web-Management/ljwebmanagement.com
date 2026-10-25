// Small helpers shared by every page builder.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..", "..");
const SITE_URL = "https://www.ljwebmanagement.com";
const BLOG_URL = "https://blog.ljwebmanagement.com";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function writeFile(rel, content) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

// Short content hash used as a cache-busting query string, since the deploy
// gives every non-HTML asset a one-year immutable cache.
function fileHash(rel) {
  return crypto.createHash("sha1").update(fs.readFileSync(path.join(ROOT, rel))).digest("hex").slice(0, 10);
}

// Cuts text at a word boundary and adds an ellipsis.
function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[,;:.]$/, "") + "…";
}

const ABBREVIATIONS = ["e.g.", "i.e.", "vs.", "etc.", "Dr.", "Mr.", "Mrs.", "Ms.", "St.", "a.m.", "p.m.", "U.S.", "No.", "approx.", "Inc.", "LLC."];

// Splits a paragraph into sentences without breaking on common
// abbreviations such as "e.g." or "a.m.".
function sentences(text) {
  const out = [];
  let buf = "";
  const parts = text.split(/(\s+)/);
  for (let i = 0; i < parts.length; i++) {
    buf += parts[i];
    const word = parts[i];
    if (!/[.!?]["')\]]?$/.test(word)) continue;
    if (ABBREVIATIONS.some((a) => word.endsWith(a))) continue;
    const next = parts[i + 2];
    if (next && !/^["'(\[]?[A-Z0-9]/.test(next)) continue;
    out.push(buf.trim());
    buf = "";
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

function jsonLd(nodes) {
  const data = { "@context": "https://schema.org", "@graph": nodes };
  // Escape "<" so no string can close the script element early.
  return '<script type="application/ld+json">' + JSON.stringify(data).replace(/</g, "\\u003c") + "</script>";
}

module.exports = {
  ROOT,
  SITE_URL,
  BLOG_URL,
  escapeHtml,
  slugify,
  writeFile,
  readFile,
  fileHash,
  truncate,
  sentences,
  formatNumber,
  jsonLd,
};
