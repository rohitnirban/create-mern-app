import { Request, Response, NextFunction } from "express";
import type { UserRole } from "../types/user.types";
import { AppError } from "../utils/AppError";

export const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!role) {
      next(new AppError(401, "Not authenticated"));
      return;
    }

    if (!allowedRoles.includes(role)) {
      next(new AppError(403, "You are not allowed to access this resource"));
      return;
    }

    next();
  };

