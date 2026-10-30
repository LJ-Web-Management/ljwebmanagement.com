// HTML to Markdown for the Markdown twin of every page. Each built
// index.html gets an index.md next to it, which the edge function serves
// when a visitor (usually an AI agent) sends `Accept: text/markdown`.
// Only the page's <main> is converted; the shared header and footer are
// navigation chrome that agents do not need on every page.

const { SITE_URL } = require("./util");

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
// Dropped with everything inside them.
const SKIP = new Set(["script", "style", "noscript", "template", "svg", "button", "form", "input", "select", "textarea", "iframe", "video", "audio", "picture", "head"]);
const BLOCK = new Set(["address", "article", "aside", "div", "dl", "dd", "dt", "fieldset", "figure", "figcaption", "footer", "header", "main", "nav", "section", "details", "summary", "label"]);

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", middot: "·", rarr: "→", larr: "←", hellip: "…", mdash: "-", ndash: "–", copy: "©", reg: "®", trade: "™", times: "×", bull: "•", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };

function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    const v = ENTITIES[e.toLowerCase()];
    return v === undefined ? m : v;
  });
}

function parseAttrs(src) {
  const attrs = {};
  const re = /([^\s=\/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  return attrs;
}

// Small tolerant parser: the input is HTML this repo generates, so it is
// well formed apart from unclosed void elements.
function parse(html) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!DOCTYPE[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+|<)/g;
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[4] !== undefined) {
      top.children.push({ text: decode(m[4]) });
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      const node = { tag, attrs: parseAttrs(m[3]), children: [] };
      top.children.push(node);
      const selfClosing = /\/\s*$/.test(m[3]);
      if (VOID.has(tag) || selfClosing) continue;
      if (tag === "script" || tag === "style") {
        // Raw text: skip straight to the closing tag.
        const end = html.toLowerCase().indexOf("</" + tag, re.lastIndex);
        re.lastIndex = end === -1 ? html.length : html.indexOf(">", end) + 1;
        continue;
      }
      stack.push(node);
    } else if (m[1]) {
      const tag = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
    }
  }
  return root;
}

function absolute(href) {
  if (!href) return "";
  if (href.startsWith("/") && !href.startsWith("//")) return SITE_URL + href;
  return href;
}

