import type { Database, Role, SessionUser, Unit } from "@/types";

export function homePath(role: Role): string {
  if (role === "super_admin") return "/super";
  if (role === "society_admin") return "/society";
  if (role === "resident") return "/resident";
  return "/gate";
}

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function unitLabel(units: Unit[], unitId: string | null): string {
  const unit = units.find((item) => item.id === unitId);
  return unit ? `${unit.block}-${unit.number}` : "—";
}

export function societyName(db: Database, societyId: string | null): string {
  if (!societyId) return "All societies";
  return db.societies.find((item) => item.id === societyId)?.name ?? "Unknown society";
}

/** Rows a person is allowed to see. Super admin sees every society. */
export function inSociety<T extends { societyId: string }>(rows: T[], user: SessionUser): T[] {
  if (user.role === "super_admin") return rows;
  return rows.filter((row) => row.societyId === user.societyId);
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function pinCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Email or a 10-digit Indian mobile. At least one must be present and valid. */
export function contactError(email: string, phone: string): string | null {
  const mail = email.trim();
  const digits = phone.replace(/\D/g, "");
  const cleanDigits =
    digits.length === 11 && digits.startsWith("0")
      ? digits.slice(1)
      : digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  const phoneOk = cleanDigits.length === 10;
  if (!mail && !phone.trim()) return "Enter an email or a 10-digit mobile number.";
  if (mail && !emailOk) return "That email does not look valid.";
  if (phone.trim() && !phoneOk) return "Enter a valid 10-digit mobile number.";
  if (!emailOk && !phoneOk) return "Enter a valid email or a 10-digit mobile number.";
  return null;
}

export function roleLabel(role: Role): string {
  if (role === "super_admin") return "Platform Super Admin";
  if (role === "society_admin") return "Society Admin";
  if (role === "resident") return "Resident";
  return "Gatekeeper";
}
