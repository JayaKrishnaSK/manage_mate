import dbConnect from '@/lib/db';
import Task from '@/models/task.model';
import { createNotification } from '@/lib/notificationService';
import { publish } from '@/lib/redis';

/**
 * Checks for task conflicts and updates task flags and notifications
 */
export async function checkTaskConflicts() {
  try {
    await dbConnect();
    
    // Find users who have more than one task with 'High' or 'Critical' priority
    // where the startDate and deadline ranges overlap
    const usersWithConflicts = await Task.aggregate([
      {
        $match: {
          priority: { $in: ['High', 'Critical'] }
        }
      },
      {
        $group: {
          _id: '$assigneeId',
          tasks: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 1,
          conflictingTasks: {
            $filter: {
              input: '$tasks',
              as: 'task',
              cond: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: '$tasks',
                        as: 'otherTask',
                        cond: {
                          $and: [
                            { $ne: ['$$task._id', '$$otherTask._id'] },
                            { $eq: ['$$task.assigneeId', '$$otherTask.assigneeId'] },
                            { $eq: ['$$task.priority', '$$otherTask.priority'] },
                            {
                              $or: [
                                {
                                  $and: [
                                    { $lte: ['$$task.startDate', '$$otherTask.deadline'] },
                                    { $gte: ['$$task.deadline', '$$otherTask.startDate'] }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      }
                    }
                  },
                  0
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          'conflictingTasks.1': { $exists: true } // At least 2 conflicting tasks
        }
      }
    ]);
    
    // Process each user with conflicts
    for (const userConflict of usersWithConflicts) {
      const userId = userConflict._id;
      const conflictingTasks = userConflict.conflictingTasks;
      
      // Update tasks to set hasConflict flag
      const taskIds = conflictingTasks.map((task: any) => task._id);
      await Task.updateMany(
        { _id: { $in: taskIds } },
        { hasConflict: true }
      );
      
      // Create notifications for the user
      try {
        await createNotification(
          userId,
          `You have ${taskIds.length} conflicting tasks that overlap in schedule.`,
          'ConflictDetected',
          '/dashboard' // Link to user's dashboard
        );
      } catch (error) {
        console.error('Error creating conflict notification:', error);
      }
      
      // Publish conflict event to Redis
      try {
        await publish('conflicts', {
          userId,
          taskIds,
          message: 'Task conflict detected'
        });
      } catch (error) {
        console.error('Error publishing conflict event:', error);
      }
    }
    
    console.log(`Processed ${usersWithConflicts.length} users with task conflicts`);
  } catch (error) {
    console.error('Error checking task conflicts:', error);
    throw error;
  }
}