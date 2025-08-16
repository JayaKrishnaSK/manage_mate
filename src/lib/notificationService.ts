import dbConnect from '@/lib/db';
import Notification from '@/models/notification.model';
import { publish } from '@/lib/redis';

/**
 * Creates a new notification and publishes it to Redis
 * @param recipientId The ID of the user receiving the notification
 * @param message The notification message
 * @param type The type of notification
 * @param link A link to the relevant resource
 * @returns The created notification
 */
export async function createNotification(
  recipientId: string,
  message: string,
  type: 'TaskAssigned' | 'StatusUpdate' | 'ConflictDetected',
  link: string
) {
  try {
    // Connect to the database
    await dbConnect();

    // Create the notification
    const notification = new Notification({
      recipientId,
      message,
      type,
      link,
      isRead: false,
    });

    await notification.save();

    // Publish the notification to Redis
    await publish('notifications', {
      ...notification.toObject(),
      recipientId, // Ensure recipientId is included
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}