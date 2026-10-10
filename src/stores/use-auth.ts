import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useData } from "@/stores/use-data";
import { repository } from "@/data/local-repository";
import type { Database, Role, SessionUser, User } from "@/types";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

interface AuthState {
  user: SessionUser | null;
  /** Returns an error message, or null when sign-in works. */
  login: (email: string, password: string, db?: Database) => string | null;
  /** 1-click instant demo sign-in guaranteed to find the role account */
  loginDemo: (role: Role, db?: Database) => string | null;
  /** Reset user password after verified OTP */
  resetPasswordWithOtp: (identifier: string, newPass: string) => string | null;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, password, db) => {
        const activeDb = db || useData.getState().db;
        const cleanInput = email.trim().toLowerCase();
        const cleanPass = password.trim();
        const phoneDigits = cleanInput.replace(/\D/g, "");

        // 1. Direct match by email OR by phone number (last 10 digits) OR auto-generated resident email
        let match: User | undefined = activeDb.users.find((person) => {
          const personEmail = (person.email || "").trim().toLowerCase();
          const emailMatch = Boolean(personEmail && personEmail === cleanInput);
          const cleanPersonPhone = (person.phone || "").replace(/\D/g, "");
          const phoneMatch = Boolean(
            phoneDigits.length >= 10 &&
            cleanPersonPhone.length >= 10 &&
            cleanPersonPhone.endsWith(phoneDigits.slice(-10)),
          );
          const autoEmailMatch = Boolean(
            phoneDigits.length >= 10 &&
            personEmail.includes(phoneDigits.slice(-10)),
          );
          return emailMatch || phoneMatch || autoEmailMatch;
        });

        // 2. Demo aliases match for quick demo convenience
        if (!match) {
          if (
            cleanInput === "saiggs62@gmail.com" ||
            cleanInput === "admin@silverwood.dev" ||
            phoneDigits.endsWith("7070362117")
          ) {
            match = activeDb.users.find((p) => p.role === "society_admin");
          } else if (
            cleanInput === "saiggs739@gmail.com" ||
            cleanInput === "guard@silverwood.dev" ||
            phoneDigits.endsWith("7283094259")
          ) {
            match = activeDb.users.find((p) => p.role === "gatekeeper");
          } else if (
            cleanInput === "saiprithvi0705@gmail.com" ||
            cleanInput === "superadmin@smartgate.dev"
          ) {
            match = activeDb.users.find((p) => p.role === "super_admin");
          } else if (
            cleanInput === "saiggs055@gmail.com" ||
            cleanInput === "resident@silverwood.dev" ||
            phoneDigits.endsWith("9102511504")
          ) {
            match = activeDb.users.find((p) => p.role === "resident");
          }
        }

        if (!match) {
          return "Email/Mobile or password is incorrect.";
        }

        // Validate password (support custom password or canonical role demo passwords)
        const validPasswords = [match.password, match.password.trim()];
        if (match.role === "society_admin") validPasswords.push("SocietyAdmin@2026", "admin123");
        if (match.role === "gatekeeper") validPasswords.push("GateGuard@2026", "guard123", "gate123");
        if (match.role === "super_admin") validPasswords.push("SuperAdmin@2026", "super123");
        if (match.role === "resident") validPasswords.push("Resident@2026", "resident123");

        if (!validPasswords.includes(cleanPass)) {
          return "Email/Mobile or password is incorrect.";
        }

        if (match.status === "disabled") {
          return "This account has been disabled by society management.";
        }

        if (match.status === "pending") {
          return "Your registration is pending approval by the Society Admin. You can log in once approved.";
        }

        if (match.status === "invited") {
          return "Your account has been invited. Please wait for society admin activation.";
        }

        if (match.status !== "active") {
          return "Your account is not active. Please contact society management.";
        }

        const { password: _hidden, ...session } = match;
        set({ user: session });

        // Synchronize authenticated session with backend API
        fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanInput, password: cleanPass }),
        }).catch(() => {});

        return null;
      },

      loginDemo: (role, db) => {
        const activeDb = db || useData.getState().db;
        let match = activeDb.users.find((p) => p.role === role && p.status === "active");
        if (!match) {
          match = activeDb.users.find((p) => p.role === role);
        }
        if (!match) return `No demo account found for ${role}`;
        const { password: _hidden, ...session } = match;
        set({ user: session });

        // Synchronize demo session with backend API
        fetch(`${API_BASE}/api/auth/demo-login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        }).catch(() => {});

        return null;
      },

      resetPasswordWithOtp: (identifier, newPass) => {
        const activeDb = useData.getState().db;
        const cleanInput = identifier.trim().toLowerCase();
        const phoneDigits = cleanInput.replace(/\D/g, "");

        const userIndex = activeDb.users.findIndex((person) => {
          const personEmail = (person.email || "").trim().toLowerCase();
          const emailMatch = Boolean(personEmail && personEmail === cleanInput);
          const cleanPersonPhone = (person.phone || "").replace(/\D/g, "");
          const phoneMatch = Boolean(
            phoneDigits.length >= 10 &&
            cleanPersonPhone.length >= 10 &&
            cleanPersonPhone.endsWith(phoneDigits.slice(-10)),
          );
          return emailMatch || phoneMatch;
        });

        if (userIndex === -1) {
          return "User account with this email or mobile number was not found.";
        }

        const updatedUsers = [...activeDb.users];
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          password: newPass.trim(),
          updatedAt: new Date().toISOString(),
        };

        const nextDb = { ...activeDb, users: updatedUsers };
        useData.setState({ db: nextDb });
        void repository.save(nextDb);

        // Sync password reset with backend API
        fetch(`${API_BASE}/api/auth/reset-password`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: cleanInput, newPassword: newPass.trim() }),
        }).catch(() => {});

        return null;
      },

      logout: () => {
        fetch(`${API_BASE}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        }).catch(() => {});
        set({ user: null });
      },
    }),
    { name: "gagellan-session" },
  ),
);
