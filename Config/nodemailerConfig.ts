import nodemailer from 'nodemailer'
import dotenv from "dotenv";


dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASSWORD, 
    },
});


transporter.verify((error:any, success:any) => {
    if (error) {
        console.error("Nodemailer Transporter Error:", error);
    } else {
        console.log("Nodemailer Transporter Ready");
    }
});

export default transporter;
