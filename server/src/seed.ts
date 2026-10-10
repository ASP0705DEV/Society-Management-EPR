import { prisma } from "./db";
import { hashPassword } from "./lib/auth";

export async function runDatabaseSeed() {
  console.log("🌱 Checking database state for initial seed...");

  const existingSocieties = await prisma.society.count();
  if (existingSocieties > 0) {
    console.log("✓ Database already seeded. Skipping initial seed.");
    return;
  }

  console.log("🌱 Populating fresh PostgreSQL database with AI Smartgate OS seed data...");

  // 1. Plans
  await prisma.plan.createMany({
    data: [
      {
        id: "plan-starter",
        name: "Starter",
        monthlyPrice: 2499,
        maxUnits: 100,
        maxGates: 2,
        features: ["Visitor approvals", "Parcel desk", "Email support"],
      },
      {
        id: "plan-professional",
        name: "Professional",
        monthlyPrice: 5999,
        maxUnits: 400,
        maxGates: 6,
        features: ["Everything in Starter", "Multiple gates", "Priority support"],
      },
      {
        id: "plan-enterprise",
        name: "Enterprise",
        monthlyPrice: 12999,
        maxUnits: 2500,
        maxGates: 20,
        features: ["Everything in Professional", "Dedicated manager"],
      },
    ],
    skipDuplicates: true,
  });

  // 2. Society
  const society = await prisma.society.create({
    data: {
      id: "soc-silverwood",
      name: "Silverwood Heights",
      address: "12 Palm Avenue, Whitefield",
      city: "Bengaluru",
      state: "Karnataka",
      latitude: 12.9716,
      longitude: 77.5946,
      code: "SW-2026",
      photo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    },
  });

  // 3. Subscription
  await prisma.subscription.create({
    data: {
      id: "sub-silverwood",
      societyId: society.id,
      planId: "plan-professional",
      status: "active",
      renewsOn: "2027-03-01",
    },
  });

  // 4. Units
  const unitsData = [
    { id: "unit-a101", societyId: society.id, block: "A", number: "101", floor: 1 },
    { id: "unit-a102", societyId: society.id, block: "A", number: "102", floor: 1 },
    { id: "unit-b201", societyId: society.id, block: "B", number: "201", floor: 2 },
    { id: "unit-b202", societyId: society.id, block: "B", number: "202", floor: 2 },
  ];
  for (const u of unitsData) {
    await prisma.unit.create({ data: u });
  }

  // 5. Users with Argon2 password hashing
  const superAdminPass = await hashPassword("SuperAdmin@2026");
  const societyAdminPass = await hashPassword("SocietyAdmin@2026");
  const residentPass = await hashPassword("Resident@2026");
  const guardPass = await hashPassword("GateGuard@2026");

  await prisma.user.createMany({
    data: [
      {
        id: "user-superadmin",
        societyId: null,
        unitId: null,
        name: "Sai Prithvi",
        email: "saiprithvi0705@gmail.com",
        phone: "+91 98000 00001",
        password: superAdminPass,
        role: "super_admin",
        status: "active",
        emailVerified: true,
        phoneVerified: true,
        gateId: null,
        photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      },
      {
        id: "user-society-admin",
        societyId: society.id,
        unitId: null,
        name: "Kritik Rao",
        email: "saiggs62@gmail.com",
        phone: "+91 70703 62117",
        password: societyAdminPass,
        role: "society_admin",
        status: "active",
        emailVerified: true,
        phoneVerified: true,
        gateId: null,
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      },
      {
        id: "user-resident",
        societyId: society.id,
        unitId: "unit-a101",
        name: "Prithvi A",
        email: "saiggs055@gmail.com",
        phone: "+91 90000 00003",
        password: residentPass,
        role: "resident",
        status: "active",
        emailVerified: true,
        phoneVerified: true,
        gateId: null,
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      },
      {
        id: "user-guard",
        societyId: society.id,
        unitId: null,
        name: "Rahul M",
        email: "saiggs739@gmail.com",
        phone: "+91 72830 94259",
        password: guardPass,
        role: "gatekeeper",
        status: "active",
        emailVerified: true,
        phoneVerified: true,
        gateId: "gate-north",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      },
    ],
  });

  // 6. Gates
  await prisma.gate.createMany({
    data: [
      {
        id: "gate-north",
        societyId: society.id,
        name: "North Gate (Main Entrance)",
        visitorApprovalRequired: true,
        deliveryAutoApprove: true,
      },
      {
        id: "gate-south",
        societyId: society.id,
        name: "South Gate (Tower B)",
        visitorApprovalRequired: true,
        deliveryAutoApprove: false,
      },
    ],
  });

  // 7. Helpers
  await prisma.helper.createMany({
    data: [
      {
        id: "help-1",
        societyId: society.id,
        unitId: "unit-a101",
        name: "Sunita Devi",
        phone: "+91 98765 43210",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        duty: "Housekeeping",
        allowed: true,
      },
      {
        id: "help-2",
        societyId: society.id,
        unitId: "unit-a101",
        name: "Ramesh Kumar",
        phone: "+91 98765 43211",
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        duty: "Driver",
        allowed: true,
      },
    ],
  });

  // 8. Notices
  await prisma.notice.createMany({
    data: [
      {
        id: "not-1",
        societyId: society.id,
        title: "Swimming Pool Maintenance Schedule",
        body: "The pool will be closed for deep cleaning on Friday, Oct 16th from 8:00 AM to 4:00 PM.",
        priority: "normal",
        category: "Maintenance",
      },
      {
        id: "not-2",
        societyId: society.id,
        title: "Festival Celebration & Parking Guidelines",
        body: "Guest parking passes are mandatory for this weekend's festivities. Please register vehicles at the gate.",
        priority: "urgent",
        category: "Event",
      },
    ],
  });

  // 9. Family Member
  await prisma.familyMember.create({
    data: {
      id: "fam-1",
      societyId: society.id,
      unitId: "unit-a101",
      primaryResidentId: "user-resident",
      name: "Sneha A",
      relation: "Spouse",
      phone: "+91 90000 00004",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
  });

  console.log("✅ PostgreSQL initial seed complete!");
}
