# manuscripts-data

This repository contains source data for use by Manuscripts client applications, plus scripts for building and deploying the data to S3 and a Docker image.

## Data sources

### CSL submodules

The CSL locale and style files are published by [the CSL project](https://citationstyles.org/).

* `csl/locales` - the official [Citation Style Language (CSL) locale files](https://github.com/citation-style-language/locales).
* `csl/styles` - the official [distribution of validated CSL citation styles](https://github.com/citation-style-language/styles-distribution).

Run `scripts/update.sh` to update these sources.

### Couchbase Lite databases

* `couchbase/*.cblite` - databases from the Manuscripts desktop repository.

Run `node scripts/extract-databases.js` to extract the objects from these databases to JSON files. This happens automatically as part of the build process, so the extracted JSON files are not committed to version control.

### JSON files

* `shared/*.json` - JSON files from the Manuscripts desktop repository.

## Development

1. Clone this repository and run `git submodule update --init --recursive`.
1. Run `yarn build` to generate and populate the `dist` directory.
1. Run `yarn dev` to serve the files from the `dist` directory.

