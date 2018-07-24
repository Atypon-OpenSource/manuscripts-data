#!/usr/bin/env bash

set -e # exit if any step fails
set -u # exit if a variable isn't set

aws s3 sync \
    --content-type "application/vnd.citationstyles.style+xml" \
    --acl "public-read" \
    dist/csl/styles s3://${S3_BUCKET}/data/csl/styles

aws s3 sync \
    --acl "public-read" \
    dist/csl/locales s3://${S3_BUCKET}/data/csl/locales

aws s3 sync \
    --acl "public-read" \
    dist/shared s3://${S3_BUCKET}/data/shared
