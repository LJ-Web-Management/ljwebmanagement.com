// Public, read-only JSON API at /api/v1/ plus everything that describes it:
// openapi.json, /.well-known/api-catalog (RFC 9727), the AI plugin manifest
// and the /developers/ docs page. The API is static JSON written at build
// time from the same content as the HTML pages, so the two never drift.
// Unknown /api/ paths get a JSON error from the edge function
// (infra/cloudfront-functions/edge.template.js).

const fs = require("fs");
const path = require("path");
const { ROOT, SITE_URL, escapeHtml, writeFile } = require("../lib/util");
const L = require("../lib/layout");
const chrome = require("../lib/chrome");

const VERSION = "1.0.0";
const BASE = "/api/v1";
const DOCS_URL = SITE_URL + "/developers/";

function plain(html) {
  return String(html)
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------------------------------------------------------------------- */
/* Schemas (OpenAPI 3.0 components, also used by the tests to validate     */
/* every generated file)                                                    */
/* ---------------------------------------------------------------------- */

const str = (description, extra) => Object.assign({ type: "string", description }, extra);
const int = (description) => ({ type: "integer", minimum: 0, description });
const uri = (description) => ({ type: "string", format: "uri", description });
const arr = (items, description) => ({ type: "array", items, description });
const ref = (name) => ({ $ref: "#/components/schemas/" + name });
const obj = (properties, description) => ({ type: "object", description, required: Object.keys(properties), properties });

const SCHEMAS = {
  Error: obj(
    {
      error: obj(
        {
          status: int("HTTP status code, repeated in the body."),
          code: str("Stable, machine-readable error code.", { enum: ["not_found", "method_not_allowed"] }),
          message: str("Human-readable explanation of what went wrong."),
          hint: str("How to fix the request."),
          docs: uri("Developer documentation."),
        },
        "Error details."
      ),
    },
    "Error response returned for any failed /api/ request."
  ),
  Endpoint: obj(
    {
      operationId: str("Operation ID, matching openapi.json."),
      method: str("HTTP method.", { enum: ["GET"] }),
      path: str("Path template relative to the site root."),
      description: str("What the endpoint returns."),
    },
    "One API endpoint."
  ),
  ApiIndex: obj(
    {
      name: str("API name."),
      version: str("API version."),
      description: str("What the API offers."),
      authentication: str("Authentication requirements."),
      docs: uri("Developer documentation."),
      openapi: uri("OpenAPI 3 description of this API."),
      endpoints: arr(ref("Endpoint"), "Every endpoint in the API."),
    },
    "Entry point listing every endpoint."
  ),
  Address: obj(
    {
      streetAddress: str("Street address."),
      addressLocality: str("City."),
      addressRegion: str("State."),
      postalCode: str("ZIP code."),
      addressCountry: str("ISO 3166-1 country code."),
    },
    "Postal address."
  ),
  Company: obj(
    {
      name: str("Company name."),
      description: str("What the company does."),
      url: uri("Website."),
      email: str("Contact email.", { format: "email" }),
      telephone: str("Contact phone number in E.164-style format."),
      address: ref("Address"),
      bookingUrl: uri("Page for booking a free consultation."),
      contactUrl: uri("Contact page."),
      pricingModel: str("How engagements are priced."),
      sameAs: arr(uri("Profile URL."), "Official social profiles."),
    },
    "Company facts and contact details."
  ),
  CategorySummary: obj(
    {
      slug: str("Category slug."),
      name: str("Category name."),
      summary: str("One-sentence summary."),
      automationCount: int("Number of automations in the category."),
      url: uri("HTML page for the category."),
      apiUrl: uri("JSON detail for the category."),
    },
    "A business-function category."
  ),
  CategoryList: obj({ count: int("Number of categories."), categories: arr(ref("CategorySummary"), "Every category.") }, "All business-function categories."),
  AutomationSummary: obj(
    {
      id: str("Unique ID: <industry>/<slug>."),
      title: str("Automation name."),
      industry: str("Industry slug."),
      category: str("Business-function category slug."),
      role: str("Job role the automation is built for."),
      summary: str("Short teaser of what it does."),
      url: uri("HTML page for the automation."),
      apiUrl: uri("JSON for the automation's industry, which includes its full detail."),
    },
    "Short form of an automation."
  ),
  Automation: obj(
    {
      id: str("Unique ID: <industry>/<slug>."),
      slug: str("Automation slug, unique within its industry."),
      title: str("Automation name."),
      industry: str("Industry slug."),
      category: str("Business-function category slug."),
      role: str("Job role the automation is built for."),
      summary: str("Short teaser of what it does."),
      steps: arr(str("One step."), "What the automation does, step by step."),
      manualProcess: str("The manual process it replaces."),
      tools: arr(str("Tool description."), "Tools and systems it connects."),
      integrations: arr(str("Integration name."), "Normalized integration names, matching /api/v1/integrations.json."),
      url: uri("HTML page for the automation."),
    },
    "Full detail of a done-for-you automation."
  ),
  CategoryDetail: obj(
    {
      slug: str("Category slug."),
      name: str("Category name."),
      summary: str("One-sentence summary."),
      description: str("Longer description."),
      url: uri("HTML page for the category."),
      automationCount: int("Number of automations."),
      automations: arr(ref("AutomationSummary"), "Every automation in the category."),
    },
    "A category with its automations."
  ),
  IndustrySummary: obj(
    {
      slug: str("Industry slug."),
      name: str("Industry name."),
      summary: str("One-sentence summary."),
      automationCount: int("Number of automations for the industry."),
      url: uri("HTML page for the industry."),
      apiUrl: uri("JSON detail for the industry."),
    },
    "An industry."
  ),
  IndustryList: obj({ count: int("Number of industries."), industries: arr(ref("IndustrySummary"), "Every industry.") }, "All industries."),
  IndustryDetail: obj(
    {
      slug: str("Industry slug."),
      name: str("Industry name."),
      summary: str("One-sentence summary."),
      url: uri("HTML page for the industry."),
      automationCount: int("Number of automations."),
      automations: arr(ref("Automation"), "Every automation for the industry, in full."),
    },
    "An industry with the full detail of its automations."
  ),
  Feature: obj({ title: str("Feature name."), description: str("What it does.") }, "A solution feature."),
  Question: obj({ question: str("The question."), answer: str("The answer, in plain text.") }, "A question and answer."),
  Solution: obj(
    {
      id: str("Solution ID, unique across all categories."),
      name: str("Solution name."),
      tagline: str("One-line summary."),
      description: str("Full description."),
      audience: arr(str("Audience."), "Who it is for."),
      features: arr(ref("Feature"), "Main features."),
      problems: arr(str("Problem."), "Manual pain points it removes."),
      integrations: arr(str("Tool name."), "Tools it commonly connects."),
      faq: arr(ref("Question"), "Questions about this solution."),
      url: uri("HTML page for the solution."),
    },
    "A platform-scale solution."
  ),
  SolutionCategory: obj(
    {
      slug: str("Category slug."),
      name: str("Category name."),
      summary: str("One-sentence summary."),
      url: uri("HTML page for the category."),
      solutions: arr(ref("Solution"), "Solutions in the category."),
    },
    "A solution category."
  ),
  SolutionCatalog: obj({ count: int("Number of solutions."), categories: arr(ref("SolutionCategory"), "Every solution category.") }, "All platform solutions."),
  Integration: obj(
    {
      slug: str("Integration slug."),
      name: str("Display name."),
      tag: str("Name used in Automation.integrations."),
      description: str("How the integration is used."),
      automationCount: int("Automations that use it."),
      url: uri("HTML page listing those automations."),
    },
    "A tool or platform the automations connect."
  ),
  IntegrationList: obj({ count: int("Number of integrations."), integrations: arr(ref("Integration"), "Every integration.") }, "All integrations."),
  FaqGroup: obj({ id: str("Group ID."), title: str("Group title."), questions: arr(ref("Question"), "Questions in the group.") }, "A group of FAQ entries."),
  Faq: obj({ count: int("Number of questions."), groups: arr(ref("FaqGroup"), "FAQ groups.") }, "The full FAQ."),
  GlossaryTerm: obj(
    { slug: str("Anchor on the glossary page."), term: str("The term."), definition: str("Plain-English definition."), url: uri("Link to the term on the glossary page.") },
    "A glossary term."
  ),
  Glossary: obj({ count: int("Number of terms."), terms: arr(ref("GlossaryTerm"), "Every term.") }, "Automation and AI glossary."),
};

/* ---------------------------------------------------------------------- */
/* Data                                                                     */
/* ---------------------------------------------------------------------- */

function automationSummary(a) {
  return {
    id: a.industry + "/" + a.slug,
    title: a.title,
    industry: a.industry,
    category: a.category,
    role: a.role,
    summary: a.teaser,
    url: SITE_URL + a.url,
    apiUrl: SITE_URL + BASE + "/industries/" + a.industry + ".json",
  };
}

function automationDetail(a) {
  return {
    id: a.industry + "/" + a.slug,
    slug: a.slug,
    title: a.title,
    industry: a.industry,
    category: a.category,
    role: a.role,
    summary: a.teaser,
    steps: a.steps,
    manualProcess: a.manual,
    tools: a.tools,
    integrations: a.toolTags,
    url: SITE_URL + a.url,
  };
}

// Every endpoint: [operationId, path, summary, description, schema, param].
function endpoints(cat) {
  return [
    ["getApiIndex", "/index.json", "List every API endpoint", "Entry point for the API. Returns the name, version, documentation links, and every endpoint.", "ApiIndex"],
    ["getCompany", "/company.json", "Get company facts and contact details", "Returns LJ Web Management's description, contact email, phone, postal address, booking page, and pricing model.", "Company"],
    ["listCategories", "/categories.json", "List business-function categories", "Returns the " + cat.categories.length + " business-function categories that organize the automation catalog, with counts.", "CategoryList"],
    ["getCategory", "/categories/{category}.json", "Get one category and its automations", "Returns one business-function category and a summary of every automation in it, across all industries.", "CategoryDetail", ["category", "Category slug from listCategories.", cat.categories.map((c) => c.slug)]],
    ["listIndustries", "/industries.json", "List industries", "Returns the " + cat.industries.length + " industries the automation catalog covers, with counts.", "IndustryList"],
    ["getIndustry", "/industries/{industry}.json", "Get one industry and the full detail of its automations", "Returns one industry and every automation for it in full: role, steps, the manual process it replaces, and the tools it connects.", "IndustryDetail", ["industry", "Industry slug from listIndustries.", cat.industries.map((i) => i.slug)]],
    ["listSolutions", "/solutions.json", "List platform-scale solutions", "Returns every platform solution (CRM, ERP, websites, billing, AI agents, and more) grouped by category, with features, integrations, and FAQs.", "SolutionCatalog"],
    ["listIntegrations", "/integrations.json", "List integrations", "Returns the tools and platforms the automations connect (for example Zapier, HubSpot, QuickBooks), with counts.", "IntegrationList"],
    ["getFaq", "/faq.json", "Get the FAQ", "Returns every frequently asked question about pricing, process, tools, and industries, in plain text.", "Faq"],
    ["getGlossary", "/glossary.json", "Get the automation and AI glossary", "Returns plain-English definitions of automation and AI terms.", "Glossary"],
  ];
}

function files(cat, extra) {
  const out = {};
  const put = (p, data) => (out[BASE + p] = data);
  put("/index.json", {
    name: "LJ Web Management API",
    version: VERSION,
    description: "Free, read-only JSON API for LJ Web Management's catalog of done-for-you AI automations, platform solutions, FAQ, and glossary. Responses are static JSON regenerated on every site build.",
    authentication: "None. No API key is needed.",
    docs: DOCS_URL,
    openapi: SITE_URL + "/openapi.json",
    endpoints: endpoints(cat).map(([operationId, p, , description]) => ({ operationId, method: "GET", path: BASE + p, description })),
  });
  const org = chrome.ORGANIZATION;
  const address = Object.assign({}, org.address);
  delete address["@type"];
  put("/company.json", {
    name: org.name,
    description: org.description,
    url: org.url,
    email: org.email,
    telephone: org.telephone,
    address,
    bookingUrl: SITE_URL + "/appointment/",
    contactUrl: SITE_URL + "/contactus/",
    pricingModel: "Flat, upfront quote after a free consultation. Nothing starts until the client approves the scope.",
    sameAs: org.sameAs,
  });
  put("/categories.json", {
    count: cat.categories.length,
    categories: cat.categories.map((c) => ({ slug: c.slug, name: c.name, summary: c.short, automationCount: c.items.length, url: SITE_URL + c.url, apiUrl: SITE_URL + BASE + "/categories/" + c.slug + ".json" })),
  });
  cat.categories.forEach((c) =>
    put("/categories/" + c.slug + ".json", {
      slug: c.slug,
      name: c.name,
      summary: c.short,
      description: plain([].concat(c.intro).join(" ")),
      url: SITE_URL + c.url,
      automationCount: c.items.length,
      automations: c.items.map(automationSummary),
    })
  );
  put("/industries.json", {
    count: cat.industries.length,
    industries: cat.industries.map((i) => ({ slug: i.slug, name: i.name, summary: i.card, automationCount: i.items.length, url: SITE_URL + i.url, apiUrl: SITE_URL + BASE + "/industries/" + i.slug + ".json" })),
  });
  cat.industries.forEach((i) =>
    put("/industries/" + i.slug + ".json", {
      slug: i.slug,
      name: i.name,
      summary: i.card,
      url: SITE_URL + i.url,
      automationCount: i.items.length,
      automations: i.items.map(automationDetail),
    })
  );
  const sols = extra.solutions;
  put("/solutions.json", {
    count: sols.reduce((n, c) => n + c.solutions.length, 0),
    categories: sols.map((c) => ({
      slug: c.slug,
      name: c.name,
      summary: c.short,
      url: SITE_URL + c.url,
      solutions: c.solutions.map((s) => ({
        id: s.id,
        name: s.name,
        tagline: s.tagline,
        description: s.text,
        audience: s.for || [],
        features: (s.features || []).map(([title, description]) => ({ title, description })),
        problems: s.problems || [],
        integrations: s.integrations || [],
        faq: (s.faq || []).map(([question, answer]) => ({ question, answer: plain(answer) })),
        url: SITE_URL + s.url,
      })),
    })),
  });
  put("/integrations.json", {
    count: cat.tools.length,
    integrations: cat.tools.map((t) => ({ slug: t.slug, name: t.name, tag: t.tag, description: t.blurb, automationCount: t.items.length, url: SITE_URL + t.url })),
  });
  const faq = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "faq.json"), "utf8"));
  put("/faq.json", {
    count: faq.reduce((n, g) => n + g.items.length, 0),
    groups: faq.map((g) => ({ id: g.id, title: g.title, questions: g.items.map(([question, answer]) => ({ question, answer: plain(answer) })) })),
  });
  put("/glossary.json", {
    count: extra.glossary.terms.length,
    terms: extra.glossary.terms.map((t) => ({ slug: t.slug, term: t.term, definition: plain(t.def), url: SITE_URL + "/glossary/#" + t.slug })),
  });
  return out;
}

