// Free courses:
//   /learn/                     hub listing every course
//   /learn/<course>/            course overview with the lesson list
//   /learn/<course>/<lesson>/   one page per lesson
//
// Each course is a folder in content/learn/ with a course.json and one HTML
// file per lesson, named NN-slug.html so they sort in order. A lesson file
// starts with a JSON comment holding title, description, minutes,
// keyPoints and `check` (the knowledge check: [{q, options, answer, why}]).
// Progress is kept in the visitor's browser by assets/js/tools.js.

const fs = require("fs");
const path = require("path");
const { ROOT, SITE_URL, escapeHtml, slugify, writeFile, truncate } = require("../lib/util");
const L = require("../lib/layout");
const { icon } = L;

const DIR = path.join(ROOT, "content", "learn");

function load() {
  return fs
    .readdirSync(DIR)
    .filter((d) => fs.statSync(path.join(DIR, d)).isDirectory())
    .map((dir) => {
      const course = JSON.parse(fs.readFileSync(path.join(DIR, dir, "course.json"), "utf8"));
      course.slug = dir;
      course.url = "/learn/" + dir + "/";
      course.lessons = fs
        .readdirSync(path.join(DIR, dir))
        .filter((f) => /^\d\d-.+\.html$/.test(f))
        .sort()
        .map((file, i) => {
          const raw = fs.readFileSync(path.join(DIR, dir, file), "utf8");
          const m = raw.match(/^<!--([\s\S]*?)-->\s*/);
          if (!m) throw new Error("content/learn/" + dir + "/" + file + " is missing its metadata comment");
          const meta = JSON.parse(m[1]);
          const slug = file.replace(/^\d\d-/, "").replace(/\.html$/, "");
          const toc = [];
          const body = raw.slice(m[0].length).replace(/<h2>([\s\S]*?)<\/h2>/g, (all, inner) => {
            const text = inner.replace(/<[^>]+>/g, "");
            const id = slugify(text);
            toc.push([id, text]);
            return '<h2 id="' + id + '">' + inner + "</h2>";
          });
          const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
          return Object.assign({ slug, n: i + 1, url: course.url + slug + "/", body, toc, words }, meta);
        });
      course.minutes = course.lessons.reduce((a, l) => a + l.minutes, 0);
      return course;
    })
    .sort((a, b) => a.order - b.order);
}

function outline(course, current) {
  return (
    '<nav class="lj-outline" data-lj-course aria-label="' + escapeHtml(course.title) + ' lessons">' +
    '<p class="lj-outline-title"><a href="' + course.url + '">' + escapeHtml(course.title) + "</a></p>" +
    '<div class="lj-course-progress"><div class="lj-course-bar"><span data-lj-progress-fill></span></div><small data-lj-progress-text>' + course.lessons.length + " lessons</small></div>" +
    "<ol>" +
    course.lessons
      .map(
        (l) =>
          '<li data-lj-lesson-item="' + l.url + '"' + (l === current ? ' class="is-current"' : "") + '><a href="' + l.url + '"' + (l === current ? ' aria-current="page"' : "") + '><span class="lj-outline-n">' + l.n + "</span><span>" + escapeHtml(l.title) + "</span></a></li>"
      )
      .join("") +
    "</ol></nav>"
  );
}

function knowledgeCheck(l) {
  if (!l.check || !l.check.length) return "";
  return (
    '<section class="lj-check" aria-labelledby="check-your-understanding">' +
    '<h2 id="check-your-understanding">Check your understanding</h2>' +
    "<p>" + l.check.length + " quick questions. Answer them all to mark this lesson complete.</p>" +
    l.check
      .map(
        (c, i) =>
          '<div class="lj-check-q" data-answer="' + c.answer + '">' +
          '<p class="lj-check-title"><span>' + (i + 1) + ".</span> " + escapeHtml(c.q) + "</p>" +
          '<div class="lj-quiz-opts">' + c.options.map((o, j) => '<button type="button" class="lj-quiz-opt" data-o="' + j + '"><span>' + escapeHtml(o) + "</span></button>").join("") + "</div>" +
          '<p class="lj-check-why" hidden>' + c.why + "</p></div>"
      )
      .join("") +
    '<p class="lj-check-done" data-lj-lesson-done hidden>' + icon("checkCircle") + "<span>Lesson complete. <span data-lj-check-score></span></span></p>" +
    '<button type="button" class="lj-btn lj-btn-ghost lj-btn-sm" data-lj-complete>Mark complete and skip the questions</button>' +
    "</section>"
  );
}

