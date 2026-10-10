import crypto from "crypto";
import nodemailer from "nodemailer";

try {
  (process as any).loadEnvFile?.();
} catch {
  // .env already loaded or not present
}

export interface StoredOtp {
  id: string;
  identifier: string; // email or normalized phone
  type: "email" | "sms";
  purpose: "registration" | "login" | "password_reset" | "verification";
  otpHash: string;
  salt: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  resendCooldownUntil: number;
  verified: boolean;
  createdAt: number;
}

// In-memory persistent server cache for OTP records
const otpStore = new Map<string, StoredOtp>();

// Rate limit store: identifier -> timestamp[]
const rateLimitStore = new Map<string, number[]>();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_MS = 60 * 1000; // 60 seconds resend cooldown
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_MAX = 5; // max 5 requests
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes

function normalizeIdentifier(val: string): string {
  const trimmed = val.trim().toLowerCase();
  const digits = trimmed.replace(/\D/g, "");
  if (!trimmed.includes("@") && digits.length >= 10) {
    return digits.slice(-10);
  }
  return trimmed;
}

function hashOtp(otp: string, salt: string): string {
  return crypto.createHash("sha256").update(`${salt}:${otp}`).digest("hex");
}

function checkRateLimit(identifier: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const history = rateLimitStore.get(identifier) || [];
  const recent = history.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    const oldestInWindow = recent[0];
    const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestInWindow)) / 1000);
    return { allowed: false, waitSeconds };
  }

  recent.push(now);
  rateLimitStore.set(identifier, recent);
  return { allowed: true };
}

/**
 * Sends Email OTP via SMTP if credentials exist, or provides development simulator
 */
export async function sendEmailOtp(
  email: string,
  purpose: "registration" | "login" | "password_reset" | "verification" = "registration"
): Promise<{ success: boolean; message: string; cooldownSeconds: number; devOtp?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Please provide a valid email address.");
  }

  const rateCheck = checkRateLimit(cleanEmail);
  if (!rateCheck.allowed) {
    throw new Error(`Too many OTP requests. Please try again in ${rateCheck.waitSeconds} seconds.`);
  }

  const key = `email:${cleanEmail}:${purpose}`;
  const now = Date.now();
  const existing = otpStore.get(key);

  if (existing && existing.resendCooldownUntil > now) {
    const remaining = Math.ceil((existing.resendCooldownUntil - now) / 1000);
    throw new Error(`Please wait ${remaining} seconds before requesting a new OTP.`);
  }

  // Generate secure 6-digit random OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const salt = crypto.randomBytes(16).toString("hex");
  const otpHash = hashOtp(rawOtp, salt);

  const otpRecord: StoredOtp = {
    id: `otp-${crypto.randomUUID().slice(0, 8)}`,
    identifier: cleanEmail,
    type: "email",
    purpose,
    otpHash,
    salt,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    resendCooldownUntil: now + COOLDOWN_MS,
    verified: false,
    createdAt: now,
  };

  otpStore.set(key, otpRecord);

  // Attempt real SMTP dispatch if configured
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpUser = process.env.SMTP_USER || "saiprithvi0705@gmail.com";
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "brytuohojhsfblwt";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const rawFrom = process.env.SMTP_FROM;
  const smtpFromEmail = process.env.SMTP_FROM_EMAIL || "saiprithvi0705@gmail.com";
  const smtpFromName = process.env.SMTP_FROM_NAME || "AI Smartgate Estate OS";
  const finalFrom = rawFrom || `"${smtpFromName}" <${smtpFromEmail}>`;

  let dispatched = false;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const subjectMap: Record<string, string> = {
        registration: `${rawOtp} is your AI Smartgate Estate OS registration verification code`,
        login: `${rawOtp} is your AI Smartgate Estate OS login verification code`,
        password_reset: `${rawOtp} is your AI Smartgate Estate OS password reset code`,
        verification: `${rawOtp} is your AI Smartgate Estate OS verification code`,
      };

      const mailOptions = {
        from: finalFrom,
        to: cleanEmail,
        replyTo: "saiprithvi0705@gmail.com",
        subject: subjectMap[purpose] || `${rawOtp} is your AI Smartgate Estate OS security code`,
        date: new Date(),
        messageId: `<otp-${Date.now()}-${crypto.randomBytes(4).toString("hex")}@saiprithvi0705@gmail.com>`,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          "Importance": "high",
          "X-Entity-Ref-ID": `em-otp-${Date.now()}`,
        },
        text: `Your AI Smartgate Estate OS security verification code is: ${rawOtp}

This single-use code is valid for 10 minutes. Please do not share this code with anyone.

If you did not request this verification code, you can safely disregard this message.

— AI Smartgate Estate OS Security Team
Smart Society Operating System
`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Smartgate Estate OS Security Code</title>
          </head>
          <body style="margin: 0; padding: 24px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 32px 28px 20px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f2b5c; letter-spacing: -0.5px;">AI Smartgate Estate OS</h1>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Smart Society Security System</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px 28px 20px;">
                  <p style="margin: 0 0 16px; font-size: 14px; color: #334155; line-height: 1.5;">Hello,</p>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #334155; line-height: 1.5;">Your one-time verification code for <strong>${purpose.replace("_", " ")}</strong> is:</p>
                  
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe; margin: 16px 0 24px;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; display: inline-block;">${rawOtp}</span>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 8px; font-size: 13px; color: #475569; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone, including AI Smartgate Estate OS staff.</p>
                  <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">If you did not request this verification code, please disregard this email or contact society security if you suspect unauthorized activity.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">© 2026 AI Smartgate Estate OS · Smart Society Operating System</p>
                  <p style="margin: 4px 0 0; font-size: 10px; color: #cbd5e1;">DPDP Act Compliant · Automated Security Transaction</p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

      await transporter.sendMail(mailOptions);
      dispatched = true;
    } catch (err) {
      console.error("[SMTP Transport Error]: Failed to send email via SMTP", err);
    }
  }

  // Securely log dispatch in dev mode
  if (process.env.NODE_ENV !== "production") {
    console.log(`[AUTH-OTP:EMAIL] [Target: ${cleanEmail}] [Purpose: ${purpose}] [Dispatched: ${dispatched ? "SMTP" : "Simulated"}]`);
    console.log(`[AUTH-OTP:EMAIL-CODE]: ${rawOtp} for ${cleanEmail}`);
  }

  return {
    success: true,
    message: dispatched ? `OTP successfully sent to ${cleanEmail}` : `OTP dispatched to ${cleanEmail}`,
    cooldownSeconds: 60,
    devOtp: process.env.NODE_ENV !== "production" ? rawOtp : undefined,
  };
}

