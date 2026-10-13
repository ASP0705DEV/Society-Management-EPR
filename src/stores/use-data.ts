import { create } from "zustand";
import { repository } from "@/data/local-repository";
import { createSeed } from "@/data/seed";
import { contactError, newId, pinCode } from "@/lib/format";
import type {
  AppNotification,
  Database,
  FamilyMember,
  Parcel,
  SessionUser,
  SubscriptionStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  Visitor,
  VisitorPurpose,
  VisitorStatus,
} from "@/types";

interface NewSocietyInput {
  name: string;
  address: string;
  city: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  planId: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword: string;
  photo?: string | null;
  /** Paid customers show up as revenue. A trial is a lead, not revenue. */
  paid: boolean;
  paymentId?: string | null;
}

export interface CreatedSociety {
  code: string;
  email: string;
  password: string;
  societyName: string;
  photo?: string | null;
}

interface InviteInput {
  societyId: string;
  unitId?: string;
  block?: string;
  number?: string;
  floor?: number;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  password: string;
  autoActivate?: boolean;
}

interface VisitorInput {
  societyId: string;
  unitId: string;
  hostUserId: string;
  name: string;
  phone: string;
  purpose: VisitorPurpose;
  note: string;
  photo: string | null;
  helperId: string | null;
  createdBy: "resident" | "gatekeeper";
  vehicleNumber?: string | null;
  validDurationHours?: number;
  isSurpriseDelivery?: boolean;
  category?: string | null;
}

interface DataState {
  ready: boolean;
  error: string | null;
  db: Database;
  hydrate: () => Promise<void>;
  resetDemo: () => Promise<void>;
  createSociety: (input: NewSocietyInput) => CreatedSociety | { error: string };
  joinResident: (input: {
    code: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    block: string;
    number: string;
  }) => string | null;
  requestDemo: (input: {
    name: string;
    phone: string;
    email: string;
    societyName: string;
    city: string;
    message: string;
  }) => string | null;
  setDemoStatus: (id: string, status: "new" | "contacted") => void;
  setSocietyPhoto: (societyId: string, photo: string | null) => void;
  setUserPhoto: (userId: string, photo: string | null) => void;
  addStaff: (input: {
    societyId: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    photo: string | null;
  }) => string | null;
  addHelper: (input: {
    societyId: string;
    unitId: string;
    name: string;
    phone: string;
    duty: string;
    photo: string | null;
  }) => string | null;
  setVisitorPhoto: (visitorId: string, photo: string | null) => void;
  updateSociety: (
    societyId: string,
    patch: {
      name?: string;
      address?: string;
      city?: string;
      state?: string;
      latitude?: number;
      longitude?: number;
      planId?: string;
      status?: SubscriptionStatus;
      photo?: string | null;
    },
  ) => void;
  addNote: (input: { societyId: string; title: string; content: string }) => void;
  deleteNote: (noteId: string) => void;
  addWorkOrder: (input: { societyId: string; vendor: string; category: string; description: string }) => void;
  addUnit: (input: { societyId: string; block: string; number: string; floor: number }) => string | null;
  updatePlanPrice: (planId: string, monthlyPrice: number) => void;
  setTicketStatus: (ticketId: string, status: TicketStatus) => void;
  raiseTicket: (input: {
    societyId: string;
    userId: string;
    subject: string;
    body: string;
    category: TicketCategory;
    priority: TicketPriority;
  }) => void;
  inviteResident: (input: InviteInput) => string | null;
  activateResident: (userId: string) => void;
  rejectResident: (userId: string) => void;
  updateGate: (gateId: string, patch: { visitorApprovalRequired: boolean; deliveryAutoApprove: boolean }) => void;
  addVisitor: (input: VisitorInput, autoApproveDelivery?: boolean) => Visitor;
  setVisitorStatus: (visitorId: string, status: VisitorStatus, actor: SessionUser) => void;
  addParcel: (input: { societyId: string; unitId: string; residentUserId: string; carrier: string; description: string }) => string;
  setParcelStatus: (parcelId: string, status: Parcel["status"], actor: SessionUser) => string | null;
  collectParcel: (parcelId: string, otp: string) => string | null;
  checkInStaff: (input: { societyId: string; gateId: string; name: string; duty: string; photo: string | null; helperId?: string | null }) => void;
  checkOutStaff: (id: string, helperId?: string | null) => void;
  addNotice: (input: { societyId: string; title: string; body: string; priority?: "urgent" | "normal" | "info"; category?: string }) => void;
  deleteNotice: (noticeId: string) => void;
  toggleHelperAllowed: (helperId: string) => void;
  deleteHelper: (helperId: string) => void;
  addFamilyMember: (input: {
    societyId: string;
    unitId: string;
    primaryResidentId: string;
    name: string;
    relation: FamilyMember["relation"];
    phone: string;
    photo?: string | null;
  }) => string | null;
  deleteFamilyMember: (id: string) => void;
  addNotification: (input: {
    societyId: string;
    userId?: string;
    title: string;
    message: string;
    type: AppNotification["type"];
  }) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (societyId: string, userId?: string) => void;
}

