// Editorial content for the automation catalog: the business-function
// categories every automation is filed under, the tool pages, and the
// per-industry intro copy. Automation records themselves live in
// content/automations.json; each one names its category by slug.

const categories = [
  {
    slug: "lead-follow-up-sales",
    name: "Lead Follow-Up & Sales",
    short: "Respond to every lead in minutes, chase quotes automatically, and keep deals from going quiet.",
    icon: "target",
    intro: [
      "Most lost sales are not lost to a competitor. They are lost to silence: a web form that sits unanswered over a weekend, a quote nobody follows up on, a missed call that never gets a callback.",
      "These automations make the first response instant and the follow-up persistent, so every inquiry gets worked whether your team is on a job, in a meeting, or asleep. When a lead replies, the sequence stops and a person takes over.",
    ],
    benefits: [
      "Instant first response by text and email on every new inquiry",
      "Follow-up cadences that stop the moment a lead replies",
      "Stalled-deal alerts before a pipeline quietly goes cold",
      "Clean CRM records without manual data entry",
    ],
    guide: "automate-lead-follow-up",
  },
  {
    slug: "marketing-retention",
    name: "Marketing & Customer Retention",
    short: "Win back lapsed customers, reward loyalty, and keep repeat business coming in on its own.",
    icon: "megaphone",
    intro: [
      "Keeping a customer costs far less than finding a new one, but retention work is easy to postpone because nothing visibly breaks when you skip it.",
      "These automations run the campaigns that quietly drive repeat revenue: win-back sequences, renewal reminders, referral rewards, birthday offers, and launch announcements. Each one is triggered by real customer behavior instead of a calendar reminder someone forgets to check.",
    ],
    benefits: [
      "Win-back sequences triggered by inactivity, not guesswork",
      "Renewals and memberships that never lapse silently",
      "Referral and loyalty programs that track themselves",
      "Segmented campaigns built from actual purchase history",
    ],
    guide: "how-to-automate-emails",
  },
  {
    slug: "scheduling-dispatch",
    name: "Scheduling, Reminders & Dispatch",
    short: "Fill calendars, cut no-shows, backfill cancellations, and route crews without phone tag.",
    icon: "calendar",
    intro: [
      "Every empty appointment slot and every wasted drive is revenue you cannot get back. Scheduling is also where small businesses lose the most time to back-and-forth messages.",
      "These automations handle booking, confirmations, reminders, waitlists, rebooking, and dispatch updates, so the calendar fills itself and your team spends its time serving customers instead of coordinating them.",
    ],
    benefits: [
      "Multi-touch reminders that measurably reduce no-shows",
      "Waitlists that backfill cancellations automatically",
      "Self-scheduling with instant confirmations",
      "Dispatch and on-my-way updates sent to the right people",
    ],
    guide: "reduce-no-shows-appointment-reminders",
  },
  {
    slug: "customer-communication",
    name: "Customer Service & Communication",
    short: "Proactive status updates, faster support routing, and far fewer \"just checking in\" calls.",
    icon: "message",
    intro: [
      "Customers rarely complain about waiting. They complain about not knowing. Most inbound \"where are we on this?\" calls are a symptom of updates that never went out.",
      "These automations send the update before the customer has to ask: job and order status, delays, results, care instructions, outage notices, and check-ins. They also route support requests to the right person with context attached, so nothing sits unanswered in a shared inbox.",
    ],
    benefits: [
      "Status updates triggered by real milestones in your systems",
      "Support requests routed to the right owner with full context",
      "Escalations when a response deadline is about to slip",
      "Fewer inbound status calls for your front desk",
    ],
    guide: "how-to-automate-customer-support",
  },
  {
    slug: "reviews-feedback",
    name: "Reviews, Feedback & Reputation",
    short: "Ask every customer for a review at the right moment, fix problems fast, and watch your reputation.",
    icon: "star",
    intro: [
      "Online reviews drive local buying decisions, and the businesses with the most recent, most numerous reviews tend to win. The hard part is not asking; it is asking every customer, at the right moment, without forgetting.",
      "These automations time review requests to the moment of delivery, ask every customer the same way, alert a manager the moment someone reports a problem so it can be fixed fast, and monitor what customers are saying across platforms.",
    ],
    benefits: [
      "Review requests timed to the moment the job is done",
      "Instant manager alerts when a customer reports a problem",
      "Alerts when a new review needs a response",
      "Survey and NPS results that reach the people who can act",
    ],
    guide: "automate-review-requests",
  },
  {
    slug: "billing-finance",
    name: "Billing, Payments & Finance",
    short: "Invoices that send themselves, payment reminders that get paid, and books that close on time.",
    icon: "receipt",
    intro: [
      "Cash flow problems are often process problems: invoices that go out days late, reminders nobody sends, failed card payments nobody notices, and month-end closes built on spreadsheets.",
      "These automations connect the moment work is finished to the moment it is billed, follow up on unpaid balances politely and consistently, recover failed payments, and keep finance data reconciled as it happens.",
    ],
    benefits: [
      "Invoices generated the moment a job or milestone completes",
      "Polite, escalating payment reminders that run on schedule",
      "Failed payment recovery for subscriptions and memberships",
      "Expense, commission, and reconciliation work handled automatically",
    ],
    guide: "automate-invoicing-payment-reminders",
  },
  {
    slug: "onboarding-intake",
    name: "Client Onboarding & Intake",
    short: "Turn a signed deal into a smooth start with forms, documents, welcome sequences, and kickoff.",
    icon: "userPlus",
    intro: [
      "The first two weeks of a relationship set the tone for everything after. They are also where most teams improvise, chasing paperwork by email and retyping intake details into three different systems.",
      "These automations collect what you need up front, sync it to the right places, send a welcome sequence that answers questions before they are asked, and schedule the kickoff, so every new client gets the same organized experience.",
    ],
    benefits: [
      "Intake forms that sync straight into your CRM or practice software",
      "Document collection with automatic reminders",
      "Welcome sequences that set expectations from day one",
      "Kickoff and first appointments scheduled without back-and-forth",
    ],
    guide: "client-onboarding-automation",
  },
  {
    slug: "hr-team",
    name: "HR, Hiring & Team Management",
    short: "Hire faster, onboard consistently, and keep certifications, shifts, and timesheets on track.",
    icon: "users",
    intro: [
      "People operations are full of repeatable steps that still get handled by hand: scheduling interviews, collecting new hire paperwork, chasing timesheets, tracking certifications, and routing time-off requests.",
      "These automations give every candidate and employee the same reliable process, alert managers before a license or certification lapses, and take the reminders off HR's plate.",
    ],
    benefits: [
      "Interview scheduling without email ping-pong",
      "New hire paperwork and account setup before day one",
      "Certification and license expiration alerts",
      "Timesheet and time-off workflows that route themselves",
    ],
    guide: "employee-onboarding-automation",
  },
  {
    slug: "compliance-documents",
    name: "Compliance, Documents & Deadlines",
    short: "Track licenses, permits, contracts, signatures, and filing deadlines before they become problems.",
    icon: "shield",
    intro: [
      "Compliance failures are rarely about not knowing the rule. They come from a deadline that lived in one person's head, a certificate that expired quietly, or a signature request that stalled in someone's inbox.",
      "These automations track every date that matters, chase missing documents and signatures, and escalate when something is about to slip, while keeping an audit trail of what was sent and when.",
    ],
    benefits: [
      "Expiration and renewal alerts on a 90, 60, and 30 day countdown",
      "Signature and document chasers that escalate on their own",
      "Deadline tracking for filings, permits, and inspections",
      "An automatic audit trail of every notice sent",
    ],
    guide: "document-workflow-automation",
  },
  {
    slug: "operations-inventory",
    name: "Operations, Inventory & Vendors",
    short: "Keep stock, equipment, vendors, projects, and work orders moving without the spreadsheet chase.",
    icon: "box",
    intro: [
      "Operations run on handoffs: a reorder that needs to happen, a vendor who needs to confirm, a work order that needs an owner, a project milestone that needs an update. Every handoff is a chance for something to sit.",
      "These automations watch the numbers and the calendar for you, reorder before stock runs out, confirm vendors and crews, log maintenance, and keep projects moving from one stage to the next.",
    ],
    benefits: [
      "Low-stock and reorder alerts before you run out",
      "Vendor and subcontractor confirmations that chase themselves",
      "Preventive maintenance scheduled by usage or date",
      "Work orders and project milestones that update stakeholders",
    ],
    guide: "business-process-automation",
  },
  {
    slug: "reporting-analytics",
    name: "Reporting & Analytics",
    short: "Dashboards, digests, and alerts that show leaders what is happening without anyone building a report.",
    icon: "chart",
    intro: [
      "Most small business reporting is a person copying numbers from four systems into a spreadsheet every Monday. It is slow, it is error-prone, and by the time it is finished, it is already out of date.",
      "These automations pull the numbers together on a schedule, deliver digests to the people who need them, and send alerts when a metric moves outside its normal range, so problems surface while there is still time to act.",
    ],
    benefits: [
      "Daily and weekly digests delivered automatically",
      "Threshold alerts when a key number moves",
      "Dashboards fed directly from your systems",
      "Client and owner reports assembled without copy and paste",
    ],
    guide: "how-to-automate-reports",
  },
];

