import React, { Component } from "react";
import {
  Route,
  BrowserRouter as Router,
  Redirect,
  Switch
} from "react-router-dom";
import { firebaseAuth } from "./auth";

import LandingPage from "./landingPage";
import Dashboard from "./Dashboard";
import Register from "./Register";
import Login from "./Login";
import Stocks from "./Stocks";
import stockPage from "./stockPage";
import portfolio from "./portfolio";
import page404 from "./404";
import Admin from "./Admin";

function PrivateRoute({ component: Component, authed, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        authed === true ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect
            to={{ pathname: "/login", state: { from: props.location } }}
          />
        )
      }
    />
  );
}

function PublicRoute({ component: Component, authed, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        authed === false ? (
          <Component {...props} />
        ) : (
          <Redirect to="/Dashboard" />
        )
      }
    />
  );
}

class App extends Component {
  state = {
    authed: false,
    loading: true,
    theme: ""
  };
  componentDidMount() {
    this.removeListener = firebaseAuth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          authed: true,
          loading: false
        });
      } else {
        this.setState({
          authed: false,
          loading: false
        });
      }
    });
  }
  componentWillUnmount() {
    this.removeListener();
  }

  componentWillMount() {
    let theme = localStorage.getItem("theme");
    if (
      window.location.href.split("/")[
        window.location.href.split("/").length - 1
      ] !== ""
    ) {
      if (theme !== null)
        this.setState({
          theme: theme
        });
      else
        this.setState({
          theme: "dark"
        });
    }
  }

  render() {
    if (this.state.theme === "light") {
      localStorage.setItem("theme", "light");
      document.getElementById("root").classList.add("light");
    }
    if (this.state.theme === "dark") {
      localStorage.setItem("theme", "dark");
      document.getElementById("root").classList.remove("light");
    }
    return this.state.loading ? (
      <div className="loader-background">
        <ul className="loader">
          <li />
          <li />
          <li />
        </ul>
      </div>
    ) : (
      <Router>
        <div className="container">
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <PublicRoute
              authed={this.state.authed}
              path="/register"
              component={Register}
            />
            <PublicRoute
              authed={this.state.authed}
              path="/login"
              component={Login}
            />
            <PrivateRoute
              authed={this.state.authed}
              path="/dashboard"
              component={Dashboard}
            />
            <PrivateRoute
              authed={this.state.authed}
              path="/allstocks"
              component={Stocks}
            />
            <PrivateRoute
              authed={this.state.authed}
              path="/portfolio"
              component={portfolio}
            />
            <PrivateRoute
              authed={this.state.authed}
              path="/admin"
              component={Admin}
            />
            <PrivateRoute
              name="stocks"
              authed={this.state.authed}
              path="/stocks/:symbol"
              component={stockPage}
              symbol={window.location.pathname.split("/")[2]}
            />
            <Route component={page404} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
