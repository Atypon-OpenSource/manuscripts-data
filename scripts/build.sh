#!/usr/bin/env bash

set -e # exit if any step fails

# copy CSL styles
mkdir -p dist/csl/styles
find csl/styles -name '*.csl' -exec cp "{}" dist/csl/styles/ \;
# TODO: rewrite dependent styles?

# copy CSL locales
node scripts/build-locales-json.js
find csl/locales -maxdepth 1 -name '*.xml' -exec cp "{}" dist/csl/locales/ \;

# build CSL styles files
node scripts/build-styles.js

# copy shared data
mkdir -p dist/shared
find shared -maxdepth 1 -name '*.json' -exec cp "{}" dist/shared/ \;

# extract shared data from databases
node scripts/extract-databases.js

# verify extracted data
node scripts/verify-bundles.js
node scripts/verify-templates.js

# write bundle index
node scripts/build-issn-bundle-index.js