// Tool pages: integration tags used across the catalog. Zapier and Make.com
// appear on nearly every automation, so they are described on the hub
// instead of getting their own (near-complete) listing pages.
const tools = [
  { slug: "twilio", tag: "Twilio", name: "Twilio (SMS & Voice)", blurb: "Twilio powers the text messages and calls in these automations: instant lead replies, appointment reminders, status updates, and two-way SMS conversations that land with the right person on your team." },
  { slug: "slack", tag: "Slack", name: "Slack", blurb: "Slack is where these automations bring work to your team: internal alerts, approval requests, daily digests, and escalations posted to the channel or person who owns the problem." },
  { slug: "google-sheets", tag: "Google Sheets", name: "Google Sheets", blurb: "Google Sheets acts as a lightweight database in these automations: logs, trackers, and simple dashboards that update themselves as work happens, with no manual copy and paste." },
  { slug: "mailchimp", tag: "Mailchimp", name: "Mailchimp", blurb: "Mailchimp runs the email side of these automations: nurture sequences, win-back campaigns, renewal reminders, and segmented messages triggered by real customer activity." },
  { slug: "airtable", tag: "Airtable", name: "Airtable", blurb: "Airtable is the backbone for trackers that outgrow a spreadsheet: deal pipelines, compliance logs, inventory, and project records with automatic status changes and alerts." },
  { slug: "jotform", tag: "Jotform", name: "Jotform", blurb: "Jotform collects the information that starts the workflow: intake forms, surveys, inspection checklists, and requests that route themselves to the right place the moment they are submitted." },
  { slug: "activecampaign", tag: "ActiveCampaign", name: "ActiveCampaign", blurb: "ActiveCampaign combines email marketing with CRM-style automation, making it a strong fit for behavior-based nurture sequences, lead scoring, and lifecycle campaigns." },
  { slug: "google-calendar", tag: "Google Calendar", name: "Google Calendar", blurb: "Google Calendar keeps schedules in sync: appointments booked by these automations land on the right calendar, and changes trigger confirmations, reminders, and reschedule notices." },
  { slug: "hubspot", tag: "HubSpot", name: "HubSpot", blurb: "HubSpot is the CRM at the center of many of these automations: leads captured and routed, deals advanced by real activity, and follow-up tasks created without manual data entry." },
  { slug: "quickbooks", tag: "QuickBooks", name: "QuickBooks", blurb: "QuickBooks automations connect finished work to finished books: invoices created from completed jobs, payments recorded and reconciled, and overdue balances followed up on schedule." },
  { slug: "calendly", tag: "Calendly", name: "Calendly", blurb: "Calendly handles self-scheduling in these automations, so leads and clients book directly from a text or email and the rest of the workflow starts the moment they do." },
  { slug: "clio", tag: "Clio", name: "Clio", blurb: "Clio automations help law firms keep intake, matters, deadlines, billing, and client communication moving without paralegals re-keying information between systems." },
  { slug: "docusign", tag: "DocuSign", name: "DocuSign", blurb: "DocuSign automations send agreements the moment they are ready, chase unsigned documents on a schedule, and kick off the next step as soon as the last signature lands." },
  { slug: "stripe", tag: "Stripe", name: "Stripe", blurb: "Stripe automations handle the payment side: deposits and payment links sent automatically, failed charges recovered with reminders, and subscription events synced to the rest of your tools." },
  { slug: "salesforce", tag: "Salesforce", name: "Salesforce", blurb: "Salesforce automations keep larger pipelines honest: leads routed by territory, stale opportunities flagged, and records enriched and updated without reps doing data entry." },
  { slug: "outlook", tag: "Outlook", name: "Microsoft Outlook", blurb: "Outlook automations work inside the inbox and calendar your team already lives in: parsing incoming requests, sending templated follow-ups, and keeping meetings in sync." },
  { slug: "pandadoc", tag: "PandaDoc", name: "PandaDoc", blurb: "PandaDoc automations generate proposals and quotes from your data, track when they are opened, and follow up automatically until they are signed or declined." },
];