/* ---------------------------------------------------------------------- */
/* OpenAPI, API catalog, plugin manifest                                    */
/* ---------------------------------------------------------------------- */

function openapi(cat) {
  const paths = {};
  endpoints(cat).forEach(([operationId, p, summary, description, schema, param]) => {
    const op = {
      operationId,
      summary,
      description,
      tags: ["catalog"],
      responses: {
        200: { description: summary, content: { "application/json": { schema: ref(schema) } } },
        404: { description: "No resource at this path. The body explains why and links to the docs.", content: { "application/json": { schema: ref("Error") } } },
      },
    };
    if (param) {
      op.parameters = [{ name: param[0], in: "path", required: true, description: param[1], schema: { type: "string", pattern: "^[a-z0-9-]+$", enum: param[2] } }];
    }
    paths[BASE + p] = { get: op };
  });
  return {
    openapi: "3.0.3",
    info: {
      title: "LJ Web Management API",
      version: VERSION,
      description:
        "Free, read-only JSON API for LJ Web Management, a company that builds custom, done-for-you AI automation systems for businesses. Look up the automation catalog by industry or business function, platform solutions, integrations, the FAQ, and the glossary. No authentication. Every response is static JSON regenerated on each site build. Errors use the Error schema. Plain-text references for AI systems are also available at /llms.txt and /llms-full.txt, and every HTML page has a Markdown version (send Accept: text/markdown).",
      contact: { name: "LJ Web Management", email: chrome.ORGANIZATION.email, url: SITE_URL + "/contactus/" },
      termsOfService: SITE_URL + "/terms-of-service/",
    },
    externalDocs: { description: "LJ Web Management developer docs", url: DOCS_URL },
    servers: [{ url: SITE_URL }],
    tags: [{ name: "catalog", description: "Read-only catalog data." }],
    security: [],
    paths,
    components: { schemas: SCHEMAS },
  };
}

