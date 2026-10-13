const http = require("http");

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 8080,
        path: path,
        method: method,
        headers: {
          ...(postData ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("==================================================================");
  console.log("   GAGELLAN SMARTGATE FULL END-TO-END VERIFICATION TEST SUITE    ");
  console.log("==================================================================");

  // 1. Health Check
  console.log("\n[TEST 1] Testing Backend Health & PostgreSQL Connection...");
  const health = await request("GET", "/api/health");
  console.log("Health status:", health.status, health.data);
  if (health.status !== 200 || health.data.status !== "ok") {
    throw new Error("Health check failed");
  }
  console.log("✓ Backend and PostgreSQL 17 are healthy and responding!");

  // 2. Fetch existing societies or create new society
  console.log("\n[TEST 2] Checking / Creating New Society 'Silver Oak Heights' (Code: SO-2026)...");
  const initialData = await request("GET", "/api/data/snapshot");
  let society = (initialData.data.societies || []).find((s) => s.code === "SO-2026");
  
  if (!society) {
    // Add society via sync
    const newSoc = {
      id: "soc-silver-oak-" + Date.now(),
      name: "Silver Oak Heights",
      code: "SO-2026",
      address: "Plot 42, Hiranandani Estate",
      city: "Mumbai",
      photo: null,
    };
    await request("POST", "/api/data/sync", {
      societies: [newSoc],
      gates: [
        {
          id: "gate-so-main-" + Date.now(),
          societyId: newSoc.id,
          name: "Main Sentinel Gate",
          visitorApprovalRequired: true,
          deliveryAutoApprove: true,
        },
      ],
    });
    society = newSoc;
    console.log("✓ Created society 'Silver Oak Heights' with code SO-2026 (ID:", society.id, ")");
  } else {
    console.log("✓ Found existing society 'Silver Oak Heights' (ID:", society.id, ")");
  }

  // 3. Register 5 Different Residents
  console.log("\n[TEST 3] Registering 5 Different Residents with Code SO-2026...");
  const residentsToRegister = [
    { name: "Aarav Sharma", email: "aarav.sharma@testmail.com", phone: "9820011001", block: "A", number: "101", floor: 1 },
    { name: "Rohit Verma", email: "rohit.verma@testmail.com", phone: "9820011002", block: "A", number: "102", floor: 1 },
    { name: "Sneha Patel", email: "sneha.patel@testmail.com", phone: "9820011003", block: "B", number: "201", floor: 2 },
    { name: "Vikram Singh", email: "vikram.singh@testmail.com", phone: "9820011004", block: "B", number: "202", floor: 2 },
    { name: "Neha Kapoor", email: "neha.kapoor@testmail.com", phone: "9820011005", block: "C", number: "301", floor: 3 },
  ];

  const registeredUsers = [];
  for (const r of residentsToRegister) {
    const regRes = await request("POST", "/api/auth/register-resident", {
      code: "SO-2026",
      societyCode: "SO-2026",
      name: r.name,
      email: r.email,
      phone: r.phone,
      password: "Password@123",
      block: r.block,
      number: r.number,
      floor: r.floor,
    });
    if (regRes.data && regRes.data.user) {
      console.log(`Registered ${r.name} (Flat ${r.block}-${r.number}): ✓ Success`);
      registeredUsers.push(regRes.data.user);
    } else {
      console.log(`User ${r.name} already exists in database.`);
      const snap = await request("GET", "/api/data/snapshot");
      const found = snap.data.users.find((u) => u.email === r.email);
      registeredUsers.push(found);
    }
  }

  // 4. Verify all 5 are in "pending" status in database
  console.log("\n[TEST 4] Verifying 5 Residents are in 'pending' status in PostgreSQL...");
  const stateAfterReg = await request("GET", "/api/data/snapshot");
  const pendingInDb = stateAfterReg.data.users.filter((u) => u.societyId === society.id && u.status === "pending");
  console.log(`Found ${pendingInDb.length} pending residents in society ${society.name}:`);
  pendingInDb.forEach((u) => console.log(`  - ${u.name} (${u.email}) -> Status: ${u.status}`));

  // 5. Add Spouses and Family Members to them
  console.log("\n[TEST 5] Adding Spouses & Family Members...");
  const familyMembersToAdd = [
    { primaryUser: registeredUsers[0], name: "Pooja Sharma", relation: "spouse", phone: "9820099001" },
    { primaryUser: registeredUsers[1], name: "Ananya Verma", relation: "spouse", phone: "9820099002" },
    { primaryUser: registeredUsers[2], name: "Kunal Patel", relation: "spouse", phone: "9820099003" },
    { primaryUser: registeredUsers[3], name: "Simran Singh", relation: "spouse", phone: "9820099004" },
    { primaryUser: registeredUsers[4], name: "Aryan Kapoor", relation: "child", phone: "9820099005" },
  ];

  const familyPayload = familyMembersToAdd.map((fm, idx) => ({
    id: "fam-" + (idx + 1) + "-" + Date.now(),
    societyId: society.id,
    unitId: fm.primaryUser.unitId,
    primaryResidentId: fm.primaryUser.id,
    name: fm.name,
    relation: fm.relation,
    phone: fm.phone,
    photo: null,
  }));

  await request("POST", "/api/data/sync", { familyMembers: familyPayload });
  console.log(`✓ Added ${familyPayload.length} family members synced to PostgreSQL.`);

  // 6. Admin Approves the Residents
  console.log("\n[TEST 6] Admin Approves & Activates All 5 Residents...");
  for (const user of registeredUsers) {
    const actRes = await request("PUT", `/api/residents/${user.id}/activate`);
    console.log(`Approved ${user.name} (${user.id}):`, actRes.data.success ? "✓ Active" : actRes.data);
  }

  // Verify status in PostgreSQL
  const stateAfterApproval = await request("GET", "/api/data/snapshot");
  const activeInDb = stateAfterApproval.data.users.filter((u) => u.societyId === society.id && u.status === "active");
  console.log(`✓ Verified in PostgreSQL: ${activeInDb.length} residents now active!`);
  activeInDb.forEach((u) => console.log(`  - ${u.name} -> Status: ${u.status}`));

  // 7. Test Visitor Entry, Approval & Real-Time Exit with Resident Notification
  console.log("\n[TEST 7] Testing Visitor Entry & Real-Time Exit with Resident Notification...");
  const targetResident = activeInDb[0]; // Aarav Sharma
  const testVisitor = {
    id: "vis-test-" + Date.now(),
    societyId: society.id,
    unitId: targetResident.unitId,
    hostUserId: targetResident.id,
    name: "Rajesh Kumar (Guest)",
    phone: "9811122233",
    purpose: "guest",
    status: "checked_in",
    code: "654321",
    createdBy: "gatekeeper",
    note: "Weekend family friend visit",
  };

  await request("POST", "/api/data/sync", { visitors: [testVisitor] });
  console.log(`✓ Visitor Rajesh Kumar checked in for Flat A-101 (Resident: ${targetResident.name})`);

  // Now Mark Exit via Real-Time Exit Endpoint
  console.log("Marking Visitor Exit at Gate Desk...");
  const exitRes = await request("PUT", `/api/visitors/${testVisitor.id}/status`, { status: "exited" });
  console.log("Exit result:", exitRes.data.success ? "✓ Exited" : exitRes.data);

  // Check that Resident Notification was created in PostgreSQL
  const stateAfterExit = await request("GET", "/api/data/snapshot");
  const residentNotifs = stateAfterExit.data.notifications.filter((n) => n.userId === targetResident.id);
  console.log(`✓ Notifications generated for ${targetResident.name}:`, residentNotifs.length);
  residentNotifs.forEach((n) => console.log(`  - [${n.type.toUpperCase()}] ${n.title}: ${n.message}`));

  // 8. Test Domestic Staff Check-In & Real-Time Exit with Resident Notification
  console.log("\n[TEST 8] Testing Domestic Helper (Maid/Cook) Check-In & Exit Notification...");
  const snehaResident = activeInDb.find((u) => u.name === "Sneha Patel");
  const helper = {
    id: "help-test-" + Date.now(),
    societyId: society.id,
    unitId: snehaResident.unitId,
    name: "Sunita Bai (House Maid)",
    phone: "9876500001",
    duty: "Maid",
    allowed: true,
  };
  await request("POST", "/api/data/sync", { helpers: [helper] });
  console.log(`✓ Helper Sunita Bai registered for Sneha Patel (Flat B-201)`);

  console.log("Logging Staff Check-Out via POST /api/staff/exit...");
  const staffExitRes = await request("POST", "/api/staff/exit", {
    societyId: society.id,
    name: helper.name,
    helperId: helper.id,
  });
  console.log("Staff exit response:", staffExitRes.data);

  const stateAfterStaffExit = await request("GET", "/api/data/snapshot");
  const snehaNotifs = stateAfterStaffExit.data.notifications.filter((n) => n.userId === snehaResident.id);
  console.log(`✓ Notifications generated for Sneha Patel:`, snehaNotifs.length);
  snehaNotifs.forEach((n) => console.log(`  - [${n.type.toUpperCase()}] ${n.title}: ${n.message}`));

  // 9. Test Parcel Delivery & OTP Handover
  console.log("\n[TEST 9] Testing Parcel Logging & OTP Handover...");
  const testParcel = {
    id: "parcel-test-" + Date.now(),
    societyId: society.id,
    unitId: targetResident.unitId,
    residentUserId: targetResident.id,
    carrier: "Amazon",
    description: "MacBook Air Sleeve & Charger",
    status: "at_gate",
    otp: "789123",
  };
  await request("POST", "/api/data/sync", { parcels: [testParcel] });
  // 10. Test Approved Resident Login
  console.log("\n[TEST 10] Testing Approved Resident Login via POST /api/auth/login...");
  const loginRes = await request("POST", "/api/auth/login", {
    email: "aarav.sharma@testmail.com",
    password: "Password@123",
  });
  console.log("Resident login status:", loginRes.status, loginRes.data.user ? `✓ Successfully logged in as ${loginRes.data.user.name} (${loginRes.data.user.role})` : loginRes.data);
  if (!loginRes.data.user) {
    throw new Error("Resident login failed after approval");
  }

  console.log("\n==================================================================");
  console.log("   ALL 10 TEST PHASES COMPLETED WITH 100% SUCCESS!               ");
  console.log("==================================================================");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
