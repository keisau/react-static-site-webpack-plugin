import path from 'path'

import RawSource from 'webpack-sources/lib/RawSource'
import _eval from 'eval'
import Promise from 'bluebird'

function ReactStaticSitePlugin(name, context) {
  Object.assign(this, {
    name,
    context
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

      try {
        const { name, context } = this
        const asset = getAsset(name, compilation, stats)

        let entry = _eval(asset.source(), true)
        if (entry.hasOwnProperty('default')) {
          entry = entry['default']
        }

        const { routes, render } = entry

        const promises = search(routes, '/', []).map((result, i, paths) => {
          const outputFile = path.join(result, 'index.html')
          const promise = new Promise((resolve, reject) => {
            const retval = render({ paths, path: result, context }, (err, data) => {
              if (err != null) {
                return reject(err)
              }

              resolve(data)
            })

            /**
             * if render() returns a promise, resolve it
             * NOTE: this check is not necessary or sufficient
             */
            if (typeof retval.then === 'function') {
              resolve(retval)
            }
          })

          /* undefined behavior: if both cb and promise are provided, they will race to generate output file */
          return promise.then(output => {
            if (compilation.assets[outputFile] == null) {
              compilation.assets[outputFile] = new RawSource(output)
            }
          })
        })

        Promise.all(promises).nodeify(cb)
      } catch(err) {
        compilation.errors.push(err.stack)
        cb()
      }
    })
  })
}

module.exports = ReactStaticSitePlugin
