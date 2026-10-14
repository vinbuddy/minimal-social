import nodemailer from "nodemailer";
import envConfig from "./env";

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: envConfig.EMAIL_APP_USER,
        pass: envConfig.EMAIL_APP_PASSWORD,
    },
});

export default transporter;
