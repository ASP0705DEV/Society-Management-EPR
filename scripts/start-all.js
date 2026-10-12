/**
 * AI Smartgate Estate OS - Unified Stack Launcher
 * Starts both Express Backend (:8080) and Vite Frontend (:3100) concurrently
 * with process cleanup, colored logging, and graceful termination.
 */

import { spawn, execSync } from "child_process";
import path from "path";
import process from "process";

const rootDir = process.cwd();

// ANSI color helpers
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

function log(prefix, color, message) {
  const lines = message.toString().split("\n");
  for (const line of lines) {
    if (line.trim().length > 0) {
      console.log(`${color}${colors.bold}[${prefix}]${colors.reset} ${line}`);
    }
  }
}

// 1. Free ports 8080 and 3100 if lingering from previous run
function clearPort(port) {
  try {
    const cmd =
      process.platform === "win32"
        ? `netstat -ano | findstr :${port}`
        : `lsof -ti :${port}`;
    const output = execSync(cmd, { stdio: ["pipe", "pipe", "ignore"] }).toString();
    if (process.platform === "win32") {
      const lines = output.trim().split("\n");
      const pids = new Set();
      lines.forEach((l) => {
        const parts = l.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0" && pid !== String(process.pid)) {
          pids.add(pid);
        }
      });
      pids.forEach((pid) => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
          console.log(`${colors.yellow}⚠️  Cleared existing process PID ${pid} holding port ${port}${colors.reset}`);
        } catch (_) {}
      });
    } else {
      const pids = output.trim().split("\n");
      pids.forEach((pid) => {
        if (pid) execSync(`kill -9 ${pid}`, { stdio: "ignore" });
      });
    }
  } catch (_) {
    // Port was already free
  }
}

console.log(`${colors.cyan}${colors.bold}
╔══════════════════════════════════════════════════════════════════╗
║               AI SMARTGATE ESTATE OS - FULL STACK                ║
║           Starting Backend (8080) & Frontend (3100)...           ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.gray}🔍 Checking ports 8080 and 3100...${colors.reset}`);
clearPort(8080);
clearPort(3100);

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

// 2. Launch Backend (Node Express + Socket.io)
console.log(`${colors.green}🚀 Starting Backend API on http://localhost:8080...${colors.reset}`);
const serverProc = spawn(npmCmd, ["run", "server"], {
  cwd: rootDir,
  shell: true,
  env: { ...process.env, FORCE_COLOR: "1" },
});

serverProc.stdout.on("data", (data) => log("API:8080", colors.magenta, data));
serverProc.stderr.on("data", (data) => log("API:ERR ", colors.red, data));

// 3. Launch Frontend (Vite SPA)
console.log(`${colors.green}🌐 Starting Frontend UI on http://localhost:3100...${colors.reset}`);
const clientProc = spawn(npmCmd, ["run", "dev"], {
  cwd: rootDir,
  shell: true,
  env: { ...process.env, FORCE_COLOR: "1" },
});

clientProc.stdout.on("data", (data) => log("WEB:3100", colors.cyan, data));
clientProc.stderr.on("data", (data) => log("WEB:ERR ", colors.red, data));

// 4. Graceful termination handler
let isShuttingDown = false;
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${colors.yellow}🛑 Shutting down AI Smartgate OS stack...${colors.reset}`);

  try {
    if (serverProc && !serverProc.killed) {
      if (isWin) {
        execSync(`taskkill /F /T /PID ${serverProc.pid}`, { stdio: "ignore" });
      } else {
        serverProc.kill("SIGINT");
      }
    }
  } catch (_) {}

  try {
    if (clientProc && !clientProc.killed) {
      if (isWin) {
        execSync(`taskkill /F /T /PID ${clientProc.pid}`, { stdio: "ignore" });
      } else {
        clientProc.kill("SIGINT");
      }
    }
  } catch (_) {}

  clearPort(8080);
  clearPort(3100);
  console.log(`${colors.green}✓ All processes stopped cleanly.${colors.reset}\n`);
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);
