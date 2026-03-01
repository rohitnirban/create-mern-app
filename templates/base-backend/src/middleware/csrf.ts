import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const MUTATION_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

export const csrfProtection = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!MUTATION_METHODS.includes(req.method)) {
    next();
    return;
  }

  const headerToken = req.headers["x-csrf-token"] as string | undefined;
  const cookieToken = req.cookies?.csrf_token as string | undefined;

  if (!headerToken || !cookieToken) {
    next(new AppError(403, "CSRF token missing"));
    return;
  }

  if (headerToken !== cookieToken) {
    next(new AppError(403, "CSRF token mismatch"));
    return;
  }

  next();
};
