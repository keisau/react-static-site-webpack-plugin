import fs from 'fs'

import mkdirp from 'mkdirp'
import Promise from 'bluebird'

Promise.promisifyAll(fs)
Promise.promisifyAll(mkdirp)

export {
  Promise,
  fs,
  mkdirp
}
