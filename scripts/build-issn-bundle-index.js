#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')

const input = 'dist/shared/bundles.json'
const output = 'dist/shared/issn-bundle-index.json'

const bundles = fs.readJSONSync(input)
const mapping = {}

// TODO: ignore child if parent exists with same ISSN?
const checkForDuplicate = (issn, bundle) => {
  if (mapping[issn]) {
    console.log(`Duplicate ISSN: ${issn}\n\t${bundle._id}\n\t${mapping[issn]}`)
  }
}

for (const bundle of bundles) {
  if (bundle.csl) {
    const { cslIdentifier, ISSNs, eISSNs } = bundle.csl

    const id = path.basename(cslIdentifier)

    if (fs.existsSync(`dist/csl/styles/${id}.csl`)) {
      // TODO: handle duplicates with ISSN + article type key?

      if (ISSNs) {
        for (const issn of ISSNs) {
          checkForDuplicate(issn, bundle)
          mapping[issn] = bundle._id
        }
      }

      if (eISSNs) {
        for (const issn of eISSNs) {
          checkForDuplicate(issn, bundle)
          mapping[issn] = bundle._id
        }
      }
    }
  }
}

fs.writeJSONSync(output, mapping, {
  spaces: 2,
})
