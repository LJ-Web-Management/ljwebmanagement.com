// Copy and settings for the free calculators at /tools/<slug>/ and the
// automation priority scorer. The math for each `calc` id lives in
// assets/js/tools.js; field names here must match the names it reads.
//
// Field types: range (slider; `fmt` formats the live value), number (typed
// value with optional prefix/suffix), select (`options` as [value, label]).

const calculators = [
  {
    slug: "time-savings-calculator",
    calc: "time-savings",
    name: "Time Savings Calculator",
    icon: "clock",
    title: "How much time would automating a task save?",
    seoTitle: "Time Savings Calculator: How Much Time Will Automation Save?",
    description: "Free time savings calculator: enter how often a task happens and how long it takes to see the hours, workdays, and dollars automation could save each year.",
    lead: "Enter how often a repetitive task happens and how long it takes. See the hours, workdays, and payroll dollars that automating it could hand back every year.",
    card: "Enter how often a task happens and how long it takes to see the hours and dollars automating it would save each year.",
    fields: [
      { name: "times", type: "number", label: "How often the task happens", value: 20, step: 1, suffix: "times" },
      { name: "per", type: "select", label: "Per", value: "week", options: [["day", "Workday (250 a year)"], ["week", "Week"], ["month", "Month"]] },
      { name: "minutes", type: "range", label: "Minutes each time", min: 1, max: 120, value: 6, fmt: "min", hint: "Include switching between apps and fixing mistakes, not just the clicks." },
      { name: "people", type: "range", label: "People who do this task", min: 1, max: 50, value: 1, fmt: "num", hint: "If several people each do it this often, count them all." },
      { name: "rate", type: "range", label: "Fully loaded hourly cost", min: 15, max: 150, value: 35, fmt: "usd", hint: "Wages plus payroll taxes and benefits, often 1.25 to 1.4 times the hourly wage." },
      { name: "share", type: "range", label: "Share of the work automation removes", min: 30, max: 100, step: 5, value: 80, fmt: "pct", hint: "Rule-based tasks usually land between 60% and 90%. Someone still handles the exceptions." },
    ],
    results: {
      title: "Estimated savings",
      hero: ["moneyYear", "Payroll time freed up per year", "moneyMonth"],
      metrics: [["hoursSaved", "Hours saved per year"], ["daysSaved", "8-hour workdays saved"], ["hoursNow", "Hours spent on it today, per year"], ["threeYear", "Value over three years"]],
      note: "Estimates for planning only, based on the numbers you enter.",
      cta: "Find Out What to Automate First",
    },
    explainer: `<h2>How the calculation works</h2>
<p>The calculator multiplies three things you already know: how often the task happens, how long it takes, and how many people do it.</p>
<ul>
<li><strong>Runs per year</strong> = times per period &times; periods per year (250 workdays, 52 weeks, or 12 months) &times; people.</li>
<li><strong>Hours today</strong> = runs per year &times; minutes each &divide; 60.</li>
<li><strong>Hours saved</strong> = hours today &times; the share of the work automation removes.</li>
<li><strong>Dollar value</strong> = hours saved &times; the fully loaded hourly cost.</li>
</ul>
<p>Small numbers add up quickly. A six-minute task done 20 times a week is about 100 hours a year for one person. Spread across a team, the same task can quietly consume weeks of paid time.</p>
<h2>Why "share removed" is not 100%</h2>
<p>Even a well-built automation leaves some work behind: reviewing exceptions, answering replies, and fixing the occasional bad record. Setting the share to 70% to 90% keeps the estimate honest. Tasks that need judgment every time (a custom quote, a sensitive conversation) are better candidates for partial automation, such as drafting or data gathering, than for full automation.</p>
<h2>Turn the result into a decision</h2>
<p>Hours saved are only half the picture. Many automations also prevent losses: leads that go cold, invoices paid late, appointments missed. Use the <a href="/tools/automation-payback-calculator/">payback calculator</a> to weigh the savings against the build and running costs, and the <a href="/tools/automation-priority-scorer/">priority scorer</a> to compare several tasks side by side.</p>
<p>As a rule of thumb, if building an automation costs less than one year of the savings it produces, it is usually worth doing, as long as the process is stable and the rules are clear.</p>`,
    faq: [
      ["How do I estimate how long a task takes?", "<p>Time it a few times with a stopwatch, including the minutes spent opening apps, looking up information, and switching context. People usually underestimate small tasks by a third or more, because the interruptions are invisible.</p>"],
      ["What is a fully loaded hourly cost?", "<p>It is the true cost of an hour of an employee's time: wages plus payroll taxes, benefits, paid time off, and overhead. A common shortcut is to multiply the hourly wage by 1.25 to 1.4.</p>"],
      ["Which tasks save the most time when automated?", "<p>Tasks that happen often, follow clear rules, and move information between systems: data entry, follow-up emails and texts, appointment reminders, invoice creation, report building, and status updates. Our guide on <a href=\"/guides/how-to-automate-repetitive-tasks/\">how to automate repetitive tasks</a> covers how to spot them.</p>"],
      ["Is saved time the same as saved money?", "<p>Only if the time is redeployed. Freed-up hours are worth the most when they go to revenue work, customer care, or growth, or when they let you avoid a new hire. Count the dollar figure as capacity you get back.</p>"],
    ],
    related: [
      ["What to automate first: a scoring framework", "/guides/what-to-automate-first/", "book"],
      ["How to automate repetitive tasks", "/guides/how-to-automate-repetitive-tasks/", "book"],
      ["Automation payback calculator", "/tools/automation-payback-calculator/", "calculator"],
      ["Automation priority scorer", "/tools/automation-priority-scorer/", "listCheck"],
    ],
  },
  {
    slug: "lead-response-calculator",
    calc: "lead-response",
    name: "Lead Response Revenue Calculator",
    icon: "target",
    title: "What is slow lead follow-up costing you?",
    seoTitle: "Lead Response Time Calculator: Revenue From Faster Follow-Up",
    description: "Estimate how much revenue faster lead follow-up could add. Enter monthly leads, close rate, and customer value to see what a higher close rate is worth.",
    lead: "Faster, more consistent follow-up wins more of the leads you already pay for. Enter your numbers and an improvement you consider realistic to see what it is worth each year.",
    card: "See what a higher close rate from faster, more consistent lead follow-up is worth in revenue each month and year.",
    fields: [
      { name: "leads", type: "number", label: "New leads per month", value: 120, step: 1, suffix: "leads" },
      { name: "close", type: "range", label: "Current close rate", min: 1, max: 60, value: 15, fmt: "pct", hint: "Share of leads that become paying customers." },
      { name: "value", type: "number", label: "Average value of a new customer", value: 1500, step: 1, prefix: "$", hint: "First sale or first-year value, whichever you track." },
      { name: "lift", type: "range", label: "Expected improvement in close rate", min: 0, max: 100, step: 5, value: 20, fmt: "pct", hint: "A relative improvement: 20% turns a 15% close rate into 18%. Choose a figure you believe for your market." },
    ],
    results: {
      title: "Estimated added revenue",
      hero: ["extraYear", "Added revenue per year", "extraMonth"],
      metrics: [["dealsNow", "Customers won per month today"], ["dealsNew", "Customers per month after"], ["closeNew", "New close rate"], ["perPoint", "Yearly value of each point of close rate"]],
      note: "An estimate based on your inputs. Faster response helps most when leads currently wait hours or days, or never get a second follow-up.",
      cta: "Set Up Instant Lead Follow-Up",
    },
    explainer: `<h2>How the calculation works</h2>
<p>Revenue from leads is simple multiplication: <strong>leads &times; close rate &times; customer value</strong>. The calculator applies your expected improvement to the close rate and shows the difference.</p>
<p>The most useful number is often the last one: the yearly value of a single percentage point of close rate. If one point is worth tens of thousands of dollars a year, even a modest improvement justifies fixing follow-up.</p>
<h2>Why response speed matters</h2>
<p>People who fill out a form or call a business are usually comparing options. The first business to respond clearly and helpfully has an advantage, and a lead that hears nothing for a day often books with someone else. Consistency matters as much as speed: many leads need several touches before they reply, and manual follow-up tends to stop after one or two.</p>
<h2>What an automated follow-up system does</h2>
<ul>
<li>Replies to every new inquiry within a minute, by text and email, day or night.</li>
<li>Routes the lead to the right person and alerts them instantly.</li>
<li>Sends a follow-up sequence over the next days until the lead responds, then stops.</li>
<li>Texts back missed callers so a phone lead is never lost to voicemail.</li>
<li>Logs every touch in your CRM so nothing depends on memory.</li>
</ul>
<p>The <a href="/guides/automate-lead-follow-up/">lead follow-up playbook</a> walks through the setup, with message templates.</p>`,
    faq: [
      ["What is a good lead response time?", "<p>As fast as you can make it. For inbound leads, aim to acknowledge every inquiry within minutes during business hours. An automated reply can go out instantly around the clock, with a person following up as soon as they are available.</p>"],
      ["How do I measure my current response time?", "<p>Pull 20 recent leads and compare when each one arrived with when someone first replied. Most CRMs and form tools record both timestamps. The average, and the slowest few, tell you how much there is to gain.</p>"],
      ["Does faster follow-up really increase sales?", "<p>For inbound leads who are actively shopping, faster and more persistent follow-up generally means more conversations and more customers. How much depends on your market, price point, and sales process, so measure your close rate before and after the change.</p>"],
      ["Will automated follow-up feel robotic?", "<p>Not if it is written well. Short, specific messages in your own voice, sent at sensible times, read like a prompt reply from a busy team. The automation handles timing and persistence; people handle the conversation once the lead replies.</p>"],
    ],
    related: [
      ["How to automate lead follow-up", "/guides/automate-lead-follow-up/", "book"],
      ["Missed-call text-back explained", "/guides/missed-call-text-back/", "book"],
      ["CRM automation guide", "/guides/crm-automation/", "book"],
      ["Lead follow-up and sales automations", "/automations/category/lead-follow-up-sales/", "target"],
    ],
  },
  {
    slug: "no-show-cost-calculator",
    calc: "no-show",
    name: "No-Show Cost Calculator",
    icon: "calendarX",
    title: "What are no-shows costing your business?",
    seoTitle: "No-Show Cost Calculator: Revenue Lost to Missed Appointments",
    description: "Calculate the revenue lost to missed appointments each year and how much automated reminders and confirmations could recover. Free no-show cost calculator.",
    lead: "Every empty slot is time you paid for and revenue you did not earn. Enter your booking numbers to see what no-shows cost each year and what better reminders could recover.",
    card: "Calculate the revenue lost to missed appointments each year and what automated reminders could win back.",
    fields: [
      { name: "appts", type: "number", label: "Appointments per week", value: 80, step: 1, suffix: "per week" },
      { name: "rate", type: "range", label: "No-show rate", min: 0, max: 40, value: 10, fmt: "pct", hint: "Appointments missed without notice, as a share of all bookings." },
      { name: "value", type: "number", label: "Average revenue per appointment", value: 120, step: 1, prefix: "$" },
      { name: "cut", type: "range", label: "Reduction you expect from automated reminders", min: 0, max: 80, step: 5, value: 30, fmt: "pct", hint: "Confirmations, reminders, and one-tap rescheduling. A conservative figure keeps the estimate honest." },
      { name: "callMin", type: "range", label: "Staff minutes per manual reminder call", min: 0, max: 10, value: 2, fmt: "min", hint: "Set to 0 if your team does not call to remind people today." },
    ],
    results: {
      title: "Estimated impact",
      hero: ["recoveredYear", "Revenue recovered per year", "recoveredMonth"],
      metrics: [["lostNow", "Revenue lost to no-shows today, per year"], ["missedNow", "Missed appointments per year today"], ["missedNew", "Missed appointments per year after"], ["callHours", "Staff hours of reminder calls replaced"]],
      note: "Estimates for planning only. Recovered revenue assumes the freed slots would otherwise have been kept, rebooked, or filled from a waitlist.",
      cta: "Cut No-Shows With Automated Reminders",
    },
    explainer: `<h2>How the calculation works</h2>
<ul>
<li><strong>Missed appointments per year</strong> = appointments per week &times; 52 &times; no-show rate.</li>
<li><strong>Revenue lost</strong> = missed appointments &times; average revenue per appointment.</li>
<li><strong>Revenue recovered</strong> = revenue lost &times; the reduction you expect.</li>
<li><strong>Reminder call hours</strong> = appointments per year &times; minutes per call &divide; 60.</li>
</ul>
<h2>What actually reduces no-shows</h2>
<p>Most no-shows are not people who decided not to come. They forgot, mixed up the time, or could not reach you to reschedule. An automated system attacks each cause:</p>
<ul class="lj-checklist">
<li>A confirmation the moment the appointment is booked, with an add-to-calendar link</li>
<li>A reminder a day or two before and another a few hours before, by text</li>
<li>A one-tap way to confirm, cancel, or reschedule, so an empty slot becomes a rebooking</li>
<li>A waitlist that offers freed slots to the next person automatically</li>
<li>A friendly follow-up to anyone who misses, offering a new time</li>
</ul>
<p>The <a href="/guides/reduce-no-shows-appointment-reminders/">no-show guide</a> includes a reminder schedule and message templates you can copy.</p>`,
    faq: [
      ["What is a normal no-show rate?", "<p>It varies widely by industry, patient or client type, and how far ahead appointments are booked. The useful benchmark is your own: track no-shows for a month before and after adding reminders, and compare.</p>"],
      ["How many reminders should I send?", "<p>Two is a good default: one a day or two before and one a few hours before. Add a confirmation at booking time. More than that tends to annoy people without improving attendance.</p>"],
      ["Should reminders be texts or emails?", "<p>Texts are read quickly and suit short reminders; email works for details such as preparation instructions or forms. Many businesses send both, with texts for timing and email for information. Get consent for texting and include opt-out language.</p>"],
      ["Can automation fill cancelled slots?", "<p>Yes. When someone cancels through the reminder link, the system can text the people on your waitlist who fit that time, in order, and book the first one who accepts.</p>"],
    ],
    related: [
      ["How to reduce no-shows with reminders", "/guides/reduce-no-shows-appointment-reminders/", "book"],
      ["Scheduling and reminder automations", "/automations/category/scheduling-dispatch/", "calendar"],
      ["Time savings calculator", "/tools/time-savings-calculator/", "calculator"],
      ["How to automate customer support", "/guides/how-to-automate-customer-support/", "book"],
    ],
  },
  {
    slug: "late-payment-calculator",
    calc: "late-payment",
    name: "Late Payment & Cash Flow Calculator",
    icon: "receipt",
    title: "How much cash is stuck in unpaid invoices?",
    seoTitle: "Late Payment Calculator: Cash Tied Up in Unpaid Invoices",
    description: "See how much cash is tied up in slow-paying invoices, how much faster collection would free up, and what chasing payments costs your team each year.",
    lead: "Slow payments do not just delay revenue; they lock up cash you could be using. See how much faster invoicing and automated reminders could free up.",
    card: "See how much cash is tied up in slow-paying invoices and how much faster collection would free up.",
    fields: [
      { name: "revenue", type: "number", label: "Monthly invoiced revenue", value: 60000, step: 100, prefix: "$", suffix: "per month" },
      { name: "days", type: "range", label: "Average days to get paid today", min: 5, max: 120, value: 45, fmt: "days", hint: "Also called DSO (days sales outstanding)." },
      { name: "target", type: "range", label: "Target days to get paid after automating", min: 1, max: 90, value: 30, fmt: "days", hint: "Invoices sent the day work finishes, with reminders and a pay-online link." },
      { name: "chase", type: "range", label: "Hours per week spent chasing payments", min: 0, max: 20, step: 0.5, value: 3, fmt: "hrs" },
      { name: "rate", type: "range", label: "Hourly cost of whoever chases", min: 15, max: 150, value: 35, fmt: "usd" },
      { name: "interest", type: "range", label: "Your cost of borrowing", min: 0, max: 25, step: 0.5, value: 9, fmt: "pct", hint: "What it costs to cover a cash gap with a credit line or card." },
    ],
    results: {
      title: "Estimated impact",
      hero: ["freed", "Cash freed up by getting paid faster"],
      metrics: [["tiedNow", "Cash tied up in receivables today"], ["tiedNew", "Cash tied up at your target"], ["financing", "Yearly borrowing cost avoided"], ["chaseCost", "Yearly cost of chasing payments"]],
      note: "Cash freed up is a one-time improvement in working capital, not new revenue. Estimates based on your inputs.",
      cta: "Automate Invoicing and Reminders",
    },
    explainer: `<h2>How the calculation works</h2>
<p>At any moment, the money customers owe you is roughly your <strong>daily revenue &times; the average days it takes to get paid</strong>. Daily revenue is monthly revenue &times; 12 &divide; 365. Cut the days and the same revenue ties up less cash.</p>
<ul>
<li><strong>Cash freed up</strong> = daily revenue &times; (days today &minus; target days).</li>
<li><strong>Borrowing cost avoided</strong> = cash freed &times; your interest rate, per year.</li>
<li><strong>Chasing cost</strong> = hours per week &times; 52 &times; hourly cost.</li>
</ul>
<h2>Where the days go</h2>
<p>Most late payments are slow for boring reasons: the invoice went out a week after the work, it lacked a purchase order number, it landed in the wrong inbox, or paying required a check. Automation removes those delays:</p>
<ul class="lj-checklist">
<li>Create and send the invoice the moment the job closes or the order ships</li>
<li>Include a pay-online link and the details the customer's accounts team needs</li>
<li>Send polite reminders before the due date, on it, and after it, on a schedule</li>
<li>Retry failed card payments and ask customers to update expired cards</li>
<li>Alert a person only when an account needs a real conversation</li>
</ul>
<p>See the <a href="/guides/automate-invoicing-payment-reminders/">invoicing and payment reminder guide</a> for the full workflow.</p>`,
    faq: [
      ["What is DSO?", "<p>Days sales outstanding is the average number of days it takes to collect payment after a sale. A simple estimate is accounts receivable &divide; revenue for the period &times; the number of days in the period.</p>"],
      ["What is a good number of days to get paid?", "<p>Close to your stated payment terms. If your terms are net 30 and you average 45 days, the 15-day gap is mostly process friction that reminders and easier payment can close.</p>"],
      ["Will automatic payment reminders upset customers?", "<p>Not when they are polite, accurate, and well timed. Most customers appreciate a reminder before the due date with a direct payment link. Keep the tone friendly and stop reminders the moment a payment arrives.</p>"],
      ["Can automation handle partial payments and disputes?", "<p>It can detect them and route them to a person, which is usually the right approach. Automation handles the routine majority; people handle the conversations that need judgment.</p>"],
    ],
    related: [
      ["How to automate invoicing and payment reminders", "/guides/automate-invoicing-payment-reminders/", "book"],
      ["How to automate invoice processing (accounts payable)", "/guides/how-to-automate-invoice-processing/", "book"],
      ["Billing, payments and finance automations", "/automations/category/billing-finance/", "receipt"],
      ["Automation payback calculator", "/tools/automation-payback-calculator/", "calculator"],
    ],
  },
  {
    slug: "ai-cost-calculator",
    calc: "ai-cost",
    name: "AI Cost Calculator",
    icon: "bot",
    title: "What will an AI automation cost to run?",
    seoTitle: "AI Cost Calculator: Estimate AI API Costs per Month",
    description: "Estimate what an AI automation will cost to run each month from request volume, words in and out, and your provider's token prices, and compare it to manual work.",
    lead: "AI models charge by the token. Enter how much text goes in and out of each request and how often it runs to estimate the monthly bill, and compare it with doing the same work by hand.",
    card: "Estimate the monthly cost of an AI automation from request volume and token prices, and compare it with manual work.",
    fields: [
      { name: "perDay", type: "number", label: "AI requests per day", value: 200, step: 1, suffix: "per day", hint: "Each email sorted, document summarized, or reply drafted is one request." },
      { name: "days", type: "range", label: "Days per month it runs", min: 1, max: 31, value: 22, fmt: "num" },
      { name: "wordsIn", type: "number", label: "Words sent to the AI per request", value: 600, step: 10, suffix: "words", hint: "Instructions plus the content: an email, a document, a transcript." },
      { name: "wordsOut", type: "number", label: "Words the AI writes back per request", value: 150, step: 10, suffix: "words" },
      { name: "priceIn", type: "number", label: "Input price", value: 3, step: 0.01, prefix: "$", suffix: "per 1M tokens", hint: "Example price. Enter your provider's current rate for the model you plan to use." },
      { name: "priceOut", type: "number", label: "Output price", value: 15, step: 0.01, prefix: "$", suffix: "per 1M tokens", hint: "Output usually costs several times more than input." },
      { name: "humanMin", type: "range", label: "Minutes a person would spend on the same task", min: 0, max: 30, value: 4, fmt: "min" },
      { name: "rate", type: "range", label: "Hourly cost of that person", min: 15, max: 150, value: 35, fmt: "usd" },
    ],
    results: {
      title: "Estimated running cost",
      hero: ["month", "AI cost per month"],
      metrics: [["perRequest", "Cost per request"], ["tokens", "Tokens per request (approx.)"], ["human", "Same work done by hand, per month"], ["ratio", "Manual cost compared with AI cost"]],
      note: "Tokens are estimated at about 0.75 words each for English text. Add automation platform fees, and the time to build, test, and review the automation.",
      cta: "Plan an AI Automation With Us",
    },
    explainer: `<h2>How AI pricing works</h2>
<p>Most AI providers charge per <strong>token</strong>, a chunk of text roughly three quarters of an English word long. You pay for the tokens you send (your instructions plus the content) and, usually at a higher rate, for the tokens the model writes back. Prices are quoted per million tokens and vary a lot between models, so the same task can cost many times more on a large model than on a small one.</p>
<p>This calculator converts words to tokens, multiplies by your prices, and scales by volume: <strong>(input tokens &times; input price + output tokens &times; output price) &divide; 1,000,000 &times; requests per month</strong>.</p>
<h2>How to keep AI costs down</h2>
<ul>
<li><strong>Match the model to the task.</strong> Sorting an email into five categories rarely needs the largest model. Save premium models for complex writing or reasoning.</li>
<li><strong>Keep instructions tight.</strong> Long prompts are re-sent with every request. Trim examples and boilerplate you do not need.</li>
<li><strong>Send only what is needed.</strong> Pass the relevant section of a document rather than the whole thing.</li>
<li><strong>Use provider discounts.</strong> Many providers discount repeated prompt prefixes (prompt caching) and non-urgent batch jobs.</li>
<li><strong>Cap the output.</strong> Ask for short, structured answers when that is all the workflow needs.</li>
</ul>
<h2>The cost that matters more</h2>
<p>For most small business automations, the token bill is small next to the value of the time saved. The bigger costs are designing the workflow, testing it on real examples, and the human review that keeps quality high. Budget for those, and use the <a href="/tools/automation-payback-calculator/">payback calculator</a> to see the full picture.</p>`,
    faq: [
      ["What is a token?", "<p>A token is a piece of text, often part of a word, that AI models read and write. In English, one token is about four characters or three quarters of a word, so 1,000 words is roughly 1,300 to 1,400 tokens.</p>"],
      ["How much does it cost to run an AI automation?", "<p>For common tasks such as sorting emails, extracting data from documents, or drafting short replies, the AI usage itself often costs cents per day at small business volumes. Long documents, large models, and high volumes raise it. Use your provider's current prices in the calculator above for a realistic figure.</p>"],
      ["Is it cheaper to use AI than to do the work manually?", "<p>For narrow, repetitive language tasks, usually yes, often by a wide margin. Remember to count the time someone spends reviewing AI output, which is essential for anything customer-facing or high-stakes.</p>"],
      ["Do I need to pay for an AI subscription to automate with AI?", "<p>Automations usually use a provider's API, which is billed by usage rather than per seat. Automation platforms such as Zapier, Make, and n8n can call these APIs, and some include AI steps in their own plans.</p>"],
    ],
    related: [
      ["AI workflow automation: how to add AI to your workflows", "/guides/ai-workflow-automation/", "book"],
      ["AI vs. automation: what's the difference?", "/guides/ai-vs-automation/", "book"],
      ["AI prompt library", "/tools/ai-prompt-library/", "message"],
      ["Free course: AI at Work 101", "/learn/ai-at-work-101/", "school"],
    ],
  },
  {
    slug: "automation-payback-calculator",
    calc: "payback",
    name: "Automation Payback Calculator",
    icon: "trend",
    title: "How fast will an automation pay for itself?",
    seoTitle: "Automation Payback Period and ROI Calculator",
    description: "Calculate the payback period, first-year return, and three-year ROI of an automation project from its build cost, running costs, hours saved, and added revenue.",
    lead: "Weigh what an automation costs to build and run against the time it saves and the revenue it protects. See the payback period, first-year return, and three-year ROI.",
    card: "Find the payback period, first-year return, and three-year ROI of an automation project.",
    fields: [
      { name: "build", type: "number", label: "One-time build cost", value: 3000, step: 50, prefix: "$", hint: "Design, setup, testing, and training." },
      { name: "running", type: "number", label: "Monthly running cost", value: 100, step: 5, prefix: "$", suffix: "per month", hint: "Software subscriptions, usage fees, AI tokens, and support." },
      { name: "hours", type: "range", label: "Hours saved per month", min: 0, max: 200, value: 25, fmt: "hrs" },
      { name: "rate", type: "range", label: "Hourly cost of the time saved", min: 15, max: 150, value: 35, fmt: "usd" },
      { name: "revenue", type: "number", label: "Added revenue or avoided losses per month", value: 500, step: 10, prefix: "$", suffix: "per month", hint: "Recovered leads, fewer no-shows, faster payments. Use 0 if unsure." },
    ],
    results: {
      title: "Estimated return",
      hero: ["payback", "Payback period", "monthly"],
      metrics: [["firstYear", "Net return in year one"], ["threeYear", "Net return over three years"], ["roi", "Three-year ROI"]],
      note: "Estimates for planning only. ROI here is total benefit minus total cost over three years, divided by total cost.",
      cta: "Get a Flat Quote for Your Automation",
    },
    explainer: `<h2>How the calculation works</h2>
<ul>
<li><strong>Monthly net benefit</strong> = hours saved &times; hourly cost + added revenue &minus; running cost.</li>
<li><strong>Payback period</strong> = build cost &divide; monthly net benefit.</li>
<li><strong>Net return</strong> = monthly net benefit &times; months &minus; build cost.</li>
<li><strong>Three-year ROI</strong> = (three years of benefit &minus; build cost &minus; three years of running cost) &divide; (build cost + three years of running cost).</li>
</ul>
<h2>What a good payback period looks like</h2>
<p>Well-chosen small business automations often pay back within months, because they replace work that happens every day. If a project takes more than 18 to 24 months to pay back on conservative numbers, look for a simpler version, a different first project, or a way to reuse the work across more of the business.</p>
<h2>Costs people forget</h2>
<ul>
<li>Time to document the process and test the automation with real examples</li>
<li>Training the team and updating how exceptions are handled</li>
<li>Ongoing upkeep when a connected tool changes a field or an API</li>
<li>Usage-based fees that grow with volume, including AI tokens</li>
</ul>
<p>The <a href="/guides/automation-roi/">automation ROI guide</a> explains the method in more depth, with worked examples.</p>`,
    faq: [
      ["How do you calculate automation ROI?", "<p>Add up the value of time saved and revenue gained over a period, subtract the build and running costs for the same period, and divide by those costs. This calculator uses three years, which suits most automations.</p>"],
      ["What is a payback period?", "<p>The time it takes for the monthly benefit of an automation to repay its upfront cost. A three-month payback means that after month three, the automation is pure return.</p>"],
      ["Should I include revenue gains or only time saved?", "<p>Include both if you can estimate them honestly. Many automations (lead follow-up, reminders, invoicing) are justified more by revenue protected than by hours saved. If unsure, run the numbers with revenue at zero first.</p>"],
    ],
    related: [
      ["How to calculate automation ROI", "/guides/automation-roi/", "book"],
      ["Automation ROI calculator", "/roi-calculator/", "calculator"],
      ["Time savings calculator", "/tools/time-savings-calculator/", "clock"],
      ["How to automate your business", "/guides/how-to-automate-your-business/", "book"],
    ],
  },
];

