const couchbase = require('couchbase')
const fs = require('fs-extra')
require('dotenv').config()

const projectsBucket = process.env.COUCHBASE_BUCKET

const splitString = (input, separator) =>
  input.split(separator).map((item) => item.trim())

const allowedOwners = splitString(process.env.COUCHBASE_ALLOWED_OWNERS, ';')

const cluster = new couchbase.Cluster(process.env.COUCHBASE_CONNECTION, {
  username: process.env.COUCHBASE_USERNAME,
  password: process.env.COUCHBASE_PASSWORD,
})

const bucket = cluster.bucket(projectsBucket)

const buildItem = (row) => {
  const { _sync, sessionID, containerID, templateID, ...item } = row.projects

  return { ...item, _id: row.id }
}

const findProjects = async () => {
  const query = `SELECT *, META().id FROM \`${bucket.name}\` WHERE objectType = 'MPProject' AND templateContainer = true AND _deleted IS MISSING AND ANY owner IN projects.owners SATISFIES owner IN $1 END`

  const result = await cluster.query(query, {
    parameters: [allowedOwners],
  })

  // TODO: forEach?
  return result.rows.map(buildItem)
}

const findTemplatesInProject = async (project) => {
  const query = `SELECT *, META().id FROM \`${bucket.name}\` WHERE objectType = 'MPManuscriptTemplate' AND containerID = $1 AND _deleted IS MISSING`

  const result = await cluster.query(query, {
    parameters: [project._id],
  })

  return result.rows.map(buildItem)
}

const findModelsInTemplate = async (project, template) => {
  const query = `SELECT *, META().id FROM \`${bucket.name}\` WHERE containerID = $1 AND templateID = $2 AND _deleted IS MISSING`

  const result = await cluster.query(query, {
    parameters: [project._id, template._id],
  })

  return result.rows.map(buildItem)
}

const fetchPublishedTemplates = async () => {
  // this ensures that an error is thrown if the connection doesn't open correctly
  const diagnostics = await cluster.diagnostics()
  console.log(diagnostics.services[0].status)

  console.log(`Fetching templates published by ${allowedOwners.join(', ')}`)

  const output = []

  const projects = await findProjects()

  for (const project of projects) {
    console.log(`"${project.title}" (${project._id})`)
    const templates = await findTemplatesInProject(project)

    for (const template of templates) {
      console.log(`\t"${template.title}" (${template._id})`)
      output.push(template)

      const templateItems = await findModelsInTemplate(project, template)

      output.push(...templateItems)
    }
  }

  return output
}

fetchPublishedTemplates()
  .then((output) => {
    fs.writeJSONSync('shared/published-templates.json', output, { spaces: 2 })
    console.log('Written shared/published-templates.json')
  })
  .catch((error) => {
    console.error(error)
  })
  .finally(() => {
    cluster.close()
  })

// module.exports = { fetchPublishedTemplates }
