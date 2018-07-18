#!/usr/bin/env bash

set -e # exit if any step fails
set -u # exit if a variable isn't set

aws s3 sync --acl "public-read" data/ s3://${S3_BUCKET}/shared-data
aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/shared-data/*"
