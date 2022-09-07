import {Directory, Filesystem, ReaddirResult} from '@capacitor/filesystem';
import {
    IonContent,
    IonText,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonPopover,
    IonProgressBar,
    IonGrid, IonRow
} from '@ionic/react';
import React from 'react';
import './Library.css';
import {showTabs} from "../App";
import Graphs from "./Graphs";

let files: string[] = [];
let dur1 = 0;
let dur2 = 0;

const loadFiles = async () => {
    console.log("loading files...");
    let result: ReaddirResult;
    result = await Filesystem.readdir({
        path: "",
        directory: Directory.Documents
    })
    files = [];
    result.files.forEach(element => {
        files.push(element);
    });
    return files;
};

class Library extends React.Component<{},{popover:boolean,value:string,value2:string,storedFileNames:string[]}> {
    private popover: React.RefObject<HTMLIonPopoverElement>;

    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.popover = React.createRef();
        this.state = {
            popover: false,
            value: "",
            value2: "",
            storedFileNames: []
        };
    };

    componentDidMount() {
        showTabs();
    }

    render() {

        const playRecording = async () => {
            $('.start1').toggle();
            $('.stop1').toggle();
            console.log("Loading and playing file: ", this.state.value);
            const audioFile = await Filesystem.readFile({
                path: this.state.value,
                directory: Directory.Documents
            });
            const recordData = audioFile.data;
            const audioRef = new Audio(`data:audio/aac;base64,${recordData}`);
            audioRef.oncanplaythrough = () => audioRef.play();
            audioRef.load();
            //audioRef.ended;

            audioRef.onloadedmetadata = function () {
                dur1 = audioRef.duration;
                console.log("   -> dur1 = ", dur1);
            };

            return dur1;
        };

        const playRecording2 = async () => {
            $('.start2').toggle();
            $('.stop2').toggle();
            console.log("Loading and playing file: ", this.state.value2);
            const audioFile = await Filesystem.readFile({
                path: this.state.value2,
                directory: Directory.Documents
            });
            const recordData = audioFile.data;
            const audioRef = new Audio(`data:audio/aac;base64,${recordData}`);
            audioRef.oncanplaythrough = () => audioRef.play();
            audioRef.load();

            audioRef.onloadedmetadata = function () {
                dur2 = audioRef.duration;
                console.log("   -> dur2 = ", dur2);
            };

            return dur1;
        };

        const deleteRecording = async () => {
            console.log("Deleting file: ", this.state.value);
            this.setState({popover:false});
            //setPopoverOpen(false);
            await Filesystem.deleteFile({
                path: this.state.value,
                directory: Directory.Documents
            });
        };

        const deleteRecording2 = async () => {
            console.log("Deleting file: ", this.state.value2);
            this.setState({popover:false});
            //setPopoverOpen(false);
            await Filesystem.deleteFile({
                path: this.state.value2,
                directory: Directory.Documents
            });
        };

        return (

            <IonPage>
                <IonHeader><div className = "header">
                    <IonToolbar>
                        <IonTitle size="small">Select Audio Clips</IonTitle>
                    </IonToolbar>
                </div></IonHeader>
                <IonContent fullscreen>
                    <IonGrid>
                        <IonRow>
                            <div className="select">
                                <IonText color="dark">
                                    <h4>Audio Clip #1</h4>
                                </IonText>
                                <div className="fileNameSelect">
                                    <IonItem>
                                        <IonSelect placeholder="Select Recording" value={this.state.value} onIonFocus={e => {loadFiles().then(r => {
                                            this.setState({ storedFileNames: r });

                                        });
                                        }} onIonChange={e => {
                                            this.setState({value:e.detail.value});
                                        }}>

                                            showLoading = true
                                            {this.state.storedFileNames.map((storedFileNames,i) => (
                                                <IonSelectOption value={storedFileNames} key={i}>
                                                    {storedFileNames}
                                                </IonSelectOption>
                                            ))}
                                        </IonSelect>
                                    </IonItem>
                                </div>
                                <div className="fileButtons">
                                    <IonButton size="small" onClick={async () => {
                                        //take out later
                                        dur1 = await playRecording();
                                        console.log("... attemping progress bar increase");

                                        let dec1 = (time1: number) => {
                                                if (time1 >= 1) {
                                                    return;
                                                }
                                                let s = time1.toString();
                                                $('.time1').val(s);
                                                setTimeout(function () {
                                                    dec1(time1 + 0.001);
                                                }, dur1);
                                        }
                                        dec1(0);
                                        console.log(" current dur: " + dur1);
                                        console.log(" end of progress");
                                    }
                                    }>
                                        <div className="playButton">
                                            Play
                                        </div>
                                    </IonButton>
                                    <IonButton size="small" id="click-trigger">
                                        <div className="playButton">
                                            Delete
                                        </div>
                                    </IonButton>
                                </div>
                                <IonPopover trigger="click-trigger" triggerAction="click" ref={this.popover} dismissOnSelect={true} onDidDismiss={() => this.setState({popover:false})}>
                                    <IonContent class="ion-padding">
                                        <IonList>
                                            Are you sure you want to delete this file?
                                        </IonList>
                                        <IonButton size="small">Go Back</IonButton>
                                        <IonButton size="small" onClick={()=>{
                                            deleteRecording().then(() => {
                                                loadFiles().then(r => {
                                                    this.setState({storedFileNames:r});
                                                });
                                                window.location.reload();
                                            });
                                        }}>Delete</IonButton>
                                    </IonContent>
                                </IonPopover>
                                <IonProgressBar id="prog1" className="time1" color="primary" value={0}></IonProgressBar>
                            </div>
                        </IonRow>
                        <IonRow>
                            <div className="select">
                                <IonText color="dark">
                                    <h4>Audio Clip #2</h4>
                                </IonText>
                                <div className="fileNameSelect">
                                    <IonItem>
                                        <IonSelect placeholder="Select Recording" value={this.state.value2} onIonFocus={e => {loadFiles().then(r => {this.setState({storedFileNames:r});});}}
                                                   onIonChange={e => {
                                                       this.setState({value2:e.detail.value})
                                                   }}>
                                            {this.state.storedFileNames.map((storedFileNames,i) => (
                                                <IonSelectOption value={storedFileNames} key={i}>
                                                    {storedFileNames}
                                                </IonSelectOption>
                                            ))}
                                        </IonSelect>
                                    </IonItem>
                                </div>
                                <div className="fileButtons">
                                    <IonButton size="small" onClick={async () => {
                                        //take out later
                                        dur2 = await playRecording2();
                                        console.log("... attemping progress bar increase");

                                        let dec2 = (time2: number) => {
                                            if (time2 >= 1) {
                                                return;
                                            }
                                            let s = time2.toString();
                                            $('.time2').val(s);
                                            setTimeout(function () {
                                                dec2(time2 + 0.001);
                                            }, dur2);
                                        }
                                        dec2(0);
                                        console.log(" current dur: " + dur2);
                                        console.log(" end of progress");
                                    }
                                    }>
                                        <div className="playButton">
                                            Play
                                        </div>
                                    </IonButton>
                                    <IonButton size="small" id="click-trigger2">
                                        <div className="playButton">
                                            Delete
                                        </div>
                                    </IonButton>
                                </div>
                                <IonPopover trigger="click-trigger2" triggerAction="click" ref={this.popover} dismissOnSelect={true} onDidDismiss={() => this.setState({popover:false})}>
                                    <IonContent class="ion-padding">
                                        <IonList>
                                            Are you sure you want to delete this file?
                                        </IonList>
                                        <IonButton size="small">Go Back</IonButton>
                                        <IonButton size="small" onClick={()=>{
                                            deleteRecording2().then(() => {
                                                loadFiles().then(r => {
                                                    this.setState({storedFileNames:r});
                                                });
                                                window.location.reload();
                                            });
                                        }}>Delete</IonButton>
                                    </IonContent>
                                </IonPopover>
                                <IonProgressBar id = "prog2" className="time2" color="primary" value={0}></IonProgressBar>
                            </div>
                        </IonRow>
                        <IonRow>
                            <Graphs {...this.state}/>
                        </IonRow>
                    </IonGrid>
                </IonContent>
            </IonPage>
        )
    }
}

export default Library;