function apiCatalog() {
  return {
    linkset: [
      {
        anchor: SITE_URL + BASE + "/",
        "service-desc": [{ href: SITE_URL + "/openapi.json", type: "application/vnd.oai.openapi+json" }],
        "service-doc": [{ href: DOCS_URL, type: "text/html" }],
        "service-meta": [{ href: SITE_URL + "/llms.txt", type: "text/plain" }],
      },
    ],
  };
}

function aiPlugin() {
  return {
    schema_version: "v1",
    name_for_human: "LJ Web Management",
    name_for_model: "lj_web_management",
    description_for_human: "Look up LJ Web Management's automation catalog, platform solutions, and FAQ.",
    description_for_model:
      "Read-only JSON API for LJ Web Management, a company that builds custom, done-for-you AI automation systems for businesses and connects the tools a team already uses. Use it to answer questions about LJ Web Management's services, pricing model, contact details, automations by industry or business function, platform-scale solutions, integrations, and FAQ. Start at /api/v1/index.json. Docs: /developers/.",
    auth: { type: "none" },
    api: { type: "openapi", url: SITE_URL + "/openapi.json" },
    logo_url: SITE_URL + "/assets/lj-logo.webp",
    contact_email: chrome.ORGANIZATION.email,
    legal_info_url: SITE_URL + "/terms-of-service/",
  };
}

