import { User } from "../models/user.model";
import { RefreshToken } from "../models/refreshToken.model";
import { IUserDocument, IUserResponse } from "../types/user.types";
import {
  generateAccessToken,
  generateRefreshToken,
  generateCsrfToken,
  hashToken,
  verifyRefreshToken,
} from "../utils/token";
import { AppError } from "../utils/AppError";

const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenSet {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

export const registerUser = async (
  input: RegisterInput
): Promise<{ user: IUserResponse; tokens: TokenSet }> => {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new AppError(409, "Email already registered");
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
  });

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());
  const csrfToken = generateCsrfToken();

  const hashedRefreshToken = hashToken(refreshToken);
  await RefreshToken.create({
    user: user._id,
    hashedToken: hashedRefreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  return {
    user: user.toJSON(),
    tokens: { accessToken, refreshToken, csrfToken },
  };
};

export const loginUser = async (
  input: LoginInput
): Promise<{ user: IUserResponse; tokens: TokenSet }> => {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());
  const csrfToken = generateCsrfToken();

  const hashedRefreshToken = hashToken(refreshToken);
  await RefreshToken.create({
    user: user._id,
    hashedToken: hashedRefreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  return {
    user: user.toJSON(),
    tokens: { accessToken, refreshToken, csrfToken },
  };
};

export const logoutUser = async (
  userId: string,
  refreshToken: string | undefined
): Promise<void> => {
  if (refreshToken) {
    const hashedToken = hashToken(refreshToken);
    await RefreshToken.deleteOne({
      user: userId,
      hashedToken,
    });
  }
};

export const refreshAccessToken = async (
  oldRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string; csrfToken: string; userId: string }> => {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError(403, "Invalid or expired refresh token");
  }

  const hashedOldToken = hashToken(oldRefreshToken);
  const storedToken = await RefreshToken.findOne({
    hashedToken: hashedOldToken,
  });

  if (!storedToken) {
    await RefreshToken.deleteMany({ user: payload.userId });
    throw new AppError(403, "Refresh token reuse detected. All sessions revoked.");
  }

  if (storedToken.user.toString() !== payload.userId) {
    throw new AppError(403, "Invalid refresh token");
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError(403, "User not found");
  }

  const newAccessToken = generateAccessToken(user._id.toString(), user.role);
  const newRefreshToken = generateRefreshToken(user._id.toString());
  const csrfToken = generateCsrfToken();
  const hashedNewToken = hashToken(newRefreshToken);

  await RefreshToken.deleteOne({ _id: storedToken._id });
  await RefreshToken.create({
    user: user._id,
    hashedToken: hashedNewToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    csrfToken,
    userId: user._id.toString(),
  };
};
