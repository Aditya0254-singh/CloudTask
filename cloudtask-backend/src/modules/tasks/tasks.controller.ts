import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../middleware/error.middleware";
import { tasksService } from "./tasks.service";

const statusEnum = z.enum(["todo", "in_progress", "done"]);
const priorityEnum = z.enum(["low", "medium", "high"]);
const uuidSchema = z.string().uuid();

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
  description: z.string().trim().optional(),
  priority: priorityEnum.optional().default("medium"),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
});

const changeStatusSchema = z.object({
  status: statusEnum,
});

const listTasksQuerySchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  search: z.string().trim().min(1).optional(),
});

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(", ");
}

// Every route in this controller requires authMiddleware to have run first,
// so req.user is always populated. userId is never read from the body.
function getUserId(req: Request): string {
  return req.user!.userId;
}

function validateTaskId(id: unknown): string {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new AppError("Invalid task id", 400);
  }
  return parsed.data;
}

export const tasksController = {
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400);
    }

    const { title, description, priority } = parsed.data;
    const task = await tasksService.createTask(
      getUserId(req),
      title,
      description,
      priority
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task },
    });
  },

  async list(req: Request, res: Response): Promise<void> {
    const parsed = listTasksQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400);
    }

    const tasks = await tasksService.listTasks(getUserId(req), parsed.data);

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: { tasks },
    });
  },

  async getOne(req: Request, res: Response): Promise<void> {
    const taskId = validateTaskId(req.params.id);
    const task = await tasksService.getTask(getUserId(req), taskId);

    res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: { task },
    });
  },

  async update(req: Request, res: Response): Promise<void> {
    const taskId = validateTaskId(req.params.id);

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400);
    }

    const task = await tasksService.updateTask(
      getUserId(req),
      taskId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: { task },
    });
  },

  async changeStatus(req: Request, res: Response): Promise<void> {
    const taskId = validateTaskId(req.params.id);

    const parsed = changeStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400);
    }

    const task = await tasksService.changeStatus(
      getUserId(req),
      taskId,
      parsed.data.status
    );

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: { task },
    });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const taskId = validateTaskId(req.params.id);
    await tasksService.deleteTask(getUserId(req), taskId);
    res.status(204).send();
  },
};
