const test = require("node:test");
const assert = require("node:assert");
const { htmlToMarkdown, pageToMarkdown } = require("../build/lib/markdown");

test("headings, paragraphs, emphasis and links", () => {
  const md = htmlToMarkdown('<h2>Title</h2><p>Some <strong>bold</strong> and <em>soft</em> text with <a href="/faq/">a link</a>.</p>');
  assert.strictEqual(md, "## Title\n\nSome **bold** and _soft_ text with [a link](https://www.ljwebmanagement.com/faq/).");
});

test("lists, nested lists and ordered lists", () => {
  const md = htmlToMarkdown("<ul><li>One<ul><li>Inner</li></ul></li><li>Two</li></ul><ol><li>First</li><li>Second</li></ol>");
  assert.strictEqual(md, "- One\n  - Inner\n- Two\n\n1. First\n2. Second");
});

test("drops scripts, svg, buttons and aria-hidden content", () => {
  const md = htmlToMarkdown('<p>Keep<script>var x = "<p>no</p>";</script></p><svg><path d="M0"/></svg><button>Search</button><span aria-hidden="true">dup</span><p>Done</p>');
  assert.strictEqual(md, "Keep\n\nDone");
});

test("adjacent inline elements stay separate words", () => {
  assert.strictEqual(htmlToMarkdown("<div><strong>57</strong><span>Industries</span></div>"), "**57** Industries");
});

test("a card wrapped in a link keeps the link on its heading", () => {
  const md = htmlToMarkdown('<a class="lj-card" href="/solutions/"><h3>Solutions</h3><p>All of them</p></a>');
  assert.strictEqual(md, "### [Solutions](https://www.ljwebmanagement.com/solutions/)\n\nAll of them");
});

test("tables and entities", () => {
  const md = htmlToMarkdown("<table><tr><th>A</th><th>B</th></tr><tr><td>1 &amp; 2</td><td>x|y</td></tr></table>");
  assert.strictEqual(md, "| A | B |\n| --- | --- |\n| 1 & 2 | x\\|y |");
});

test("escapes Markdown syntax in text", () => {
  assert.strictEqual(htmlToMarkdown("<p>a*b_c [d] &lt;e&gt;</p>"), "a\\*b\\_c \\[d\\] \\<e>");
  assert.strictEqual(htmlToMarkdown("<p># not a heading</p>"), "\\# not a heading");
});

test("pageToMarkdown converts <main> only and adds summary and source", () => {
  const html =
    '<html><head><title>T | LJ</title><meta name="description" content="Short summary."><link rel="canonical" href="https://www.ljwebmanagement.com/x/"></head>' +
    "<body><header><p>Menu</p></header><main id=\"main\"><h1>Hello</h1><p>Body</p></main><footer>Foot</footer></body></html>";
  const md = pageToMarkdown(html);
  assert.ok(md.startsWith("# Hello\n\n> Short summary.\n\nBody\n\n---\n"));
  assert.ok(md.includes("Source: https://www.ljwebmanagement.com/x/"));
  assert.ok(md.includes("https://www.ljwebmanagement.com/llms.txt"));
  assert.ok(!md.includes("Menu") && !md.includes("Foot"));
});

test("pageToMarkdown falls back to the <title> when there is no h1", () => {
  const md = pageToMarkdown("<title>Only Title</title><main><p>x</p></main>");
  assert.ok(md.startsWith("# Only Title\n\nx"));
});
