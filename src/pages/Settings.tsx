import {IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import './Settings.css';
import React from "react";
import {showTabs} from "../App";

class Settings extends React.Component {

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(props: {} | Readonly<{}>) {
        super(props);
    };

    componentDidMount() {
        showTabs();
    }

    render() {

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar className="header">
                        <IonTitle size="small">Settings</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen>
                    <div className="contain">
                        <div className="logout">
                            <IonButton size="large" onClick={() => {
                                window.sessionStorage.clear();
                                window.location.href = "/login"
                            }}>
                                Logout
                            </IonButton>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        )
    }
}

export default Settings;
