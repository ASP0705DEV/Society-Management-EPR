import { Router } from "express";
import { prisma } from "../db";
import { type AuthenticatedRequest, requireAuth, hashPassword } from "../lib/auth";
import {
  notifyVisitorRequest,
  notifyVisitorStatus,
  notifyVisitorExit,
  notifyStaffExit,
  notifyParcelArrival,
  notifyNoticePublished,
} from "../lib/socket";
import type { Database } from "../../../src/types";

export const dataRouter = Router();

// Helper to format ISO dates
function toIso(date: Date | null | undefined): string {
  return date ? date.toISOString() : new Date().toISOString();
}

// -------------------------------------------------------------
// GET /api/data/snapshot (Loads full database matching Database interface)
// -------------------------------------------------------------
dataRouter.get("/snapshot", async (req: AuthenticatedRequest, res) => {
  try {
    const [
      users,
      societies,
      plans,
      subscriptions,
      units,
      visitors,
      parcels,
      tickets,
      gates,
      notices,
      staffCheckIns,
      purchases,
      helpers,
      demoRequests,
      familyMembers,
      notifications,
      societyNotes,
      workOrders,
    ] = await prisma.$transaction([
      prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.society.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.plan.findMany(),
      prisma.subscription.findMany(),
      prisma.unit.findMany({ orderBy: [{ block: "asc" }, { number: "asc" }] }),
      prisma.visitor.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.parcel.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.ticket.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.gate.findMany(),
      prisma.notice.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.staffCheckIn.findMany({ orderBy: { checkedInAt: "desc" } }),
      prisma.purchase.findMany({ orderBy: { purchasedAt: "desc" } }),
      prisma.helper.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.demoRequest.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.familyMember.findMany({ orderBy: { addedAt: "desc" } }),
      prisma.appNotification.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.societyNote.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.workOrder.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    const snapshot: Database = {
      users: users.map((u) => ({
        id: u.id,
        societyId: u.societyId,
        unitId: u.unitId,
        name: u.name,
        email: u.email,
        phone: u.phone,
        password: u.password,
        role: u.role as any,
        status: u.status as any,
        emailVerified: u.emailVerified,
        phoneVerified: u.phoneVerified,
        gateId: u.gateId,
        photo: u.photo,
        createdAt: toIso(u.createdAt),
        updatedAt: toIso(u.updatedAt),
      })),
      societies: societies.map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        city: s.city,
        state: s.state || undefined,
        latitude: s.latitude || undefined,
        longitude: s.longitude || undefined,
        code: s.code,
        photo: s.photo,
      })),
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        monthlyPrice: p.monthlyPrice,
        maxUnits: p.maxUnits,
        maxGates: p.maxGates,
        features: p.features,
      })),
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        societyId: s.societyId,
        planId: s.planId,
        status: s.status as any,
        renewsOn: s.renewsOn,
      })),
      units: units.map((u) => ({
        id: u.id,
        societyId: u.societyId,
        block: u.block,
        number: u.number,
        floor: u.floor,
      })),
      visitors: visitors.map((v) => ({
        id: v.id,
        societyId: v.societyId,
        unitId: v.unitId,
        hostUserId: v.hostUserId,
        name: v.name,
        phone: v.phone,
        purpose: v.purpose as any,
        status: v.status as any,
        code: v.code,
        createdBy: v.createdBy as any,
        note: v.note,
        photo: v.photo,
        helperId: v.helperId,
        vehicleNumber: v.vehicleNumber,
        validDurationHours: v.validDurationHours || undefined,
        isSurpriseDelivery: v.isSurpriseDelivery || false,
        category: v.category,
        createdAt: toIso(v.createdAt),
      })),
      parcels: parcels.map((p) => ({
        id: p.id,
        societyId: p.societyId,
        unitId: p.unitId,
        residentUserId: p.residentUserId,
        carrier: p.carrier,
        description: p.description,
        status: p.status as any,
        otp: p.otp,
        createdAt: toIso(p.createdAt),
      })),
      tickets: tickets.map((t) => ({
        id: t.id,
        societyId: t.societyId,
        raisedByUserId: t.raisedByUserId,
        subject: t.subject,
        body: t.body,
        category: t.category as any,
        priority: t.priority as any,
        status: t.status as any,
        createdAt: toIso(t.createdAt),
      })),
      gates: gates.map((g) => ({
        id: g.id,
        societyId: g.societyId,
        name: g.name,
        visitorApprovalRequired: g.visitorApprovalRequired,
        deliveryAutoApprove: g.deliveryAutoApprove,
      })),
      notices: notices.map((n) => ({
        id: n.id,
        societyId: n.societyId,
        title: n.title,
        body: n.body,
        priority: n.priority as any,
        category: n.category || undefined,
        createdAt: toIso(n.createdAt),
      })),
      staffCheckIns: staffCheckIns.map((sc) => ({
        id: sc.id,
        societyId: sc.societyId,
        gateId: sc.gateId,
        name: sc.name,
        duty: sc.duty,
        photo: sc.photo,
        checkedInAt: toIso(sc.checkedInAt),
      })),
      purchases: purchases.map((pu) => ({
        id: pu.id,
        societyId: pu.societyId,
        planId: pu.planId,
        amount: pu.amount,
        status: pu.status as any,
        buyerName: pu.buyerName,
        buyerEmail: pu.buyerEmail,
        paymentId: pu.paymentId,
        purchasedAt: toIso(pu.purchasedAt),
      })),
      helpers: helpers.map((h) => ({
        id: h.id,
        societyId: h.societyId,
        unitId: h.unitId,
        name: h.name,
        phone: h.phone,
        photo: h.photo,
        duty: h.duty,
        allowed: h.allowed,
      })),
      demoRequests: demoRequests.map((d) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        email: d.email,
        societyName: d.societyName,
        city: d.city,
        message: d.message,
        status: d.status as any,
        createdAt: toIso(d.createdAt),
      })),
      familyMembers: familyMembers.map((f) => ({
        id: f.id,
        societyId: f.societyId,
        unitId: f.unitId,
        primaryResidentId: f.primaryResidentId,
        name: f.name,
        relation: f.relation as any,
        phone: f.phone,
        photo: f.photo,
        addedAt: toIso(f.addedAt),
      })),
      notifications: notifications.map((no) => ({
        id: no.id,
        userId: no.userId || undefined,
        societyId: no.societyId,
        title: no.title,
        message: no.message,
        type: no.type as any,
        read: no.read,
        createdAt: toIso(no.createdAt),
      })),
      notes: societyNotes.map((sn) => ({
        id: sn.id,
        societyId: sn.societyId,
        title: sn.title,
        content: sn.content,
        date: sn.date,
      })),
      workOrders: workOrders.map((wo) => ({
        id: wo.id,
        societyId: wo.societyId,
        code: wo.code,
        vendor: wo.vendor,
        category: wo.category,
        description: wo.description,
        status: wo.status as any,
        sentDate: wo.sentDate,
      })),
    };

    res.json(snapshot);
  } catch (error: any) {
    console.error("Snapshot error:", error);
    res.status(500).json({ error: "Failed to load database snapshot." });
  }
});

