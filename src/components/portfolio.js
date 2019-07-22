import React from "react";
import Leftbar from './leftbar'
import { Link } from "react-router-dom";
import Topbar from "./topbar";

export default class portfolio extends React.Component {
    render(){
        return (
            <div className="portfolio">
                <Leftbar/>
                <div className="portfolio__container">
                <Topbar/>
                <h2>XXXXXXX</h2>
                </div>
            </div>
        )
    }
}