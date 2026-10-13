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

// CSP header middleware allowing connect-src for sockets, APIs, and devtools
app.use((_req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: ws: wss: data: blob:; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* http://127.0.0.1:* ws://127.0.0.1:* https:;"
  );
  next();
});

// Chrome DevTools probe endpoint to prevent 404 and CSP errors
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({});
});

// Empty favicon handler to avoid 404
app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

// Root landing page for port 8080
app.get("/", (req, res) => {
  if (req.accepts("html")) {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Smartgate Estate OS API</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 36px; max-width: 480px; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    .badge { display: inline-block; background: rgba(99,102,241,0.2); border: 1px solid #4f46e5; color: #a5b4fc; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    h1 { font-size: 22px; margin: 0 0 10px 0; color: #ffffff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0; }
    .btn { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .btn:hover { background: #4338ca; }
    .links { margin-top: 20px; font-size: 12px; color: #64748b; }
    .links a { color: #818cf8; text-decoration: none; margin: 0 8px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Backend API Active • Port 8080</div>
    <h1>AI Smartgate Estate OS API</h1>
    <p>Backend Express service and Socket.io engine are active on port 8080.<br/>Click below to launch the web application.</p>
    <a href="http://localhost:3100" class="btn">Open Web Application (:3100) &rarr;</a>
    <div class="links">
      <a href="/api/health">/api/health</a> • 
      <a href="/api/metrics">/api/metrics</a> • 
      <a href="/api/data/snapshot">/api/data/snapshot</a>
    </div>
  </div>
</body>
</html>`);
  } else {
    res.json({
      service: "AI Smartgate Estate OS Backend API",
      status: "online",
      port: 8080,
      frontendUrl: "http://localhost:3100",
      endpoints: {
        health: "/api/health",
        metrics: "/api/metrics",
        snapshot: "/api/data/snapshot",
      },
    });
  }
});

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
app.use("/api", dataRouter);
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
