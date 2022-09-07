import {IonButton} from '@ionic/react';
import './Register.css';
import React from "react";
import {showTabs} from "../App";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {Button} from "@mui/material";

class Register extends React.Component <{ addUser: (username:string, password:string) => void; }, {username:string, password:string, open: boolean}> {

    constructor(props: any) {
        super(props);
        this.state = {
            username: "",
            password: "",
            open: false
        };
    };

    componentDidMount() {
        showTabs();
    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleChange = (e: any) => {
        this.setState({...this.state,[e.target.name]:e.target.value})
    };

    handleAdd = () => {
        this.props.addUser(this.state.username,this.state.password);
        this.handleClose();
    }

    render() {

        return (
            <div className="btn">
                <div>
                    <IonButton size="large" onClick={() => {
                        this.handleOpen();
                    }}>
                        Register
                    </IonButton>
                </div>
                <Dialog open={this.state.open} onClose={this.handleClose} PaperProps={{ sx: { width: "80%", height: "60%" } }}>
                    <DialogTitle>Create Account</DialogTitle>
                    <DialogContent style={{ paddingTop: 20 }}>
                        <TextField autoFocus fullWidth label="Username" name="username" onChange={this.handleChange} margin="normal" />
                        <TextField type="password" fullWidth label="Password" name="password" onChange={this.handleChange} margin="normal" />
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={this.handleClose}>Back</Button>
                        <Button color="primary" onClick={this.handleAdd}>Add</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default Register;
