#!/usr/bin/env node

const Database = require('better-sqlite3')
const fs = require('fs-extra')
const path = require('path')

fs.ensureDirSync('dist/shared')

// NOTE: need to extract bundles before templates
const files = ['bundles', 'templates-v2', 'symbols-v2', 'funders']

const bundleIDs = new Set()

for (const file of files) {
  const db = new Database(`couchbase/${file}.cblite`, {
    readonly: true,
  })

  let docs = db.prepare('SELECT * FROM docs INNER JOIN revs on docs.doc_id = revs.doc_id WHERE revs.current=1 AND revs.deleted=0')
    .all()
    .map(({ json, docid }) => ({
      _id: docid,
      ...JSON.parse(json.toString()),
    }))

  // remove bundles that reference missing CSL
  if (file === 'bundles') {
    docs = docs.filter(doc => {
      if (doc.csl) {
        const id = path.basename(doc.csl.cslIdentifier)

        if (!fs.existsSync(`dist/csl/styles/${id}.csl`)) {
          console.warn(`Removed bundle ${id} (${doc.csl.title})`)
          return false
        }
      }

      return true
    })

    docs.forEach(doc => {
      bundleIDs.add(doc._id)

      if (doc.csl) {
        delete doc.csl.objectType
      }
    })
  }

  // remove derived data and invalid bundles from templates JSON
  if (file === 'templates-v2') {
    docs = docs.filter(doc => {
      if (doc.objectType === 'MPManuscriptTemplate') {
        if (doc.bundle && !bundleIDs.has(doc.bundle)) {
          console.warn(`Removed template ${doc._id} (${doc.title})`)
          return false
        }
      }

      return true
    })

    docs.forEach(doc => {
      delete doc.requirements
      delete doc.styles
    })
  }

  fs.writeJSONSync(`dist/shared/${file}.json`, docs, {
    spaces: 2
  })
}

console.info('Finished extracting databases.')

