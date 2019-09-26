import React from "react";
import { Link } from "react-router-dom";
import firebase from "firebase/app";
import "firebase/firestore";

let usersInfo = {
  username: [],
  email: [],
  currentFunds: [],
  positions: [],
  isAdmin: []
};

export default class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
  }
  loadUsers() {
    firebase
      .firestore()
      .collection("users")
      .get()
      .then(snapshot => {
        if (snapshot.docs.length !== 0) {
          snapshot.forEach(doc => {
            usersInfo.username.push(doc.data().username);
            usersInfo.email.push(doc.data().email);
            usersInfo.currentFunds.push(doc.data().currentfunds);
            usersInfo.positions.push(doc.data().positions);
            usersInfo.isAdmin.push(doc.data().admin);
          });
        } else {
          this.setState({
            portfolioLoader: "nothing"
          });
        }
      });
  }
  componentDidMount() {
    this.loadUsers();
  }

  render() {
    return (
      <div className="devPanel">
        <div className="topbar">
          <Link to="/dashboard">
            <div className="topbar__dev">
              <h4>DASHBOARD</h4>
            </div>
          </Link>
        </div>

        <div className="devPanel__content">
          {this.state.loaded ? (
            <table>
              <tbody>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Current Money</th>
                  <th>Opened positions</th>
                  <th>Is admin</th>
                </tr>
                {usersInfo.username.map((val, index) => (
                  <tr>
                    <td>x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ul className="loader">
              <li />
              <li />
              <li />
            </ul>
          )}
        </div>
      </div>
    );
  }
}
