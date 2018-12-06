#!/usr/bin/env node

const fs = require('fs-extra')
const got = require('got')
const parse = require('neat-csv')

const input = 'http://ftp.crossref.org/titlelist/titleFile.csv'
const output = 'dist/shared/journals.json'

got(input)
  .then(response => response.body)
  .then(parse)
  .then(items => items.map(item => ({
    title: item.JournalTitle.replace(/"/g, ''),
    publisher: item.Publisher.replace(/"/g, ''),
    ISSNs: [
      item.pissn,
      item.eissn,
      ...item.additionalIssns.split('|')
    ].filter(_ => _)
  })))
  .then(items => fs.writeJSON(output, items, {
    spaces: 2
  }))
  .then(() => {
    console.log('Finished')
  })
  .catch(error => {
    console.error(error)
  })
