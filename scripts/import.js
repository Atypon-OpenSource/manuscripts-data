#!/usr/bin/env node

require('dotenv-safe').config()
const axios = require('axios')
const Promise = require('bluebird')
const fs = require('fs-extra')
const globby = require('globby')

Promise.map(
  globby('data/*.json'),
  file => fs.readJSON(file).then(docs => axios({
    method: 'post',
    url: `${process.env.SYNC_GATEWAY_URL}/${process.env.SHARED_DATA_BUCKET}/_bulk_docs`,
    auth: {
      username: process.env.COUCHBASE_RBAC_USERNAME,
      password: process.env.COUCHBASE_RBAC_PASSWORD,
    },
    data: ({
      docs,
      new_edits: true
    }),
  })),
  { concurrency: 5 }
).then(() => {
  console.log('finished importing')
}).catch(error => {
  console.error(error.message)
})