function lessonPage(course, l, courses) {
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Learn", "/learn/"],
    [course.title, course.url],
    [l.title, l.url],
  ]);
  const prev = course.lessons[l.n - 2];
  const next = course.lessons[l.n];
  const other = courses.find((c) => c !== course);
  const nextLink = next
    ? '<a class="lj-lesson-next" href="' + next.url + '"><small>Next lesson</small><span>' + escapeHtml(next.title) + "</span>" + icon("arrowRight") + "</a>"
    : other
      ? '<a class="lj-lesson-next" href="' + other.url + '"><small>Course complete. Up next</small><span>' + escapeHtml(other.title) + "</span>" + icon("arrowRight") + "</a>"
      : '<a class="lj-lesson-next" href="/resources/"><small>Course complete</small><span>Explore the resource center</span>' + icon("arrowRight") + "</a>";

  const main = `
<header class="lj-article-hero">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">Lesson ${l.n} of ${course.lessons.length} &middot; ${escapeHtml(course.title)}</span>
    <h1>${escapeHtml(l.title)}</h1>
    <p class="lj-lead">${escapeHtml(l.description)}</p>
    <div class="lj-article-meta">
      <span>${icon("clock")}${l.minutes} min lesson</span>
      <span>${icon("school")}${escapeHtml(course.level)}</span>
      <span>${icon("checkCircle")}Free, no sign-up</span>
    </div>
  </div>
</header>
<div class="lj-container">
  <div class="lj-article-layout">
    <article class="lj-prose" data-lj-lesson="${l.url}">
      ${l.keyPoints ? '<div class="lj-keypoints"><p>In this lesson</p><ul>' + l.keyPoints.map((k) => "<li>" + k + "</li>").join("") + "</ul></div>" : ""}
      ${l.body}
      ${knowledgeCheck(l)}
      <nav class="lj-lesson-nav" aria-label="Lesson navigation">
        ${prev ? '<a class="lj-lesson-prev" href="' + prev.url + '">' + icon("arrowLeft") + "<small>Previous lesson</small><span>" + escapeHtml(prev.title) + "</span></a>" : '<a class="lj-lesson-prev" href="' + course.url + '">' + icon("arrowLeft") + "<small>Back to</small><span>Course overview</span></a>"}
        ${nextLink}
      </nav>
    </article>
    <aside class="lj-article-aside" aria-label="Course outline">
      ${outline(course, l)}
      <div class="lj-aside-cta"><strong>Rather have it built?</strong>We design and build automations for small teams, with a flat quote before any work starts.<a class="lj-btn lj-btn-accent lj-btn-sm" href="/appointment/">Book a Free Consultation</a></div>
    </aside>
  </div>
</div>`;

  writeFile(
    l.url.slice(1) + "index.html",
    L.page({
      path: l.url,
      title: l.title + " | " + course.title + " | LJ Web Management",
      description: truncate(l.description, 158),
      ogType: "article",
      active: "resources",
      jsonLd: [
        {
          "@type": "LearningResource",
          "@id": SITE_URL + l.url + "#lesson",
          name: l.title,
          description: l.description,
          url: SITE_URL + l.url,
          learningResourceType: "Lesson",
          educationalLevel: course.level,
          timeRequired: "PT" + l.minutes + "M",
          isAccessibleForFree: true,
          inLanguage: "en-US",
          position: l.n,
          isPartOf: { "@id": SITE_URL + course.url + "#course" },
          author: { "@id": SITE_URL + "/#organization" },
          publisher: { "@id": SITE_URL + "/#organization" },
        },
        crumbs.schema,
      ],
      endScripts: L.toolsScript(),
      main,
    })
  );
}

