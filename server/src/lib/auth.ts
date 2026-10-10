import { hash, verify } from "@node-rs/argon2";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { Role, SessionUser } from "../../../src/types";

const JWT_SECRET = process.env.JWT_SECRET || "ai-smartgate-estate-os-jwt-secret-2026";
const TOKEN_COOKIE_NAME = "smartgate_token";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  societyId: string | null;
  unitId: string | null;
}

export async function hashPassword(plainText: string): Promise<string> {
  return hash(plainText, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function verifyPassword(hashed: string, plainText: string): Promise<boolean> {
  try {
    // If legacy plain text password in dev DB, fallback gracefully
    if (!hashed.startsWith("$argon2")) {
      return hashed === plainText;
    }
    return await verify(hashed, plainText);
  } catch {
    return false;
  }
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.[TOKEN_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    next();
    return;
  }

  const payload = verifyToken(token);
  if (payload) {
    req.user = payload;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  next();
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized. Please sign in." });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden. Insufficient permissions for this resource." });
      return;
    }
    next();
  };
}
