import transporter from "../configs/mailer";
import logger from "../configs/logger";

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
        logger.error("Failed to send email", { to, subject, error });
        return false;
    }
}
