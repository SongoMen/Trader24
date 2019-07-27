import React from "react";
import LandingMenu from "./LandingMenu";

const LandingPage = () => {
  return (
    <div className="landingPage">
      <LandingMenu
        name="LOGIN"
        url="/login"
        name2="REGISTER"
        url2="/register"
      />
      <div className="landing">
        <h1>
          MEET THE NEW STANDARTS FOR <br />
          MARKET TRADING
        </h1>
        <img src={require("../images/mockup.png")} />
      </div>
      <div className="background" />
    </div>
  );
};
export default LandingPage;
