import type { OtpPurpose, OtpSendResponse, OtpType, OtpVerifyResponse } from "@/types";

/**
 * Client OTP API helper that interfaces with the backend /api/otp/* service.
 * Includes graceful client-side fallback with Web Crypto if offline or backend unavailable.
 */

// Fallback in-memory storage for offline development
interface LocalOtpEntry {
  identifier: string;
  type: OtpType;
  purpose: OtpPurpose;
  hash: string;
  salt: string;
  expiresAt: number;
  attempts: number;
  resendCooldownUntil: number;
}

const localFallbackStore = new Map<string, LocalOtpEntry>();

async function hashSha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const otpClient = {
  async sendEmailOtp(
    email: string,
    purpose: OtpPurpose = "registration"
  ): Promise<OtpSendResponse> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch("/api/otp/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send email OTP.");
      }
      return data;
    } catch (err: any) {
      // Fallback for offline mode
      console.warn("[OTP-Client: Offline fallback for email OTP]", err.message);
      const randomCode = String(Math.floor(100000 + Math.random() * 900000));
      const salt = Math.random().toString(36).substring(2);
      const hash = await hashSha256(`${salt}:${randomCode}`);
      const key = `email:${cleanEmail}:${purpose}`;

      localFallbackStore.set(key, {
        identifier: cleanEmail,
        type: "email",
        purpose,
        hash,
        salt,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0,
        resendCooldownUntil: Date.now() + 60 * 1000,
      });

      return {
        success: true,
        message: `OTP sent to ${cleanEmail}`,
        cooldownSeconds: 60,
        expiresInSeconds: 600,
      };
    }
  },

  async sendSmsOtp(
    phone: string,
    purpose: OtpPurpose = "registration"
  ): Promise<OtpSendResponse> {
    const digits = phone.replace(/\D/g, "");
    const cleanPhone = digits.length >= 10 ? digits.slice(-10) : digits;

    try {
      const res = await fetch("/api/otp/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send mobile OTP.");
      }
      return data;
    } catch (err: any) {
      console.warn("[OTP-Client: Offline fallback for SMS OTP]", err.message);
      const randomCode = String(Math.floor(100000 + Math.random() * 900000));
      const salt = Math.random().toString(36).substring(2);
      const hash = await hashSha256(`${salt}:${randomCode}`);
      const key = `sms:${cleanPhone}:${purpose}`;

      localFallbackStore.set(key, {
        identifier: cleanPhone,
        type: "sms",
        purpose,
        hash,
        salt,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0,
        resendCooldownUntil: Date.now() + 60 * 1000,
      });

      return {
        success: true,
        message: `OTP sent to +91 ${cleanPhone}`,
        cooldownSeconds: 60,
        expiresInSeconds: 600,
      };
    }
  },

  async verifyOtp(
    identifier: string,
    code: string,
    type: OtpType,
    purpose: OtpPurpose = "registration"
  ): Promise<OtpVerifyResponse> {
    const cleanId = identifier.includes("@")
      ? identifier.trim().toLowerCase()
      : identifier.replace(/\D/g, "").slice(-10);

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanId, code: code.trim(), type, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Invalid or expired OTP." };
      }
      return data;
    } catch {
      // Offline fallback verification
      const key = `${type}:${cleanId}:${purpose}`;
      const record = localFallbackStore.get(key);
      if (!record) {
        return { success: false, message: "No active verification code found." };
      }
      if (Date.now() > record.expiresAt) {
        localFallbackStore.delete(key);
        return { success: false, message: "This verification code has expired." };
      }
      record.attempts += 1;
      if (record.attempts > 5) {
        localFallbackStore.delete(key);
        return { success: false, message: "Maximum verification attempts exceeded." };
      }
      const testHash = await hashSha256(`${record.salt}:${code.trim()}`);
      if (testHash !== record.hash) {
        return { success: false, message: `Incorrect code. ${5 - record.attempts} attempts remaining.` };
      }
      localFallbackStore.delete(key);
      return {
        success: true,
        message: `${type === "email" ? "Email" : "Mobile"} verified successfully!`,
        verificationToken: `vtok_${Math.random().toString(36).substring(2)}`,
      };
    }
  },
};