// Industry copy: `card` is the one-line summary used on cards and menus,
// `intro` opens the industry page.
const industries = {
  "addiction-treatment-behavioral-health": {
    card: "Inquiry-to-intake conversion, authorization tracking, discharge planning, and alumni support.",
    intro: "Admissions teams in behavioral health are racing the clock: a person reaching out for help may not reach out twice. These automations respond to every inquiry immediately, track insurance authorizations and documentation deadlines, and keep alumni connected after discharge, so clinical staff spend their time on care instead of follow-up.",
  },
  "agriculture-farming": {
    card: "Planting schedules, weather-triggered field tasks, input reorders, and crop insurance deadlines.",
    intro: "Farm operations run on timing that weather and markets dictate, not a desk calendar. These automations log field activity, trigger tasks when conditions change, keep equipment maintenance on schedule by hours, and make sure crop insurance and input orders never miss a deadline.",
  },
  "architecture-engineering": {
    card: "Drawing revisions, RFIs, permit tracking, consultant deadlines, and project budget variance.",
    intro: "Design firms lose hours to coordination: tracking which revision went to whom, which RFI is overdue, and where each permit stands. These automations distribute drawings, log RFIs and change orders, chase consultant deadlines, and flag budget variance before a project's margin disappears.",
  },
  automotive: {
    card: "Lead response, service reminders, repair status texts, recall alerts, and trade-in follow-up.",
    intro: "Dealerships and service shops juggle two businesses at once: selling vehicles and keeping them on the road. These automations answer internet leads in minutes, text customers when their vehicle is ready, time service reminders to real mileage, and turn recalls, trade-in equity, and declined work into booked appointments.",
  },
  "cannabis-hemp": {
    card: "Seed-to-sale compliance, license renewals, B2B reorders, grow monitoring, and loyalty.",
    intro: "Cannabis businesses operate under some of the tightest reporting rules of any industry, with thin margins and fierce competition. These automations keep track-and-trace and license deadlines on schedule, monitor grow conditions, prompt wholesale accounts to reorder, and keep loyal customers coming back.",
  },
  "car-wash-auto-detailing": {
    card: "Membership renewals, failed payment recovery, mobile route booking, and review requests.",
    intro: "Car wash and detailing revenue increasingly comes from memberships and fleets, which means a failed card or a forgotten renewal costs real money. These automations recover failed payments, book mobile detailing routes efficiently, honor weather guarantees automatically, and ask happy customers for reviews.",
  },
  catering: {
    card: "Event inquiry to proposal, headcount finalization, ingredient ordering, and crew staffing.",
    intro: "Caterers win business on responsiveness and keep it on execution. These automations turn event inquiries into proposals quickly, chase final headcounts and dietary needs, order ingredients from the event calendar, staff each event, and reconcile the final invoice.",
  },
  "commercial-real-estate": {
    card: "Deal pipelines, lease abstracts, critical date alerts, listing syndication, and CAM reconciliation.",
    intro: "Commercial real estate runs on long timelines where a single missed date can cost a deal or a renewal. These automations track deals and LOIs, abstract leases into critical date alerts, syndicate listings, keep investors updated, and make sure tax, insurance, and CAM deadlines never slip.",
  },
  "construction-contracting": {
    card: "Bid collection, daily site reports, permit and inspection tracking, and estimate follow-up.",
    intro: "Contractors lose money in the gaps between the field and the office. These automations collect and compare sub bids, turn daily site updates into reports and punch lists, track permits and inspections, document incidents, and follow up on every unsigned estimate.",
  },
  cybersecurity: {
    card: "Alert triage, phishing training, policy attestations, scan-to-ticket, and expiration monitoring.",
    intro: "Security teams drown in alerts and administrative follow-through. These automations enrich and route alerts, assign security awareness training, collect policy attestations, turn vulnerability scans into tickets, and catch expiring certificates and domains before they cause an outage.",
  },
  "dental-practices": {
    card: "Hygiene recall, treatment plan follow-up, insurance verification, and same-day cancellation fill.",
    intro: "A dental schedule is only as profitable as the chairs that stay full. These automations reactivate overdue patients, follow up on unscheduled treatment, verify insurance before the visit, pre-fill new patient paperwork, and fill same-day cancellations from a waitlist.",
  },
  "driving-schools": {
    card: "Lesson scheduling, instructor matching, test date reminders, and parent progress updates.",
    intro: "Driving schools coordinate students, instructors, vehicles, and test dates, often by phone. These automations match students with instructors, send test and lesson reminders, keep training vehicles inspected, and update parents on progress.",
  },
  "ecommerce-retail": {
    card: "Abandoned cart recovery, shipping updates, low-stock alerts, returns, reviews, and win-back.",
    intro: "Online stores live and die by conversion rate, repeat purchases, and inventory accuracy. These automations recover abandoned carts, send proactive shipping and delay updates, reorder before stock runs out, streamline returns, request reviews after delivery, and win back customers who have gone quiet.",
  },
  education: {
    card: "Enrollment inquiries, waitlists, absence alerts, progress reports, and tuition reminders.",
    intro: "Schools and training providers handle a constant stream of communication with students and families. These automations answer enrollment inquiries, manage waitlists, notify parents of absences, deliver progress reports, track course completion, and remind families about tuition.",
  },
  "faith-based-organizations": {
    card: "Volunteer scheduling, giving statements, new visitor follow-up, and small group placement.",
    intro: "Churches and ministries run on volunteers and relationships, and administration often falls to a very small staff. These automations follow up with first-time visitors, place people in small groups, schedule volunteers, route prayer requests, and send giving statements without a year-end scramble.",
  },
  "financial-services": {
    card: "Client onboarding, tax document collection, review scheduling, and life-event outreach.",
    intro: "Advisors and financial firms build trust through consistent, timely contact, and they carry heavy documentation requirements. These automations onboard new clients, collect tax documents securely, schedule annual reviews, follow loan milestones, and reach out at life events that matter.",
  },
  "fitness-wellness": {
    card: "Class booking, waitlists, trial conversion, member retention, renewals, and referrals.",
    intro: "Gyms, studios, and wellness practices grow by filling classes and keeping members engaged past the first 90 days. These automations manage bookings and waitlists, convert trials into memberships, flag members who stop showing up, recover failed payments, and reward referrals.",
  },
  "general-business": {
    card: "Missed-call text-back, lead routing, invoicing, HR workflows, contracts, and IT admin.",
    intro: "Some workflows show up in nearly every business, regardless of industry: following up with leads, sending invoices, onboarding employees, renewing contracts, and keeping IT tidy. This is the largest collection in the catalog, covering sales, marketing, finance, HR, operations, and IT automations that fit almost any team.",
  },
  "government-public-sector": {
    card: "Public records requests, service request routing, grant tracking, and public notices.",
    intro: "Public agencies have to be responsive and accountable at the same time, often with lean staffing. These automations track public records requests against statutory deadlines, route citizen service requests, manage grant pipelines and reporting, and publish meeting notices on time.",
  },
  healthcare: {
    card: "Appointment reminders, waitlist fill, intake, eligibility checks, referrals, and recalls.",
    intro: "Medical practices lose revenue to no-shows, eligibility surprises, and referrals that never get scheduled, while front desk staff spend their day on the phone. These automations handle reminders and waitlists, verify insurance before visits, collect intake forms, track referrals and authorizations, and run preventive care recalls.",
  },
  "home-services": {
    card: "Missed-call text-back, quote follow-up, technician ETAs, maintenance plans, and reviews.",
    intro: "HVAC, plumbing, electrical, and other home service companies win jobs by answering first and keep customers by showing up when promised. These automations text back missed calls, follow up on quotes, send technician ETAs, renew maintenance plans, invoice on job completion, and request reviews while the work is fresh.",
  },
  "hospitality-hotels": {
    card: "Pre-arrival upsells, guest messaging, room status, review requests, and group proposals.",
    intro: "Hotels compete on guest experience and on revenue per stay. These automations send pre-arrival messages and upgrade offers, keep housekeeping and front desk in sync on room status, recover abandoned bookings, respond to group inquiries, and request reviews at the right moment.",
  },
  "human-resources": {
    card: "Applicant tracking, interview scheduling, new hire paperwork, timesheets, and offboarding.",
    intro: "HR teams carry a long list of recurring processes that every employee depends on. These automations post jobs and track applicants, schedule interviews, collect new hire documents, chase timesheets, run review cycles, route time-off requests, and handle offboarding checklists.",
  },
  insurance: {
    card: "Quote requests, renewals, claims status updates, certificates of insurance, and cross-sell.",
    intro: "Agencies grow by retaining policies and rounding out accounts, while claims and certificates create a steady stream of service work. These automations respond to quote requests, run renewal outreach, update clients on claims, generate certificates, and flag cross-sell opportunities.",
  },
  "interior-design-home-staging": {
    card: "Client approvals, vendor purchase orders, lead time tracking, and installation coordination.",
    intro: "Design and staging projects involve dozens of vendors, orders, and approvals per client. These automations route mood boards for approval, track purchase orders and lead time changes, manage staging inventory, coordinate installation day, and trigger the final invoice after the walkthrough.",
  },
  "junk-removal": {
    card: "Instant photo quotes, crew routing, same-day capacity, and before/after review requests.",
    intro: "Junk removal is a speed business: the company that quotes first usually wins the job. These automations generate quotes from customer photos, sequence crew routes, watch same-day capacity, report on donation and landfill volume, and request reviews with before and after photos.",
  },
  "landscaping-lawn-care": {
    card: "Route optimization, weather rescheduling, seasonal upsells, and photo invoicing.",
    intro: "Landscaping companies run recurring routes at the mercy of the weather. These automations optimize routes, reschedule and notify customers when the weather turns, promote seasonal services, renew contracts, and send invoices with proof-of-service photos.",
  },
  "laundry-dry-cleaning": {
    card: "Order-ready texts, pickup and delivery scheduling, unclaimed order alerts, and loyalty.",
    intro: "Laundry and dry cleaning businesses depend on repeat customers and on getting orders back out the door. These automations text customers when orders are ready, schedule recurring pickup and delivery, flag unclaimed orders, track complaints, and run a digital loyalty program.",
  },
  legal: {
    card: "After-hours lead recovery, intake, deadlines, case status updates, and billing.",
    intro: "Law firms lose cases to slow intake and lose time to administrative follow-up. These automations capture after-hours and missed-call leads, streamline intake and conflict checks, track statutes of limitation and discovery deadlines, update clients on case status, and keep billing and trust accounting on schedule.",
  },
  "locksmith-security": {
    card: "Emergency dispatch with ETAs, maintenance contracts, credential audits, and quote follow-up.",
    intro: "Locksmith and security companies handle urgent calls alongside recurring commercial contracts. These automations dispatch emergency jobs with customer ETA texts, schedule maintenance visits, remind clients about access credential audits, and follow up on security system quotes.",
  },
  "logistics-supply-chain": {
    card: "Shipment tracking, delay alerts, vendor quotes, reorder points, and customs paperwork.",
    intro: "Logistics teams spend much of the day answering \"where is it?\" These automations track shipments and alert customers to delays, assign warehouse tasks, collect vendor quotes, flag freight cost anomalies, maintain fleet compliance, and assemble customs documentation.",
  },
  manufacturing: {
    card: "Downtime alerts, preventive maintenance, quality deviations, reorders, and safety compliance.",
    intro: "Manufacturers protect margin by keeping lines running and quality consistent. These automations alert on equipment downtime, schedule preventive maintenance, escalate quality deviations, reorder materials by lead time, prompt customer reorders, and track safety inspections and incidents.",
  },
  "marketing-agencies": {
    card: "Client reporting, content calendars, budget pacing, SEO reports, and onboarding.",
    intro: "Agencies sell strategy and creativity but spend a surprising share of hours on reporting and coordination. These automations assemble monthly client reports, pace ad budgets, schedule content across platforms, onboard new clients, and spot upsell opportunities in client data.",
  },
  "media-publishing": {
    card: "Editorial deadlines, subscription renewals, production pipelines, and content performance.",
    intro: "Publishers juggle contributors, production schedules, and subscribers at the same time. These automations manage editorial calendars and contributor deadlines, run renewal and win-back campaigns, coordinate guest booking and production, and flag content worth repurposing.",
  },
  "moving-storage": {
    card: "Inventory-based quotes, crew routing, move-day updates, storage billing, and claims.",
    intro: "Moving and storage companies win on quick, accurate quotes and keep customers calm with communication on move day. These automations quote from inventory lists, assign crews and routes, send move-day status updates, manage storage billing and lien notices, and handle damage claims.",
  },
  nonprofit: {
    card: "Donor acknowledgments, grant deadlines, volunteer shifts, events, and lapsed donor win-back.",
    intro: "Nonprofits do more with less, and administration competes with mission for every staff hour. These automations send instant donation receipts and stewardship sequences, track grant deadlines, schedule volunteers, run event registration, and re-engage lapsed donors.",
  },
  "oil-gas": {
    card: "Safety check-ins, drilling reports, lease payments, regulatory filings, and royalties.",
    intro: "Oil and gas operations combine field safety, regulatory complexity, and intricate financial obligations. These automations run daily safety check-ins, compile drilling reports, track lease and rental payments, manage regulatory filing deadlines, and calculate royalty statements.",
  },
  "pest-control": {
    card: "Recurring treatment scheduling, inspection reports, chemical logs, and callback routing.",
    intro: "Pest control companies grow through recurring service plans and keep them through reliability. These automations schedule recurring treatments, deliver inspection reports, log routes and chemical usage, prioritize callback requests, and ask for referrals and reviews after service.",
  },
  "pharmaceutical-biotech": {
    card: "Submission deadlines, batch record deviations, trial enrollment, and sample accountability.",
    intro: "Life sciences teams operate under strict regulatory oversight, where documentation is as important as the science. These automations track submission deadlines, escalate batch record deviations, monitor trial enrollment and protocol deviations, log samples, and alert on cold chain excursions.",
  },
  "photography-videography": {
    card: "Inquiry response, booking and contracts, shoot prep, revisions, and gallery delivery.",
    intro: "Photographers and video producers spend as much time managing clients as creating. These automations respond to inquiries, turn bookings into signed contracts with deposits, send pre-shoot questionnaires, track revisions, deliver galleries, and follow up with print and album offers.",
  },
  "pool-service": {
    card: "Route skip notifications, chemical trend alerts, repair quotes, and seasonal openings.",
    intro: "Pool service companies run tight weekly routes and earn extra revenue on repairs and seasonal work. These automations notify customers of route changes, flag concerning chemical trends, move repair quotes to approval, and schedule seasonal openings and closings.",
  },
  "professional-services": {
    card: "Document requests, engagement letters, deadlines, client onboarding, and invoicing.",
    intro: "Accountants, consultants, and other professional firms sell expertise but get buried in administration. These automations chase client documents, follow up on engagement letters, track filing and project deadlines, onboard new clients, and send invoices and payment reminders.",
  },
  "property-management": {
    card: "Maintenance triage, rent reminders, lease renewals, vacancy listings, and owner statements.",
    intro: "Property managers answer to tenants, owners, and vendors at once, often across many buildings. These automations triage maintenance requests and dispatch vendors, send rent reminders and late notices, run renewal countdowns, syndicate vacancies, and generate owner statements.",
  },
  "property-restoration": {
    card: "First notice of loss response, claim documentation, drying logs, and job updates.",
    intro: "Restoration companies win jobs with speed and get paid with documentation. These automations dispatch crews the moment a loss is reported, assemble insurance claim packets, log drying equipment readings, keep homeowners updated on milestones, and reconcile subcontractor invoices.",
  },
  "real-estate": {
    card: "Instant lead response, showing follow-up, transaction deadlines, and past client nurture.",
    intro: "Real estate is a relationship business with transaction-level paperwork. These automations respond to new leads instantly, follow up after showings, match buyers to new listings, track contract deadlines and contingencies, keep clients updated through closing, and stay in touch with past clients for referrals.",
  },
  "renewable-energy-solar": {
    card: "Utility bill lead qualification, permit tracking, milestone payments, and performance alerts.",
    intro: "Solar installers manage long sales cycles, complex permitting, and years of system support. These automations qualify leads from utility bills, track permits and interconnection applications, trigger milestone payments, flag underperforming systems, and remind customers about maintenance.",
  },
  "restaurants-food-service": {
    card: "Reservations, waitlists, review management, inventory reorders, and staff scheduling.",
    intro: "Restaurants operate on thin margins and fast feedback loops. These automations confirm reservations and manage waitlists, monitor and respond to reviews, reorder inventory from POS data, fill open shifts, sync 86'd items across menus, and run promotions on slow nights.",
  },
  "salons-spas-barbershops": {
    card: "Appointment confirmations, rebooking, slot fill, birthday offers, and retail restock.",
    intro: "Salons and spas earn the most from clients who rebook on a regular cadence. These automations confirm appointments to reduce no-shows, prompt rebooking at checkout, fill last-minute openings from a waitlist, send birthday offers, and remind clients to restock retail products.",
  },
  "senior-living-childcare": {
    card: "Family updates, tuition billing, caregiver scheduling, incident reports, and ratio compliance.",
    intro: "Care providers carry two responsibilities at once: the people in their care and the families who trust them. These automations send daily family updates, manage tuition billing, match caregivers to schedules, document incidents with timely family notification, and monitor staffing ratios.",
  },
  "sports-recreation": {
    card: "Registration and payments, facility booking, eligibility tracking, and weather cancellations.",
    intro: "Leagues, clubs, and recreation facilities coordinate registrations, schedules, and facilities for hundreds of families. These automations handle registration and team placement, prevent booking conflicts, track eligibility and physicals, publish results, and notify everyone when weather cancels play.",
  },
  "staffing-recruiting": {
    card: "Job order intake, candidate matching, re-engagement, timesheets, and compliance.",
    intro: "Staffing firms win on speed to submittal and keep clients with reliable fill rates. These automations turn job orders into candidate matches, re-engage past candidates, collect timesheets and trigger billing, track I-9 and certification compliance, and flag stalled pipelines.",
  },
  "technology-saas": {
    card: "Trial conversion, churn signals, ticket routing, feature requests, and failed payments.",
    intro: "SaaS companies grow by converting trials and reducing churn. These automations nurture trials to paid, detect churn signals and trigger save plays, route support tickets by priority and SLA, aggregate feature requests, update status pages during incidents, and recover failed payments.",
  },
  telecommunications: {
    card: "Installation booking, outage communication, contract renewals, and usage alerts.",
    intro: "Telecom providers serve large customer bases where proactive communication prevents call volume spikes. These automations book installations and dispatch technicians, notify customers about outages and ETAs, run renewal and retention campaigns, and alert customers before usage overages.",
  },
  "vacation-rentals": {
    card: "Pre-arrival instructions, cleaning turnovers, pricing alerts, and guest reviews.",
    intro: "Short-term rental hosts and managers deliver hotel-level service without a front desk. These automations send check-in instructions before arrival, schedule cleaning turnovers between stays, flag pricing opportunities, route maintenance issues, and request reviews after checkout.",
  },
  "veterinary-practices": {
    card: "Vaccination reminders, appointment requests, discharge follow-up, and lapsed patient recall.",
    intro: "Veterinary practices care for patients who cannot book their own appointments, so pet owner communication is everything. These automations send vaccination and wellness reminders, confirm appointments, follow up after visits, prompt prescription refills, and reactivate lapsed patients.",
  },
  "warehousing-distribution": {
    card: "Dock scheduling, wave planning, cycle counts, returns, and labor productivity.",
    intro: "Warehouses run on throughput and accuracy. These automations schedule dock appointments, plan order waves and pick priorities, run cycle counts and investigate variances, process returns, flag pick-pack-ship exceptions, and track labor productivity by shift.",
  },
  "wedding-event-planning": {
    card: "Inquiry to proposal, vendor confirmations, payment milestones, and day-of timelines.",
    intro: "Event planners manage dozens of vendors and deadlines for every celebration. These automations turn inquiries into proposals, confirm every vendor, remind clients about payment milestones, distribute day-of timelines, and request reviews and referrals after the event.",
  },
};

