import path from 'path'
import React from 'react'
import { render } from 'react-dom'
import { renderToString } from 'react-dom/server'
import { Router, RouterContext, match } from 'react-router'
import { createHistory, createMemoryHistory } from 'history'

require('../styles/stylesheet.css')
import routes from './routes'

export default {
  routes,
  render({ paths }) {
    const history = createMemoryHistory()
    const location = history.location

    const template = require('handlebars?name=[name].[ext]!../index.html')

    return new Promise((resolve, reject) => {
      match({ routes, location }, (error, redirectLocation, renderProps) => {
        const result = template({
          app: renderToString(<RouterContext {...renderProps} />)
        })

        resolve(result)
      })
    })
  }
}
