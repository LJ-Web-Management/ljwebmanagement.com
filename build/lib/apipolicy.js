// Conventions every /api/ response follows, shared by the edge function
// (which sends them as headers), openapi.json and the /developers/ page
// (which document them), so the three cannot drift.

const { SITE_URL } = require("./util");

// Fair-use rate limit, per client. Field syntax follows the IETF HTTPAPI
// draft "RateLimit header fields for HTTP" (draft-ietf-httpapi-ratelimit-headers):
// RateLimit-Policy describes the quota (q) and window in seconds (w);
// RateLimit gives remaining units (r) and seconds until reset (t).
const RATE_LIMIT = { name: "fair-use", quota: 300, window: 60 };
const RATE_LIMIT_POLICY = `"${RATE_LIMIT.name}";q=${RATE_LIMIT.quota};w=${RATE_LIMIT.window}`;
const RATE_LIMIT_STATE = `"${RATE_LIMIT.name}";r=${RATE_LIMIT.quota};t=${RATE_LIMIT.window}`;

const POLICY_URL = SITE_URL + "/developers/#versioning";

// Header fields (lowercase, as CloudFront Functions expect) added to every
// /api/ response and every JSON error.
const API_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "RateLimit, RateLimit-Policy, Retry-After, Link, Deprecation, Sunset",
  "ratelimit-policy": RATE_LIMIT_POLICY,
  ratelimit: RATE_LIMIT_STATE,
  // RFC 8594 section 6: the "sunset" link relation points to information
  // about the sunset (deprecation) policy, even before any Sunset header.
  link: `<${POLICY_URL}>; rel="sunset"; type="text/html"`,
};

module.exports = { RATE_LIMIT, RATE_LIMIT_POLICY, RATE_LIMIT_STATE, POLICY_URL, API_HEADERS };
