import React, { Component } from 'react';
import { Route, BrowserRouter as Router, Redirect, Switch } from 'react-router-dom'
import { firebaseAuth } from './auth'

import Home from './Home.js';
import Dashboard from './Dashboard.js';
import Register from './Register';
import Login from './Login'
import Stocks from './Stocks'
import stockPage from './stockPage'

function PrivateRoute({ component: Component, authed, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} {...rest} />
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

let allSymbols = [];

(() => {
  fetch("https://cloud.iexapis.com/stable/ref-data/symbols?token=pk_95c4a35c80274553987b93e74bb825d7")
    .then(res => res.json())
    .then(result => {
      allSymbols = result.map((val) => {
        return val
      })
    })
})()

class App extends Component {
  state = {
    authed: false,
    loading: true,
  }
  componentDidMount() {
    setTimeout(() => {

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
          
  }, 2500);
  }
  componentWillUnmount() {
    this.removeListener()
  }
  render() {
    return this.state.loading ?
      <div className="loader-background">
        <ul className="loader">
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      : (
        <Router>
          <div className="container">
            <Switch>
              <PublicRoute authed={this.state.authed} exact path="/" component={Home} />
              <PublicRoute authed={this.state.authed} path="/register" component={Register} />
              <PublicRoute authed={this.state.authed} path="/login" component={Login} />
              <PrivateRoute authed={this.state.authed} path="/dashboard" component={Dashboard} />
              <PrivateRoute authed={this.state.authed} path="/stocks" component={Stocks} />
              {allSymbols.map((val,index) =>{
                return <PrivateRoute key={index} authed={this.state.authed} path={"/" + val.symbol} component={stockPage} symbol={val.symbol}/>

              })}
            </Switch>
          </div>
        </Router>
      );
  }
}

export default App;