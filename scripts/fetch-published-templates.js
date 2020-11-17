#!/usr/bin/env node

const fs = require('fs-extra')
const got = require('got')

const input = 'https://api.manuscripts.io/api/v1/publishedTemplates'
const output = 'dist/shared/published-templates.json'

got(input)
  .then((response) => {
    if (response.statusCode !== 200) {
      throw new Error(`Error ${response.statusCode}`)
    }

    return JSON.parse(response.body)
  })
  // TODO: filter/validate?
  .then((items) =>
    fs.writeJSON(output, items, {
      spaces: 2,
    })
  )
  .then(() => {
    console.log('Finished')
  })
  .catch((error) => {
    console.error(error)
  })
