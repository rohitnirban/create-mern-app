import http from "http";
import app from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/db";
import { logger } from "./utils/logger";

let server: http.Server | null = null;

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Received shutdown signal, closing server");
  if (!server) {
    process.exit(0);
    return;
  }
  server.close(async (err) => {
    if (err) logger.error({ err }, "Error while closing server");
    try {
      await disconnectDB();
    } catch (e) {
      logger.error({ err: e }, "Error during disconnect");
    }
    logger.info("Shutdown complete");
    process.exit(err ? 1 : 0);
  });
  const forceExit = setTimeout(() => {
    logger.warn("Forcing exit after 10s");
    process.exit(1);
  }, 10000);
  forceExit.unref();
}

const start = async () => {
  await connectDB();

  server = http.createServer(app);
  server.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });
};

start().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
