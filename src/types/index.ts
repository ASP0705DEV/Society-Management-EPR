/**
 * Shared shapes for Gagellan Society OS.
 *
 * Anything that belongs to one housing society carries `societyId`.
 * Platform-wide records (plans, and the Gagellan super admin user)
 * do not. That split is what keeps one society from seeing another.
 */

export type Role = "super_admin" | "society_admin" | "resident" | "gatekeeper";

export type AccountStatus = "active" | "invited" | "disabled" | "pending";

export interface User {
  id: string;
  /** Null only for the platform super admin. */
  societyId: string | null;
  unitId: string | null;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  status: AccountStatus;
  /** Verification status */
  emailVerified: boolean;
  phoneVerified: boolean;
  gateId?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Small image stored with the person. Null until someone uploads one. */
  photo: string | null;
}

export type OtpType = "email" | "sms";
export type OtpPurpose = "registration" | "login" | "password_reset" | "verification";

export interface OtpRecord {
  id: string;
  identifier: string;
  type: OtpType;
  purpose: OtpPurpose;
  otpHash: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  resendCooldownUntil: number;
  verified: boolean;
  createdAt: string;
}

export interface OtpSendResponse {
  success: boolean;
  message: string;
  cooldownSeconds: number;
  expiresInSeconds: number;
  /** Only present in local development test mode */
  devOtp?: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  verificationToken?: string;
}

/** Logged-in person. The password never stays in the browser session. */
export type SessionUser = Omit<User, "password">;

export interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  /** Shared with residents so they can join the right society. */
  code: string;
  photo: string | null;
}

/** A regular visitor such as a maid or driver, so the gate can recognise them. */
export interface Helper {
  id: string;
  societyId: string;
  unitId: string;
  name: string;
  phone: string;
  photo: string | null;
  duty: string;
  allowed: boolean;
}

export interface DemoRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  societyName: string;
  city: string;
  message: string;
  status: "new" | "contacted";
  createdAt: string;
}

/** A society buying a Gagellan plan. This is the sales record, not resident data. */
export interface Purchase {
  id: string;
  societyId: string;
  planId: string;
  amount: number;
  status: "paid" | "trial";
  buyerName: string;
  buyerEmail: string;
  purchasedAt: string;
  /** Razorpay payment id when the society paid. Null on a trial. */
  paymentId?: string | null;
}

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  maxUnits: number;
  maxGates: number;
  features: string[];
}

export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled";

export interface Subscription {
  id: string;
  societyId: string;
  planId: string;
  status: SubscriptionStatus;
  renewsOn: string;
}

export interface Unit {
  id: string;
  societyId: string;
  block: string;
  number: string;
  floor: number;
}

export type VisitorPurpose = "guest" | "delivery" | "cab" | "staff";
export type VisitorStatus = "pending" | "approved" | "rejected" | "checked_in";

export interface Visitor {
  id: string;
  societyId: string;
  unitId: string;
  hostUserId: string;
  name: string;
  phone: string;
  purpose: VisitorPurpose;
  status: VisitorStatus;
  /** Code the guard or resident can read out. */
  code: string;
  createdBy: "resident" | "gatekeeper";
  note: string;
  photo: string | null;
  helperId: string | null;
  createdAt: string;
  vehicleNumber?: string | null;
  validDurationHours?: number;
  isSurpriseDelivery?: boolean;
  category?: string | null;
}

export type ParcelStatus = "expected" | "at_gate" | "leave_at_gate" | "collected";

export interface Parcel {
  id: string;
  societyId: string;
  unitId: string;
  residentUserId: string;
  carrier: string;
  description: string;
  status: ParcelStatus;
  otp: string;
  createdAt: string;
}

/** Product support for Gagellan. Not a society complaint box. */
export type TicketCategory = "billing" | "access" | "bug" | "other";
export type TicketPriority = "low" | "medium" | "high";
export type TicketStatus = "open" | "in_progress" | "resolved";

export interface Ticket {
  id: string;
  societyId: string;
  raisedByUserId: string;
  subject: string;
  body: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
}

export interface Gate {
  id: string;
  societyId: string;
  name: string;
  visitorApprovalRequired: boolean;
  deliveryAutoApprove: boolean;
}

export interface Notice {
  id: string;
  societyId: string;
  title: string;
  body: string;
  createdAt: string;
  priority?: "urgent" | "normal" | "info";
  category?: string;
}

export interface StaffCheckIn {
  id: string;
  societyId: string;
  gateId: string;
  name: string;
  duty: string;
  photo: string | null;
  checkedInAt: string;
}

export interface WorkOrder {
  id: string;
  societyId: string;
  code: string;
  vendor: string;
  category: string;
  description: string;
  status: "sent" | "in_progress" | "completed";
  sentDate: string;
}

export interface SocietyNote {
  id: string;
  societyId: string;
  title: string;
  content: string;
  date: string;
}

export interface FamilyMember {
  id: string;
  societyId: string;
  unitId: string;
  primaryResidentId: string;
  name: string;
  relation: "Spouse" | "Child" | "Parent" | "Sibling" | "Relative" | "Other";
  phone: string;
  photo: string | null;
  addedAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  societyId: string;
  title: string;
  message: string;
  type: "visitor" | "parcel" | "notice" | "gate" | "security";
  createdAt: string;
  read: boolean;
}

/** One snapshot of all mock data. Swap this for API responses later. */
export interface Database {
  users: User[];
  societies: Society[];
  plans: Plan[];
  subscriptions: Subscription[];
  units: Unit[];
  visitors: Visitor[];
  parcels: Parcel[];
  tickets: Ticket[];
  gates: Gate[];
  notices: Notice[];
  staffCheckIns: StaffCheckIn[];
  purchases: Purchase[];
  helpers: Helper[];
  demoRequests: DemoRequest[];
  familyMembers?: FamilyMember[];
  notifications?: AppNotification[];
  notes?: SocietyNote[];
  workOrders?: WorkOrder[];
}
