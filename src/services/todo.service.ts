import dbConnect from '@/lib/db';
import PersonalTodo from '@/models/personalTodo.model';

export class TodoService {
  /**
   * Create a new personal todo
   * @param userId The ID of the user creating the todo
   * @param content The content of the todo
   * @param linkedResourceType The type of resource the todo is linked to
   * @param linkedResourceId The ID of the resource the todo is linked to
   * @returns The created todo
   */
  static async createTodo(
    userId: string,
    content: string,
    linkedResourceType?: 'Project' | 'Module' | 'Task' | null,
    linkedResourceId?: string | null
  ) {
    await dbConnect();

    const todo = new PersonalTodo({
      userId,
      content,
      linkedResourceType: linkedResourceType || null,
      linkedResourceId: linkedResourceId || null,
      isCompleted: false,
    });

    await todo.save();
    return todo;
  }

  /**
   * Get all todos for a user
   * @param userId The ID of the user
   * @returns Array of todos
   */
  static async getTodos(userId: string) {
    await dbConnect();

    // Use aggregation pipeline to join with linked resources
    const todos = await PersonalTodo.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'projects',
          localField: 'linkedResourceId',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: 'modules',
          localField: 'linkedResourceId',
          foreignField: '_id',
          as: 'module',
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'linkedResourceId',
          foreignField: '_id',
          as: 'task',
        },
      },
      {
        $addFields: {
          linkedResource: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$linkedResourceType', 'Project'] },
                  then: {
                    $arrayElemAt: [
                      {
                        title: { $arrayElemAt: ['$project.name', 0] },
                        url: { $concat: ['/projects/', { $toString: '$linkedResourceId' }] },
                      },
                      0,
                    ],
                  },
                },
                {
                  case: { $eq: ['$linkedResourceType', 'Module'] },
                  then: {
                    $arrayElemAt: [
                      {
                        title: { $arrayElemAt: ['$module.name', 0] },
                        url: { $concat: ['/modules/', { $toString: '$linkedResourceId' }] },
                      },
                      0,
                    ],
                  },
                },
                {
                  case: { $eq: ['$linkedResourceType', 'Task'] },
                  then: {
                    $arrayElemAt: [
                      {
                        title: { $arrayElemAt: ['$task.title', 0] },
                        url: { $concat: ['/tasks/', { $toString: '$linkedResourceId' }] },
                      },
                      0,
                    ],
                  },
                },
              ],
              default: null,
            },
          },
        },
      },
      {
        $project: {
          project: 0,
          module: 0,
          task: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return todos;
  }

  /**
   * Update a todo
   * @param userId The ID of the user
   * @param todoId The ID of the todo to update
   * @param updates The fields to update
   * @returns The updated todo
   */
  static async updateTodo(
    userId: string,
    todoId: string,
    updates: Partial<{
      content: string;
      isCompleted: boolean;
      linkedResourceType: 'Project' | 'Module' | 'Task' | null;
      linkedResourceId: string | null;
    }>
  ) {
    await dbConnect();

    const todo = await PersonalTodo.findOneAndUpdate(
      { _id: todoId, userId },
      { 
        ...updates,
        completedAt: updates.isCompleted ? new Date() : null,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!todo) {
      throw new Error('Todo not found');
    }

    return todo;
  }

  /**
   * Delete a todo
   * @param userId The ID of the user
   * @param todoId The ID of the todo to delete
   */
  static async deleteTodo(userId: string, todoId: string) {
    await dbConnect();

    const result = await PersonalTodo.deleteOne({ _id: todoId, userId });

    if (result.deletedCount === 0) {
      throw new Error('Todo not found');
    }
  }
}