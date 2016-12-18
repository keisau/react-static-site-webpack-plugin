import path from 'path'

import RawSource from 'webpack-sources/lib/RawSource'
import _eval from 'eval'
import Promise from 'bluebird'

export default class {
  constructor(name, context) {
    Object.assign(this, {
      name,
      context
    })
  }

  /**
   * given a <Route> node, a prefix and a results array,
   * search for endpoint components and push the resulted path to
   * the results array.
   * a typical DFS algorithm
   */
  search(node, prefix, array) {
    let component = null
    let name = null
    let children = null
    let indexRoute = null

    if (node.props != null) {
      component = node.props.component
      name = node.props.path || '/'
      children = node.props.children
      indexRoute = node.props.indexRoute
    } else {
      component = node.component
      name = node.path || '/'
      children = node.children
      indexRoute = node.indexRoute
    }

    if (children != null) {
      if (!Array.isArray(children)) {
        children = [ children ]
      }
      children.forEach(child => this.search(child, path.join(prefix, name), array))
    } else if (indexRoute != null) {
      this.search(indexRoute, path.join(prefix, name), array)
    } else if (component != null) {
      try {
        const destPath = path.join(prefix, name)

        array.push({ route: node, routePath: destPath })
      } catch(err) {
        console.error(err.stack)
      }
    }
    return array
  }

  getAsset(name, compilation, { assetsByChunkName }) {
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

  apply(compiler) {
    compiler.plugin('this-compilation', (compilation) => {
      compilation.plugin('optimize-assets', (_, cb) => {
        const stats = compilation.getStats().toJson()

        try {
          const { name, context } = this
          const asset = this.getAsset(name, compilation, stats)

          let entry = _eval(asset.source(), true)
          if (entry.hasOwnProperty('default')) {
            entry = entry['default']
          }

          const { routes, render } = entry

          const pathArray = this.search(routes, '/', [])
          const promises = pathArray.map(({ routePath, route }, i, paths) => {
            //const route = this.followPath([ routes ], routePath).filter(res => res != null)[0]
            const outputFile = path.join(routePath, 'index.html')
            const promise = new Promise((resolve, reject) => {
              const retval = render({ paths, path: routePath, route, context }, (err, data) => {
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
}
