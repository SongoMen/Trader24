import React, { Component } from "react";
import { auth } from './auth'
import * as firebase from 'firebase';

const db = firebase.firestore();

function setErrorMsg(error) {
    return {
        registerError: error.message
    }
}

class Register extends Component {
    constructor(props) {
        super(props);

        this.handleClickRegisterUser = this.handleClickRegisterUser.bind(this);
    }
    handleClickRegisterUser(e) {
        var re = /^(([^<>()\\.,;:\s@"]+(\.[^<>()\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (this.password.value.length > 6 && re.test(String(this.email.value).toLowerCase())) {
            localStorage.setItem('password', this.password.value);
            localStorage.setItem('user', this.username.value);
            auth(this.email.value, this.password.value, this.username.value)
                .catch(e => this.setState(setErrorMsg(e)))
                let username = localStorage.getItem('user')
                let pw = localStorage.getItem('pw')
              
                db.collection("users").doc(this.username.value).set({
                  email: this.email.value,
                  username:this.username.value,
                  password:this.password.value,
                })
                .then(()=>{
                console.log("Xxx")})
                .catch(function(error) {
                    console.error("Error writing document: ", error);
                });
            setTimeout(() => {
                localStorage.removeItem('password');
                localStorage.removeItem('user');
            }, 1500);
        }
        if (this.password.value.length < 6) {
            alert("Password must have at least 6 characters");

        }
        if (re.test(String(this.email.value).toLowerCase()) === false) {
            alert("wrong email adress")
        }

    }
    render() {
        return (
            <div className="limiter">
            <div className="container-login">
              <div className="wrap-login">
                <div className="login-pic js-tilt" data-tilt=""><img src="images/img-01.png" alt=
                "IMG" /></div>
        
                <form className="login-form validate-form">
                  <span className="login-form-title">Member Login</span>
        
                  <div className="wrap-input validate-input" data-validate=
                  "Valid email is required: ex@abc.xyz">
                    <input className="input" type="text" name="email" placeholder="Email" />
                  </div>
        
                  <div className="wrap-input validate-input" data-validate="Password is required">
                    <input className="input" type="password" name="pass" placeholder="Password" />
                  </div>
        
                  <div className="container-login-form-btn">
                    <button className="login-form-btn">Login</button>
                  </div>
        
                  <div className="text-center p-t-12">
                    <span className="txt1">Forgot</span> <a className="txt2" href="#">Username /
                    Password?</a>
                  </div>
        
                  <div className="text-center p-t-136">
                    <a className="txt2" href="#">Create your Account </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
    }
}

export default Register