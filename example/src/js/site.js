import fs from 'fs'

import React from 'react'
import { Route } from 'zingtaai'

import Home from './components/home'

const site = (
  <Route name='a' >
    <Route name='b'>
      <Route name='c' app={<Home data='hello world!' />} />
    </Route>
  </Route>
)

const mapping = {
  app: 'app',
  css: '/stylesheet.css'
}

export default {
  site,
  template: {
    source: fs.readFileSync('../index.html'),
    mappings: [
    ]
  }
}
