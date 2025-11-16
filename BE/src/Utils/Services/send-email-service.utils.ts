import nodemailer from "nodemailer";



class sendEmailService {
    
    sendTaggedEmail = async (emails:string[], PostUrl:string) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASSWORD,
            },
        });
        const mailOptions = {
            from: `NO-reply <${process.env.USER_EMAIL}>`,
            to: emails,
            subject: 'You have been tagged in a post',
            html: `<p>You have been tagged in a post</p>
            <p>Click <a href="${PostUrl}">here</a> to view the post</p>`,
        };
        await transporter.sendMail(mailOptions);
    }
}

export default new sendEmailService()
