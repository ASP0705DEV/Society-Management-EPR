import { Router } from "express";
import { prisma } from "../db";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  type AuthenticatedRequest,
} from "../lib/auth";
import type { Role, SessionUser } from "../../../src/types";

export const authRouter = Router();

function toSessionUser(user: any): SessionUser {
  const { password, ...session } = user;
  return session as SessionUser;
}

// -------------------------------------------------------------
// POST /api/auth/login (Email or Phone + Password with Argon2)
// -------------------------------------------------------------
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email/Phone and password are required." });
      return;
    }

    const cleanInput = String(email).trim().toLowerCase();
    const cleanPass = String(password).trim();
    const phoneDigits = cleanInput.replace(/\D/g, "");

    // Look up user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanInput, mode: "insensitive" } },
          phoneDigits.length >= 10
            ? { phone: { contains: phoneDigits.slice(-10) } }
            : { email: { equals: cleanInput, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials. Account not found." });
      return;
    }

    if (user.status === "disabled") {
      res.status(403).json({ error: "This account has been deactivated by the estate office." });
      return;
    }

    if (user.status === "pending") {
      res.status(403).json({
        error: "Your registration is awaiting society admin approval. Please contact your society office.",
      });
      return;
    }

    const isMatch = await verifyPassword(user.password, cleanPass);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials. Please verify your password." });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      societyId: user.societyId,
      unitId: user.unitId,
    });

    setAuthCookie(res, token);

    res.json({
      success: true,
      user: toSessionUser(user),
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during authentication." });
  }
});

// -------------------------------------------------------------
// POST /api/auth/demo-login (1-Click Instant Demo Sign-In)
// -------------------------------------------------------------
authRouter.post("/demo-login", async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      res.status(400).json({ error: "Role is required for demo login." });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { role: String(role) },
    });

    if (!user) {
      res.status(404).json({ error: `No active demo account found for role "${role}".` });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      societyId: user.societyId,
      unitId: user.unitId,
    });

    setAuthCookie(res, token);

    res.json({
      success: true,
      user: toSessionUser(user),
      token,
    });
  } catch (error: any) {
    console.error("Demo login error:", error);
    res.status(500).json({ error: "Internal server error during demo login." });
  }
});

// -------------------------------------------------------------
// POST /api/auth/register-resident (Resident Self-Registration)
// -------------------------------------------------------------
authRouter.post("/register-resident", async (req, res) => {
  try {
    const { name, email, phone, password, block, number } = req.body;
    const code = req.body.code || req.body.societyCode;

    if (!code || !name || !email || !password || !block || !number) {
      res.status(400).json({ error: "All required registration fields must be provided." });
      return;
    }

    const rawCode = String(code).trim();
    const cleanCode = rawCode.toUpperCase().replace(/[\s-]/g, "");
    const withHyphen = rawCode.includes("-")
      ? rawCode
      : rawCode.length > 2
      ? `${rawCode.slice(0, 2)}-${rawCode.slice(2)}`
      : rawCode;

    const society = await prisma.society.findFirst({
      where: {
        OR: [
          { code: { equals: rawCode, mode: "insensitive" } },
          { code: { equals: cleanCode, mode: "insensitive" } },
          { code: { equals: withHyphen, mode: "insensitive" } },
        ],
      },
    });

    if (!society) {
      res.status(404).json({ error: `Society code "${code}" was not found.` });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      res.status(409).json({ error: "An account with this email address already exists." });
      return;
    }

    // Find or create the unit
    const cleanBlock = String(block).trim().toUpperCase();
    const cleanNumber = String(number).trim();

    let unit = await prisma.unit.findFirst({
      where: {
        societyId: society.id,
        block: cleanBlock,
        number: cleanNumber,
      },
    });

    if (!unit) {
      unit = await prisma.unit.create({
        data: {
          societyId: society.id,
          block: cleanBlock,
          number: cleanNumber,
          floor: parseInt(cleanNumber.slice(0, 1), 10) || 1,
        },
      });
    }

    const hashedPassword = await hashPassword(String(password).trim());

    const newUser = await prisma.user.create({
      data: {
        societyId: society.id,
        unitId: unit.id,
        name: String(name).trim(),
        email: cleanEmail,
        phone: String(phone || "").trim(),
        password: hashedPassword,
        role: "resident",
        status: "pending", // Pending society admin approval
        emailVerified: true, // Completed OTP before submission
        phoneVerified: false,
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully! Pending society admin approval.",
      user: toSessionUser(newUser),
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to submit resident registration." });
  }
});

// -------------------------------------------------------------
// GET /api/auth/me (Current Session Check)
// -------------------------------------------------------------
authRouter.get("/me", async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.json({ user: null });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      clearAuthCookie(res);
      res.json({ user: null });
      return;
    }

    res.json({ user: toSessionUser(user) });
  } catch (error: any) {
    console.error("Me error:", error);
    res.json({ user: null });
  }
});

// -------------------------------------------------------------
// POST /api/auth/logout (Clear Auth Cookie)
// -------------------------------------------------------------
authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: "Logged out successfully." });
});

// -------------------------------------------------------------
// POST /api/auth/reset-password (Password Reset with Argon2)
// -------------------------------------------------------------
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    if (!identifier || !newPassword) {
      res.status(400).json({ error: "Identifier and new password are required." });
      return;
    }

    const cleanInput = String(identifier).trim().toLowerCase();
    const phoneDigits = cleanInput.replace(/\D/g, "");

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanInput, mode: "insensitive" } },
          phoneDigits.length >= 10
            ? { phone: { contains: phoneDigits.slice(-10) } }
            : { email: { equals: cleanInput, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      res.status(404).json({ error: "Account not found for password reset." });
      return;
    }

    const hashedPassword = await hashPassword(String(newPassword).trim());
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
});
