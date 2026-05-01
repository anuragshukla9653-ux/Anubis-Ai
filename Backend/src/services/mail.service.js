import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        clientId: process.env.GOOGLE_CLIENT_ID,
    }
})

export async function sendEmail({ to, subject, text, html }) {

    const mailOption = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        text,
        html,
    };

    const details = await transporter.sendMail(mailOption);
    console.log("Email sent successfully:", details);
}
