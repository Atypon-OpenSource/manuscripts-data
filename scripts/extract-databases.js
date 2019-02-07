#!/usr/bin/env node

const Promise = require('bluebird')
const Database = require('better-sqlite3')
const fs = require('fs-extra')
const globby = require('globby')
const path = require('path')

fs.ensureDirSync('dist/shared')

Promise.map(
  globby('couchbase/*.cblite'),
  file => {
    const db = new Database(file, {
      readonly: true,
    })

    const docs = db.prepare('SELECT * FROM docs INNER JOIN revs on docs.doc_id = revs.doc_id WHERE revs.current=1 AND revs.deleted=0')
      .all()
      .map(({ json, docid }) => ({
        _id: docid,
        ...JSON.parse(json.toString()),
      }))

    const basename = path.basename(file, '.cblite')

    // remove derived data from templates JSON, to save space
    if (basename === 'templates-v2') {
      docs.forEach(doc => {
        delete doc.requirements
        delete doc.styles
      })
    }

    return fs.writeJSON(`dist/shared/${basename}.json`, docs, {
      spaces: 2
    })
  },
  { concurrency: 1 }
).then(() => {
  console.info('Finished extracting databases.')
}).catch(error => {
  console.error(error.message)
})