// -------------------------------------------------------------
// POST /api/data/sync (Persists state mutations from client)
// -------------------------------------------------------------
dataRouter.post("/sync", async (req, res) => {
  try {
    const body: Partial<Database> = req.body;

    // 1. Persist societies first (Root tenant boundary)
    if (body.societies && Array.isArray(body.societies)) {
      for (const s of body.societies) {
        await prisma.society.upsert({
          where: { id: s.id },
          create: {
            id: s.id,
            name: s.name,
            address: s.address,
            city: s.city,
            state: s.state || "Karnataka",
            latitude: s.latitude ?? 12.9716,
            longitude: s.longitude ?? 77.5946,
            code: s.code,
            photo: s.photo,
          },
          update: {
            name: s.name,
            address: s.address,
            city: s.city,
            state: s.state,
            code: s.code,
            photo: s.photo,
          },
        });
      }
    }

    // 2. Persist units next (Dependency for users, visitors, parcels, helpers)
    if (body.units && Array.isArray(body.units)) {
      for (const u of body.units) {
        await prisma.unit.upsert({
          where: { id: u.id },
          create: {
            id: u.id,
            societyId: u.societyId,
            block: u.block,
            number: u.number,
            floor: u.floor || 1,
          },
          update: {
            block: u.block,
            number: u.number,
            floor: u.floor,
          },
        });
      }
    }

    // 3. Persist gates
    if (body.gates && Array.isArray(body.gates)) {
      for (const g of body.gates) {
        await prisma.gate.upsert({
          where: { id: g.id },
          create: {
            id: g.id,
            societyId: g.societyId,
            name: g.name,
            visitorApprovalRequired: g.visitorApprovalRequired ?? true,
            deliveryAutoApprove: g.deliveryAutoApprove ?? false,
          },
          update: {
            name: g.name,
            visitorApprovalRequired: g.visitorApprovalRequired,
            deliveryAutoApprove: g.deliveryAutoApprove,
          },
        });
      }
    }

    // 4. Persist users (with Argon2 password hashing if unhashed)
    if (body.users && Array.isArray(body.users)) {
      for (const u of body.users) {
        let pass = u.password;
        if (pass && !pass.startsWith("$argon2")) {
          pass = await hashPassword(pass);
        }
        await prisma.user.upsert({
          where: { id: u.id },
          create: {
            id: u.id,
            societyId: u.societyId,
            unitId: u.unitId,
            name: u.name,
            email: u.email,
            phone: u.phone || "",
            password: pass || "",
            role: u.role,
            status: u.status,
            emailVerified: u.emailVerified ?? true,
            phoneVerified: u.phoneVerified ?? false,
            gateId: u.gateId,
            photo: u.photo,
          },
          update: {
            status: u.status,
            emailVerified: u.emailVerified,
            phoneVerified: u.phoneVerified,
            photo: u.photo,
            unitId: u.unitId,
            password: pass,
          },
        });
      }
    }

    // 5. Persist subscriptions
    if (body.subscriptions && Array.isArray(body.subscriptions)) {
      for (const sub of body.subscriptions) {
        await prisma.subscription.upsert({
          where: { id: sub.id },
          create: {
            id: sub.id,
            societyId: sub.societyId,
            planId: sub.planId,
            status: sub.status,
            renewsOn: sub.renewsOn,
          },
          update: {
            planId: sub.planId,
            status: sub.status,
            renewsOn: sub.renewsOn,
          },
        });
      }
    }

    // 6. Persist family members
    if (body.familyMembers && Array.isArray(body.familyMembers)) {
      for (const f of body.familyMembers) {
        await prisma.familyMember.upsert({
          where: { id: f.id },
          create: {
            id: f.id,
            societyId: f.societyId,
            unitId: f.unitId,
            primaryResidentId: f.primaryResidentId,
            name: f.name,
            relation: f.relation,
            phone: f.phone,
            photo: f.photo,
          },
          update: {
            name: f.name,
            relation: f.relation,
            phone: f.phone,
            photo: f.photo,
          },
        });
      }
    }

    // 7. Persist visitors
    if (body.visitors && Array.isArray(body.visitors)) {
      for (const v of body.visitors) {
        await prisma.visitor.upsert({
          where: { id: v.id },
          create: {
            id: v.id,
            societyId: v.societyId,
            unitId: v.unitId,
            hostUserId: v.hostUserId,
            name: v.name,
            phone: v.phone,
            purpose: v.purpose,
            status: v.status,
            code: v.code,
            createdBy: v.createdBy,
            note: v.note || "",
            photo: v.photo,
            helperId: v.helperId,
            vehicleNumber: v.vehicleNumber,
            validDurationHours: v.validDurationHours,
            isSurpriseDelivery: v.isSurpriseDelivery,
            category: v.category,
          },
          update: {
            status: v.status,
            note: v.note || "",
            photo: v.photo,
          },
        });

        if (v.status === "pending") {
          notifyVisitorRequest(v.societyId, v.unitId, v);
        } else if (v.status === "exited") {
          notifyVisitorExit(v.societyId, v.unitId, v);
        } else {
          notifyVisitorStatus(v.societyId, v);
        }
      }
    }

    // 8. Persist parcels
    if (body.parcels && Array.isArray(body.parcels)) {
      for (const p of body.parcels) {
        await prisma.parcel.upsert({
          where: { id: p.id },
          create: {
            id: p.id,
            societyId: p.societyId,
            unitId: p.unitId,
            residentUserId: p.residentUserId,
            carrier: p.carrier,
            description: p.description,
            status: p.status,
            otp: p.otp,
          },
          update: {
            status: p.status,
          },
        });

        notifyParcelArrival(p.societyId, p.unitId, p);
      }
    }

    // 9. Persist helpers
    if (body.helpers && Array.isArray(body.helpers)) {
      for (const h of body.helpers) {
        await prisma.helper.upsert({
          where: { id: h.id },
          create: {
            id: h.id,
            societyId: h.societyId,
            unitId: h.unitId,
            name: h.name,
            phone: h.phone,
            photo: h.photo,
            duty: h.duty,
            allowed: h.allowed,
          },
          update: {
            allowed: h.allowed,
            photo: h.photo,
            duty: h.duty,
          },
        });
      }
    }

    // 10. Persist staff check-ins
    if (body.staffCheckIns && Array.isArray(body.staffCheckIns)) {
      for (const sc of body.staffCheckIns) {
        await prisma.staffCheckIn.upsert({
          where: { id: sc.id },
          create: {
            id: sc.id,
            societyId: sc.societyId,
            gateId: sc.gateId,
            name: sc.name,
            duty: sc.duty,
            photo: sc.photo,
            checkedInAt: sc.checkedInAt ? new Date(sc.checkedInAt) : new Date(),
          },
          update: {
            duty: sc.duty,
            photo: sc.photo,
          },
        });
      }
    }

    // 11. Persist notices
    if (body.notices && Array.isArray(body.notices)) {
      for (const n of body.notices) {
        await prisma.notice.upsert({
          where: { id: n.id },
          create: {
            id: n.id,
            societyId: n.societyId,
            title: n.title,
            body: n.body,
            priority: n.priority || "normal",
            category: n.category,
          },
          update: {
            title: n.title,
            body: n.body,
            priority: n.priority || "normal",
            category: n.category,
          },
        });
      }
    }

    // 12. Persist tickets
    if (body.tickets && Array.isArray(body.tickets)) {
      for (const t of body.tickets) {
        await prisma.ticket.upsert({
          where: { id: t.id },
          create: {
            id: t.id,
            societyId: t.societyId,
            authorUserId: t.authorUserId,
            subject: t.subject,
            body: t.body,
            category: t.category,
            priority: t.priority,
            status: t.status,
          },
          update: {
            status: t.status,
            priority: t.priority,
          },
        });
      }
    }

    // 13. Persist demo requests
    if (body.demoRequests && Array.isArray(body.demoRequests)) {
      for (const d of body.demoRequests) {
        await prisma.demoRequest.upsert({
          where: { id: d.id },
          create: {
            id: d.id,
            name: d.name,
            phone: d.phone,
            email: d.email,
            societyName: d.societyName,
            city: d.city,
            message: d.message,
            status: d.status,
          },
          update: {
            status: d.status,
          },
        });
      }
    }

    // 14. Persist work orders
    if (body.workOrders && Array.isArray(body.workOrders)) {
      for (const w of body.workOrders) {
        await prisma.workOrder.upsert({
          where: { id: w.id },
          create: {
            id: w.id,
            societyId: w.societyId,
            code: w.code,
            vendor: w.vendor,
            category: w.category,
            description: w.description,
            status: w.status,
            sentDate: w.sentDate,
          },
          update: {
            status: w.status,
          },
        });
      }
    }

    // 15. Persist notifications
    if (body.notifications && Array.isArray(body.notifications)) {
      for (const no of body.notifications) {
        await prisma.appNotification.upsert({
          where: { id: no.id },
          create: {
            id: no.id,
            societyId: no.societyId,
            userId: no.userId,
            title: no.title,
            message: no.message,
            type: no.type,
            read: no.read ?? false,
          },
          update: {
            read: no.read,
          },
        });
      }
    }

    res.json({ success: true, message: "Database synchronized successfully." });
  } catch (error: any) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Failed to persist database mutations." });
  }
});

