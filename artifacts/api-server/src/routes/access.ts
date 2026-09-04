import { Router, type IRouter } from "express";
import { generateKeyPairSync, createSign, randomUUID } from "node:crypto";
import {
  CreatePassBody,
  SyncEventsBody,
} from "@workspace/api-zod";

type PassType = "guest" | "delivery";
type PassStatus = "active" | "used" | "revoked" | "expired";
type Decision = "granted" | "denied";

type AccessPass = {
  id: string;
  type: PassType;
  label: string;
  issuedBy: string;
  validFrom: Date;
  validTo: Date;
  status: PassStatus;
  token: string;
  createdAt: Date;
};

type GateEvent = {
  id: string;
  tokenId: string;
  passLabel: string;
  decision: Decision;
  reason: string;
  gate: string;
  occurredAt: string;
  synced: boolean;
};

const router: IRouter = Router();
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});
const keyId = "gatepass-2026-01";
const issuedPasses: AccessPass[] = [];
const revokedIds = new Map<string, string>();
const gateEvents: GateEvent[] = [];

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function signToken(pass: {
  id: string;
  type: PassType;
  label: string;
  issuedBy: string;
  validFrom: Date;
  validTo: Date;
}) {
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: keyId }));
  const payload = base64Url(
    JSON.stringify({
      token_id: pass.id,
      type: pass.type,
      label: pass.label,
      issued_by: pass.issuedBy,
      valid_from: pass.validFrom.toISOString(),
      valid_to: pass.validTo.toISOString(),
      iat: Math.floor(pass.validFrom.getTime() / 1000),
      exp: Math.floor(pass.validTo.getTime() / 1000),
    }),
  );
  const signingInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKey);
  return `${signingInput}.${base64Url(signature)}`;
}

function withCurrentStatus(pass: AccessPass): AccessPass {
  if (pass.status === "active" && pass.validTo.getTime() < Date.now()) {
    return { ...pass, status: "expired" };
  }
  return pass;
}

function serializePass(pass: AccessPass) {
  return {
    ...withCurrentStatus(pass),
    validFrom: pass.validFrom.toISOString(),
    validTo: pass.validTo.toISOString(),
    createdAt: pass.createdAt.toISOString(),
  };
}

function addPass(input: {
  type: PassType;
  label: string;
  validFrom: Date;
  validTo: Date;
}) {
  const pass = {
    id: randomUUID(),
    type: input.type,
    label: input.label,
    issuedBy: "Unit 12B",
    validFrom: input.validFrom,
    validTo: input.validTo,
    status: "active" as PassStatus,
    token: "",
    createdAt: new Date(),
  };
  pass.token = signToken(pass);
  issuedPasses.unshift(pass);
  return pass;
}

const seededGuestFrom = new Date(Date.now() - 45 * 60 * 1000);
const seededGuestTo = new Date(Date.now() + 6 * 60 * 60 * 1000);
addPass({
  type: "guest",
  label: "Maya Thompson",
  validFrom: seededGuestFrom,
  validTo: seededGuestTo,
});
const seededDeliveryFrom = new Date(Date.now() - 20 * 60 * 1000);
const seededDeliveryTo = new Date(Date.now() + 90 * 60 * 1000);
addPass({
  type: "delivery",
  label: "FreshCart delivery",
  validFrom: seededDeliveryFrom,
  validTo: seededDeliveryTo,
});

router.get("/passes", (_req, res) => {
  res.json(issuedPasses.map(serializePass));
});

router.post("/passes", (req, res) => {
  const input = CreatePassBody.parse(req.body);
  if (input.validTo <= input.validFrom) {
    res.status(400).json({ error: "The end time must be after the start time." });
    return;
  }
  const pass = addPass(input);
  res.status(201).json(serializePass(pass));
});

router.post("/passes/:id/revoke", (req, res) => {
  const pass = issuedPasses.find((item) => item.id === req.params.id);
  if (!pass) {
    res.status(404).json({ error: "Pass not found." });
    return;
  }
  pass.status = "revoked";
  revokedIds.set(pass.id, new Date().toISOString());
  res.json(serializePass(pass));
});

router.get("/gate/public-key", (_req, res) => {
  res.json({
    kid: keyId,
    publicKey: publicKey.toString(),
    fetchedAt: new Date().toISOString(),
  });
});

router.get("/sync/revocations", (_req, res) => {
  res.json(
    [...revokedIds.entries()].map(([tokenId, revokedAt]) => ({
      tokenId,
      revokedAt,
    })),
  );
});

router.post("/sync/events", (req, res) => {
  const { events } = SyncEventsBody.parse(req.body);
  const existing = new Set(gateEvents.map((event) => event.id));
  for (const event of events) {
    if (!existing.has(event.id)) {
      gateEvents.unshift({ ...event, synced: true });
    }
  }
  res.json({
    accepted: events.length,
    syncedAt: new Date().toISOString(),
  });
});

router.get("/dashboard/summary", (_req, res) => {
  const now = Date.now();
  const activePasses = issuedPasses.filter(
    (pass) =>
      pass.status === "active" &&
      pass.validFrom.getTime() <= now &&
      pass.validTo.getTime() >= now,
  ).length;
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const entriesToday = gateEvents.filter(
    (event) =>
      event.decision === "granted" &&
      new Date(event.occurredAt).getTime() >= dayStart.getTime(),
  ).length;
  res.json({
    activePasses,
    entriesToday,
    revokedPendingSync: revokedIds.size,
    gateStatus: "online",
    lastSyncAt: gateEvents.length ? gateEvents[0].occurredAt : null,
  });
});

router.get("/dashboard/events", (_req, res) => {
  res.json(gateEvents.slice(0, 20));
});

export default router;