function courseSchema(course) {
  return {
    "@type": "Course",
    "@id": SITE_URL + course.url + "#course",
    name: course.name,
    description: course.description,
    url: SITE_URL + course.url,
    provider: { "@id": SITE_URL + "/#organization" },
    educationalLevel: course.level,
    isAccessibleForFree: true,
    inLanguage: "en-US",
    teaches: course.outcomes.map((o) => o.replace(/<[^>]+>/g, "")),
    timeRequired: "PT" + course.minutes + "M",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", category: "Free" },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: "PT" + course.minutes + "M" },
    hasPart: course.lessons.map((l) => ({ "@type": "LearningResource", name: l.title, url: SITE_URL + l.url })),
  };
}

function coursePage(course, courses) {
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Learn", "/learn/"],
    [course.title, course.url],
  ]);
  const faq = course.faq && course.faq.length ? L.faq(course.faq) : null;
  const other = courses.filter((c) => c !== course);
  const main = `
<div data-lj-course>
<section class="lj-page-hero">
  <div class="lj-container">
    ${crumbs.html}
    <span class="lj-eyebrow lj-eyebrow--pill">Free course &middot; ${escapeHtml(course.level)}</span>
    <h1>${escapeHtml(course.name)}</h1>
    <p class="lj-lead">${course.lead}</p>
    <div class="lj-article-meta">
      <span>${icon("book")}${course.lessons.length} lessons</span>
      <span>${icon("clock")}About ${Math.round(course.minutes / 5) * 5} minutes total</span>
      <span>${icon("listCheck")}Knowledge check in every lesson</span>
    </div>
    <div class="lj-btn-row lj-mt-lg"><a class="lj-btn lj-btn-primary lj-btn-lg" href="${course.lessons[0].url}" data-lj-continue>Start the course ${icon("arrowRight")}</a></div>
  </div>
</section>
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <div class="lj-course">
      <div>
        <h2 class="lj-h3">Lessons</h2>
        <ol class="lj-lessons">
          ${course.lessons
            .map(
              (l) =>
                '<li data-lj-lesson-item="' + l.url + '"><a href="' + l.url + '"><span class="lj-lessons-n">' + l.n + '</span><span class="lj-lessons-body"><strong>' + escapeHtml(l.title) + "</strong><span>" + escapeHtml(l.description) + '</span></span><span class="lj-lessons-meta">' + l.minutes + " min</span></a></li>"
            )
            .join("")}
        </ol>
      </div>
      <aside class="lj-course-aside">
        <div class="lj-course-card">
          <p class="lj-outline-title">Your progress</p>
          <div class="lj-course-progress"><div class="lj-course-bar"><span data-lj-progress-fill></span></div><small data-lj-progress-text>Not started yet</small></div>
          <p class="lj-outline-title lj-mt">What you will learn</p>
          <ul class="lj-checklist">${course.outcomes.map((o) => "<li>" + icon("checkCircle") + "<span>" + o + "</span></li>").join("")}</ul>
          <p class="lj-outline-title lj-mt">Who it is for</p>
          <p>${course.audience}</p>
        </div>
      </aside>
    </div>
  </div>
</section>
</div>
${faq ? `<section class="lj-section lj-section--mist">
  <div class="lj-container lj-container--narrow">
    <div class="lj-section-head"><span class="lj-eyebrow">FAQ</span><h2>About this course</h2></div>
    ${faq.html}
  </div>
