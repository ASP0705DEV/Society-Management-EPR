import { describe, it, expect } from "vitest";
import { verifyOtp } from "../src/server/otp-service";

describe("Phase 4: OTP Verification Service Tests", () => {
  it("should fail gracefully when code length is incorrect", () => {
    const res = verifyOtp("test@example.com", "123", "email", "registration");
    expect(res.success).toBe(false);
    expect(res.message).toContain("6-digit");
  });

  it("should fail when no OTP record exists for the identifier", () => {
    const res = verifyOtp("nonexistent@example.com", "999999", "email", "registration");
    expect(res.success).toBe(false);
    expect(res.message).toContain("No active verification code");
  });
});
