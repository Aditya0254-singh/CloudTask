import { AppError } from "../../middleware/error.middleware";
import {
  tasksRepository,
  TaskFilters,
  UpdatableTaskFields,
} from "./tasks.repository";

export const tasksService = {
  async createTask(
    userId: string,
    title: string,
    description: string | undefined,
    priority: string
  ) {
    return tasksRepository.create(userId, title, description, priority);
  },

  async listTasks(userId: string, filters: TaskFilters) {
    return tasksRepository.findAllForUser(userId, filters);
  },

  async getTask(userId: string, taskId: string) {
    const task = await tasksRepository.findByIdForUser(taskId, userId);
    if (!task) {
      // Same message whether the task doesn't exist or belongs to
      // someone else — never reveal which case it is.
      throw new AppError("Task not found", 404);
    }
    return task;
  },

  async updateTask(
    userId: string,
    taskId: string,
    fields: UpdatableTaskFields
  ) {
    const updated = await tasksRepository.updateForUser(taskId, userId, fields);
    if (!updated) {
      throw new AppError("Task not found", 404);
    }
    return updated;
  },

  async changeStatus(userId: string, taskId: string, status: string) {
    const updated = await tasksRepository.updateForUser(taskId, userId, {
      status,
    });
    if (!updated) {
      throw new AppError("Task not found", 404);
    }
    return updated;
  },

  async deleteTask(userId: string, taskId: string) {
    const deleted = await tasksRepository.deleteForUser(taskId, userId);
    if (!deleted) {
      throw new AppError("Task not found", 404);
    }
  },
};
