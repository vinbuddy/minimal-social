import transporter from "../configs/mailer";

export async function sendEmail(from: string, to: string, subject: string, content: string): Promise<boolean> {
    // Code to send email
    try {
        const info = await transporter.sendMail({
            from: {
                name: "Minimal Social",
                address: from,
            },
            to,
            subject,
            text: content,
        });

        return true;
    } catch (error) {
        console.log("error: ", error);
        return false;
    }
}