const emptyDb = createSeed();

export const useData = create<DataState>((set, get) => {
  function commit(recipe: (db: Database) => Database) {
    const next = recipe(get().db);
    set({ db: next, error: null });
    repository.save(next).catch(() => {
      set({ error: "Could not save data in this browser." });
    });
  }

  return {
    ready: false,
    error: null,
    db: emptyDb,
    hydrate: async () => {
      try {
        const db = await repository.load();
        set({ db, ready: true, error: null });
      } catch {
        set({ ready: true, error: "Could not read saved data." });
      }
    },
    resetDemo: async () => {
      const db = await repository.reset();
      set({ db, error: null, ready: true });
    },
    createSociety: (input) => {
      const emailTaken = get().db.users.some(
        (person) => person.email.toLowerCase() === input.adminEmail.trim().toLowerCase(),
      );
      if (emailTaken) return { error: "That admin email is already in use." };
      const plan = get().db.plans.find((item) => item.id === input.planId);
      if (!plan) return { error: "Choose a plan." };
      const societyId = newId("soc");
      const code = `${input.name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "SOC"}-${String(Date.now()).slice(-4)}`;
      const email = input.adminEmail.trim().toLowerCase();
      commit((db) => ({
        ...db,
        societies: [
          ...db.societies,
          {
            id: societyId,
            name: input.name.trim(),
            address: input.address.trim(),
            city: input.city.trim(),
            state: input.state?.trim() || "Karnataka",
            latitude: input.latitude ?? 12.9716,
            longitude: input.longitude ?? 77.5946,
            code,
            photo: input.photo ?? null,
          },
        ],
        subscriptions: [
          ...db.subscriptions,
          {
            id: newId("sub"),
            societyId,
            planId: input.planId,
            status: input.paid ? "active" : "trial",
            renewsOn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
          },
        ],
        purchases: [
          {
            id: newId("buy"),
            societyId,
            planId: input.planId,
            amount: input.paid ? plan.monthlyPrice : 0,
            status: input.paid ? "paid" : "trial",
            buyerName: input.adminName.trim(),
            buyerEmail: email,
            purchasedAt: new Date().toISOString(),
            paymentId: input.paymentId ?? null,
          },
          ...db.purchases,
        ],
        users: [
          ...db.users,
          {
            id: newId("user"),
            societyId,
            unitId: null,
            name: input.adminName.trim(),
            email,
            phone: input.adminPhone?.trim() || "",
            password: input.adminPassword,
            role: "society_admin",
            status: "active",
            emailVerified: true,
            phoneVerified: true,
            gateId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            photo: null,
          },
        ],
        gates: [
          ...db.gates,
          {
            id: newId("gate"),
            societyId,
            name: "Main Gate",
            visitorApprovalRequired: true,
            deliveryAutoApprove: false,
          },
        ],
        units: [
          ...db.units,
          { id: newId("unit"), societyId, block: "A", number: "101", floor: 1 },
        ],
      }));
      return { code, email, password: input.adminPassword, societyName: input.name.trim(), photo: input.photo ?? null };
    },
    updateSociety: (id, updates) => {
      commit((db) => {
        const nextSocieties = db.societies.map((soc) =>
          soc.id === id
            ? {
                ...soc,
                ...(updates.name ? { name: updates.name.trim() } : {}),
                ...(updates.address ? { address: updates.address.trim() } : {}),
                ...(updates.city ? { city: updates.city.trim() } : {}),
                ...(updates.state ? { state: updates.state.trim() } : {}),
                ...(updates.latitude !== undefined ? { latitude: updates.latitude } : {}),
                ...(updates.longitude !== undefined ? { longitude: updates.longitude } : {}),
                ...(updates.photo !== undefined ? { photo: updates.photo } : {}),
              }
            : soc
        );
        const nextSubs =
          updates.planId || updates.status
            ? db.subscriptions.map((sub) =>
                sub.societyId === id
                  ? {
                      ...sub,
                      ...(updates.planId ? { planId: updates.planId } : {}),
                      ...(updates.status ? { status: updates.status } : {}),
                    }
                  : sub
              )
            : db.subscriptions;
        return { ...db, societies: nextSocieties, subscriptions: nextSubs };
      });
    },
    joinResident: (input) => {
      const problem = contactError(input.email, input.phone);
      if (problem) return problem;

      // Robust society code matching (ignores dashes, spaces, case: e.g. "AASH-3773" matches "aash3773")
      const cleanCode = input.code.trim().toUpperCase().replace(/[\s-]/g, "");
      const society = get().db.societies.find(
        (item) => item.code.trim().toUpperCase().replace(/[\s-]/g, "") === cleanCode,
      );
      if (!society) return "That society code was not found. Please check with your society management.";

      const email = input.email.trim().toLowerCase();
      const phoneDigits = input.phone.replace(/\D/g, "");
      const cleanPhone = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : input.phone.trim();
      const cleanBlock = input.block.trim().toUpperCase() || "A";
      const cleanNumber = input.number.trim() || "101";
      const cleanPassword = input.password.trim();

      // Find or create flat unit
      const existingUnit = get().db.units.find(
        (u) =>
          u.societyId === society.id &&
          u.block.toUpperCase() === cleanBlock &&
          u.number.toLowerCase() === cleanNumber.toLowerCase(),
      );
      const unitId = existingUnit ? existingUnit.id : newId("unit");
      const nextUnits = existingUnit
        ? get().db.units
        : [
            ...get().db.units,
            {
              id: unitId,
              societyId: society.id,
              block: cleanBlock,
              number: cleanNumber,
              floor: 1,
            },
          ];

      const residentEmail = email || `${cleanPhone}@resident.smartgate`;

      // Check if user account already exists (by email or phone)
      const existingUserIndex = get().db.users.findIndex(
        (person) =>
          (email && person.email.toLowerCase() === email) ||
          (cleanPhone.length >= 10 && person.phone && person.phone.replace(/\D/g, "").endsWith(cleanPhone)),
      );

      if (existingUserIndex >= 0) {
        // Update credentials and link to society/flat, ensuring active status
        commit((db) => {
          const updatedUsers = [...db.users];
          updatedUsers[existingUserIndex] = {
            ...updatedUsers[existingUserIndex],
            societyId: society.id,
            unitId,
            name: input.name.trim() || updatedUsers[existingUserIndex].name,
            email: residentEmail,
            phone: input.phone.trim(),
            password: cleanPassword,
            role: "resident",
            status: "pending",
            emailVerified: true,
            phoneVerified: false,
          };
          return {
            ...db,
            units: nextUnits,
            users: updatedUsers,
          };
        });
        return null;
      }

      // Create new resident user with immediate active status
      commit((db) => ({
        ...db,
        units: nextUnits,
        users: [
          ...db.users,
          {
            id: newId("user"),
            societyId: society.id,
            unitId,
            name: input.name.trim(),
            email: residentEmail,
            phone: input.phone.trim(),
            password: cleanPassword,
            role: "resident",
            status: "pending",
            emailVerified: true,
            phoneVerified: false,
            gateId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            photo: null,
          },
        ],
      }));
      return null;
    },
    requestDemo: (input) => {
      const problem = contactError(input.email, input.phone);
      if (problem) return problem;
      commit((db) => ({
        ...db,
        demoRequests: [
          {
            id: newId("demo"),
            name: input.name.trim(),
            phone: input.phone.trim(),
            email: input.email.trim().toLowerCase(),
            societyName: input.societyName.trim(),
            city: input.city.trim(),
            message: input.message.trim(),
            status: "new",
            createdAt: new Date().toISOString(),
          },
          ...db.demoRequests,
        ],
      }));
      return null;
    },
    setDemoStatus: (id, status) => {
      commit((db) => ({
        ...db,
        demoRequests: db.demoRequests.map((item) => (item.id === id ? { ...item, status } : item)),
      }));
    },
    setSocietyPhoto: (societyId, photo) => {
      commit((db) => ({
        ...db,
        societies: db.societies.map((society) => (society.id === societyId ? { ...society, photo } : society)),
      }));
    },
    setUserPhoto: (userId, photo) => {
      commit((db) => ({
        ...db,
        users: db.users.map((person) => (person.id === userId ? { ...person, photo } : person)),
      }));
    },
    addStaff: (input) => {
      const problem = contactError(input.email, input.phone);
      if (problem) return problem;
      const email = input.email.trim().toLowerCase();
      if (email && get().db.users.some((person) => person.email.toLowerCase() === email)) return "That email is already used.";
      commit((db) => ({
        ...db,
        users: [
          ...db.users,
          {
            id: newId("user"),
            societyId: input.societyId,
            unitId: null,
            name: input.name.trim(),
            email: email || `${input.phone.replace(/\D/g, "")}@gate.smartgate`,
            phone: input.phone.trim(),
            password: input.password.trim() || "guard123",
            role: "gatekeeper",
            status: "active",
            emailVerified: true,
            phoneVerified: true,
            gateId: "gate-main",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            photo: input.photo,
          },
        ],
      }));
      return null;
    },
    addHelper: (input) => {
      const problem = contactError("", input.phone);
      if (problem) return problem;
      commit((db) => ({
        ...db,
        helpers: [
          {
            id: newId("helper"),
            societyId: input.societyId,
            unitId: input.unitId,
            name: input.name.trim(),
            phone: input.phone.trim(),
            duty: input.duty.trim(),
            photo: input.photo,
            allowed: true,
          },
          ...db.helpers,
        ],
      }));
      return null;
    },
    setVisitorPhoto: (visitorId, photo) => {
      commit((db) => ({
        ...db,
        visitors: db.visitors.map((visitor) => (visitor.id === visitorId ? { ...visitor, photo } : visitor)),
      }));
    },
    addNote: (input) => {
      commit((db) => ({
        ...db,
        notes: [
          {
            id: newId("note"),
            societyId: input.societyId,
            title: input.title.trim(),
            content: input.content.trim(),
            date: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          ...(db.notes || []),
        ],
      }));
    },
    deleteNote: (noteId) => {
      commit((db) => ({
        ...db,
        notes: (db.notes || []).filter((note) => note.id !== noteId),
      }));
    },
    addWorkOrder: (input) => {
      const count = (get().db.workOrders || []).length + 1;
      commit((db) => ({
        ...db,
        workOrders: [
          {
            id: newId("wo"),
            societyId: input.societyId,
            code: `WO#${510 + count} - A`,
            vendor: input.vendor.trim(),
            category: input.category.trim(),
            description: input.description.trim(),
            status: "sent",
            sentDate: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          ...(db.workOrders || []),
        ],
      }));
    },
    addUnit: (input) => {
      const block = input.block.trim();
      const number = input.number.trim();
      if (!block || !number) return "Enter the block and flat number.";
      const taken = get().db.units.some(
        (unit) => unit.societyId === input.societyId && unit.block.toLowerCase() === block.toLowerCase() && unit.number === number,
      );
      if (taken) return "That flat is already in this society.";
      commit((db) => ({
        ...db,
        units: [...db.units, { id: newId("unit"), societyId: input.societyId, block, number, floor: input.floor || 1 }],
      }));
      return null;
    },
    updatePlanPrice: (planId, monthlyPrice) => {
      commit((db) => ({
        ...db,
        plans: db.plans.map((plan) => (plan.id === planId ? { ...plan, monthlyPrice } : plan)),
      }));
    },
    setTicketStatus: (ticketId, status) => {
      commit((db) => ({
        ...db,
        tickets: db.tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)),
      }));
    },
    raiseTicket: (input) => {
      commit((db) => ({
        ...db,
        tickets: [
          {
            id: newId("ticket"),
            societyId: input.societyId,
            raisedByUserId: input.userId,
            subject: input.subject.trim(),
            body: input.body.trim(),
            category: input.category,
            priority: input.priority,
            status: "open",
            createdAt: new Date().toISOString(),
          },
          ...db.tickets,
        ],
      }));
    },
    inviteResident: (input) => {
      const problem = contactError(input.email, input.phone);
      if (problem) return problem;
      const email = input.email.trim().toLowerCase();
      if (email && get().db.users.some((person) => person.email.toLowerCase() === email)) {
        return "That email is already used.";
      }
      let finalUnitId = input.unitId;
      let newUnits = [...get().db.units];
      if (!finalUnitId && input.block && input.number) {
        const found = get().db.units.find(
          (u) =>
            u.societyId === input.societyId &&
            u.block.toLowerCase() === input.block!.trim().toLowerCase() &&
            u.number.toLowerCase() === input.number!.trim().toLowerCase(),
        );
        if (found) {
          finalUnitId = found.id;
        } else {
          finalUnitId = newId("unit");
          newUnits.push({
            id: finalUnitId,
            societyId: input.societyId,
            block: input.block.trim(),
            number: input.number.trim(),
            floor: input.floor || 1,
          });
        }
      }
      if (!finalUnitId || !newUnits.some((unit) => unit.id === finalUnitId && unit.societyId === input.societyId)) {
        return "Choose a flat in this society or specify block and flat number.";
      }
      const unitTaken = get().db.users.some(
        (person) => person.unitId === finalUnitId && person.role === "resident" && person.status !== "disabled",
      );
      if (unitTaken) return "That flat already has an active resident.";
      commit((db) => ({
        ...db,
        units: newUnits,
        users: [
          ...db.users,
          {
            id: newId("user"),
            societyId: input.societyId,
            unitId: finalUnitId,
            name: input.name.trim(),
            email: email || `${input.phone.replace(/\D/g, "") || "user"}@invite.smartgate`,
            phone: input.phone.trim(),
            password: input.password.trim() || "welcome123",
            role: "resident",
            status: input.autoActivate ? "active" : "invited",
            emailVerified: Boolean(input.autoActivate),
            phoneVerified: Boolean(input.autoActivate),
            gateId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            photo: input.photo,
          },
        ],
      }));
      return null;
    },
    activateResident: (userId) => {
      commit((db) => ({
        ...db,
        users: db.users.map((person) =>
          person.id === userId
            ? { ...person, status: "active", emailVerified: true, updatedAt: new Date().toISOString() }
            : person,
        ),
      }));
      fetch(`/api/residents/${userId}/activate`, { method: "PUT" }).catch((e) =>
        console.warn("Direct resident activation failed:", e)
      );
    },
    rejectResident: (userId) => {
      commit((db) => ({
        ...db,
        users: db.users.filter((person) => person.id !== userId),
      }));
      fetch(`/api/residents/${userId}/reject`, { method: "DELETE" }).catch((e) =>
        console.warn("Direct resident reject failed:", e)
      );
    },
    updateGate: (gateId, patch) => {
      commit((db) => ({
        ...db,
        gates: db.gates.map((gate) => (gate.id === gateId ? { ...gate, ...patch } : gate)),
      }));
    },
    addVisitor: (input, autoApproveDelivery) => {
      const approved = input.purpose === "delivery" && !!autoApproveDelivery;
      const code = pinCode();
      const newVisitor: Visitor = {
        id: newId("vis"),
        ...input,
        name: input.name.trim(),
        phone: input.phone.trim(),
        note: input.note.trim(),
        photo: input.photo,
        helperId: input.helperId,
        status: input.createdBy === "resident" || approved ? "approved" : "pending",
        code,
        createdAt: new Date().toISOString(),
        vehicleNumber: input.vehicleNumber ?? null,
        validDurationHours: input.validDurationHours ?? 1,
        isSurpriseDelivery: input.isSurpriseDelivery ?? false,
        category: input.category ?? null,
      };
      commit((db) => ({
        ...db,
        visitors: [newVisitor, ...db.visitors],
      }));
      return newVisitor;
    },
    setVisitorStatus: (visitorId, status, actor) => {
      commit((db) => {
        const targetVisitor = db.visitors.find((v) => v.id === visitorId);
        let updatedNotifs = db.notifications;
        if (status === "exited" && targetVisitor) {
          const exitNotif: AppNotification = {
            id: newId("notif"),
            societyId: targetVisitor.societyId,
            userId: targetVisitor.hostUserId,
            title: `🚪 Visitor Exited: ${targetVisitor.name}`,
            message: `${targetVisitor.name} (${targetVisitor.purpose}) has checked out and exited through the gate at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
            type: "gate",
            read: false,
            createdAt: new Date().toISOString(),
          };
          updatedNotifs = [exitNotif, ...(db.notifications ?? [])];
        }

        return {
          ...db,
          notifications: updatedNotifs,
          visitors: db.visitors.map((visitor) => {
            if (visitor.id !== visitorId) return visitor;
            if (actor.role === "resident" && visitor.hostUserId !== actor.id) return visitor;
            if (actor.role !== "super_admin" && visitor.societyId !== actor.societyId) return visitor;
            return { ...visitor, status };
          }),
        };
      });
      fetch(`/api/visitors/${visitorId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).catch((e) => console.warn("Visitor status API call failed:", e));
    },
    addParcel: (input) => {
      const otp = pinCode();
      commit((db) => ({
        ...db,
        parcels: [
          {
            id: newId("parcel"),
            societyId: input.societyId,
            unitId: input.unitId,
            residentUserId: input.residentUserId,
            carrier: input.carrier.trim(),
            description: input.description.trim(),
            status: "at_gate",
            otp,
            createdAt: new Date().toISOString(),
          },
          ...db.parcels,
        ],
      }));
      return otp;
    },
    setParcelStatus: (parcelId, status, actor) => {
      const parcel = get().db.parcels.find((item) => item.id === parcelId);
      if (!parcel) return "Parcel not found.";
      if (actor.role === "resident" && parcel.residentUserId !== actor.id) return "You can only update your own parcels.";
      if (actor.role !== "super_admin" && parcel.societyId !== actor.societyId) return "Wrong society.";
      commit((db) => ({
        ...db,
        parcels: db.parcels.map((item) => (item.id === parcelId ? { ...item, status } : item)),
      }));
      return null;
    },
    collectParcel: (parcelId, otp) => {
      const parcel = get().db.parcels.find((item) => item.id === parcelId);
      if (!parcel) return "Parcel not found.";
      if (parcel.otp !== otp.trim()) return "That code does not match.";
      commit((db) => ({
        ...db,
        parcels: db.parcels.map((item) =>
          item.id === parcelId ? { ...item, status: "collected" } : item,
        ),
      }));
      return null;
    },
    checkInStaff: (input) => {
      commit((db) => ({
        ...db,
        staffCheckIns: [
          {
            id: newId("check"),
            societyId: input.societyId,
            gateId: input.gateId,
            name: input.name.trim(),
            duty: input.duty.trim(),
            photo: input.photo,
            checkedInAt: new Date().toISOString(),
            checkedOutAt: null,
            helperId: input.helperId ?? null,
          },
          ...db.staffCheckIns,
        ],
      }));
    },
    checkOutStaff: (id, helperId) => {
      const staffItem = get().db.staffCheckIns.find((item) => item.id === id);
      const name = staffItem?.name || "Staff Member";
      const societyId = staffItem?.societyId || "";
      const now = new Date().toISOString();

      commit((db) => ({
        ...db,
        staffCheckIns: db.staffCheckIns.map((item) =>
          item.id === id ? { ...item, checkedOutAt: now } : item,
        ),
      }));

      // Call backend staff exit endpoint to persist and notify residents
      fetch("/api/staff/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ societyId, name, helperId: helperId || staffItem?.helperId }),
      }).catch((e) => console.warn("Staff exit API failed:", e));
    },
    addNotice: (input) => {
      commit((db) => ({
        ...db,
        notices: [
          {
            id: newId("notice"),
            societyId: input.societyId,
            title: input.title.trim(),
            body: input.body.trim(),
            priority: input.priority || "normal",
            category: input.category || "General",
            createdAt: new Date().toISOString(),
          },
          ...db.notices,
        ],
      }));
    },
    deleteNotice: (noticeId) => {
      commit((db) => ({
        ...db,
        notices: db.notices.filter((n) => n.id !== noticeId),
      }));
    },
    toggleHelperAllowed: (helperId) => {
      commit((db) => ({
        ...db,
        helpers: db.helpers.map((h) => (h.id === helperId ? { ...h, allowed: !h.allowed } : h)),
      }));
    },
    deleteHelper: (helperId) => {
      commit((db) => ({
        ...db,
        helpers: db.helpers.filter((h) => h.id !== helperId),
      }));
    },
    addFamilyMember: (input) => {
      if (!input.name.trim()) return "Please enter family member's full name.";
      if (!input.phone.trim()) return "Please enter a valid mobile number for access.";
      const id = newId("fam");
      commit((db) => ({
        ...db,
        familyMembers: [
          ...(db.familyMembers || []),
          {
            id,
            societyId: input.societyId,
            unitId: input.unitId,
            primaryResidentId: input.primaryResidentId,
            name: input.name.trim(),
            relation: input.relation,
            phone: input.phone.trim(),
            photo: input.photo ?? null,
            addedAt: new Date().toISOString(),
          },
        ],
      }));
      return null;
    },
    deleteFamilyMember: (id) => {
      commit((db) => ({
        ...db,
        familyMembers: (db.familyMembers || []).filter((f) => f.id !== id),
      }));
    },
    addNotification: (input) => {
      const id = newId("notif");
      commit((db) => ({
        ...db,
        notifications: [
          {
            id,
            societyId: input.societyId,
            userId: input.userId,
            title: input.title.trim(),
            message: input.message.trim(),
            type: input.type,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...(db.notifications || []),
        ],
      }));
    },
    markNotificationRead: (id) => {
      commit((db) => ({
        ...db,
        notifications: (db.notifications || []).map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    },
    markAllNotificationsRead: (societyId, userId) => {
      commit((db) => ({
        ...db,
        notifications: (db.notifications || []).map((n) => {
          if (n.societyId === societyId && (!userId || !n.userId || n.userId === userId)) {
            return { ...n, read: true };
          }
          return n;
        }),
      }));
    },
  };
});
