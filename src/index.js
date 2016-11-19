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
    const { component } = node.props
    const name = node.props.path || '/'
    let { children } = node.props

    if (children != null) {
      if (!Array.isArray(children)) {
        children = [ children ]
      }
      children.forEach(child => this.search(child, path.join(prefix, name), array))
    } else if (component != null) {
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

  /**
   * find out a route given a target path,
   * a path matching algorithm
   */
  followPath(routes, targetPath) {
    const pathChunks = targetPath.split('/')
    let results = []

    for (let i = 0; i < routes.length; ++i) {
      const route = routes[i]
      const routePath = route.props.path
      let { children } = route.props
      children = Array.isArray(children) ? children : [ children ]
      children = children.filter(child => child != null)

      /* IndexRoute */
      if ((targetPath === '/' || targetPath === '') && routePath == null) {
        return [ route ]
      }

      if (targetPath !== '/' && routePath == null) {
        continue
      }

      const routePathChunks = routePath.split('/')

      let hasMatch = false
      let j = 0

      /* path following */
      for (; j < pathChunks.length && j < routePathChunks.length; ++j) {
        if (routePathChunks[j] !== pathChunks[j]) {
          break
        } else {
          hasMatch = true
        }
      }

      if (hasMatch) {
        if (j === pathChunks.length && children.length === 0) {
          return [ route ]
        } else {

          results = results.concat(this.followPath(children, pathChunks.splice(j).join('/')))
        }
      }
    }

    return results
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
          const promises = pathArray.map((result, i, paths) => {
            const route = this.followPath([ routes ], result).filter(res => res != null)[0]
            const outputFile = path.join(result, 'index.html')
            const promise = new Promise((resolve, reject) => {
              const retval = render({ paths, path: result, route, context }, (err, data) => {
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