// -------------------------------------------------------------
// Specialized Resident Approval Endpoint: PUT /api/residents/:id/activate
// -------------------------------------------------------------
dataRouter.put("/residents/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.user.update({
      where: { id },
      data: { status: "active" },
    });
    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Activation error:", error);
    res.status(500).json({ error: "Failed to activate resident." });
  }
});

// -------------------------------------------------------------
// Specialized Resident Reject Endpoint: DELETE /api/residents/:id/reject
// -------------------------------------------------------------
dataRouter.delete("/residents/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "Resident application rejected and removed." });
  } catch (error: any) {
    console.error("Reject error:", error);
    res.status(500).json({ error: "Failed to reject resident." });
  }
});

// -------------------------------------------------------------
// Real-Time Visitor Status Endpoint: PUT /api/visitors/:id/status
// -------------------------------------------------------------
dataRouter.put("/visitors/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.visitor.update({
      where: { id },
      data: { status },
    });
    if (status === "exited") {
      notifyVisitorExit(updated.societyId, updated.unitId, updated as any);
      // Create resident notification in DB
      await prisma.appNotification.create({
        data: {
          societyId: updated.societyId,
          userId: updated.hostUserId,
          title: `🚶 Visitor Exited: ${updated.name}`,
          message: `${updated.name} (${updated.purpose}) has checked out and exited through the gate at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
          type: "gate",
        },
      });
    } else {
      notifyVisitorStatus(updated.societyId, updated as any);
    }
    res.json({ success: true, visitor: updated });
  } catch (error: any) {
    console.error("Visitor status error:", error);
    res.status(500).json({ error: "Failed to update visitor status." });
  }
});

// -------------------------------------------------------------
// Real-Time Staff / Daily Help Exit Endpoint: POST /api/staff/exit
// -------------------------------------------------------------
dataRouter.post("/staff/exit", async (req, res) => {
  try {
    const { societyId, name, helperId } = req.body;

    const unitsToNotify: string[] = [];
    if (helperId) {
      const helper = await prisma.helper.findUnique({ where: { id: helperId } });
      if (helper?.unitId) {
        unitsToNotify.push(helper.unitId);
        const residents = await prisma.user.findMany({ where: { unitId: helper.unitId } });
        for (const r of residents) {
          await prisma.appNotification.create({
            data: {
              societyId: helper.societyId,
              userId: r.id,
              title: `👋 Daily Help Checked Out: ${helper.name}`,
              message: `${helper.name} (${helper.duty}) has checked out and exited through the gate at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
              type: "gate",
            },
          });
        }
      }
    }

    notifyStaffExit(societyId, name, unitsToNotify);
    res.json({ success: true, message: `Staff member ${name} checked out.` });
  } catch (error: any) {
    console.error("Staff exit error:", error);
    res.status(500).json({ error: "Failed to process staff check-out." });
  }
});


