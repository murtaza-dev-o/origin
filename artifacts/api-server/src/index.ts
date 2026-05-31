import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] ?? "3001";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Global handlers for clearer diagnostics
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  // give the logger time to flush
  setTimeout(() => process.exit(1), 100);
});
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled rejection");
});

(async () => {
  // Seed if DB is available; import dynamically to avoid failing at module import time
  if (process.env.DATABASE_URL) {
    try {
      const mod = await import("./lib/seed");
      if (typeof mod.seedIfEmpty === "function") {
        await mod.seedIfEmpty();
      }
    } catch (err) {
      logger.error({ err }, "Seed failed");
    }
  } else {
    logger.warn("DATABASE_URL not set — skipping DB seed (server will start without DB)");
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
})();
