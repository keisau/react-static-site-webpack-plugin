import React from 'react'
import cli from 'cli'
import path from 'path'

import { fs } from './utils'
import render from './render'

cli.enable('help', 'version')
cli.parse({
  site: [ 's', 'path to site tree file', 'file', null ],
  template: [ 't', 'path to index.html template file', 'file', null ]
})

const { options: { site, template } } = cli

async function task(routePath, templatePath) {
  try {
    const { site } = require(path.resolve('.', routePath))
    const template = templatePath != null ? await fs.readFileAsync(path.resolve('.', templatePath), 'utf8') : null

    console.log({ template })

    render(site, '.', { template })
  } catch(err) {
    console.error(err.stack)
  }
}

if (site != null) {
  task(site, template)
}
