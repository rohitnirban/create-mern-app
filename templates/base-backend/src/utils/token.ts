import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";
import type { UserRole } from "../types/user.types";

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string, role: UserRole): string => {
  return jwt.sign({ userId, role } as AccessTokenPayload, env.accessTokenSecret, {
    expiresIn: "1m",
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId } as RefreshTokenPayload, env.refreshTokenSecret, {
    expiresIn: "30d",
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.accessTokenSecret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.refreshTokenSecret) as RefreshTokenPayload;
};

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
