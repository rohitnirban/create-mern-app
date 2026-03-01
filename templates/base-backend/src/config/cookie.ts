import { CookieOptions } from "express";
import { env } from "./env";

const BASE_OPTIONS: CookieOptions = {
  secure: true,
  sameSite: "none",
};

const ONE_HOUR = 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const accessTokenCookieOptions: CookieOptions = {
  ...BASE_OPTIONS,
  httpOnly: true,
  maxAge: ONE_HOUR,
  path: "/",
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...BASE_OPTIONS,
  httpOnly: true,
  maxAge: THIRTY_DAYS,
  path: "/api/v1/auth/refresh",
};

export const csrfCookieOptions: CookieOptions = {
  ...BASE_OPTIONS,
  httpOnly: false,
  maxAge: ONE_HOUR,
  path: "/",
};

export const loggedInCookieOptions: CookieOptions = {
  ...BASE_OPTIONS,
  httpOnly: false,
  maxAge: ONE_HOUR,
  path: "/",
};

export const clearAccessTokenCookieOptions: CookieOptions = {
  ...BASE_OPTIONS,
  httpOnly: true,
  path: "/",
};

export const clearRefreshTokenCookieOptions: CookieOptions = {
  ...BASE_OPTIONS,
  httpOnly: true,
  path: "/api/v1/auth/refresh",
};

export const clearCsrfCookieOptions: CookieOptions = {
  ...BASE_OPTIONS,
  httpOnly: false,
  path: "/",
};

export const clearLoggedInCookieOptions: CookieOptions = {
  ...BASE_OPTIONS,
  httpOnly: false,
  path: "/",
};
