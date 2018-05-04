import React, { Component } from 'react'
import Header from './Header'
import { Switch, Route, Redirect } from 'react-router-dom'
import Loadable from 'react-loadable'

const makeItLoadable = (path) => Loadable({
  loader: () => import(`${path}`),
  loading: () => <div>Loading...</div>
})

class App extends Component {
  render() {
    return ([
      <Header key='1' />,
      <Switch key='2'>
        <Route exact path='/' render={() => <Redirect to='/new/1' />} />
        <Route exact path='/create' component={makeItLoadable('./CreateLink')} />
        <Route exact path='/login' component={makeItLoadable('./Login')} />
        <Route exact path='/new/:page' component={makeItLoadable('./LinkList')} />
      </Switch>
    ]
    )
  }
}

export default App