function escapeText(s) {
  return s.replace(/([\\`*_\[\]<])/g, "\\$1");
}

function hidden(node) {
  const a = node.attrs;
  return a["aria-hidden"] === "true" || "hidden" in a || /(^|\s)lj-skip(\s|$)/.test(a.class || "");
}

// Inline content of a node as one line of Markdown.
function inline(node) {
  if (node.text !== undefined) return escapeText(node.text.replace(/\s+/g, " "));
  if (SKIP.has(node.tag) || hidden(node)) return "";
  const inner = () => joinInline(node.children);
  switch (node.tag) {
    case "br":
      return "  \n";
    case "strong":
    case "b": {
      const t = inner().trim();
      return t ? "**" + t + "**" : "";
    }
    case "em":
    case "i": {
      const t = inner().trim();
      return t ? "_" + t + "_" : "";
    }
    case "code":
      return "`" + node.children.map((c) => c.text || "").join("").replace(/`/g, "'") + "`";
    case "img":
      return node.attrs.alt ? "![" + escapeText(node.attrs.alt) + "](" + absolute(node.attrs.src) + ")" : "";
    case "a": {
      const t = inner().replace(/\s+/g, " ").trim();
      const href = node.attrs.href;
      if (!t) return "";
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return t;
      return "[" + t + "](" + absolute(href) + ")";
    }
    default:
      return inner();
  }
}

// Joins inline siblings. Adjacent elements such as
// <strong>57</strong><span>Industries</span> are separate words on the
// rendered page, so they get a space between them.
function joinInline(children) {
  let out = "";
  let prevEl = false;
  children.forEach((c) => {
    const piece = inline(c);
    if (!piece) return;
    const isEl = c.text === undefined;
    if (isEl && prevEl && out && !/\s$/.test(out) && !/^\s/.test(piece)) out += " ";
    out += piece;
    prevEl = isEl;
  });
  return out;
}

// Text at the start of a block that would read as Markdown syntax.
function escapeLead(t) {
  return t.replace(/^([#>+-]|\d+\.)(\s)/, "\\$1$2");
}

function clean(s) {
  return s.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim();
}

// Block-level rendering. Returns an array of Markdown blocks.
function blocks(node, depth) {
  const out = [];
  let para = "";
  let lastEl = false;
  const flush = () => {
    const t = clean(para);
    if (t) out.push(escapeLead(t));
    para = "";
  };
  node.children.forEach((c) => {
    if (c.text !== undefined) {
      para += inline(c);
      lastEl = false;
      return;
    }
    if (SKIP.has(c.tag) || hidden(c)) return;
    const prevEl = lastEl;
    lastEl = false;
    const h = /^h([1-6])$/.exec(c.tag);
    if (h) {
      flush();
      const t = clean(inline(c));
      if (t) out.push("#".repeat(+h[1]) + " " + t);
    } else if (c.tag === "p" || c.tag === "summary") {
      flush();
      const t = clean(inline(c));
      if (t) out.push(c.tag === "summary" ? "**" + t + "**" : escapeLead(t));
    } else if (c.tag === "ul" || c.tag === "ol") {
      flush();
      const list = listBlock(c, depth);
      if (list) out.push(list);
    } else if (c.tag === "blockquote") {
      flush();
      const inner = blocks(c, depth).join("\n\n");
      if (inner) out.push(inner.split("\n").map((l) => "> " + l).join("\n"));
    } else if (c.tag === "pre") {
      flush();
      out.push("```\n" + textOf(c).replace(/\n$/, "") + "\n```");
    } else if (c.tag === "table") {
      flush();
      const t = tableBlock(c);
      if (t) out.push(t);
    } else if (c.tag === "hr") {
      flush();
      out.push("---");
    } else if (BLOCK.has(c.tag) || c.tag === "li") {
      flush();
      out.push(...blocks(c, depth));
    } else {
      // Inline element; if it holds block children, treat it as a block.
      if (c.children.some((x) => x.tag && (BLOCK.has(x.tag) || /^(h[1-6]|p|ul|ol|table)$/.test(x.tag)))) {
        flush();
        const inner = blocks(c, depth);
        const href = c.tag === "a" && c.attrs.href && !c.attrs.href.startsWith("#") ? absolute(c.attrs.href) : "";
        if (href) {
          // A whole card wrapped in a link: link its heading instead.
          const h = inner.findIndex((b) => /^#{1,6} /.test(b));
          if (h !== -1) inner[h] = inner[h].replace(/^(#{1,6}) (.*)$/, (m, hashes, t) => hashes + " [" + t + "](" + href + ")");
          else if (inner.length) inner[0] = "[" + inner[0] + "](" + href + ")";
        }
        out.push(...inner);
      } else {
        const piece = inline(c);
        if (piece && prevEl && para && !/\s$/.test(para) && !/^\s/.test(piece)) para += " ";
        para += piece;
        lastEl = !!piece;
      }
    }
  });
  flush();
  return out;
}

function textOf(node) {
  if (node.text !== undefined) return node.text;
  return node.children.map(textOf).join("");
}

function listBlock(list, depth) {
  const ordered = list.tag === "ol";
  const pad = "  ".repeat(depth);
  const items = [];
  let n = parseInt(list.attrs.start, 10) || 1;
  list.children.forEach((li) => {
    if (li.tag !== "li" || hidden(li)) return;
    const nested = [];
    const own = { tag: "li", attrs: {}, children: li.children.filter((c) => !(c.tag === "ul" || c.tag === "ol") || (nested.push(c), false)) };
    const body = blocks(own, depth + 1).join(" ").replace(/\n+/g, " ").trim();
    const marker = ordered ? n++ + ". " : "- ";
    let item = pad + marker + body;
    nested.forEach((sub) => {
      const s = listBlock(sub, depth + 1);
      if (s) item += "\n" + s;
    });
    if (body || nested.length) items.push(item);
  });
  return items.join("\n");
}

function tableBlock(table) {
  const rows = [];
  const walk = (n) => {
    if (n.tag === "tr") rows.push(n.children.filter((c) => c.tag === "th" || c.tag === "td").map((c) => clean(inline(c)).replace(/\|/g, "\\|").replace(/\n/g, " ")));
    else if (n.children) n.children.forEach(walk);
  };
  walk(table);
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const line = (r) => "| " + Array.from({ length: width }, (_, i) => r[i] || "").join(" | ") + " |";
  return [line(rows[0]), "| " + Array(width).fill("---").join(" | ") + " |"].concat(rows.slice(1).map(line)).join("\n");
}

function htmlToMarkdown(html) {
  return blocks(parse(html), 0).join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Markdown twin of a full built page: its <main>, plus where it came from.
function pageToMarkdown(html) {
  const title = decode((/<title>([\s\S]*?)<\/title>/.exec(html) || [])[1] || "").trim();
  const description = decode((/<meta name="description" content="([^"]*)"/.exec(html) || [])[1] || "");
  const canonical = (/<link rel="canonical" href="([^"]*)"/.exec(html) || [])[1] || "";
  const main = (/<main\b[^>]*>([\s\S]*)<\/main>/.exec(html) || [])[1];
  if (main === undefined) throw new Error("Page has no <main> element");
  let body = htmlToMarkdown(main);
  if (!/^# /m.test(body)) body = "# " + escapeText(title) + "\n\n" + body;
  const meta = [];
  if (description) meta.push("> " + escapeText(description));
  const foot = ["---", ""];
  if (canonical) foot.push("Source: " + canonical);
  foot.push(
    "Site index for AI agents: " + SITE_URL + "/llms.txt",
    "Developer API and docs: " + SITE_URL + "/developers/",
    "Contact: info@ljwebmanagement.com, +1-877-559-3268"
  );
  // Put the summary right after the first heading.
  const parts = body.split("\n\n");
  const h1 = parts.findIndex((p) => p.startsWith("# "));
  if (meta.length && h1 !== -1) parts.splice(h1 + 1, 0, ...meta);
  return parts.join("\n\n") + "\n\n" + foot.join("\n") + "\n";
}

module.exports = { htmlToMarkdown, pageToMarkdown, parse, decode };
