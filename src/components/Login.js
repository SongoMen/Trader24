import React from 'react'
import { login, auth } from './auth'

export default class Login extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            msg:""
        }
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(e) {
        e.preventDefault()
        login(this.email.value, this.password.value)
            .catch((error) => {
                this.setState({
                    msg:"Wrong Email or password"
                })
            })
    }
    render() {
        return (
            <div className="limiter">
                <div className="container-register">
                    <div className="wrap-register">
                        <div className="register-pic js-tilt" data-tilt=""><img src={require('../images/img-01.png')} alt=
                            "IMG" /></div>

                        <form className="register-form validate-form">
                            <span className="register-form-title">Member Login</span>

                            <div className="wrap-input " >
                                <input className="input" type="text" name="email" placeholder="Email" required ref={(email) => this.email = email} />
                            </div>

                            <div className="wrap-input " data-validate="Password is required">
                                <input className="input" type="password" name="pass" placeholder="Password" required ref={(password) => this.password = password} />
                            </div>

                            <div className="container-register-form-btn">
                                <button type="button" className="register-form-btn" onClick={event => this.handleClickRegisterUser(event, this.props.role)}>Register</button>
                            </div>

                            <div className="text-center">
                                <span className="txt1">Forgot</span> <a className="txt2" href="">Password ?</a>
                            </div>

                            <div className="text-center">
                                <span className="txt2">Doesn't have an account ?<a className="txt2" href="Register"> Register here</a></span>
                            </div>
                            {this.state.msg !== "" ?
                                <h3 style={{ color: "green" }}>{this.state.msg}</h3>
                                :
                                <div />}
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}
