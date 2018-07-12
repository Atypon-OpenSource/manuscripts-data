#!/usr/bin/env node

const Promise = require('bluebird')
const Database = require('better-sqlite3')
const fs = require('fs-extra')
const globby = require('globby')
const path = require('path')

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

    return fs.writeJSON(`./data/${basename}.json`, docs, {
      spaces: 2
    })
  },
  { concurrency: 1 }
).then(() => {
  console.log('finished importing')
}).catch(error => {
  console.error(error.message)
})
