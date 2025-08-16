import dbConnect from "@/lib/db";
import Notification from "@/models/notification.model";
import User from "@/models/user.model";
import { sendNotificationEmail } from "@/lib/emailService";

/**
 * Sends email notifications for critical/high-priority notifications
 */
export async function sendCriticalNotificationEmails() {
  try {
    await dbConnect();

    // Find unread critical notifications
    const criticalNotifications = await Notification.find({
      isRead: false,
      type: { $in: ["TaskAssigned", "ConflictDetected"] },
    }).populate("recipientId", "email");

    // Group notifications by user
    const notificationsByUser: { [key: string]: any[] } = {};

    for (const notification of criticalNotifications) {
      const userId = notification.recipientId._id.toString();
      if (!notificationsByUser[userId]) {
        notificationsByUser[userId] = [];
      }
      notificationsByUser[userId].push(notification);
    }

    // Send emails to each user
    for (const [userId, notifications] of Object.entries(notificationsByUser)) {
      try {
        // Get user email
        const user = await User.findById(userId);
        if (!user) continue;

        // Compose email content
        const subject = `ManageMate: ${
          notifications.length
        } Important Notification${notifications.length > 1 ? "s" : ""}`;
        const message = `
          You have ${notifications.length} important notification${
          notifications.length > 1 ? "s" : ""
        }:
          
          ${notifications
            .map((n: any) => `- ${n.message}`)
            .join(
              "\
"
            )}
          
          Please log in to ManageMate to view details.
        `;

        const html = `
          <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
            <h2>ManageMate Notifications</h2>
            <p>You have ${notifications.length} important notification${
          notifications.length > 1 ? "s" : ""
        }:</p>
            <ul>
              ${notifications.map((n: any) => `<li>${n.message}</li>`).join("")}
            </ul>
            <p><a href=\"${
              process.env.BASE_URL || "http://localhost:3000"
            }\" style=\"background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">View Notifications</a></p>
            <hr style=\"margin: 20px 0;\">
            <p style=\"font-size: 12px; color: #666;\">
              This is an automated message from ManageMate. Please do not reply to this email.
            </p>
          </div>
        `;

        // Send email
        await sendNotificationEmail(user.email, subject, message, html);
      } catch (error) {
        console.error(`Error sending email to user ${userId}:`, error);
      }
    }

    console.log(
      `Sent emails for ${criticalNotifications.length} critical notifications`
    );
  } catch (error) {
    console.error("Error sending critical notification emails:", error);
    throw error;
  }
}
