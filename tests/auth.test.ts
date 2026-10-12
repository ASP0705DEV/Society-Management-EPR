import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "../server/src/lib/auth";

describe("Phase 4: Authentication Security & Argon2 Tests", () => {
  it("should securely hash and verify a password using Argon2", async () => {
    const plainPassword = "Resident@Secret2026!";
    const hashed = await hashPassword(plainPassword);

    expect(hashed).toBeDefined();
    expect(hashed.startsWith("$argon2")).toBe(true);

    const isMatch = await verifyPassword(hashed, plainPassword);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword(hashed, "WrongPassword");
    expect(isWrongMatch).toBe(false);
  });

  it("should generate and verify signed JWT tokens for session auth", () => {
    const payload = {
      userId: "user-123",
      email: "resident@silverwood.dev",
      role: "resident" as const,
      societyId: "soc-silverwood",
      unitId: "unit-a101",
    };

    const token = generateToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
  });
});
