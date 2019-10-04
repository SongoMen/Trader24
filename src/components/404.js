import React from "react";
import { Link } from "react-router-dom";

export default class page404 extends React.Component{
    render(){
        return(
            <div className="page404">
                <h1>404</h1>
                <h4>Go back to <Link to="/dashboard">Dashboard</Link></h4>
            </div>
        );
    }
}