// CloudFront Function (viewer request) for Accept: text/markdown content negotiation.
//
// Not deployed automatically: this repo's GitHub Actions workflow only syncs
// files to S3 and invalidates CloudFront, it does not manage CloudFront
// Functions. To activate this, in the AWS console (or via `aws cloudfront
// create-function` / `aws cloudfront update-distribution`):
//   1. Create a CloudFront Function using this file's contents.
//   2. Publish it.
//   3. Associate it with the distribution's default cache behavior on the
//      "Viewer Request" event.
//
// Behavior: if a request's Accept header asks for text/markdown (as AI
// crawlers increasingly do) and the request isn't already for a text/plain
// or text/markdown resource, rewrite it to /llms-full.txt so the crawler
// gets a markdown-friendly plain-text document instead of the HTML page.

function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var accept = headers['accept'] && headers['accept'].value ? headers['accept'].value.toLowerCase() : '';

  var alreadyPlain = /\.(txt|xml|json|md)$/.test(request.uri);

  if (accept.indexOf('text/markdown') !== -1 && !alreadyPlain) {
    request.uri = '/llms-full.txt';
  }

  return request;
}
