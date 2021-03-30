import React, { Component } from 'react';
import FileBase64 from 'react-file-base64';
import {Button,Form,FormGroup,Label,FormText,Input,Alert} from "reactstrap";

import "./ocr.css";

const makeResponsiveClasses={
    MOBILE:"m-auto align-self-center",
    DESKTOP:"col-6 offset-3",
}

export default class Ocr extends Component {

    constructor(props){
        super(props);


    this.state = {
            name: "",
            fname: "",
            dateOfBirth: "",
            pan: "",
            error: null,
            warnings: null,
            success:null,
            responsiveClass:null,
            confirmation : "",
            isLoading : "",
            files : "",
      }

    this.handleChange= this.handleChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
    
    }
    componentDidMount() {
        window.addEventListener("resize", this.updateResponsiveClass());
    }
    
    componentWillUnmount() {
        window.removeEventListener("resize", this.updateResponsiveClass());
    }
    
    updateResponsiveClass() {
       let screenSize = (window.innerWidth<=760)?makeResponsiveClasses.MOBILE:makeResponsiveClasses.DESKTOP;
       this.setState({responsiveClass:screenSize});
    }

    // Handle change
    handleChange(event){
        event.preventDefault();
        const target = event.target;
        const value=target.value;
        const name=target.name;
        this.setState({[name]:value});
    }

    async getFiles(files){
        this.setState({
            success:null,
            error:null,
            warnings:null,
            isLoading : "Extracting data",
            files : files
    });
    console.log(files);


    const UID= Math.round(1+ Math.random() * (1000000-1));

    var date={
        fileExt:"png",
        imageID: UID,
        folder:UID,
        img : this.state.files[0].base64
    };

    
    this.setState({confirmation : "Processing..."})
    await fetch(
        'https://bje59v8af5.execute-api.ap-northeast-2.amazonaws.com/Production', 
        {
        method: "POST",
        headers: {
            Accept : "application/json",
            "Content-Type": "application.json"
        },
        body : JSON.stringify(date)
        }
    );



    let timage= UID + ".png";
    //Extract data using OCR
    const response=await fetch( 
        'https://bje59v8af5.execute-api.ap-northeast-2.amazonaws.com/Production/ocr', 
        {
        method: "POST",
        headers: {
            Accept : "application/json",
            "Content-Type": "application.json"
        },
        body : JSON.stringify(timage)
        }
       
    );
    this.setState({confirmation : ""})
    
    const ocrText = await response.json();
    console.log("ocrText",ocrText);
    this.setState({
        error:ocrText.error,
    })
    this.setState({
        name :ocrText.body[0],
        fname :ocrText.body[1],
        dateOfBirth: ocrText.body[2],
        pan: ocrText.body[3],
        warnings:ocrText.warnings,
    })
    }

    //Submit formdata to datebase
    async handleSubmit(event){
        event.preventDefault()
        this.setState({confirmation : "Uploading..."});
        const formData={
            name:this.state.name,
            fatherName:this.state.fname,
            dateOfBirth:this.state.dateOfBirth,
            panNumber:this.state.pan
        }
        await fetch(
            'https://bje59v8af5.execute-api.ap-northeast-2.amazonaws.com/Production/submit',
            {
            method:"POST",
            headers:{
                Accept: "application/json",
                "Content-Type":"application.json"
            },
            body: JSON.stringify(formData)
        })
        .then((res)=>{
            console.log(res.json());
            if(res.status===200){
                this.setState({
                    success:true,
                    warnings:null,
                    error:null,
                    files:"",
                    name:"",
                    fname:"",
                    dateOfBirth:"",
                    pan:"",
                    confirmation:""
                })
            }
        })
    }

    render() { 
        const processing=this.state.confirmation;
        return (
             
           <div className="row p-4" id="container">
               
               <div className={this.state.responsiveClass} id="div">

                   {/* Submission Message */}
                    {this.state.success && (
                        <Alert color="success">
                        <h1>Form submitted successfully</h1>
                        </Alert>
                    )}

                    <Form method='POST' onSubmit={this.handleSubmit} >
                        <FormGroup style={{width: "50%",padding: "1%"}}>
                           <h3 className="text-danger">{processing}</h3>    
                           <h6>UPLOAD YOUR PAN CARD</h6>
                           <FormText color="muted">FORMAT: PNG,JPG</FormText>
                       
                       
                        <div className="form-group files color" id="input">
                            <FileBase64 
                            multiple={true} 
                            onDone={this.getFiles.bind(this)}></FileBase64>                            
                        </div>
                        </FormGroup> 

                        {/* Error Message */}
                        {this.state.error && (
                            <Alert color="danger">
                            <h1>{this.state.error}</h1>
                            </Alert>
                        )}
                        {/* Warning Message */}
                        {this.state.warnings && (
                            <Alert color="warning">
                            <h1>{this.state.warnings}</h1>
                            </Alert>
                        )}
                        
                        <div className="output">
                        {/*Rendering Details*/}
                        <FormGroup>
                            <Label>
                                <h6>Name</h6>
                            </Label>
                            <Input 
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={this.state.name}
                                onChange={this.handleChange}
                            />

                        </FormGroup>


                        <FormGroup>
                            <Label>
                                <h6>Father's Name</h6>
                            </Label>
                            <Input 
                                type="text"
                                name="fname"
                                id="fname"
                                required
                                value={this.state.fname}
                                onChange={this.handleChange}
                            />
                        </FormGroup>



                        <FormGroup>
                            <Label>
                                <h6>Date of Birth</h6>
                            </Label>
                            <Input 
                                type="text"
                                name="dateOfBirth"
                                id="dob"
                                required
                                value={this.state.dateOfBirth}
                                onChange={this.handleChange}
                            />
                        </FormGroup>


                        <FormGroup>
                            <Label>
                                <h6>Permanent Account Number(PAN)</h6>
                            </Label>
                            <Input 
                                type="text"
                                name="pan"
                                id="pan"
                                required
                                value={this.state.pan}
                                onChange={this.handleChange}
                            />
                        </FormGroup>

                        <Button className="btn btn-lg btn-block  btn-success" style={{backgroundColor: "green"}}>
                            Submit Details
                        </Button>
                        </div>
                    </Form>   
                </div>  
           </div>
         );
    }
}
 
