// Hand-written pages: home, how it works, solutions, FAQ, contact, booking,
// quiz, ROI calculator, legal pages and the 404 page. Long copy that is not
// page structure lives in content/ (faq.json, solutions.json, pages/*.html).

const fs = require("fs");
const path = require("path");
const { ROOT, SITE_URL, escapeHtml, writeFile, readFile, fileHash, formatNumber } = require("../lib/util");
const L = require("../lib/layout");
const { icon } = L;
const { categoryCard, industrySvg } = require("./automations");
const { latestPosts } = require("../lib/blogfeed");

const content = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "content", f), "utf8"));
const legal = (f) => fs.readFileSync(path.join(ROOT, "content", "pages", f), "utf8");

const TYPEFORM = '<script src="https://embed.typeform.com/next/embed.js" defer></script>';

/* ---------------------------------------------------------------------- */
/* Home                                                                     */
/* ---------------------------------------------------------------------- */

// Transcript of the homepage video, built from its caption file so the two
// never drift apart. Cues are joined and split into paragraphs at sentence
// ends roughly every 400 characters.
function videoTranscript() {
  const text = readFile("assets/homepage-video.vtt")
    .split(/\n\n+/)
    .filter((block) => block.includes("-->"))
    .map((block) => block.split("\n").slice(2).join(" "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const paras = [];
  let cur = "";
  text.split(/(?<=[.?!]) /).forEach((sentence) => {
    cur += (cur ? " " : "") + sentence;
    if (cur.length > 400) {
      paras.push(cur);
      cur = "";
    }
  });
  if (cur) paras.push(cur);
  return paras.map((p) => "<p>" + escapeHtml(p) + "</p>").join("");
}

function home(cat, guides, extra) {
  const total = formatNumber(cat.automations.length);
  const featuredInds = ["real-estate", "healthcare", "legal", "home-services", "restaurants-food-service", "ecommerce-retail", "property-management", "fitness-wellness"].map(
    (s) => cat.industryBySlug[s]
  );
  const toolNames = ["Zapier", "Make.com", "HubSpot", "Salesforce", "QuickBooks", "Twilio", "Slack", "Google Workspace", "Mailchimp", "Calendly", "DocuSign", "Stripe", "Airtable", "Shopify", "Clio", "Jotform", "ActiveCampaign", "Outlook"];
  const marquee = toolNames.concat(toolNames).map((t, i) => '<span class="lj-marquee-item"' + (i >= toolNames.length ? ' aria-hidden="true"' : "") + ">" + icon("plug") + escapeHtml(t) + "</span>").join("");
  const pillar = guides.find((g) => g.slug === "how-to-automate-your-business") || guides[0];
  const course = extra.courses[0];
  const readiness = extra.quizzes.find((q) => q.url === "/quizzes/ai-readiness-assessment/") || extra.quizzes[0];
  const tile = (href, ic, title, sub) => '<a class="lj-itile" href="' + href + '"><span class="lj-itile-icon">' + icon(ic) + "</span><span><strong>" + title + "</strong><small>" + sub + "</small></span></a>";
  const faq = L.faq(content("faq.json")[0].items.slice(0, 5));

  const main = `
<section class="lj-hero">
  <div class="lj-container lj-hero-grid">
    <div>
      <p class="lj-hero-call">Questions? Call <a href="tel:+18775593268">(877) 559-3268</a></p>
      <h1>Cut through the delay. <span class="lj-gradient-text">Automate the busywork.</span></h1>
      <p class="lj-lead">We build custom business automation and AI workflow systems that remove repetitive tasks and bottlenecks, connecting the tools you already use so your team can focus on the work that actually grows the business.</p>
      <div class="lj-hero-actions">
        <a class="lj-btn lj-btn-accent lj-btn-lg" href="/appointment/">Book a Free Consultation ${icon("arrowRight")}</a>
        <a class="lj-btn lj-btn-light lj-btn-lg" href="/automations/">Browse Automations</a>
      </div>
      <div class="lj-stat-row">
        <div class="lj-stat"><strong>${total}+</strong><span>Pre-scoped automations</span></div>
        <div class="lj-stat"><strong>${cat.industries.length}</strong><span>Industries covered</span></div>
        <div class="lj-stat"><strong>$0</strong><span>Discovery consultation</span></div>
        <div class="lj-stat"><strong>Flat</strong><span>Upfront pricing</span></div>
      </div>
    </div>
    <div class="lj-flow" aria-label="Example: an automation handling a new lead">
      <div class="lj-flow-head"><span>Lead follow-up automation</span><span class="lj-flow-live">Running</span></div>
      <div class="lj-flow-trigger"><span class="lj-flow-badge">${icon("zap")}</span><span><small>Trigger &middot; 9:42 PM</small><strong>New quote request from your website</strong></span></div>
      <ol class="lj-flow-steps">
        <li class="lj-flow-step"><div class="lj-flow-step-body">${icon("checkCircle")}<span><strong>Text sent to the lead</strong><small>Personal reply with a booking link</small></span><span class="lj-flow-time">0:04</span></div></li>
        <li class="lj-flow-step"><div class="lj-flow-step-body">${icon("checkCircle")}<span><strong>Contact created in your CRM</strong><small>Source, service, and notes attached</small></span><span class="lj-flow-time">0:05</span></div></li>
        <li class="lj-flow-step"><div class="lj-flow-step-body">${icon("checkCircle")}<span><strong>Estimator alerted in Slack</strong><small>Assigned by service area</small></span><span class="lj-flow-time">0:06</span></div></li>
        <li class="lj-flow-step"><div class="lj-flow-step-body">${icon("checkCircle")}<span><strong>Follow-up sequence scheduled</strong><small>Stops the moment they reply</small></span><span class="lj-flow-time">0:06</span></div></li>
      </ol>
      <div class="lj-flow-result">${icon("calendar")}<span><strong>Call booked for 8:30 AM</strong> while your team was offline</span></div>
    </div>
  </div>
</section>

<section class="lj-section lj-section--tight" aria-label="Integrations">
  <div class="lj-container">
    <p class="lj-center lj-muted" style="margin-bottom:22px;font-size:15px">Built around the tools you already use, no rip-and-replace</p>
    <div class="lj-marquee"><div class="lj-marquee-track">${marquee}</div></div>
  </div>
</section>

<section class="lj-section lj-section--mist">
  <div class="lj-container">
    ${L.sectionHead("Automations by business function", "What do you want to stop doing by hand?", "Every automation in the catalog is filed under the part of the business it improves. Pick one to see real workflows from every industry.")}
    <div class="lj-grid lj-grid-3">${cat.categories.map(categoryCard).join("")}
      <a class="lj-card lj-card--dark" href="/automations/">
        <span class="lj-card-icon">${icon("search")}</span>
        <h3>Not sure where it fits?</h3>
        <p>Search all ${total} automations by task, role, tool, or industry.</p>
        <div class="lj-card-foot"><span class="lj-link-arrow">Open the catalog ${icon("arrowRight")}</span></div>
      </a>
    </div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    <div class="lj-split lj-split--media">
      <div>
        <span class="lj-eyebrow">Our process</span>
        <h2>Ready to automate the boring, repetitive work?</h2>
        <p class="lj-lead">Tell us where the delay is. We scope it, quote it at a flat price, build it around your tools, and stay on to support it.</p>
        <ol class="lj-steps" style="margin-top:28px">
          <li><div class="lj-steps-body"><span class="lj-steps-label">Identify the delays</span><p>You tell us about repetitive tasks, disconnected tools, and bottlenecks slowing your business down.</p></div></li>
          <li><div class="lj-steps-body"><span class="lj-steps-label">Build the automation</span><p>We create a customized system that connects your tools and automates the work, with a flat quote up front.</p></div></li>
          <li><div class="lj-steps-body"><span class="lj-steps-label">Keep business moving</span><p>Your team saves time, responds faster, and operates more efficiently, and we support it as things change.</p></div></li>
        </ol>
        <a class="lj-link-arrow" href="/how-it-works/" style="margin-top:24px">See the full five-step process ${icon("arrowRight")}</a>
      </div>
      <div class="lj-card" style="padding:0;overflow:hidden;border-radius:22px;box-shadow:var(--shadow-lg)">
        <button type="button" class="lj-video-trigger" data-lj-video="/assets/homepage-video.mp4" data-lj-captions="/assets/homepage-video.vtt?v=${fileHash("assets/homepage-video.vtt")}" aria-label="Play the LJ Web Management walkthrough video (captions available)" style="position:relative;display:block;width:100%;padding:0;border:0;background:var(--navy);line-height:0">
          <picture>
            <source srcset="/assets/homepage-video-poster-720.webp 720w, /assets/homepage-video-poster.webp 1200w" sizes="(max-width: 980px) calc(100vw - 48px), 600px" type="image/webp">
            <img src="/assets/homepage-video-poster.jpg" width="1920" height="1080" alt="LJ Web Management automation walkthrough video preview" loading="lazy" decoding="async" style="width:100%;height:auto;display:block">
          </picture>
          <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span style="width:76px;height:76px;border-radius:50%;background:#fff;color:var(--navy);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 14px 34px rgba(8,20,38,.4)">${icon("play")}</span></span>
        </button>
        <details class="lj-transcript"><summary>Read the video transcript</summary><div tabindex="0" aria-label="Video transcript">${videoTranscript()}</div></details>
      </div>
    </div>
  </div>
</section>

<section class="lj-section lj-section--mist">
  <div class="lj-container">
    ${L.sectionHead("Why LJ Web Management", "Automation built around how your business already works", "")}
    <div class="lj-features">
      <div><span class="lj-card-icon lj-card-icon--soft">${icon("receipt")}</span><h3>A clear quote, not a price list</h3><p>After a free consultation you get one flat, all-in price. Nothing starts until you approve the scope.</p></div>
      <div><span class="lj-card-icon lj-card-icon--soft">${icon("plug")}</span><h3>Custom-fit systems</h3><p>Built around the tools you already use, not the other way around.</p></div>
      <div><span class="lj-card-icon lj-card-icon--soft">${icon("zap")}</span><h3>Fast to launch</h3><p>Most systems go live within days, not months.</p></div>
      <div><span class="lj-card-icon lj-card-icon--soft">${icon("message")}</span><h3>Real support</h3><p>A team that answers when something needs to change, long after launch day.</p></div>
    </div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    ${L.sectionHead("Where we help", "Built for your industry", "Role-specific automations for " + cat.industries.length + " industries, from dental practices to warehouses.")}
    <div class="lj-grid lj-grid-4">${featuredInds.map((ind) => '<a class="lj-card lj-card--link" href="' + ind.url + '"><span class="lj-itile-icon" style="margin-bottom:14px">' + industrySvg(ind) + "</span><h3 style=\"font-size:17px\">" + escapeHtml(ind.name) + "</h3><p>" + escapeHtml(ind.card) + '</p><div class="lj-card-foot"><span class="lj-count">' + ind.items.length + ' automations</span><span class="lj-card-arrow">' + icon("arrowRight") + "</span></div></a>").join("")}</div>
    <p class="lj-center lj-mt-lg"><a class="lj-link-arrow" href="/automations/#industries">All ${cat.industries.length} industries ${icon("arrowRight")}</a></p>
  </div>
</section>

<section class="lj-section lj-section--dark">
  <div class="lj-container">
    ${L.sectionHead("Who it's for", "Built for the people deciding on AI, and the people working alongside it", "Implementing AI in a business and using AI to get more out of a job are two different problems. We work on both sides of that.")}
    <div class="lj-features" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:32px 56px">
      <div><span class="lj-card-icon">${icon("building")}</span><h3>Business owners &amp; executives</h3><p>You don't need to hire an AI team to bring AI into your business. We scope the highest-cost repetitive process in your operation, build the automation around the tools you already use, and support it after launch, so leadership gets fewer manual hours, faster response times, and lower costs without the overhead of building it in-house.</p><p><a class="lj-link-arrow" href="/how-it-works/">See how implementation works ${icon("arrowRight")}</a></p></div>
      <div><span class="lj-card-icon">${icon("user")}</span><h3>Employees supplementing their own work</h3><p>The roles most at risk from AI are the ones where nobody bothers to use it. Automating the repetitive part of a job frees up time for the judgment and relationships AI can't replace, which is exactly what tends to keep a role valuable as more work becomes automatable.</p><p><a class="lj-link-arrow" href="/faq/#general">Read the automation FAQ ${icon("arrowRight")}</a></p></div>
    </div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Free resource center</span><h2>Learn how to automate, at your own pace</h2></div>
      <a class="lj-link-arrow" href="/resources/">Open the resource center ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">
      ${L.rcard({ href: course.url, icon: course.icon, tag: "Free course", meta: course.lessons.length + " lessons", title: course.name, text: course.description, cta: "Start learning" })}
      ${L.rcard({ href: readiness.url, icon: readiness.icon, tag: readiness.tag, meta: readiness.minutes + " min", title: readiness.name, text: readiness.card, cta: "Take the assessment" })}
      ${L.rcard({ href: pillar.url, icon: pillar.icon, tag: "Guide", meta: pillar.readMinutes + " min read", title: pillar.title, text: pillar.description, cta: "Read the guide" })}
    </div>
    <div class="lj-grid lj-grid-4 lj-mt-lg lj-home-tiles">
      ${tile("/guides/", "book", guides.length + " free guides", "How to automate, step by step")}
      ${tile("/tools/", "calculator", "Calculators &amp; tools", "ROI, time savings, AI cost")}
      ${tile("/quizzes/", "listCheck", "Quizzes &amp; assessments", "AI readiness, automation IQ")}
      ${tile("/glossary/", "bookOpen", "Automation glossary", extra.glossary.terms.length + " terms in plain English")}
    </div>
  </div>
</section>

<section class="lj-section lj-section--mist">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">From the blog</span><h2>Fresh automation ideas, published daily</h2></div>
      <a class="lj-link-arrow" href="https://blog.ljwebmanagement.com/">Visit the blog ${icon("arrowRight")}</a>
    </div>
    ${latestPosts(3)}
  </div>
</section>

<section class="lj-section">
  <div class="lj-container lj-container--narrow">
    ${L.sectionHead("FAQ", "Questions we hear every day", "")}
    ${faq.html}
    <p class="lj-center lj-mt-lg"><a class="lj-btn lj-btn-ghost" href="/faq/">See all FAQs</a></p>
  </div>
</section>`;

  writeFile(
    "index.html",
    L.page({
      path: "/",
      title: "Business Automation Services | LJ Web Management",
      description: "LJ Web Management builds custom AI and business automation systems that remove repetitive work. Browse " + total + "+ done-for-you automations and get a flat quote.",
      bodyClass: "lj-page-home",
      jsonLd: [
        { "@type": "WebSite", "@id": SITE_URL + "/#website", name: "LJ Web Management", url: SITE_URL + "/", publisher: { "@id": SITE_URL + "/#organization" }, inLanguage: "en-US" },
        faq.schema,
      ],
      extraHead:
        '<link rel="preload" as="image" href="/assets/lj-logo-80.webp">' + '<link rel="preconnect" href="https://blog.ljwebmanagement.com">',
      endScripts: '<script src="https://blog.ljwebmanagement.com/assets/js/latest-posts.js" defer></script>',
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* How it works                                                             */
/* ---------------------------------------------------------------------- */

function howItWorks(cat) {
  const steps = [
    ["Discovery Call", "We talk through your workflows and pinpoint exactly where time and accuracy are being lost."],
    ["Scope & Proposal", "You get a clear breakdown of what we'll build, which tools it connects to, and a flat price before work starts."],
    ["Build & Connect", "We build the automation and connect it to the tools you already use, no rip-and-replace."],
    ["Test Together", "You review the system on real examples from your business, and we tune it based on what you see."],
    ["Launch & Support", "It goes live, your team gets a walkthrough, and we stay on to support things as they change."],
  ];
  const coverage = [
    ["sparkles", "AI Website Assistants", "Answer common questions, collect information, and qualify potential customers automatically.", "/guides/ai-agents-vs-workflow-automation/"],
    ["mail", "Email & Follow-Up", "Send timely, personalized messages without relying on someone to remember to do it.", "/automations/category/lead-follow-up-sales/"],
    ["target", "CRM & Sales", "Organize leads, update records, assign tasks, and keep opportunities moving forward.", "/guides/crm-automation/"],
    ["message", "Customer Support", "Route requests to the right person, send acknowledgments, and speed up response times.", "/automations/category/customer-communication/"],
    ["chart", "Operations & Reporting", "Move information between systems and generate routine reports without manual pulls.", "/automations/category/reporting-analytics/"],
    ["shield", "Onboarding & Compliance", "Coordinate forms, documents, reminders, training steps, and approvals automatically.", "/automations/category/compliance-documents/"],
  ];
  const results = [
    ["Customers wait hours for a reply", "Faster customer responses"],
    ["Leads fall through the cracks", "Fewer missed follow-ups"],
    ["Hours lost retyping the same data", "Less manual data entry"],
    ["Every task handled a different way", "More consistent processes"],
    ["Small mistakes turn into big problems", "Fewer avoidable errors"],
    ["Buried in busywork instead of building the business", "More time for growth"],
  ];
  const faq = L.faq([
    ["Do I need to replace my current software?", "<p>Not necessarily. We can usually build the automation around the tools you already use.</p>"],
    ["Can a small business benefit from automation?", "<p>Yes. Automating even one repetitive, time-consuming process can make a meaningful difference.</p>"],
    ["Will my team stay in control?", "<p>Yes. Automation handles the steps you choose, while your team keeps control of decisions, exceptions, and customer relationships.</p>"],
    ["What processes can be automated?", "<p>Most repetitive, rules-based processes. Tell us what you want handled, and we'll confirm what's possible. You can also browse the <a href=\"/automations/\">automation catalog</a>.</p>"],
    ["How long does implementation take?", "<p>It depends on the tools involved and the complexity of your request. You'll get a clear project scope before development begins.</p>"],
    ["Will you show us how it works?", "<p>Yes. We'll walk your team through the finished system so everyone knows how to use it.</p>"],
  ]);
  const crumbs = L.breadcrumbs([["Home", "/"], ["How It Works", "/how-it-works/"]]);

  const main = `
<section class="lj-page-hero lj-page-hero--center">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">How it works</span>
    <h1>From bottleneck to automated, <span class="lj-gradient-text--ink">step by step</span></h1>
    <p class="lj-lead">Here's exactly what happens once you reach out, from the first conversation about what's slowing you down to a working system your team relies on every day. No jargon, no guesswork.</p>
    <div class="lj-btn-row"><a class="lj-btn lj-btn-primary" href="/appointment/">Book a Free Consultation ${icon("arrowRight")}</a><a class="lj-btn lj-btn-ghost" href="/automations/">Browse Automations</a></div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    ${L.sectionHead("The full process", "Five steps from first call to live system", "Every project follows the same process, so you always know what's happening next and why.")}
    <div class="lj-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${steps.map(([t, d], i) => '<div class="lj-process-step"><span class="lj-steps-label">Step 0' + (i + 1) + "</span><h3>" + escapeHtml(t) + "</h3><p>" + escapeHtml(d) + "</p></div>").join("")}</div>
  </div>
</section>

<section class="lj-section lj-section--mist">
  <div class="lj-container">
    ${L.sectionHead("Automation coverage", "What we can automate", "Every business has a version of these bottlenecks. Here's where our systems quietly take over.")}
    <div class="lj-grid lj-grid-3">${coverage.map(([ic, t, d, href]) => '<a class="lj-card lj-card--link" href="' + href + '"><span class="lj-card-icon">' + icon(ic) + "</span><h3>" + escapeHtml(t) + "</h3><p>" + escapeHtml(d) + '</p><div class="lj-card-foot"><span class="lj-link-arrow">Learn more ' + icon("arrowRight") + "</span></div></a>").join("")}</div>
    <div class="lj-cta-band lj-mt-lg"><div><h2>Don't see what you need?</h2><p>If it's repetitive, disconnected, or slowing your team down, chances are we can automate it. Or browse ${formatNumber(cat.automations.length)} done-for-you automations across ${cat.industries.length} industries.</p></div><div class="lj-btn-row"><a class="lj-btn lj-btn-accent" href="/contactus/">Tell Us What to Automate</a><a class="lj-btn lj-btn-light" href="/automations/">Browse the Catalog</a></div></div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container">
    ${L.sectionHead("The result", "What changes once the busywork disappears", "")}
    <div class="lj-compare">
      <div class="lj-compare-col lj-compare-before"><h3>${icon("xCircle")}Before</h3><ul class="lj-checklist">${results.map(([b]) => "<li>" + icon("close") + "<span>" + escapeHtml(b) + "</span></li>").join("")}</ul></div>
      <div class="lj-compare-col lj-compare-after"><h3>${icon("checkCircle")}After</h3><ul class="lj-checklist">${results.map(([, a]) => "<li>" + icon("check") + "<span>" + escapeHtml(a) + "</span></li>").join("")}</ul></div>
    </div>
  </div>
</section>

<section class="lj-section lj-section--mist">
  <div class="lj-container">
    ${L.sectionHead("Who it's for", "The same process, two different outcomes", "How this process plays out depends on which side of the desk you're sitting on.")}
    <div class="lj-grid lj-grid-2">
      <div class="lj-card"><span class="lj-card-icon">${icon("building")}</span><h3>For business owners &amp; executives</h3><p>Steps 1 and 2 are where you implement AI without needing to hire for it: you tell us where the delay is, and we scope and build the system around your existing tools. Step 5 is where it keeps paying off, with ongoing support instead of a project that goes stale the day it launches.</p></div>
      <div class="lj-card"><span class="lj-card-icon">${icon("user")}</span><h3>For employees</h3><p>Steps 3 and 4 are the ones that touch your own role: the repetitive part of your job gets built into the system and tested against real examples from your work, and what's left afterward is the judgment and relationship work AI can't do. That's the part of a job that's hardest to automate away, and the part worth getting good at now.</p></div>
    </div>
  </div>
</section>

<section class="lj-section">
  <div class="lj-container lj-container--narrow">
    ${L.sectionHead("FAQ", "Common questions", "")}
    ${faq.html}
    <p class="lj-center lj-mt-lg"><a class="lj-btn lj-btn-ghost" href="/faq/">View more automation FAQs</a></p>
  </div>
</section>`;

  writeFile(
    "how-it-works/index.html",
    L.page({
      path: "/how-it-works/",
      title: "How Business Automation Works | LJ Web Management",
      description: "How LJ Web Management builds your automation: a free discovery call, a flat-price scope, build and connect, test together, then launch and ongoing support.",
      active: "how",
      jsonLd: [
        {
          "@type": "HowTo",
          name: "How LJ Web Management builds a custom automation",
          description: "The five-step process LJ Web Management follows to scope, build, and launch a custom AI automation, from first call to ongoing support.",
          step: steps.map(([t, d], i) => ({ "@type": "HowToStep", position: i + 1, name: t, text: d })),
        },
        crumbs.schema,
        faq.schema,
      ],
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Solutions                                                                */
/* ---------------------------------------------------------------------- */

const SOLUTION_ICONS = {
  "custom-website": "layers", "obsolescence-management": "clock", "erp-integration": "building", "managed-saas": "shield",
  "lms-deployment": "book", "restaurant-pos": "receipt", "custom-crm": "target", "booking-scheduling": "calendar",
  "field-service": "tool", "membership-billing": "users", "help-desk-ticketing": "message", "inventory-warehouse": "box",
  "hr-payroll": "userPlus", "bi-reporting": "chart", "customer-portal": "user", "marketplace-platform": "plug",
};

function solutions() {
  const sols = content("solutions.json");
  const crumbs = L.breadcrumbs([["Home", "/"], ["Solutions", "/solutions/"]]);
  const main = `
<section class="lj-page-hero lj-page-hero--dark">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">Platform solutions</span>
    <h1>Full-scale systems, <span class="lj-gradient-text">not just single automations</span></h1>
    <p class="lj-lead">Beyond individual role-based automations, these are broader systems infrastructure investments, built for businesses ready to replace disconnected tools with one integrated backbone. These are the decisions that sit with ownership and leadership, and the systems your team will run on once they're in place.</p>
    <div class="lj-btn-row"><a class="lj-btn lj-btn-accent" href="/appointment/">Book a Free Consultation ${icon("arrowRight")}</a><a class="lj-btn lj-btn-light" href="/automations/">See Role-Based Automations</a></div>
  </div>
</section>
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <nav class="lj-chip-row" aria-label="Jump to a solution">${sols.map((s) => '<a class="lj-chip" href="#' + s.id + '">' + escapeHtml(s.name) + "</a>").join("")}</nav>
  </div>
</section>
<section class="lj-section lj-section--flush-top">
  <div class="lj-container">
    <div>${sols.map((s) => '<article class="lj-sol" id="' + s.id + '"><span class="lj-card-icon">' + icon(SOLUTION_ICONS[s.id] || "layers") + "</span><div><h2>" + escapeHtml(s.name) + "</h2><p>" + escapeHtml(s.text) + '</p><a class="lj-link-arrow" href="/appointment/">Talk to us about this ' + icon("arrowRight") + "</a></div></article>").join("")}</div>
  </div>
</section>`;
  writeFile(
    "solutions/index.html",
    L.page({
      path: "/solutions/",
      title: "Automation & Software Solutions | LJ Web Management",
      description: "Platform-scale solutions from LJ Web Management: custom websites, CRM, ERP integration, booking, field service, billing, help desk, inventory, HR, BI, and more.",
      active: "solutions",
      jsonLd: [
        {
          "@type": "ItemList",
          name: "LJ Web Management platform solutions",
          itemListElement: sols.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Service", name: s.name, description: s.text, url: SITE_URL + "/solutions/#" + s.id, provider: { "@id": SITE_URL + "/#organization" } } })),
        },
        crumbs.schema,
      ],
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* FAQ                                                                      */
/* ---------------------------------------------------------------------- */

function faqPage() {
  const groups = content("faq.json");
  const crumbs = L.breadcrumbs([["Home", "/"], ["FAQ", "/faq/"]]);
  const all = [];
  const sections = groups
    .map((g) => {
      const f = L.faq(g.items);
      all.push(...g.items);
      return '<section class="lj-faq-group" id="' + g.id + '"><span class="lj-eyebrow">' + escapeHtml(g.eyebrow) + "</span><h2>" + escapeHtml(g.title) + "</h2>" + f.html + "</section>";
    })
    .join("");
  const schema = L.faq(all).schema;
  const main = `
<section class="lj-page-hero lj-page-hero--center">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">FAQ</span>
    <h1>Frequently asked questions</h1>
    <p class="lj-lead">Everything you're likely wondering about how we work, what it costs, and what we build, organized by topic. New to the term itself? See <a href="/resources/what-is-business-automation/">what business automation is</a> first.</p>
    <nav class="lj-chip-row" aria-label="FAQ topics" style="margin-top:26px">${groups.map((g) => '<a class="lj-chip" href="#' + g.id + '">' + escapeHtml(g.eyebrow.replace(/ Questions$/, "")) + "</a>").join("")}</nav>
  </div>
</section>
<section class="lj-section">
  <div class="lj-container lj-container--narrow">${sections}</div>
</section>`;
  writeFile(
    "faq/index.html",
    L.page({
      path: "/faq/",
      title: "Business Automation FAQ | LJ Web Management",
      description: "Answers about LJ Web Management's automation services: pricing, timelines, tools we connect, industries we serve, support after launch, and platform solutions.",
      active: "resources",
      jsonLd: [schema, crumbs.schema],
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Contact, appointment, booked                                             */
/* ---------------------------------------------------------------------- */

function contactList() {
  return `<ul class="lj-contact-list">
  <li><a href="mailto:info@ljwebmanagement.com"><span class="lj-card-icon">${icon("mail")}</span><span>info@ljwebmanagement.com<small>Email us anytime</small></span></a></li>
  <li><a href="tel:+18775593268"><span class="lj-card-icon">${icon("phone")}</span><span>+1 (877) 559-3268<small>Call or text</small></span></a></li>
  <li><a href="/appointment/"><span class="lj-card-icon">${icon("calendar")}</span><span>Book a free consultation<small>Pick a time that works for you</small></span></a></li>
  <li><span><span class="lj-card-icon">${icon("pin")}</span><span>1108 E 9th St, Lockport, IL 60441<small>Available by appointment</small></span></span></li>
</ul>`;
}

function contact() {
  const crumbs = L.breadcrumbs([["Home", "/"], ["Contact Us", "/contactus/"]]);
  const main = `
<section class="lj-page-hero">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">Get in touch</span>
    <h1>Let's talk about your business</h1>
    <p class="lj-lead">Questions, ideas, or ready to get started? Send us a message and we'll get back to you shortly.</p>
  </div>
</section>
<section class="lj-section">
  <div class="lj-container">
    <div class="lj-split">
      <div><div class="lj-embed"><div data-tf-live="01KY317GTBCXA4CV67B60P7AQ9"></div></div><p class="lj-notice"><strong>Notice at collection.</strong> We collect what you enter in this form (such as your name, email address, phone number, and message) to respond to your message and follow up about our services. Typeform processes the form for us. If you give us your phone number, we may call or text you about your request; message and data rates may apply, and you can reply STOP to opt out. We do not sell or share personal information. See our <a href="/privacy-policy/">Privacy Policy</a> and <a href="/privacy-choices/">Your Privacy Choices</a>.</p></div>
      <div class="lj-sticky">
        <span class="lj-eyebrow">Other ways to reach us</span>
        <h2 style="font-size:1.5rem">Prefer email or a call?</h2>
        ${contactList()}
      </div>
    </div>
  </div>
</section>`;
  writeFile(
    "contactus/index.html",
    L.page({
      path: "/contactus/",
      title: "Contact LJ Web Management | Business Automation",
      description: "Contact LJ Web Management about business automation. Send a message, email info@ljwebmanagement.com, call +1 (877) 559-3268, or book a free consultation.",
      extraHead: TYPEFORM,
      jsonLd: [{ "@type": "ContactPage", name: "Contact LJ Web Management", url: SITE_URL + "/contactus/" }, crumbs.schema],
      main,
    })
  );
}

function appointment() {
  const crumbs = L.breadcrumbs([["Home", "/"], ["Book a Consultation", "/appointment/"]]);
  const main = `
<section class="lj-page-hero">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">Book a consultation</span>
    <h1>Let's find a time to talk</h1>
    <p class="lj-lead">Pick a slot that works for you, no back-and-forth required. We'll show up ready to talk through what's slowing your business down.</p>
  </div>
</section>
<section class="lj-section">
  <div class="lj-container">
    <div class="lj-split">
      <div><div class="lj-embed"><div data-tf-live="01KY5CPJYD0ZA29RZEH68M7A52"></div></div><p class="lj-notice"><strong>Notice at collection.</strong> We collect what you enter in this form (such as your name, email address, phone number, and message) to schedule, prepare for, and follow up on your consultation. Typeform processes the form for us. If you give us your phone number, we may call or text you about your request; message and data rates may apply, and you can reply STOP to opt out. We do not sell or share personal information. See our <a href="/privacy-policy/">Privacy Policy</a> and <a href="/privacy-choices/">Your Privacy Choices</a>.</p></div>
      <div class="lj-sticky">
        <span class="lj-eyebrow">What to expect</span>
        <ol class="lj-steps" style="margin-top:10px">
          <li><div class="lj-steps-body"><span class="lj-steps-label">A free, 30-minute-ish call</span><p>Tell us what's repetitive, disconnected, or slowing your team down. No prep required.</p></div></li>
          <li><div class="lj-steps-body"><span class="lj-steps-label">A clear recommendation</span><p>We'll point to the automations with the biggest payoff and the tools they'd connect.</p></div></li>
          <li><div class="lj-steps-body"><span class="lj-steps-label">A flat, upfront quote</span><p>One all-in price for the exact system. Nothing starts until you approve it.</p></div></li>
        </ol>
        <p class="lj-muted" style="margin-top:22px">Prefer email? <a href="/contactus/">Contact us instead</a>.</p>
      </div>
    </div>
  </div>
</section>`;
  writeFile(
    "appointment/index.html",
    L.page({
      path: "/appointment/",
      title: "Book a Business Automation Consultation | LJ Web Management",
      description: "Book a free business automation consultation with LJ Web Management. Pick a time, tell us what's slowing you down, and get a flat, upfront quote.",
      extraHead: TYPEFORM,
      jsonLd: [crumbs.schema],
      main,
    })
  );

  const booked = `
<section class="lj-section">
  <div class="lj-container lj-container--narrow lj-center">
    <span class="lj-hero-icon" style="background:linear-gradient(145deg,#12a074,#0f7a55)">${icon("check")}</span>
    <span class="lj-eyebrow" style="display:flex;justify-content:center">Consultation booked</span>
    <h1>You're all set</h1>
    <p class="lj-lead" style="margin-inline:auto;max-width:620px">Thanks for booking a time with LJ Web Management. A confirmation and calendar invite are on their way to your inbox now.</p>
    <div class="lj-card" style="text-align:left;margin:36px auto 0;max-width:640px;padding:30px">
      <span class="lj-eyebrow">What happens next</span>
      <ol class="lj-steps">
        <li><div class="lj-steps-body"><p><strong>Check your email.</strong> You'll receive a confirmation with the date, time, and a calendar invite you can add with one click.</p></div></li>
        <li><div class="lj-steps-body"><p><strong>We'll look into your business beforehand,</strong> so the call is spent talking through real solutions, not general questions.</p></div></li>
        <li><div class="lj-steps-body"><p><strong>Come ready to talk shop.</strong> Bring the repetitive tasks, disconnected tools, or bottlenecks slowing your team down, and we'll map out where automation actually helps.</p></div></li>
      </ol>
    </div>
    <div class="lj-btn-row" style="justify-content:center;margin-top:30px"><a class="lj-btn lj-btn-primary" href="/automations/">Browse Automations</a><a class="lj-btn lj-btn-ghost" href="/guides/">Read the Guides</a></div>
    <p class="lj-muted" style="margin-top:22px">Need to change your time? <a href="/appointment/">Rebook your consultation</a> or <a href="/contactus/">contact us</a> directly.</p>
  </div>
</section>`;
  writeFile(
    "appointment/booked/index.html",
    L.page({
      path: "/appointment/booked/",
      title: "You're Booked | LJ Web Management",
      description: "Your consultation with LJ Web Management is booked. Here's what happens next.",
      robots: "noindex, follow",
      main: booked,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Quiz and ROI calculator                                                  */
/* ---------------------------------------------------------------------- */

function quiz() {
  const crumbs = L.breadcrumbs([["Home", "/"], ["Resources", "/resources/"], ["Quizzes", "/quizzes/"], ["Automation Match Quiz", "/quiz/"]]);
  const main = `
<section class="lj-page-hero lj-page-hero--center">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">Find your match</span>
    <h1>Which solution fits your business?</h1>
    <p class="lj-lead">Three quick questions, then we'll point you to the exact solution built for your biggest bottleneck.</p>
  </div>
</section>
<section class="lj-section">
  <div class="lj-container">
    <div class="lj-tool-card">
      <div class="lj-progress"><div class="lj-progress-bar" id="lj-quiz-bar"></div></div>
      <div class="lj-tool-card-body">
        <div class="lj-quiz-step is-active" data-step="0">
          <span class="lj-eyebrow">Two-minute quiz</span>
          <h2>Let's find your match</h2>
          <p>Answer a few questions about where your team loses the most time, and we'll match you to the LJ Web Management solution built to fix it.</p>
          <button type="button" class="lj-btn lj-btn-primary lj-btn-lg" id="lj-quiz-start" style="margin-top:12px">Start the Quiz ${icon("arrowRight")}</button>
        </div>
        <div class="lj-quiz-step" data-step="1"><span class="lj-eyebrow">Step 1 of 3</span><h2>What's the biggest area of friction in your business right now?</h2><div class="lj-quiz-opts" id="lj-quiz-opts-1"></div></div>
        <div class="lj-quiz-step" data-step="2"><span class="lj-eyebrow">Step 2 of 3</span><h2 id="lj-quiz-step2-title">Where specifically does it hurt?</h2><div class="lj-quiz-opts" id="lj-quiz-opts-2"></div></div>
        <div class="lj-quiz-step" data-step="3"><span class="lj-eyebrow">Step 3 of 3</span><h2>How big is your team?</h2><div class="lj-quiz-opts" id="lj-quiz-opts-3"></div></div>
        <div class="lj-quiz-step" data-step="4"><div class="lj-quiz-result" id="lj-quiz-result" aria-live="polite"></div></div>
        <div class="lj-quiz-nav"><button type="button" class="lj-quiz-back" id="lj-quiz-back" hidden>${icon("arrowLeft")} Back</button></div>
      </div>
    </div>
  </div>
</section>`;
  const script = fs.readFileSync(path.join(ROOT, "content", "pages", "quiz.js"), "utf8").replace("__ARROW__", icon("arrowRight").replace(/'/g, "\\'"));
  writeFile(
    "quiz/index.html",
    L.page({
      path: "/quiz/",
      title: "Find Your Business Automation Match | LJ Web Management",
      description: "Take a two-minute quiz to match your biggest business bottleneck to the right automation or platform solution from LJ Web Management.",
      active: "resources",
      jsonLd: [crumbs.schema],
      endScripts: "<script>\n" + script + "</script>",
      main,
    })
  );
}

function roi() {
  const crumbs = L.breadcrumbs([["Home", "/"], ["Resources", "/resources/"], ["Free Tools", "/tools/"], ["ROI Calculator", "/roi-calculator/"]]);
  const field = (id, label, min, max, value, step, hint, fmt) =>
    '<div class="lj-calc-field"><label for="lj-roi-' + id + '">' + label + ' <output id="lj-roi-' + id + '-val" for="lj-roi-' + id + '">' + fmt + "</output></label>" +
    '<input type="range" id="lj-roi-' + id + '" min="' + min + '" max="' + max + '" value="' + value + '" step="' + step + '"><small>' + hint + "</small></div>";
  const main = `
<section class="lj-page-hero lj-page-hero--center">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">ROI calculator</span>
    <h1>See what manual work is really costing you</h1>
    <p class="lj-lead">Move the numbers below to match your team. We'll estimate the hours and dollars automation could hand back every month.</p>
  </div>
</section>
<section class="lj-section">
  <div class="lj-container">
    <div class="lj-tool-card" style="max-width:1000px">
      <div class="lj-calc">
        <div class="lj-calc-inputs">
          ${field("people", "People doing this manual work", 1, 50, 3, 1, "How many employees spend time on this task", "3")}
          ${field("hours", "Hours per week, per person", 1, 40, 8, 1, "Time spent on data entry, follow-ups, scheduling, or tracking by hand", "8")}
          ${field("rate", "Fully loaded hourly cost", 15, 150, 35, 1, "Wages plus taxes and benefits, per hour", "$35")}
          ${field("eff", "Estimated automation efficiency", 30, 90, 70, 5, "Share of that manual time a well-built automation typically removes", "70%")}
        </div>
        <div class="lj-calc-results">
          <h2>Estimated impact</h2>
          <div class="lj-calc-metric lj-calc-metric--hero"><span>Cost of manual work removed per year</span><strong id="lj-roi-dollars-year">$0</strong><span><span id="lj-roi-dollars-month">$0</span> per month</span></div>
          <div class="lj-grid lj-grid-2" style="gap:12px">
            <div class="lj-calc-metric"><span>Hours saved / week</span><strong id="lj-roi-hours-week">0</strong></div>
            <div class="lj-calc-metric"><span>Hours saved / year</span><strong id="lj-roi-hours-year">0</strong></div>
          </div>
          <p class="lj-calc-note">These figures are estimates for illustration purposes, based on the numbers you enter. Actual results depend on your specific workflows and tools.</p>
          <a class="lj-btn lj-btn-accent" href="/appointment/">Turn These Numbers Into Reality ${icon("arrowRight")}</a>
        </div>
      </div>
    </div>
    <p class="lj-center lj-mt-lg lj-muted">Want the full method, including revenue gains and payback period? Read <a href="/guides/automation-roi/">how to calculate automation ROI</a>, or <a href="/quiz/">take the automation match quiz</a>.</p>
  </div>
</section>`;
  const script = `(function () {
  'use strict';
  var ids = ['people', 'hours', 'rate', 'eff'];
  var el = {};
  ids.forEach(function (id) { el[id] = document.getElementById('lj-roi-' + id); });
  if (!el.people) return;
  var usd = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var num = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var set = function (id, v) { document.getElementById(id).textContent = v; };
  function recalc() {
    var p = parseFloat(el.people.value) || 0;
    var h = parseFloat(el.hours.value) || 0;
    var r = parseFloat(el.rate.value) || 0;
    var e = (parseFloat(el.eff.value) || 0) / 100;
    set('lj-roi-people-val', p);
    set('lj-roi-hours-val', h);
    set('lj-roi-rate-val', usd(r));
    set('lj-roi-eff-val', Math.round(e * 100) + '%');
    var hoursWeek = p * h * e;
    var dollarsMonth = hoursWeek * r * 4.345;
    set('lj-roi-hours-week', num(hoursWeek));
    set('lj-roi-hours-year', num(hoursWeek * 52));
    set('lj-roi-dollars-month', usd(dollarsMonth));
    set('lj-roi-dollars-year', usd(dollarsMonth * 12));
  }
  ids.forEach(function (id) { el[id].addEventListener('input', recalc); });
  recalc();
})();
`;
  writeFile(
    "roi-calculator/index.html",
    L.page({
      path: "/roi-calculator/",
      title: "Business Automation ROI Calculator | LJ Web Management",
      description: "Estimate the hours and dollars your team's manual work costs every month, and what business automation could save, with this free ROI calculator.",
      active: "resources",
      jsonLd: [
        { "@type": "WebApplication", name: "Business Automation ROI Calculator", url: SITE_URL + "/roi-calculator/", applicationCategory: "BusinessApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        crumbs.schema,
      ],
      endScripts: "<script>\n" + script + "</script>",
      main,
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Legal and 404                                                            */
/* ---------------------------------------------------------------------- */

function legalPage(slug, title, description) {
  const p = "/" + slug + "/";
  const crumbs = L.breadcrumbs([["Home", "/"], [title, p]]);
  const main = `
<section class="lj-page-hero">
  <div class="lj-container lj-container--narrow">
    ${crumbs.html}
    <span class="lj-eyebrow">LJ Web Management</span>
    <h1>${title}</h1>
  </div>
</section>
<section class="lj-section">
  <div class="lj-container lj-container--narrow"><div class="lj-prose lj-legal">${legal(slug + ".html")}</div></div>
</section>`;
  writeFile(slug + "/index.html", L.page({ path: p, title: title + " | LJ Web Management", description, jsonLd: [crumbs.schema], main }));
}

/* ---------------------------------------------------------------------- */
/* Privacy choices and accessibility                                        */
/* ---------------------------------------------------------------------- */

function privacyChoices() {
  const crumbs = L.breadcrumbs([["Home", "/"], ["Your Privacy Choices", "/privacy-choices/"]]);
  const main =
    L.hero({
      crumbs,
      center: false,
      eyebrow: "Privacy",
      title: "Your Privacy Choices",
      lead: "Control optional cookies on this site and learn how to see, correct, or delete the personal information we hold about you. We do not sell or share personal information, and these choices apply to our website and blog.",
    }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container lj-container--narrow">
    <div class="lj-prose lj-legal">
      <h2 id="cookies">Cookie and analytics settings</h2>
      <div class="lj-callout"><strong>Your current setting</strong><p data-lj-consent-status>Turn on JavaScript to change your settings here, or block cookies in your browser settings. Without JavaScript, analytics never load.</p></div>
      <div class="lj-btn-row lj-mb">
        <button type="button" class="lj-btn lj-btn-primary" data-lj-consent-open>Open privacy settings</button>
        <button type="button" class="lj-btn lj-btn-ghost" data-lj-consent-set="0">Opt out of analytics</button>
        <button type="button" class="lj-btn lj-btn-ghost" data-lj-consent-set="1">Allow analytics</button>
      </div>
      <p>Analytics (Google Analytics and Microsoft Clarity) help us understand how the site is used. They run unless you opt out, or your browser sends a Global Privacy Control or Do Not Track signal. Strictly necessary storage, which remembers this choice and on-device preferences like course progress, is always on and is used only to apply your choices, never to identify or track you. Your choice is saved in your browser for 12 months, so you will need to set it again on another browser or device, or if you clear your cookies.</p>

      <h2 id="do-not-sell">Do Not Sell or Share My Personal Information</h2>
      <p>We do not sell personal information, share it for cross-context behavioral advertising, or use it for targeted advertising, and we do not use advertising cookies. There is nothing you need to do to opt out. If you would still like us to record an opt-out request, for example to cover any future change in our practices, email <a href="mailto:info@ljwebmanagement.com?subject=Do%20Not%20Sell%20or%20Share">info@ljwebmanagement.com</a> with the subject line "Do Not Sell or Share."</p>
      <h3>Global Privacy Control</h3>
      <p>If your browser sends a Global Privacy Control (GPC) signal, we treat it as an opt-out of selling and sharing and keep analytics off for that browser. We treat Do Not Track signals the same way.</p>

      <h2 id="rights">Your privacy rights</h2>
      <p>We honor these requests from any U.S. resident, whether or not your state's privacy law requires it:</p>
      <ul>
        <li><strong>Know and access:</strong> find out what personal information we hold about you and how we use it</li>
        <li><strong>Get a copy:</strong> receive your information in a portable format</li>
        <li><strong>Correct:</strong> fix information that is inaccurate</li>
        <li><strong>Delete:</strong> ask us to delete your information, subject to legal exceptions</li>
        <li><strong>Opt out:</strong> of any sale, sharing, targeted advertising, or significant profiling (we do none of these)</li>
        <li><strong>Equal treatment:</strong> we will not treat you differently for using any of these rights</li>
      </ul>
      <p>We do not collect sensitive personal information through our website, so there is no sensitive information to limit.</p>

      <h2 id="request">How to make a request</h2>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:info@ljwebmanagement.com?subject=Privacy%20Request">info@ljwebmanagement.com</a> with the subject line "Privacy Request"</li>
        <li><strong>Phone (toll-free):</strong> <a href="tel:+18775593268">+1 (877) 559-3268</a></li>
        <li><strong>Mail:</strong> LJ Web Management, 1108 E 9th St., Lockport, IL 60441</li>
      </ul>
      <p>Tell us your name, the email address or phone number you used with us, and what you would like us to do. We may ask for a little more information to confirm your identity, and we will only use it for that purpose. We confirm requests within 10 business days and respond within 45 days; if we need more time (up to another 45 days), we will tell you why.</p>
      <p><strong>Authorized agents.</strong> Someone you authorize can make a request for you. We may ask for proof of their authority and confirm the request directly with you.</p>
      <p><strong>Appeals.</strong> If we decline your request, we will explain why. You can appeal by replying to our decision or emailing <a href="mailto:info@ljwebmanagement.com?subject=Privacy%20Appeal">info@ljwebmanagement.com</a> with the subject line "Privacy Appeal." We will respond within 45 days. If we deny your appeal, you can contact your state Attorney General.</p>

      <h2 id="more">More information</h2>
      <p>Our <a href="/privacy-policy/">Privacy Policy</a> explains what we collect, why, who receives it, and how long we keep it, including a summary table for state privacy laws. If you need this information in another format, contact us and we will provide it.</p>
    </div>
  </div>
</section>`;
  writeFile(
    "privacy-choices/index.html",
    L.page({
      path: "/privacy-choices/",
      title: "Your Privacy Choices | LJ Web Management",
      description: "Manage cookie and analytics settings, learn about Global Privacy Control, and request access to, correction of, or deletion of your personal information.",
      jsonLd: [crumbs.schema],
      main,
    })
  );
}

function accessibility() {
  const crumbs = L.breadcrumbs([["Home", "/"], ["Accessibility", "/accessibility/"]]);
  const main =
    L.hero({
      crumbs,
      center: false,
      eyebrow: "Accessibility",
      title: "Accessibility Statement",
      lead: "We want everyone to be able to use our website and blog, including people who use assistive technology. If anything gets in your way, tell us and we will help.",
    }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container lj-container--narrow">
    <div class="lj-prose lj-legal">
      <h2>Our commitment</h2>
      <p>LJ Web Management aims for our website (www.ljwebmanagement.com) and blog (blog.ljwebmanagement.com) to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, and we follow WCAG 2.2 where practical. Accessibility is part of how we design, build, and review every page.</p>
      <h2>What we do</h2>
      <ul>
        <li>Use semantic HTML, headings in a logical order, and labels for every control</li>
        <li>Support full keyboard use, with a "Skip to content" link and visible focus indicators</li>
        <li>Meet WCAG contrast requirements for text and interface elements</li>
        <li>Provide text alternatives for meaningful images and icons, and captions and a written transcript for our homepage video</li>
        <li>Respect the "reduce motion" setting on your device</li>
        <li>Make pages work when zoomed to 200 percent and on small screens</li>
        <li>Test new pages with automated checks (axe-core) and manual keyboard testing before they go live</li>
      </ul>
      <h2>Known limitations</h2>
      <p>Some features come from third parties, and we cannot fully control their accessibility: our contact, booking, and newsletter forms (Typeform) and our live chat (Tawk.to). If any of these cause a problem, you can always reach us by phone or email instead, and we will help you directly, including by booking a consultation for you or sending you the information in another format.</p>
      <h2>Feedback and help</h2>
      <p>If you have trouble using any part of our website or blog, or need information in a different format, please contact us:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:info@ljwebmanagement.com?subject=Accessibility">info@ljwebmanagement.com</a> with the subject line "Accessibility"</li>
        <li><strong>Phone (toll-free):</strong> <a href="tel:+18775593268">+1 (877) 559-3268</a></li>
        <li><strong>Mail:</strong> LJ Web Management, 1108 E 9th St., Lockport, IL 60441</li>
      </ul>
      <p>Please tell us the page and the problem you ran into. We aim to respond within five business days.</p>
      <p class="lj-muted">This statement was last reviewed on October 25, 2026.</p>
    </div>
  </div>
</section>`;
  writeFile(
    "accessibility/index.html",
    L.page({
      path: "/accessibility/",
      title: "Accessibility Statement | LJ Web Management",
      description: "LJ Web Management's commitment to WCAG 2.1 AA accessibility, known limitations, and how to get help if anything on our website is hard to use.",
      jsonLd: [crumbs.schema],
      main,
    })
  );
}

function notFound() {
  const main = `
<section class="lj-page-hero lj-page-hero--dark lj-page-hero--center" style="padding-block:96px">
  <div class="lj-container">
    <span class="lj-eyebrow lj-eyebrow--pill">Error 404</span>
    <h1>This page couldn't be found</h1>
    <p class="lj-lead" style="margin-inline:auto">The page you're looking for doesn't exist or has moved. Try searching, or start from one of these.</p>
    <div style="max-width:560px;margin:28px auto 0"><button type="button" class="lj-hero-search" data-lj-search-open aria-label="Search the site">${icon("search")}<span class="lj-hero-search-text">Search automations, guides, and articles</span><span class="lj-btn lj-btn-primary lj-btn-sm">Search</span></button></div>
    <div class="lj-hero-quick" style="justify-content:center"><a href="/">Home</a><a href="/automations/">Automations</a><a href="/guides/">Guides</a><a href="https://blog.ljwebmanagement.com/">Blog</a><a href="/contactus/">Contact</a></div>
  </div>
</section>`;
  writeFile(
    "404.html",
    L.page({ path: "/404.html", title: "Page Not Found | LJ Web Management", description: "The page you were looking for could not be found.", robots: "noindex, follow", noCanonical: true, main })
  );
}

function build(cat, guides, extra) {
  home(cat, guides, extra);
  howItWorks(cat);
  solutions();
  faqPage();
  contact();
  appointment();
  quiz();
  roi();
  legalPage("privacy-policy", "Privacy Policy", "How LJ Web Management collects, uses, discloses, and protects personal information through its website and automation services.");
  legalPage("terms-of-service", "Terms of Service", "The terms that govern use of the LJ Web Management website and automation consulting, development, and support services.");
  privacyChoices();
  accessibility();
  notFound();
}

function searchEntries() {
  return [
    ["Page", "How It Works", "Our five-step process", "/how-it-works/", "process consultation quote build launch support"],
    ["Page", "Platform Solutions", "CRM, ERP, booking, field service, billing and more", "/solutions/", "erp crm website pos lms saas platform"],
    ["Page", "Automation FAQ", "Pricing, timelines, tools, and support", "/faq/", "questions cost price how long"],
    ["Page", "ROI Calculator", "See what manual work costs you", "/roi-calculator/", "roi savings calculator cost"],
    ["Page", "Automation Match Quiz", "Find the right solution in three questions", "/quiz/", "quiz match"],
    ["Page", "Book a Free Consultation", "Pick a time to talk", "/appointment/", "book call meeting consultation appointment"],
    ["Page", "Contact Us", "Email, phone, or send a message", "/contactus/", "contact email phone"],
    ["Page", "Your Privacy Choices", "Cookie settings and privacy requests", "/privacy-choices/", "privacy cookies do not sell opt out gpc delete data request"],
    ["Page", "Accessibility Statement", "WCAG 2.1 AA and how to get help", "/accessibility/", "accessibility ada wcag screen reader"],
    ["Page", "Resource Center", "Every free guide, course, quiz, and tool", "/resources/", "resources learn free library how to automate"],
    ["Page", "Automation Guides", "Step-by-step playbooks", "/guides/", "guides learn how to"],
    ["Page", "Free Courses", "Automation 101 and AI at Work", "/learn/", "course lessons learn training class"],
    ["Page", "Free Calculators & Tools", "ROI, time savings, AI cost, and more", "/tools/", "calculator tools free"],
    ["Page", "Quizzes & Assessments", "AI readiness, automation IQ, platform picker", "/quizzes/", "quiz assessment test readiness"],
    ["Page", "Automation & AI Glossary", "Terms explained in plain English", "/glossary/", "glossary definitions terms meaning"],
    ["Page", "Blog", "AI and automation articles, published daily", "https://blog.ljwebmanagement.com/", "blog articles news"],
  ];
}

module.exports = { build, searchEntries };
