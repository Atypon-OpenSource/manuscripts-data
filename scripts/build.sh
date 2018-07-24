#!/usr/bin/env bash

# copy CSL styles
mkdir -p dist/csl/styles
find csl/styles -name '*.csl' -exec cp "{}" dist/csl/styles/ \;
# TODO: rewrite dependent styles?

# copy CSL locales
mkdir -p dist/csl/locales
cp csl/locales/locales.json dist/csl/locales/
find csl/locales -maxdepth 1 -name '*.xml' -exec cp "{}" dist/csl/locales/ \;

# copy shared data
mkdir -p dist/shared
find shared -maxdepth 1 -name '*.json' -exec cp "{}" dist/shared/ \;

# extract shared data from databases
node scripts/extract-databases.js
