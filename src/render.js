import path from 'path'

import Handlebars from 'handlebars'
import { renderToString } from 'react-dom/server'
import React from 'react'

import { mkdirp, fs } from './utils'

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
      const destPath = path.resolve(prefix, name, 'index.html')

      // mkdirp
      await mkdirp.mkdirpAsync(path.resolve(prefix, name))

      // write rendered html to file
      await fs.writeFileAsync(destPath, template({
        app: renderToString(app)
      }))
    } catch(err) {
      console.error(err.stack)
    }
  }
}

export default function (root, dir, options) {
  _render.apply(this, arguments)
}
