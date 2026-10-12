import { io, Socket } from "socket.io-client";
import { toast } from "@/stores/use-toast";
import type { Visitor, Parcel } from "@/types";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  if (!socket) {
    const baseUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, "");
    socket = io(baseUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("⚡ Real-time WebSocket connection established:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    // Real-time listener: Visitor arrived at the gate for resident's flat
    socket.on("gate:visitor-request", (visitor: Visitor) => {
      toast.info(
        `Visitor "${visitor.name}" (${visitor.purpose}) is requesting entry at the gate.`,
        "🚨 Visitor at Gate"
      );
    });

    // Real-time listener: Parcel logged at gate desk
    socket.on("gate:parcel-arrived", (parcel: Parcel) => {
      toast.success(
        `Package from ${parcel.carrier}: "${parcel.description}" has arrived at the gate desk.`,
        "📦 Parcel Arrived"
      );
    });

    // Real-time listener: Resident updated visitor status (Approve / Reject)
    socket.on("visitor:status-updated", (visitor: Visitor) => {
      if (visitor.status === "approved") {
        toast.success(
          `Visitor "${visitor.name}" was APPROVED by the resident.`,
          "✓ Entry Approved"
        );
      } else if (visitor.status === "rejected") {
        toast.error(
          `Visitor "${visitor.name}" entry was DENIED by the resident.`,
          "✕ Entry Denied"
        );
      }
    });
  }

  return socket;
}

export function joinSocketRooms(user: { id: string; societyId: string | null; unitId: string | null; role: string }) {
  const s = getSocket();
  if (!s) return;

  s.emit("join", {
    userId: user.id,
    societyId: user.societyId,
    unitId: user.unitId,
    role: user.role,
  });
}
