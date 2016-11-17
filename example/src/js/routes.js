import React from 'react'
import { Route } from 'react-router'

import Home from './components/home'

export default (
	<Route path='/' component={Home} >
		<Route path='world' component={Home}/>
	</Route>
)
