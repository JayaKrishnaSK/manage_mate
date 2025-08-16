import nodemailer from "nodemailer";

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "your-smtp-user",
    pass: process.env.SMTP_PASS || "your-smtp-password",
  },
});

/**
 * Sends an email
 * @param to Recipient email address
 * @param subject Email subject
 * @param text Plain text content
 * @param html HTML content (optional)
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    // Verify transporter configuration
    await transporter.verify();

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"ManageMate" <no-reply@managemate.com>',
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Sends a notification email
 * @param to Recipient email address
 * @param notificationType Type of notification
 * @param message Notification message
 * @param link Optional link to relevant resource
 */
export async function sendNotificationEmail(
  to: string,
  notificationType: string,
  message: string,
  link?: string
) {
  const subject = `ManageMate Notification: ${notificationType}`;

  const text = `${message}${
    link
      ? `\
\
View details: ${link}`
      : ""
  }`;

  const html = `
    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
      <h2>ManageMate Notification</h2>
      <p>${message}</p>
      ${
        link
          ? `<p><a href=\"${link}\" style=\"background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">View Details</a></p>`
          : ""
      }
      <hr style=\"margin: 20px 0;\">
      <p style=\"font-size: 12px; color: #666;\">
        This is an automated message from ManageMate. Please do not reply to this email.
      </p>
    </div>
  `;

  return await sendEmail(to, subject, text, html);
}
