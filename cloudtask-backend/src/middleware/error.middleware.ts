import { Request, Response, NextFunction } from "express";

// A small, deliberately simple error class.
// Lets route/service code throw an error with a specific HTTP status
// instead of always falling back to a generic 500.
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Catches any errors passed via next(err), plus anything thrown inside
// async route handlers when wrapped with asyncHandler (see below).
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unexpected error (e.g. database connection issue). Log it fully,
  // but don't leak internal details to the client.
  console.error("Unexpected error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
}

// Wraps an async route handler so thrown errors/rejected promises
// are forwarded to the error handler instead of crashing the process.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// Basic 404 handler for unmatched routes.
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
