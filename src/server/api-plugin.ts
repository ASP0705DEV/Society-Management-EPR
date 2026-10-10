import type { Plugin } from "vite";
import { sendEmailOtp, sendSmsOtp, verifyOtp } from "./otp-service";
import url from "url";

export function otpApiPlugin(): Plugin {
  return {
    name: "smartgate-otp-api-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = url.parse(req.url || "", true);
        const pathname = parsedUrl.pathname;

        if (!pathname?.startsWith("/api/otp")) {
          return next();
        }

        // Helper to parse JSON body
        const readBody = (): Promise<any> => {
          return new Promise((resolve, reject) => {
            let data = "";
            req.on("data", (chunk) => {
              data += chunk;
            });
            req.on("end", () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch (err) {
                reject(err);
              }
            });
            req.on("error", reject);
          });
        };

        const sendJson = (status: number, payload: any) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
        };

        try {
          if (pathname === "/api/otp/send-email" && req.method === "POST") {
            const body = await readBody();
            const result = await sendEmailOtp(body.email, body.purpose);
            return sendJson(200, result);
          }

          if (pathname === "/api/otp/send-sms" && req.method === "POST") {
            const body = await readBody();
            const result = await sendSmsOtp(body.phone, body.purpose);
            return sendJson(200, result);
          }

          if (pathname === "/api/otp/verify" && req.method === "POST") {
            const body = await readBody();
            const result = verifyOtp(body.identifier, body.code, body.type, body.purpose);
            return sendJson(result.success ? 200 : 400, result);
          }

          // Not found
          return sendJson(404, { error: "Unknown OTP API endpoint" });
        } catch (error: any) {
          return sendJson(400, {
            success: false,
            message: error.message || "An unexpected OTP service error occurred.",
          });
        }
      });
    },
  };
}