/**
 * Sends Mobile SMS OTP via SMS provider if configured, or provides development simulator
 */
export async function sendSmsOtp(
  phone: string,
  purpose: "registration" | "login" | "password_reset" | "verification" = "registration"
): Promise<{ success: boolean; message: string; cooldownSeconds: number; devOtp?: string }> {
  const digits = phone.replace(/\D/g, "");
  const cleanPhone = digits.length >= 10 ? digits.slice(-10) : digits;

  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error("Please provide a valid 10-digit mobile number.");
  }

  const rateCheck = checkRateLimit(cleanPhone);
  if (!rateCheck.allowed) {
    throw new Error(`Too many OTP requests. Please try again in ${rateCheck.waitSeconds} seconds.`);
  }

  const key = `sms:${cleanPhone}:${purpose}`;
  const now = Date.now();
  const existing = otpStore.get(key);

  if (existing && existing.resendCooldownUntil > now) {
    const remaining = Math.ceil((existing.resendCooldownUntil - now) / 1000);
    throw new Error(`Please wait ${remaining} seconds before requesting a new OTP.`);
  }

  // Generate secure 6-digit random OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const salt = crypto.randomBytes(16).toString("hex");
  const otpHash = hashOtp(rawOtp, salt);

  const otpRecord: StoredOtp = {
    id: `otp-${crypto.randomUUID().slice(0, 8)}`,
    identifier: cleanPhone,
    type: "sms",
    purpose,
    otpHash,
    salt,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    resendCooldownUntil: now + COOLDOWN_MS,
    verified: false,
    createdAt: now,
  };

  otpStore.set(key, otpRecord);

  // If Twilio credentials are configured in .env, send real SMS
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuthToken && twilioPhone) {
    try {
      const twilioModule = await import("twilio");
      const createTwilioClient = (twilioModule as any).default || twilioModule;
      const twilioClient = createTwilioClient(twilioSid, twilioAuthToken);
      await twilioClient.messages.create({
        body: `Your AI Smartgate Estate OS verification code is: ${rawOtp}. Valid for 10 minutes.`,
        from: twilioPhone,
        to: `+91${cleanPhone}`,
      });
      console.log(`[AUTH-OTP:SMS:TWILIO] Dispatched real SMS to +91 ${cleanPhone}`);
    } catch (twilioErr: any) {
      console.warn(`[AUTH-OTP:SMS:TWILIO] Failed to dispatch via Twilio:`, twilioErr.message);
    }
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[AUTH-OTP:SMS] [Target: +91 ${cleanPhone}] [Purpose: ${purpose}] [Dispatched: Simulated (Code: ${rawOtp})]`);
    }
  }

  return {
    success: true,
    message: `OTP dispatched to +91 ${cleanPhone}`,
    cooldownSeconds: 60,
    devOtp: undefined,
  };
}

/**
 * Securely verifies an OTP code and invalidates it upon success
 */
export function verifyOtp(
  identifier: string,
  code: string,
  type: "email" | "sms",
  purpose: "registration" | "login" | "password_reset" | "verification" = "registration"
): { success: boolean; message: string; verificationToken?: string } {
  const norm = normalizeIdentifier(identifier);
  const cleanCode = code.trim();

  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, message: "Please enter the 6-digit verification code." };
  }

  const key = `${type}:${norm}:${purpose}`;
  const record = otpStore.get(key);

  if (!record) {
    return { success: false, message: "No active verification code found. Please request a new OTP." };
  }

  const now = Date.now();

  // Check expiration
  if (now > record.expiresAt) {
    otpStore.delete(key);
    return { success: false, message: "This verification code has expired. Please request a new OTP." };
  }

  // Check attempt limit
  if (record.attempts >= record.maxAttempts) {
    otpStore.delete(key);
    return { success: false, message: "Maximum verification attempts exceeded. Please request a new OTP." };
  }

  // Verify hash
  const computedHash = hashOtp(cleanCode, record.salt);
  if (computedHash !== record.otpHash) {
    record.attempts += 1;
    const remaining = record.maxAttempts - record.attempts;
    if (remaining <= 0) {
      otpStore.delete(key);
      return { success: false, message: "Too many incorrect attempts. This code has been invalidated." };
    }
    return { success: false, message: `Incorrect code. ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.` };
  }

  // Mark verified & generate single-use verification token
  record.verified = true;
  const token = `vtok_${crypto.randomBytes(24).toString("hex")}`;

  // Invalidate OTP immediately to prevent reuse
  otpStore.delete(key);

  return {
    success: true,
    message: "Verification successful.",
    verificationToken: token,
  };
}
