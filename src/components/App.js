import React, { Component } from 'react';
import Header from './Header';
import { Switch, Route, Redirect } from 'react-router-dom';
import LinkList from './LinkList';
import CreateLink from './CreateLink';
import Login from './Login';

class App extends Component {
  render() {
    return ([
      <Header key="1" />,
      <Switch key="2">
        <Route exact path="/" render={() => <Redirect to='/new/1' />} />
        <Route exact path="/create" component={CreateLink} />
        <Route exact path="/login" component={Login} />
        <Route exact path='/top' component={LinkList} />
        <Route exact path='/new/:page' component={LinkList} />
      </Switch>
    ]
    )
  }
}

export default App
