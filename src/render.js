import path from 'path'

import Handlebars from 'handlebars'
import { renderToString } from 'react-dom/server'
import React from 'react'

import { mkdirp, fs } from './utils'

/* dfs on the route tree, generate index.html upon leaf nodes */
async function _render(node, prefix, options) {
  const { name, app, children } = node.props
  let source = '{{{ app }}}'
  if (options != null && options.template != null) {
    source = options.template
  }
  const template = Handlebars.compile(source)

  React.Children.forEach(children, child => _render(child, path.resolve(prefix, name), options))

  if (app != null) {
    try {
      const destPath = path.resolve(prefix, name)
      const destFile = path.resolve(destPath, 'index.html')
      const cwd = process.cwd()

      // mkdirp
      await mkdirp.mkdirpAsync(destPath)

      // chdir
      process.chdir(destPath)

      // write rendered html to file
      await fs.writeFileAsync(destFile, template({
        app: renderToString(app)
      }))
      
      process.chdir(cwd)
    } catch(err) {
      console.error(err.stack)
    }
  }
}

export default function (root, dir, options) {
  _render.apply(this, arguments)
}
