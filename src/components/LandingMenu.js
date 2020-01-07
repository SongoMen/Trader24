import React, { useState } from "react";
import { Link } from "react-router-dom";
import { firebaseAuth } from "./auth";

function LandingMenu(props) {
  const [logged, setUser] = useState(null);
  function userCheck() {
    firebaseAuth().onAuthStateChanged(user => {
      if (user) {
        setUser(true);
      } else {
        setUser(false);
      }
    });
  }
  userCheck();
  return (
    <nav className="header">
      <div className="header__logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g>
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M3.897 17.86l3.91-3.91 2.829 2.828 4.571-4.57L17 14V9h-5l1.793 1.793-3.157 3.157-2.828-2.829-4.946 4.946A9.965 9.965 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.987 9.987 0 0 1-8.103-4.14z" />
          </g>
        </svg>
        <h3>TRADER24</h3>
        <span className="header__line" />
        <h6>ALPHA</h6>
      </div>
      {logged === false ? (
        <ul className="header__menu">
          <Link to={props.url}>
            <li>
              <button type="submit" className="header__button-login">
                {props.name}
              </button>
            </li>
          </Link>
          <Link to={props.url2}>
            <li>
              <button type="submit" className="header__button-register">
                {props.name2}
              </button>
            </li>
          </Link>
        </ul>
      ) : (
        <Link to="/dashboard">
          <button type="submit" className="header__button-register">
            DASHBOARD
          </button>
        </Link>
      )}
    </nav>
  );
}

export default LandingMenu;
