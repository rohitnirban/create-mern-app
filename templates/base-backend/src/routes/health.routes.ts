import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { successResponse, errorResponse } from "../types/api.types";

export const healthRouter = Router();

/** Liveness: process is running. No dependencies. */
healthRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json(successResponse({ status: "ok" }));
});

/** Readiness: DB is reachable. */
healthRouter.get("/ready", async (_req: Request, res: Response) => {
  const checks: { mongodb: string } = {
    mongodb: mongoose.connection.readyState === 1 ? "up" : "down",
  };

  const allUp = checks.mongodb === "up";
  if (allUp) {
    res.status(200).json(successResponse({ ...checks, ready: true }));
  } else {
    const errors: Record<string, string[]> = {
      mongodb: [checks.mongodb],
    };
    res.status(503).json(errorResponse("Service unavailable", errors));
  }
});
