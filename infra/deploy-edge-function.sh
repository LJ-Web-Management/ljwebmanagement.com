#!/usr/bin/env bash
# Creates or updates the CloudFront Function from
# infra/cloudfront-functions/edge.js and publishes it to LIVE.
# Usage: infra/deploy-edge-function.sh <function-name>
# Needs AWS credentials allowed to call cloudfront:DescribeFunction,
# CreateFunction, UpdateFunction and PublishFunction. Associating the
# function with the distribution is a one-time step; see infra/README.md.
set -euo pipefail

NAME="${1:?usage: $0 <function-name>}"
CODE="$(dirname "$0")/cloudfront-functions/edge.js"
CONFIG='Comment="www.ljwebmanagement.com markdown negotiation, API and markdown 404s",Runtime="cloudfront-js-2.0"'

if ETAG=$(aws cloudfront describe-function --name "$NAME" --stage DEVELOPMENT --query ETag --output text 2>/dev/null); then
  ETAG=$(aws cloudfront update-function --name "$NAME" --if-match "$ETAG" --function-config "$CONFIG" --function-code "fileb://$CODE" --query ETag --output text)
else
  ETAG=$(aws cloudfront create-function --name "$NAME" --function-config "$CONFIG" --function-code "fileb://$CODE" --query ETag --output text)
fi

# Smoke test in CloudFront's own runtime before going live.
EVENT=$(mktemp)
printf '%s' '{"version":"1.0","context":{"eventType":"viewer-request"},"viewer":{"ip":"1.2.3.4"},"request":{"method":"GET","uri":"/","querystring":{},"headers":{"accept":{"value":"text/markdown"}},"cookies":{}}}' > "$EVENT"
RESULT=$(aws cloudfront test-function --name "$NAME" --if-match "$ETAG" --stage DEVELOPMENT --event-object "fileb://$EVENT" --query 'TestResult.FunctionOutput' --output text)
rm -f "$EVENT"
case "$RESULT" in
  *'/index.md'*) ;;
  *) echo "CloudFront test-function did not rewrite / to /index.md: $RESULT" >&2; exit 1 ;;
esac

aws cloudfront publish-function --name "$NAME" --if-match "$ETAG" > /dev/null
echo "Published CloudFront Function $NAME"