</section>` : ""}
${other.length ? `<section class="lj-section">
  <div class="lj-container">
    <div class="lj-section-head lj-section-head--split">
      <div><span class="lj-eyebrow">Keep learning</span><h2>More free courses and resources</h2></div>
      <a class="lj-link-arrow" href="/resources/">Resource center ${icon("arrowRight")}</a>
    </div>
    <div class="lj-grid lj-grid-3">
      ${other.map((c) => L.rcard({ href: c.url, icon: c.icon, tag: "Free course", meta: c.lessons.length + " lessons", title: c.name, text: c.description, cta: "View the course" })).join("")}
      ${L.rcard({ href: "/glossary/", icon: "bookOpen", tag: "Glossary", title: "Automation and AI Glossary", text: "Plain-English definitions of the automation and AI terms you will meet in this course and beyond.", cta: "Open the glossary" })}
      ${L.rcard({ href: "/quizzes/automation-iq/", icon: "award", tag: "Quiz", meta: "4 min", title: "Automation IQ Quiz", text: "Test what you know about triggers, workflows, AI, and automation strategy, with an explanation for every answer.", cta: "Take the quiz" })}
    </div>
  </div>
</section>` : ""}`;

  writeFile(
    course.url.slice(1) + "index.html",
    L.page({
      path: course.url,
      title: course.seoTitle + " | LJ Web Management",
      description: course.description,
      active: "resources",
      jsonLd: [courseSchema(course), crumbs.schema].concat(faq ? [faq.schema] : []),
      endScripts: L.toolsScript(),
      main,
    })
  );
}

function hub(courses) {
  const crumbs = L.breadcrumbs([
    ["Home", "/"],
    ["Learn", "/learn/"],
  ]);
  const main =
    L.hero({
      crumbs,
      eyebrow: "Free courses",
      title: "Learn automation and AI, free",
      lead: "Short, practical courses for business owners and teams. Each lesson takes under ten minutes, ends with a quick knowledge check, and saves your progress in your browser. No sign-up required.",
    }) +
    `
<section class="lj-section lj-section--tight">
  <div class="lj-container">
    <div class="lj-course-list">
      ${courses
        .map(
          (c) => `<article class="lj-course-tile">
        <div class="lj-course-tile-head"><span class="lj-card-icon">${icon(c.icon)}</span><div><span class="lj-tag lj-tag--cyan">Free course &middot; ${escapeHtml(c.level)}</span><h2><a href="${c.url}">${escapeHtml(c.name)}</a></h2></div></div>
        <p>${escapeHtml(c.description)}</p>
        <ol class="lj-course-tile-lessons">${c.lessons.map((l) => '<li><a href="' + l.url + '">' + escapeHtml(l.title) + "</a></li>").join("")}</ol>
        <div class="lj-btn-row"><a class="lj-btn lj-btn-primary" href="${c.url}">View the course ${icon("arrowRight")}</a><span class="lj-muted">${c.lessons.length} lessons &middot; about ${Math.round(c.minutes / 5) * 5} minutes</span></div>
      </article>`
        )
        .join("")}
    </div>
  </div>
</section>`;
  writeFile(
    "learn/index.html",
    L.page({
      path: "/learn/",
      title: "Free Automation & AI Courses for Business | LJ Web Management",
      description: "Free beginner courses on business automation and AI: short lessons, knowledge checks, and saved progress. Learn how to automate your business step by step.",
      active: "resources",
      jsonLd: [
        {
          "@type": "ItemList",
          "@id": SITE_URL + "/learn/#courses",
          name: "Free automation and AI courses",
          itemListElement: courses.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: SITE_URL + c.url, name: c.name })),
        },
        crumbs.schema,
      ],
      main,
    })
  );
}

function build(courses) {
  courses.forEach((c) => {
    c.lessons.forEach((l) => lessonPage(c, l, courses));
    coursePage(c, courses);
  });
  hub(courses);
}

function searchEntries(courses) {
  const out = [];
  courses.forEach((c) => {
    out.push(["Course", c.name, "Free course · " + c.lessons.length + " lessons", c.url, c.description]);
    c.lessons.forEach((l) => out.push(["Lesson", l.title, c.title + " · Lesson " + l.n, l.url, l.description]));
  });
  return out;
}

module.exports = { load, build, searchEntries };
