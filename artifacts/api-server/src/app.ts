import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import pinoHttp from "pino-http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import router from "./routes";
import { logger, sanitizeBody } from "./lib/logger";
import { attachUser } from "./lib/auth";

const app: Express = express();
// Respect proxy headers when running behind a load balancer (affects secure cookies)
const trustProxy = (process.env.TRUST_PROXY ?? "").toLowerCase();
if (trustProxy === "1" || trustProxy === "true") {
  app.set("trust proxy", 1);
}
const corsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  pinoHttp({
    logger,
    // Use existing X-Request-ID header if provided, otherwise generate a UUID.
    genReqId: (req) => {
      const incoming = (req.headers && (req.headers["x-request-id"] as string)) || undefined;
      if (incoming && typeof incoming === "string" && incoming.trim()) return incoming;
      try {
        return crypto.randomUUID();
      } catch {
        // Fallback to timestamp if randomUUID isn't available
        return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      }
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Expose the request id to clients for correlation with logs
app.use((req, res, next) => {
  try {
    if (req.id) res.setHeader("X-Request-ID", String(req.id));
  } catch {
    // ignore
  }
  next();
});
app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  }),
);
// Security: set sensible defaults for Production
app.use(helmet());

// Rate limiting: configurable via env
const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS ?? 15 * 60 * 1000); // 15 minutes
const RATE_MAX = Number(process.env.RATE_MAX ?? 100); // 100 requests per window per IP
app.use(
  rateLimit({
    windowMs: isNaN(RATE_WINDOW_MS) ? 15 * 60 * 1000 : RATE_WINDOW_MS,
    max: isNaN(RATE_MAX) ? 100 : RATE_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  }),
);

// Warn if running in production without explicit CORS origins
if (process.env.NODE_ENV === "production" && corsOrigins.length === 0) {
  logger.warn("CORS_ORIGIN not set in production — allowing all origins");
}
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api",
  (req, res, next) => {
    if (req.method === "GET") {
      if (req.path.startsWith("/auth")) {
        res.set("Cache-Control", "no-store");
      } else {
        res.set("Cache-Control", "public, max-age=60");
      }
    }
    next();
  },
  attachUser,
  router,
);

// Global error handler: logs sanitized context and returns a safe error message
app.use((err: any, req: any, res: any, next: any) => {
  try {
    const safeBody = sanitizeBody(req.body);
    const safeHeaders: Record<string, any> = {
      host: req.headers.host,
      referer: req.headers.referer,
      "user-agent": req.headers["user-agent"],
      "content-type": req.headers["content-type"],
    };
    req.log?.error({ err, body: safeBody, headers: safeHeaders }, "unhandled error");
  } catch (logErr) {
    // eslint-disable-next-line no-console
    console.error("error handler failed", logErr, err);
  }
  try {
    res.status(500).json({ error: "Internal server error", requestId: req.id });
  } catch {
    // If response fails, just end the connection
    try {
      res.statusCode = 500;
      res.end();
    } catch {
      /* ignore */
    }
  }
});

export default app;
