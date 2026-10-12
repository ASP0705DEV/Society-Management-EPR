import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { authRouter } from "./routes/auth";
import { dataRouter } from "./routes/data";
import { otpRouter } from "./routes/otp";
import { uploadRouter } from "./routes/upload";
import { paymentsRouter } from "./routes/payments";
import { authMiddleware } from "./lib/auth";
import { runDatabaseSeed } from "./seed";

const app = express();
const PORT = process.env.PORT || 8080;

// Trust reverse proxies (Nginx / Cloudflare)
app.set("trust proxy", 1);

// CORS configuration supporting credentials from frontend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, local tunnels, or internal requests
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("ngrok")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// Auth middleware to decode JWT cookies
app.use(authMiddleware);

// Request logger in development
if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (req.path.startsWith("/api")) {
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });
}

import { metricsMiddleware, getPrometheusMetrics } from "./lib/metrics";

// Request & performance metrics collection
app.use(metricsMiddleware);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AI Smartgate Estate OS Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Prometheus & Grafana monitoring metrics endpoint
app.get("/api/metrics", async (_req, res) => {
  try {
    const metrics = await getPrometheusMetrics();
    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(metrics);
  } catch (error: any) {
    res.status(500).send("# Error collecting metrics\n");
  }
});

// Static file serving for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount modular routers
app.use("/api/auth", authRouter);
app.use("/api/data", dataRouter);
app.use("/api/otp", otpRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/payments", paymentsRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred.",
  });
});

import http from "http";
import { initSocketServer } from "./lib/socket";

const httpServer = http.createServer(app);
initSocketServer(httpServer);

// Boot server and seed database
async function startServer() {
  try {
    await runDatabaseSeed();
    httpServer.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 AI Smartgate Estate OS Backend Service Running`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`⚡ Comms: Socket.io real-time engine active`);
      console.log(`🛡️  Auth: Argon2 password hashing & HttpOnly JWT`);
      console.log(`🐘 DB: PostgreSQL on port 5432 (smartgate)`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error("Failed to start backend server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
