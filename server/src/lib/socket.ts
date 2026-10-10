import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Visitor, Parcel, Notice } from "../../src/types";

let io: SocketIOServer | null = null;

export function initSocketServer(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    // Client joins tenant or personal rooms
    socket.on("join", ({ societyId, unitId, userId, role }) => {
      if (societyId) {
        socket.join(`society:${societyId}`);
      }
      if (unitId) {
        socket.join(`unit:${unitId}`);
      }
      if (userId) {
        socket.join(`user:${userId}`);
      }
      if (role === "gatekeeper") {
        socket.join(`gates:${societyId}`);
      }
    });

    // Real-time visitor approval response from resident device
    socket.on("visitor:respond", (payload: { visitorId: string; status: "approved" | "rejected"; societyId: string }) => {
      io?.to(`gates:${payload.societyId}`).emit("visitor:status-updated", payload);
    });

    socket.on("disconnect", () => {});
  });

  console.log("⚡ Socket.io real-time engine initialized");
  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}

export function notifyVisitorRequest(societyId: string, unitId: string, visitor: Visitor): void {
  if (!io) return;
  // Send notification to the specific flat's devices
  io.to(`unit:${unitId}`).emit("gate:visitor-request", visitor);
  io.to(`society:${societyId}`).emit("feed:visitor", visitor);
}

export function notifyVisitorStatus(societyId: string, visitor: Visitor): void {
  if (!io) return;
  io.to(`gates:${societyId}`).emit("visitor:status-updated", visitor);
  io.to(`unit:${visitor.unitId}`).emit("visitor:status-updated", visitor);
}

export function notifyParcelArrival(societyId: string, unitId: string, parcel: Parcel): void {
  if (!io) return;
  io.to(`unit:${unitId}`).emit("gate:parcel-arrived", parcel);
  io.to(`society:${societyId}`).emit("feed:parcel", parcel);
}

export function notifyNoticePublished(societyId: string, notice: Notice): void {
  if (!io) return;
  io.to(`society:${societyId}`).emit("notice:published", notice);
}
