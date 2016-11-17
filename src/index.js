import path from 'path'

import render from './render'
import Route from './route'
import Image from './image'

export {
  render,
  Route,
  Image
}

function ReactStaticSitePlugin(name) {
  Object.assign(this, {
    name
  })
}

async function _render(node, prefix, options) {
  const { name, component, children } = node.props
  let source = '{{{ app }}}'
  if (options != null && options.template != null) {
    source = options.template
  }
  const template = Handlebars.compile(source)

  React.Children.forEach(children, child => _render(child, path.resolve(prefix, name), options))

  if (component != null) {
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
        app: renderToString(component)
      }))

      process.chdir(cwd)
    } catch(err) {
      console.error(err.stack)
    }
  }
}

ReactStaticSitePlugin.prototype.apply = function(compiler) {
  compiler.plugin('this-compilation', (compilation) => {
    compilation.plugin('optimize-assets', (_, cb) => {
      //console.log(compilation, _)

      const entryPath = compilation.options.entry[this.name]

      console.log(entryPath)
      let entry = require(entryPath)
      if (entry.hasOwnProperty('default')) {
        entry = entry['default']
      }

      const { template, routes, render } = entry

      //_render(routes, outputPath, { template })
      cb()
    })
  })
}

module.exports =  ReactStaticSitePlugin
