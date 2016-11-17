import path from 'path'

import RawSource from 'webpack-sources/lib/RawSource'
import _eval from 'eval'
import Promise from 'bluebird'

function ReactStaticSitePlugin(name) {
  Object.assign(this, {
    name
  })
}

function search(node, prefix, array) {
  const { component } = node.props
  const name = node.props.path
  let { children } = node.props

  if (children != null) {
    if (!Array.isArray(children)) {
      children = [ children ]
    }
    children.forEach(child => search(child, path.join(prefix, name), array))
  }

  if (component != null) {
    try {
      const destPath = path.join(prefix, name)
      // const destFile = path.join(destPath, 'index.html')

      array.push(destPath)
    } catch(err) {
      console.error(err.stack)
    }
  }
  return array
}

function getAsset(name, compilation, { assetsByChunkName }) {
  let retval = compilation.assets[name]

  if (retval != null) {
    return retval
  }

  retval = assetsByChunkName[name]
  if (retval == null) {
    return null
  }

  if (Array.isArray(retval)) {
    retval = retval[0]
  }

  return compilation.assets[retval]
}

ReactStaticSitePlugin.prototype.apply = function(compiler) {
  compiler.plugin('this-compilation', (compilation) => {
    compilation.plugin('optimize-assets', (_, cb) => {
      const stats = compilation.getStats().toJson()

      const asset = getAsset(this.name, compilation, stats)

      const entryPath = compilation.options.entry[this.name]
      const { outputPath } = compiler

      let entry = _eval(asset.source(), true)
      if (entry.hasOwnProperty('default')) {
        entry = entry['default']
      }

      const { template, routes, render } = entry

      const promises = search(routes, '/', []).map((result, i, paths) => {
        const resultPath = path.join(outputPath, result)

        const promise = render({ paths })
        const outputFile = path.join(result, 'index.html')

        return promise.then(output => {
          compilation.assets[outputFile] = new RawSource(output)
        })
      })

      //_render(routes, outputPath, { template, placeholder: 'component' })
      Promise.all(promises).nodeify(cb)
    })
  })
}

module.exports =  ReactStaticSitePlugin