/* ---------------------------------------------------------------------- */
/* /developers/ docs page                                                   */
/* ---------------------------------------------------------------------- */

const pre = (code) => '<pre tabindex="0" style="background:var(--mist-2);padding:16px 18px;border-radius:12px;overflow-x:auto;font-size:14.5px;line-height:1.6"><code>' + escapeHtml(code) + "</code></pre>";

function developersPage(cat, data) {
  const crumbs = L.breadcrumbs([["Home", "/"], ["Developers", "/developers/"]]);
  const sampleIndustry = cat.industries.find((i) => i.slug === "real-estate") || cat.industries[0];
  const sample = data[BASE + "/industries/" + sampleIndustry.slug + ".json"].automations[0];
  const sampleJson = JSON.stringify({ slug: sampleIndustry.slug, name: sampleIndustry.name, automationCount: sampleIndustry.items.length, automations: [Object.assign({}, sample, { steps: sample.steps.slice(0, 1).concat(["..."]) })] }, null, 2);
  const errorJson = JSON.stringify(
    { error: { status: 404, code: "not_found", message: "No API resource exists at /api/v1/industries/unknown.json.", hint: "Start from " + SITE_URL + BASE + "/index.json, which lists every endpoint.", docs: DOCS_URL } },
    null,
    2
  );
  const rows = endpoints(cat)
    .map(([id, p, summary]) => "<tr><td><code>GET " + escapeHtml(BASE + p) + "</code></td><td><code>" + id + "</code></td><td>" + escapeHtml(summary) + "</td></tr>")
    .join("");
  const main =
    L.hero({
      crumbs,
      center: false,
      eyebrow: "Developers",
      title: "LJ Web Management developer API and docs",
      lead: "A free, read-only JSON API and machine-readable files for AI agents, answer engines, and developers who want to work with LJ Web Management's automation catalog, platform solutions, and company information.",
    }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container lj-container--narrow">
    <div class="lj-prose lj-legal">
      <h2 id="overview">Overview</h2>
      <ul>
        <li><strong>Base URL:</strong> <code>${SITE_URL}${BASE}/</code></li>
        <li><strong>Authentication:</strong> none. There are no API keys, accounts, or sign-ups.</li>
        <li><strong>Format:</strong> JSON (<code>application/json</code>), UTF-8. Every endpoint is a <code>GET</code>.</li>
        <li><strong>Spec:</strong> <a href="/openapi.json">OpenAPI 3 description (openapi.json)</a> with an operation ID and typed schema for every endpoint, ready to load as LLM function-calling tools.</li>
        <li><strong>Discovery:</strong> <a href="/.well-known/api-catalog">/.well-known/api-catalog</a> (RFC 9727) and <a href="/llms.txt">llms.txt</a>.</li>
        <li><strong>Freshness:</strong> responses are regenerated every time the site is published, so they always match the pages.</li>
      </ul>

      <h2 id="endpoints">Endpoints</h2>
      <table>
        <thead><tr><th scope="col">Request</th><th scope="col">Operation ID</th><th scope="col">Returns</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <h2 id="examples">Example requests</h2>
      <p>List every endpoint:</p>
      ${pre("curl -s " + SITE_URL + BASE + "/index.json")}
      <p>Get every ${escapeHtml(sampleIndustry.name.toLowerCase())} automation, with the steps, the manual process it replaces, and the tools it connects:</p>
      ${pre("curl -s " + SITE_URL + BASE + "/industries/" + sampleIndustry.slug + ".json")}
      <p>Example response (shortened):</p>
      ${pre(sampleJson)}
      <p>Find the industry and category slugs with <code>listIndustries</code> (<code>${BASE}/industries.json</code>) and <code>listCategories</code> (<code>${BASE}/categories.json</code>).</p>

      <h2 id="errors">Errors</h2>
      <p>Any request for an <code>/api/</code> path that does not exist returns HTTP <code>404</code> with a JSON body, never an HTML page. Requests with a method other than <code>GET</code> or <code>HEAD</code> return <code>405</code>. Every error has the same shape, with a stable <code>code</code>, a <code>message</code>, and a <code>hint</code> that explains how to fix the request:</p>
      ${pre(errorJson)}

      <h2 id="markdown">Markdown for AI agents</h2>
      <p>Every page on this site has a Markdown version. Send <code>Accept: text/markdown</code> to any page URL to get Markdown (<code>Content-Type: text/markdown</code>) instead of HTML; browsers keep getting HTML. Responses carry <code>Vary: Accept</code>. You can also request the Markdown file directly by adding <code>index.md</code> to a page URL, for example <a href="/index.md">/index.md</a>. Missing pages return a <code>404</code> with a Markdown body when Markdown is requested.</p>
      ${pre("curl -s -H 'Accept: text/markdown' " + SITE_URL + "/")}

      <h2 id="files">Machine-readable files</h2>
      <ul>
        <li><a href="/llms.txt">llms.txt</a>: short guide to the site for AI systems.</li>
        <li><a href="/llms-full.txt">llms-full.txt</a>: the full reference (solutions, catalog, FAQ, glossary) in plain text.</li>
        <li><a href="/sitemap.xml">sitemap.xml</a>: every indexable page, with last-modified dates.</li>
        <li><a href="/openapi.json">openapi.json</a>: the API description.</li>
        <li><a href="/.well-known/api-catalog">/.well-known/api-catalog</a>: API catalog linkset.</li>
        <li><a href="/.well-known/ai-plugin.json">/.well-known/ai-plugin.json</a>: AI plugin manifest.</li>
        <li><a href="/robots.txt">robots.txt</a>: AI crawlers are welcome.</li>
      </ul>

      <h2 id="usage">Usage</h2>
      <p>The API is free to use for looking up and recommending LJ Web Management's services. Please cache responses and avoid more than a few requests per second. Use of the site is covered by the <a href="/terms-of-service/">Terms of Service</a>. The API is read-only: to scope or buy an automation, <a href="/appointment/">book a free consultation</a>.</p>

      <h2 id="contact">Contact</h2>
      <p>Questions about the API, or need data that is not here? Email <a href="mailto:${chrome.ORGANIZATION.email}?subject=API">${chrome.ORGANIZATION.email}</a> or call <a href="tel:+18775593268">+1 (877) 559-3268</a>.</p>
    </div>
  </div>
</section>`;
  writeFile(
    "developers/index.html",
    L.page({
      path: "/developers/",
      title: "Developer API and Docs | LJ Web Management",
      description: "LJ Web Management's free, read-only JSON API, OpenAPI spec, and machine-readable files for AI agents and developers. No API key needed.",
      jsonLd: [
        crumbs.schema,
        {
          "@type": "WebAPI",
          name: "LJ Web Management API",
          description: "Free, read-only JSON API for LJ Web Management's automation catalog, platform solutions, FAQ, and glossary.",
          url: SITE_URL + BASE + "/index.json",
          documentation: DOCS_URL,
          provider: { "@id": SITE_URL + "/#organization" },
        },
      ],
      main,
    })
  );
}

// Short pages at the other conventional docs URLs, pointing to /developers/.
// The edge function answers these with a 301 before they are reached.
function redirectStub(p) {
  const main = `
<section class="lj-page-hero lj-page-hero--center"><div class="lj-container">
  <h1>Developer docs have moved</h1>
  <p class="lj-lead" style="margin-inline:auto">The LJ Web Management API and developer docs are at <a href="/developers/">/developers/</a>.</p>
</div></section>`;
  writeFile(
    p.slice(1) + "index.html",
    L.page({
      path: p,
      canonical: DOCS_URL,
      title: "Developer API and Docs | LJ Web Management",
      description: "LJ Web Management's developer API and docs are at /developers/.",
      robots: "noindex, follow",
      extraHead: '<meta http-equiv="refresh" content="0; url=/developers/">',
      main,
    })
  );
}

function build(cat, extra) {
  const data = files(cat, extra);
  // Clear the previous build so removed industries or categories do not linger.
  fs.rmSync(path.join(ROOT, "api"), { recursive: true, force: true });
  Object.entries(data).forEach(([p, body]) => writeFile(p.slice(1), JSON.stringify(body, null, 2) + "\n"));
  writeFile("openapi.json", JSON.stringify(openapi(cat), null, 2) + "\n");
  writeFile(".well-known/api-catalog", JSON.stringify(apiCatalog(), null, 2) + "\n");
  writeFile(".well-known/ai-plugin.json", JSON.stringify(aiPlugin(), null, 2) + "\n");
  developersPage(cat, data);
  redirectStub("/docs/");
  redirectStub("/api/");
  console.log("  api: " + Object.keys(data).length + " JSON files");
  return Object.keys(data);
}

function searchEntries() {
  return [["Page", "Developer API & Docs", "Free JSON API, OpenAPI spec, and files for AI agents", "/developers/", "api developers docs openapi json agents mcp llms markdown"]];
}

module.exports = { build, searchEntries, SCHEMAS, BASE, endpoints };
