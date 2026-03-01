import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

const poolSize = 10;
const serverSelectionTimeoutMS = 5000;
const connectTimeoutMS = 10000;

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongodbUri, {
      maxPoolSize: poolSize,
      serverSelectionTimeoutMS,
      connectTimeoutMS,
    });
    logger.info({ host: conn.connection.host }, "MongoDB connected");

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
  } catch (error) {
    logger.fatal({ err: error }, "MongoDB connection error");
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB connection closed");
};
