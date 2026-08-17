import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../middleware/error.middleware";
import { authService } from "./auth.service";

// Request validation schemas.
// Kept alongside the controller since this is the only place they're used.
const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(", ");
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400);
    }

    const { name, email, password } = parsed.data;
    const { user, token } = await authService.register(name, email, password);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user, token },
    });
  },

  async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(formatZodError(parsed.error), 400);
    }

    const { email, password } = parsed.data;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, token },
    });
  },
};
