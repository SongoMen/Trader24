import React, { Component } from 'react';
import { Route, BrowserRouter as Router, Redirect, Switch } from 'react-router-dom'
import { firebaseAuth } from './auth'

import Home from './Home.js';
import Dashboard from './Dashboard.js';
import Register from './Register';
import Login from './Login'

function PrivateRoute({ component: Component, authed, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />}
    />
  )
}

function PublicRoute({ component: Component, authed, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => authed === false
        ? <Component {...props} />
        : <Redirect to='/Dashboard' />}
    />
  )
}

class App extends Component {
  state = {
    authed: false,
    loading: true,
  }
  componentDidMount() {
    this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authed: true,
          loading: false,
        })
      } else {
        this.setState({
          authed: false,
          loading: false
        })
      }
    })
  }
  componentWillUnmount() {
    this.removeListener()
  }
  render() {
    return this.state.loading ?
    <div className="loader-background">
      <div className="loader">
        <div className="loader-inner" />
      </div>
      </div>
      : (
        <Router>
          <div className="container">
            <Switch>
              <PublicRoute authed={this.state.authed} exact path="/" component={Home} />
              <PublicRoute authed={this.state.authed} path="/register" component={Register} />
              <PublicRoute authed={this.state.authed} path="/login" component={Login} />
              <PrivateRoute authed={this.state.authed} path="/dashboard" component={Dashboard} />
            </Switch>
          </div>
        </Router>
      );
  }
}

export default App;