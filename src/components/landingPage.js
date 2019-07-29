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
        <h1>MEET THE NEW STANDARTS FOR MARKET TRADING</h1>
        <img src={require("../images/mockup.png")} alt="preview"/>
      </div>
      <div className="background">
        <svg width="100%" height="100">
          <path d="M600 0 L0 0 L1200 1250 Z" />
          <path d="M0 0 L0 1000 L1100 1040 Z" />
        </svg>
      </div>
    </div>
  );
};
export default LandingPage;
