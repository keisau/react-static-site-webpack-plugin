import path from 'path'
import React from 'react'
import { render } from 'react-dom'
import { renderToString } from 'react-dom/server'
import { Router, RouterContext, match, Route, IndexRoute } from 'react-router'
import { createHistory, createMemoryHistory } from 'history'

require('../styles/stylesheet.css')

const App = ({ children }) => (
  <div>
    { children != null ? React.Children.only(children): '' }
  </div>
)

const Home = ({ data }) => (
  <div>
    <h1>Hello World!</h1>
    <i className='fa fa-copyright'></i> 2016 All Rights Reserved.
    <br />
    Designed and coded by
    <br />
    <a href='mailto:keisau.ching@pierresaux.me'>
      {`Keisau 'PierreSaux' CHING`}
    </a>
  </div>
)

const Index = ({ data }) => (
  <div>
    <h1>Index Page</h1>
    <i className='fa fa-copyright'></i> 2016 All Rights Reserved.
    <br />
    Designed and coded by
    <br />
    <a href='mailto:keisau.ching@pierresaux.me'>
      {`Keisau 'PierreSaux' CHING`}
    </a>
  </div>
)

const routes = (
  <Route path='/' component={App} >
    <IndexRoute title='Index' component={Index} />
    <Route path='home' title='Home' component={Home}/>
  </Route>
)

export default {
  routes,
  render({ paths, path, route }) {
    const history = createMemoryHistory()
    const location = history.location

    /* access route's props */
    const { title } = route.props

    const template = require('handlebars?name=[name].[ext]!../index.html')

    return new Promise((resolve, reject) => {
      match({ routes, location }, (err, redirectLocation, renderProps) => {
        if (err != null) {
          return reject(err)
        }

        const result = template({
          app: renderToString(<RouterContext {...renderProps} />),
          title
        })

        resolve(result)
      })
    })
  }
}
