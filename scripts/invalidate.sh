#!/usr/bin/env bash

set -e # exit if any step fails
set -u # exit if a variable isn't set

aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/data/*"
