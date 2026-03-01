import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { AppError } from "../utils/AppError";

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body) as z.infer<T>;
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues
          .map((e: { path: unknown[]; message: string }) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        next(new AppError(400, message));
      } else {
        next(err);
      }
    }
  };
}
