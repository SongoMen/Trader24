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
            <div>

                <input id="login__username" type="text" name="username" className="form__input" placeholder="Username" required ref={(username) => this.username = username} />


                <input id="login__email" type="text" name="email" className="form__input" placeholder="Email" required ref={(email) => this.email = email} />

                <input id="login__password" type="password" name="password" className="form__input" placeholder="Password" required ref={(password) => this.password = password} />

                <input type="submit" value="Sign In" onClick={event => this.handleClickRegisterUser(event, this.props.role)} />
            </div>
        )
    }
}

export default Register