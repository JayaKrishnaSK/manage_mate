import cron from "node-cron";
import { checkTaskConflicts } from "@/lib/taskConflictChecker";
import { sendCriticalNotificationEmails } from "@/lib/notificationEmailer";

// Schedule task conflict detection to run every 30 minutes
export function initializeCronJobs() {
  // Task conflict detection
  cron.schedule("*/30 * * * *", async () => {
    console.log("Running task conflict detection...");
    try {
      await checkTaskConflicts();
      console.log("Task conflict detection completed.");
    } catch (error) {
      console.error("Error in task conflict detection:", error);
    }
  });

  // Send critical notification emails every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Sending critical notification emails...");
    try {
      await sendCriticalNotificationEmails();
      console.log("Critical notification emails sent.");
    } catch (error) {
      console.error("Error sending critical notification emails:", error);
    }
  });

  console.log("Cron jobs initialized");
}
