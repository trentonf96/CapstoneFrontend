import {
    IonButton,
    IonGrid,
    IonHeader, IonIcon,
    IonPage, IonProgressBar,
    IonRow,
    IonTitle,
    IonToolbar,
    IonContent,
    IonModal,
    IonButtons,
    IonLabel,
    IonItem,
    IonInput, IonToast
} from '@ionic/react';
import './Record.css';
import {GenericResponse, RecordingData, VoiceRecorder} from 'capacitor-voice-recorder';
import {Directory, Filesystem, ReaddirResult} from "@capacitor/filesystem";
import React from "react";
import {showTabs} from "../App";

let stop = false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let tempFileName = "";
let toastMessage = "";

VoiceRecorder.canDeviceVoiceRecord().then((result: GenericResponse) => console.log())

VoiceRecorder.requestAudioRecordingPermission().then((result: GenericResponse) => console.log())

VoiceRecorder.hasAudioRecordingPermission().then((result: GenericResponse) => console.log())

const startRecording = async () => {
    console.log("Recording...");
    $('.start').toggle();
    $('.stop').css("display","block");
    await VoiceRecorder.startRecording();
};

const stopRecording = () => {
    console.log("Recording Stopped.");
    $('.start').toggle();
    $('.stop').toggle();
    $('.time').val(1);
};

const pauseRecording = () => {
    VoiceRecorder.pauseRecording()
        .then((result: GenericResponse) => console.log("Paused..."))
        .catch(error => console.log(error))
}

class Record extends React.Component <{}, {name: string, showToast: boolean}> {
    private modal: React.RefObject<HTMLIonModalElement>;
    private input: React.RefObject<HTMLIonInputElement>;

    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.modal = React.createRef();
        this.input = React.createRef();
        this.state = {
            name: "",
            showToast: false
        };
    };

    componentDidMount() {
        showTabs();
    }

    render() {

        const confirm = async () => {
            stop=false;
            stopRecording();
            let fileName = "";
            let recordData = "";
            await VoiceRecorder.stopRecording().then(async (result: RecordingData) => {
                fileName = this.input.current?.value + '.wav';
                if (result.value && result.value.recordDataBase64) {
                    recordData = result.value.recordDataBase64;
                    console.log(recordData);
                    console.log(fileName);
                    await Filesystem.writeFile({
                        path: fileName,
                        directory: Directory.Documents,
                        data: recordData
                    });
                }
                sendData(fileName,recordData);
            })
            return fileName;
        }

        function sendData(fileName: string, recordData: string) {
            let data = {"user_name": window.sessionStorage.getItem("username"), "base64_audio": recordData, "file_name": fileName};
            console.log("FETCH");
            fetch("http://34.125.224.168:8080/saveAudio", {
                method: 'POST',
                redirect: 'follow',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(r => console.log(r.status));
        }

        async function checkExisting(fileName: string) {

            console.log("searching for file with name of: ", fileName)

            let uniqueFile = true;
            let result: ReaddirResult;
            result = await Filesystem.readdir({
                path: "",
                directory: Directory.Documents
            })
            result.files.forEach(element => {
                if (element === fileName) {
                    console.log(" -> Found! File exists called ", fileName)
                    uniqueFile = false;
                }
            });
            return uniqueFile;
        }

        const dismiss = async () => {
            stop=false;
            stopRecording();
            await VoiceRecorder.stopRecording()
            this.modal.current?.dismiss();
        }

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar className="header">
                        <IonTitle size="small">Record An Instrument</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen>
                    <div className="contain">
                        <div className="rec">
                            <IonGrid>
                                <IonRow>
                                    <IonProgressBar className="time" color="danger" value={1}></IonProgressBar>
                                </IonRow>
                                <IonRow>
                                    <div className="buttons">
                                        <IonButton fill="clear" className='start' onClick={ () => {
                                            startRecording();
                                            let dec = (time: number) => {
                                                if (stop) {
                                                    stop=false;
                                                    return;
                                                }
                                                if (time <= 0) {
                                                    $(".stop").click();
                                                    return;
                                                }
                                                let s = time.toString();
                                                $('.time').val(s);
                                                setTimeout(function() {
                                                    dec(time - 0.001);
                                                }, 10);
                                            }
                                            dec(1);
                                        }}><IonIcon className="icon" src="assets/Asset1.svg"></IonIcon></IonButton>
                                        <IonButton id="open-modal" fill="clear" className='stop' data-target="open-modal" onClick={ () => {
                                            pauseRecording();
                                            stop=true;
                                        }}><IonIcon className="icon" src="assets/Asset2.svg"></IonIcon></IonButton>
                                    </div>
                                </IonRow>
                            </IonGrid>
                        </div>
                    </div>
                    <IonModal id="modal" className="modal" ref={this.modal} trigger="open-modal">
                        <IonContent>
                            <IonHeader>
                                <IonToolbar>
                                    <IonButtons slot="end">
                                        <IonButton color="light" onClick={() => dismiss()}>
                                            Close
                                        </IonButton>
                                        <IonButton strong={true} onClick={async () => {
                                            if (await checkExisting(this.input.current?.value + ".wav")) {
                                                confirm().then(r => {
                                                    this.setState({ name: r })
                                                    this.modal.current?.dismiss(this.input.current?.value, 'confirm');
                                                    this.setState({ showToast: true });

                                                });
                                                toastMessage = 'Saved file: ' + this.input.current?.value;
                                            }
                                            else {
                                                toastMessage = 'Error: ' + this.input.current?.value + '.wav already exists!';
                                                this.setState({ showToast: true });
                                            }
                                        }}>
                                            Confirm
                                        </IonButton>
                                    </IonButtons>
                                </IonToolbar>
                            </IonHeader>
                            <IonItem>
                                <IonLabel position="stacked">Enter clip name:</IonLabel>
                                <IonInput ref={this.input} type="text" placeholder="Name"
                                    onChange={() =>
                                        tempFileName = this.input.current?.value + ".wav"
                                    } />
                            </IonItem>
                        </IonContent>
                    </IonModal>
                    <IonToast
                        isOpen={this.state.showToast}
                        onDidDismiss={() => this.setState({ showToast: false })}
                        message={toastMessage}
                        duration={2000}
                    />
                </IonContent>
            </IonPage>
        );
    };
}

export default Record;
