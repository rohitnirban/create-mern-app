import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as userService from "../services/user.service";
import { successResponse } from "../types/api.types";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user!.userId);
  res.status(200).json(successResponse({ user }));
});