const scorer = {
  name: "Automation Priority Scorer",
  title: "Which task should you automate first?",
  seoTitle: "Automation Priority Scorer: Decide What to Automate First",
  description: "Score your repetitive tasks on volume, time, cost of a miss, rule clarity, and stability to build a ranked automation shortlist. Free, no sign-up.",
  lead: "List the repetitive tasks in your business, score each on five factors, and get a ranked shortlist of what to automate first. Your list stays in your browser.",
  card: "Score your repetitive tasks on five factors and get a ranked shortlist of what to automate first.",
  factors: [
    ["Volume", "How often it happens. 5 means many times a day."],
    ["Time", "Minutes per run, including switching apps. 5 means 15 minutes or more."],
    ["Cost of a miss", "What a slip costs. 5 means a lost customer or a late payment."],
    ["Rule clarity", "Could a new hire follow written steps? 5 means clear if-this-then-that rules."],
    ["Stability", "How settled the process is. 5 means unchanged for a year."],
  ],
  examples: [
    { name: "Reply to new web leads", s: [4, 3, 5, 5, 4] },
    { name: "Appointment reminders", s: [5, 2, 4, 5, 5] },
    { name: "Weekly sales report", s: [1, 4, 2, 4, 3] },
    { name: "Vendor onboarding", s: [1, 4, 3, 3, 3] },
  ],
  explainer: `<h2>How to use the scorer</h2>
<ol>
<li><strong>List your candidates.</strong> Spend ten minutes with your team writing down every task that is repetitive, rule-based, or annoying. Most businesses find 15 to 30.</li>
<li><strong>Score each factor from 1 to 5.</strong> Be quick and honest; relative scores matter more than precision.</li>
<li><strong>Read the shortlist.</strong> Tasks scoring 18 or more out of 25 are strong first candidates. When two tie, pick the one closer to revenue.</li>
</ol>
<h2>Why these five factors</h2>
<p>The best first automations happen often (volume), take real effort (time), hurt when they slip (cost of a miss), follow clear rules (rule clarity), and will not change next month (stability). A task that scores high on all five pays back fast and rarely breaks. A task with low rule clarity or stability is a better candidate for process cleanup first, or for an AI-assisted step with human review.</p>
<p>This is the same framework we use on every free consultation. Read the full method in <a href="/guides/what-to-automate-first/">what to automate first</a>, then put numbers on your top pick with the <a href="/tools/time-savings-calculator/">time savings calculator</a>.</p>`,
  faq: [
    ["What should a small business automate first?", "<p>Usually a high-volume, rule-based task close to revenue: replying to new leads, appointment reminders, invoicing and payment reminders, or client intake. They score high on volume, cost of a miss, and rule clarity.</p>"],
    ["What if a task scores high but the process is messy?", "<p>Clean up the process first. Write the steps down, remove the ones that exist only because of old tools, and agree on how exceptions are handled. Automating a messy process just makes the mess happen faster.</p>"],
    ["Where is my list saved?", "<p>Only in this browser, using local storage. Nothing is sent to us. Clearing your browser data or using a private window will reset it.</p>"],
  ],
  related: [
    ["What to automate first: the full framework", "/guides/what-to-automate-first/", "book"],
    ["How to automate your business, step by step", "/guides/how-to-automate-your-business/", "book"],
    ["Time savings calculator", "/tools/time-savings-calculator/", "clock"],
    ["Free course: Automation 101", "/learn/automation-101/", "school"],
  ],
};

module.exports = { calculators, scorer };
