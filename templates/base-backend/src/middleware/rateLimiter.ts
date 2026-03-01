import rateLimit from "express-rate-limit";

const WINDOW_MS = 15 * 60 * 1000;

function rateLimitOptions(
  limit: number,
  message: string
): Parameters<typeof rateLimit>[0] {
  return {
    windowMs: WINDOW_MS,
    limit,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  };
}

export const loginLimiter = rateLimit(
  rateLimitOptions(10, "Too many login attempts, please try again after 15 minutes")
);

export const registerLimiter = rateLimit(
  rateLimitOptions(5, "Too many registration attempts, please try again after 15 minutes")
);

export const refreshLimiter = rateLimit(
  rateLimitOptions(10, "Too many refresh attempts, please try again after 15 minutes")
);
