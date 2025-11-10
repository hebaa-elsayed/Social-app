
import nodemailer from "nodemailer";
import { IEmailArgument } from "../../Common";

export const sendEmail = async (
    {
        to,
        cc,
        subject,
        content,
        attachments =[]
    }: IEmailArgument
) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", //smtp.gmail.com
        port: 465,
        secure: true,
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD,
        },
    });


    const Info = await transporter.sendMail({
        from: `NO-reply <${process.env.USER_EMAIL}>`,
        to,
        cc,
        subject,
        html: content,
        attachments
    })
    console.log(`info` , Info);
    
    return Info
};

export default sendEmail;

import { EventEmitter } from 'node:events';
export const localEmitter = new EventEmitter()


localEmitter.on('sendEmail' , (args:IEmailArgument)=>{
    console.log("Sending email event is working");
    sendEmail(args)
})