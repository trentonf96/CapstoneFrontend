import {
    IonButton,
    IonContent,
    IonGrid,
    IonHeader,
    IonPage, IonRow,
    IonTitle,
    IonToolbar,
    IonToast
} from '@ionic/react';
import React, {Component} from "react";
import './Login.css';
import '../App';
import {hideTabs} from "../App";
import Register from "./Register";
import TextField from "@mui/material/TextField";

let message = "";

class Login extends Component <{},{user:string, pass:string, showToast:boolean}> {

    queryString = btoa(window.location.href);

    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = {
            user: "",
            pass: "",
            showToast: false
        }
    };

    componentDidMount() {
        hideTabs();
    }

    onChange = (e: any) => {
        this.setState({...this.state,[e.target.name]:e.target.value})
    }

    fetchUser = () => {
        console.log("FETCH");
        fetch(`http://34.125.224.168:8080/user?url=${this.queryString}&username=${this.state.user}&pass=${btoa(this.state.pass)}`, {
            method: 'GET',
            redirect: 'follow',
        }).then(response => {
            if(response.redirected)
            {
                window.sessionStorage.setItem("username",this.state.user);
                window.location.href = response.url;
            } else {
                message = "Login Failed";
                this.setState({showToast:true});
            }
        })
            .catch(err => {
                console.error(err);
            });
    }

    addUser = (username:string,password:string) => {
        let data = {'username':username,'password':btoa(password)};
        console.log(data);
        console.log("FETCH");
        fetch("http://34.125.224.168:8080/register", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        message = "User Registered";
        this.setState({showToast:true});
    }

    render() {

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar className="header">
                        <IonTitle>Audio Analyzer</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen>
                    <IonGrid class={"center"}>
                        <IonRow>
                            <div className="username">
                                <TextField autoFocus fullWidth label="Username" name="user" onChange={this.onChange} margin="normal" />
                            </div>
                        </IonRow>
                        <IonRow>
                            <div className="username">
                                <TextField type="password" fullWidth label="Password" name="pass" onChange={this.onChange} margin="normal" />
                            </div>
                        </IonRow>
                        <IonRow>
                            <div className="login">
                                <IonButton onClick={() => this.fetchUser()} size="large">
                                    Login
                                </IonButton>
                            </div>
                        </IonRow>
                        <IonRow>
                            <div className="register">
                                <Register addUser={this.addUser} />
                            </div>
                        </IonRow>
                    </IonGrid>
                    <IonToast
                        isOpen={this.state.showToast}
                        onDidDismiss={() => this.setState({ showToast: false })}
                        message={message}
                        duration={2000}
                    />
                </IonContent>
            </IonPage>
        )
    }
}

export default Login;
