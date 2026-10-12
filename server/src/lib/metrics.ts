import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import { getSocketServer } from "./socket";

interface RouteMetrics {
  count: number;
  totalDurationMs: number;
}

const routeStats: Map<string, RouteMetrics> = new Map();
const startTime = Date.now();

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const key = `${req.method} ${req.route?.path || req.path} ${res.statusCode}`;
    const existing = routeStats.get(key) || { count: 0, totalDurationMs: 0 };
    existing.count += 1;
    existing.totalDurationMs += duration;
    routeStats.set(key, existing);
  });
  next();
}

export async function getPrometheusMetrics(): Promise<string> {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();
  const io = getSocketServer();
  const socketCount = io ? io.engine?.clientsCount || 0 : 0;

  let dbStatus = 1;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 0;
  }

  const lines: string[] = [
    "# HELP smartgate_uptime_seconds Total seconds the service has been running",
    "# TYPE smartgate_uptime_seconds counter",
    `smartgate_uptime_seconds ${uptimeSeconds}`,
    "",
    "# HELP smartgate_db_status 1 if PostgreSQL is healthy, 0 if down",
    "# TYPE smartgate_db_status gauge",
    `smartgate_db_status ${dbStatus}`,
    "",
    "# HELP smartgate_active_websockets Number of connected Socket.io real-time clients",
    "# TYPE smartgate_active_websockets gauge",
    `smartgate_active_websockets ${socketCount}`,
    "",
    "# HELP smartgate_nodejs_heap_used_bytes Node.js process heap memory used",
    "# TYPE smartgate_nodejs_heap_used_bytes gauge",
    `smartgate_nodejs_heap_used_bytes ${memoryUsage.heapUsed}`,
    "",
    "# HELP smartgate_nodejs_heap_total_bytes Node.js process total heap memory allocated",
    "# TYPE smartgate_nodejs_heap_total_bytes gauge",
    `smartgate_nodejs_heap_total_bytes ${memoryUsage.heapTotal}`,
    "",
    "# HELP smartgate_http_requests_total Total HTTP requests handled by method, path, and status",
    "# TYPE smartgate_http_requests_total counter",
  ];

  for (const [key, stat] of routeStats.entries()) {
    const [method, path, status] = key.split(" ");
    lines.push(`smartgate_http_requests_total{method="${method}",path="${path}",status="${status}"} ${stat.count}`);
    const avgDuration = (stat.totalDurationMs / stat.count / 1000).toFixed(4);
    lines.push(`smartgate_http_request_duration_avg_seconds{method="${method}",path="${path}",status="${status}"} ${avgDuration}`);
  }

  return lines.join("\n") + "\n";
}
