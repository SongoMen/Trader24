import React from "react";
import {Link} from 'react-router-dom'

export default class Admin extends React.Component {
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
      </div>
    );
  }
}