// How each industry reads mid-sentence, as an adjective: "What real estate
// workflows can be automated?"
const industryAdjectives = {
  "addiction-treatment-behavioral-health": "behavioral health",
  "agriculture-farming": "farm",
  "architecture-engineering": "architecture and engineering",
  automotive: "automotive",
  "cannabis-hemp": "cannabis",
  "car-wash-auto-detailing": "car wash and detailing",
  catering: "catering",
  "commercial-real-estate": "commercial real estate",
  "construction-contracting": "construction",
  cybersecurity: "cybersecurity",
  "dental-practices": "dental practice",
  "driving-schools": "driving school",
  "ecommerce-retail": "e-commerce and retail",
  education: "education and training",
  "faith-based-organizations": "church and ministry",
  "financial-services": "financial services",
  "fitness-wellness": "fitness and wellness",
  "general-business": "everyday business",
  "government-public-sector": "public sector",
  healthcare: "healthcare",
  "home-services": "home services",
  "hospitality-hotels": "hotel",
  "human-resources": "HR",
  insurance: "insurance agency",
  "interior-design-home-staging": "interior design and staging",
  "junk-removal": "junk removal",
  "landscaping-lawn-care": "landscaping",
  "laundry-dry-cleaning": "laundry and dry cleaning",
  legal: "law firm",
  "locksmith-security": "locksmith and security",
  "logistics-supply-chain": "logistics",
  manufacturing: "manufacturing",
  "marketing-agencies": "marketing agency",
  "media-publishing": "media and publishing",
  "moving-storage": "moving and storage",
  nonprofit: "nonprofit",
  "oil-gas": "oil and gas",
  "pest-control": "pest control",
  "pharmaceutical-biotech": "pharma and biotech",
  "photography-videography": "photography and video",
  "pool-service": "pool service",
  "professional-services": "professional services",
  "property-management": "property management",
  "property-restoration": "restoration",
  "real-estate": "real estate",
  "renewable-energy-solar": "solar",
  "restaurants-food-service": "restaurant",
  "salons-spas-barbershops": "salon and spa",
  "senior-living-childcare": "senior living and childcare",
  "sports-recreation": "sports and recreation",
  "staffing-recruiting": "staffing and recruiting",
  "technology-saas": "SaaS",
  telecommunications: "telecom",
  "vacation-rentals": "vacation rental",
  "veterinary-practices": "veterinary practice",
  "warehousing-distribution": "warehouse",
  "wedding-event-planning": "wedding and event planning",
};

module.exports = { categories, tools, industries, industryAdjectives };
