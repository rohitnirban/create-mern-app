import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import { healthRouter } from "./routes/health.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/health", healthRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
