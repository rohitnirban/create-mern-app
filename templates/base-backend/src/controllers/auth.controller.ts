import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as authService from "../services/auth.service";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  csrfCookieOptions,
  loggedInCookieOptions,
  clearAccessTokenCookieOptions,
  clearRefreshTokenCookieOptions,
  clearCsrfCookieOptions,
  clearLoggedInCookieOptions,
} from "../config/cookie";
import { successResponse } from "../types/api.types";
import { AppError } from "../utils/AppError";

function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; csrfToken: string }
): void {
  res.cookie("accessToken", tokens.accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);
  res.cookie("csrf_token", tokens.csrfToken, csrfCookieOptions);
  res.cookie("logged_in", "true", loggedInCookieOptions);
}

function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken", clearAccessTokenCookieOptions);
  res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);
  res.clearCookie("csrf_token", clearCsrfCookieOptions);
  res.clearCookie("logged_in", clearLoggedInCookieOptions);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const { user, tokens } = await authService.registerUser({
    name,
    email,
    password,
  });

  setAuthCookies(res, tokens);
  res.status(201).json(successResponse({ user }, "Registration successful"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, tokens } = await authService.loginUser({ email, password });

  setAuthCookies(res, tokens);
  res.status(200).json(successResponse({ user }, "Login successful"));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  await authService.logoutUser(req.user!.userId, refreshToken);

  clearAuthCookies(res);
  res.status(200).json(successResponse(null, "Logout successful"));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies?.refreshToken;

  if (!oldRefreshToken) {
    throw new AppError(403, "Refresh token missing");
  }

  const { accessToken, refreshToken, csrfToken } =
    await authService.refreshAccessToken(oldRefreshToken);

  setAuthCookies(res, { accessToken, refreshToken, csrfToken });
  res.status(200).json(successResponse(null, "Token refreshed"));
});
