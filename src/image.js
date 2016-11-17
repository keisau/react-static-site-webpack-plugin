import path from 'path'
import crypto from 'crypto'
import React, { Component } from 'react'

import { fs } from './utils'

class Image extends Component {
  render() {
    const props = Object.assign({}, this.props)
    const file = fs.readFileSync(props.src)
    const hash = crypto.createHash('sha256').update(file).digest('hex').substring(0, 7)
    const ext = path.extname(props.src)

    props.src = `./${hash}${ext}`
    fs.writeFileSync(props.src, file)

    return (
      <img {...props} />
    )
  }
}

export default Image
