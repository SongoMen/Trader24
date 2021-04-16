import React from "react";

import LandingMenu from "./LandingMenu";

const LandingPage = () => (
  <div className="landing-page">
    <LandingMenu name="LOGIN" url="/login" name2="REGISTER" url2="/register" />
    <div className="landing-page__heading">
      <h1>MEET THE NEW STANDARDS FOR MARKET TRADING BY ANAND420</h1>
      <img src={require("../../images/mockup.png")} alt="preview" />
    </div>
    <div className="landing-page__background">
      <svg width="100%" height="100">
        <path d="M600 0 L0 0 L3200 5250 Z" />
        <path d="M0 0 L0 2000 L4100 4040 Z" />
      </svg>
    </div>
  </div>
);
export default LandingPage;
