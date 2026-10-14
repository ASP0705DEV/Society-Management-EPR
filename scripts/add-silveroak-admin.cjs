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

async function main() {
  const snap = await request("GET", "/api/data/snapshot");
  const soc = snap.data.societies.find((s) => s.code === "SO-2026");
  if (!soc) {
    console.error("Society SO-2026 not found");
    process.exit(1);
  }
  console.log("Found society:", soc.name, soc.id);

  // Sync society admin & gatekeeper for Silver Oak Heights
  const syncPayload = {
    users: [
      {
        id: "user-admin-silveroak",
        societyId: soc.id,
        unitId: null,
        name: "Silver Oak Admin",
        email: "silveroak.admin@gmail.com",
        phone: "+91 98200 88001",
        password: "SocietyAdmin@2026",
        role: "society_admin",
        status: "active",
        emailVerified: true,
        phoneVerified: true,
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      },
      {
        id: "user-guard-silveroak",
        societyId: soc.id,
        unitId: null,
        name: "Silver Oak Guard",
        email: "silveroak.guard@gmail.com",
        phone: "+91 98200 88002",
        password: "GateGuard@2026",
        role: "gatekeeper",
        status: "active",
        emailVerified: true,
        phoneVerified: true,
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      },
    ],
  };

  const syncRes = await request("POST", "/api/data/sync", syncPayload);
  console.log("Sync response:", syncRes.data);

  // Test logging in with the new admin!
  const loginRes = await request("POST", "/api/auth/login", {
    email: "silveroak.admin@gmail.com",
    password: "SocietyAdmin@2026",
  });
  console.log("Admin login test:", loginRes.status, loginRes.data.user ? `✓ Success! Logged in as ${loginRes.data.user.name} (${loginRes.data.user.role}) for ${soc.name}` : loginRes.data);
}

main().catch(console.error);
