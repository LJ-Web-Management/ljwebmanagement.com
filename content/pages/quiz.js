(function () {
  'use strict';

  var BUCKETS = [
    {
      title: "Customers & Sales",
      options: [
        { label: "Leads go cold before we follow up", match: "custom-crm" },
        { label: "Booking and scheduling is a headache", match: "booking-scheduling" },
        { label: "Customers keep calling for things they could do themselves", match: "customer-portal" },
        { label: "Our website doesn't convert visitors into customers", match: "custom-website" }
      ]
    },
    {
      title: "Operations & Fulfillment",
      options: [
        { label: "Field crews or technicians are hard to dispatch and track", match: "field-service" },
        { label: "Inventory, parts, or equipment tracking is a mess", match: "inventory-warehouse" },
        { label: "Our systems don't talk to each other", match: "erp-integration" },
        { label: "We sell through multiple vendors or sellers and it's chaos", match: "marketplace-platform" }
      ]
    },
    {
      title: "People & Support",
      options: [
        { label: "Support tickets and customer requests pile up", match: "help-desk-ticketing" },
        { label: "Payroll and HR paperwork takes forever", match: "hr-payroll" },
        { label: "Training and compliance tracking is all manual", match: "lms-deployment" },
        { label: "Billing members or subscribers is a manual chore", match: "membership-billing" }
      ]
    },
    {
      title: "Visibility & Infrastructure",
      options: [
        { label: "Leadership has no real-time visibility into the numbers", match: "bi-reporting" },
        { label: "Repetitive manual busywork is everywhere on our team", match: "workflow-automation" },
        { label: "Our software or tools need someone to host and maintain them", match: "managed-saas" },
        { label: "We need a point-of-sale system for our restaurant", match: "restaurant-pos" },
        { label: "We need to track part or component lifecycle", match: "obsolescence-management" }
      ]
    }
  ];

  var SOLUTIONS = {
    "custom-website": { name: "Custom Website Design & Development", blurb: "A fully custom-built website designed around how your business actually operates, engineered to rank and convert instead of just look good.", href: "/solutions/websites-digital-presence/custom-website/" },
    "obsolescence-management": { name: "Obsolescence Management Platform", blurb: "A centralized system that tracks component and equipment lifecycle status, so you catch end-of-life parts long before they become a supply chain emergency.", href: "/solutions/operations-field-service/obsolescence-management/" },
    "erp-integration": { name: "ERP Implementation & Integration Solutions", blurb: "End-to-end ERP implementation that unifies finance, inventory, procurement, and reporting into one connected system instead of disconnected spreadsheets.", href: "/solutions/erp-enterprise-systems/erp-integration/" },
    "managed-saas": { name: "Managed SaaS Delivery & Support Service", blurb: "A subscription service that hosts, monitors, secures, and maintains your custom software or automation stack, so you never need an in-house DevOps team.", href: "/solutions/industry-platforms-saas/managed-saas/" },
    "lms-deployment": { name: "Learning Management System (LMS) Deployment", blurb: "A fully configured learning platform for onboarding, compliance training, and certification, with automated reminders and reporting built in.", href: "/solutions/hr-people-training/lms-deployment/" },
    "restaurant-pos": { name: "Restaurant Point of Sale (POS) System", blurb: "A complete point-of-sale platform for restaurants and quick-service operations, covering order entry, kitchen display integration, and real-time reporting.", href: "/solutions/industry-platforms-saas/restaurant-pos/" },
    "custom-crm": { name: "Custom CRM Platform", blurb: "A custom-built CRM designed around your actual sales process, capturing every interaction automatically instead of relying on manual data entry.", href: "/solutions/sales-marketing/custom-crm/" },
    "booking-scheduling": { name: "Booking & Scheduling Platform", blurb: "A booking and scheduling platform that fills your calendar, sends reminders, and cuts down on no-shows automatically.", href: "/solutions/customer-experience/booking-scheduling/" },
    "field-service": { name: "Field Service Management Platform", blurb: "A field service management platform that makes dispatching, routing, and tracking technicians simple from a single dashboard.", href: "/solutions/operations-field-service/field-service/" },
    "membership-billing": { name: "Membership & Subscription Billing Platform", blurb: "A membership and subscription billing platform that handles recurring payments, renewals, and member communication automatically.", href: "/solutions/finance-billing/membership-billing/" },
    "help-desk-ticketing": { name: "Help Desk & Support Ticketing Platform", blurb: "A help desk and ticketing platform that routes, tracks, and resolves customer requests before they pile up.", href: "/solutions/customer-experience/help-desk-ticketing/" },
    "inventory-warehouse": { name: "Inventory & Warehouse Management Platform", blurb: "An inventory and warehouse management platform that gives you real-time visibility into stock levels, locations, and movement.", href: "/solutions/operations-field-service/inventory-warehouse/" },
    "hr-payroll": { name: "HR & Payroll Management Platform", blurb: "An HR and payroll management platform that automates onboarding paperwork, time tracking, and payroll processing.", href: "/solutions/hr-people-training/hr-payroll/" },
    "bi-reporting": { name: "Business Intelligence & Reporting Dashboard Platform", blurb: "A business intelligence dashboard that pulls your data into one place, so leadership can see what's actually happening in real time.", href: "/solutions/data-ai-analytics/bi-reporting/" },
    "customer-portal": { name: "Customer Portal & Self-Service Platform", blurb: "A customer self-service portal where clients can find answers, check status, and manage their own accounts without calling you.", href: "/solutions/customer-experience/customer-portal/" },
    "marketplace-platform": { name: "Marketplace & Multi-Vendor Platform", blurb: "A multi-vendor marketplace platform that keeps every seller, listing, and payout organized in one system.", href: "/solutions/industry-platforms-saas/marketplace-platform/" },
    "workflow-automation": { name: "Custom Workflow Automation", blurb: "A done-for-you automation system built around your specific team and tools, the same kind behind our 1000+ industry playbooks.", href: "/automations/" }
  };

  var SIZES = [
    { label: "Just me", note: "Solo operators usually start with one focused automation that pays for itself fast." },
    { label: "2 to 10 people", note: "Small teams typically see the fastest return, since manual work is spread across the whole group." },
    { label: "11 to 50 people", note: "Teams this size often roll automation out department by department, starting with the biggest bottleneck." },
    { label: "50+ people", note: "Larger organizations usually pair this with a broader systems and integration review." }
  ];

  var ARROW = '__ARROW__';
  var state = { bucketIndex: null, match: null, sizeIndex: null };
  var history = [0];

  var bar = document.getElementById('lj-quiz-bar');
  var backBtn = document.getElementById('lj-quiz-back');
  var steps = document.querySelectorAll('.lj-quiz-step');

  function showStep(n) {
    steps.forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-step') === String(n));
    });
    bar.style.width = (n === 0 ? 0 : (n / 4) * 100) + '%';
    backBtn.hidden = n === 0;
    document.querySelector('.lj-tool-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    var heading = document.querySelector('.lj-quiz-step.is-active h2');
    if (heading && n > 0) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }

  function goTo(n) {
    history.push(n);
    showStep(n);
  }

  function goBack() {
    if (history.length < 2) return;
    history.pop();
    var prev = history[history.length - 1];
    showStep(prev);
  }

  function buildOption(labelHtml, onClick) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lj-quiz-opt';
    btn.innerHTML = '<span>' + labelHtml + '</span>' + ARROW;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function renderStep1() {
    var wrap = document.getElementById('lj-quiz-opts-1');
    wrap.innerHTML = '';
    BUCKETS.forEach(function (bucket, i) {
      wrap.appendChild(buildOption(bucket.title, function () {
        state.bucketIndex = i;
        renderStep2();
        goTo(2);
      }));
    });
  }

  function renderStep2() {
    var bucket = BUCKETS[state.bucketIndex];
    document.getElementById('lj-quiz-step2-title').textContent = 'Where specifically does it hurt, in ' + bucket.title + '?';
    var wrap = document.getElementById('lj-quiz-opts-2');
    wrap.innerHTML = '';
    bucket.options.forEach(function (opt) {
      wrap.appendChild(buildOption(opt.label, function () {
        state.match = opt.match;
        renderStep3();
        goTo(3);
      }));
    });
  }

  function renderStep3() {
    var wrap = document.getElementById('lj-quiz-opts-3');
    wrap.innerHTML = '';
    SIZES.forEach(function (size, i) {
      wrap.appendChild(buildOption(size.label, function () {
        state.sizeIndex = i;
        renderResult();
        goTo(4);
      }));
    });
  }

  function renderResult() {
    var sol = SOLUTIONS[state.match];
    var size = SIZES[state.sizeIndex];
    var isGeneric = state.match === 'workflow-automation';
    var secondaryLabel = isGeneric ? 'Browse the Automations Catalog' : 'See ' + sol.name + ' Details';
    document.getElementById('lj-quiz-result').innerHTML =
      '<span class="lj-eyebrow">Your match</span>' +
      '<h2>' + sol.name + '</h2>' +
      '<p class="lj-lead">' + sol.blurb + '</p>' +
      '<div class="lj-quiz-size"><strong>' + size.label + ':</strong> ' + size.note + '</div>' +
      '<div class="lj-btn-row">' +
        '<a class="lj-btn lj-btn-primary" href="/appointment/">Book a Free Automation Consultation</a>' +
        '<a class="lj-btn lj-btn-ghost" href="' + sol.href + '">' + secondaryLabel + '</a>' +
      '</div>' +
      '<button type="button" class="lj-quiz-retake" id="lj-quiz-retake">Retake the quiz</button>';
    document.getElementById('lj-quiz-retake').addEventListener('click', function () {
      state = { bucketIndex: null, match: null, sizeIndex: null };
      history = [0];
      showStep(0);
    });
  }

  document.getElementById('lj-quiz-start').addEventListener('click', function () {
    renderStep1();
    goTo(1);
  });

  backBtn.addEventListener('click', goBack);
})();
