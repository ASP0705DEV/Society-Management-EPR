import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { otpApiPlugin } from "./src/server/api-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), otpApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 3100,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      "flint-geiger-vixen.ngrok-free.dev",
      ".ngrok-free.dev",
      ".ngrok.io",
      ".loca.lt",
    ],
  },
});
