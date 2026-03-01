import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { errorResponse } from "../types/api.types";
import { logger } from "../utils/logger";

interface ThrownError {
  status?: number;
  message?: string;
}

export function errorMiddleware(
  err: Error | AppError | ThrownError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err && typeof err === "object" && "status" in err && "message" in err) {
    statusCode = (err as ThrownError).status ?? 500;
    message = (err as ThrownError).message ?? message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode >= 500) {
    logger.error({ err, statusCode }, message);
  } else {
    logger.warn({ statusCode, message }, "Client error");
  }

  if (!res.headersSent) {
    res.status(statusCode).json(errorResponse(message));
  }
}

/**
 * 404 handler — use as a route after all other routes to catch unknown paths.
 */
export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const err = new AppError(404, `Not found: ${req.method} ${req.originalUrl}`);
  next(err);
}
