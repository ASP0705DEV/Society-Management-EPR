import { FormEvent, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Building2,
  Package,
  UserRound,
  Car,
  Wrench,
  ShoppingBag,
  Check,
  ChevronDown,
  Sparkles,
  Share2,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  PhoneCall,
  AlertCircle,
  Gift,
  HelpCircle,
  CloudSun,
  Sun,
  Wind,
  Droplets,
  Radio,
  UserCheck,
  CheckCircle2,
  Volume2,
  Mic,
  X,
  Megaphone,
  Users,
  Trash2,
} from "lucide-react";
import { Avatar, Badge, Button, Card, EmptyState, ErrorNote, Field, PageTitle, PhotoField, SelectInput, TextInput, Modal } from "@/components/ui";
import { formatWhen, societyName, unitLabel } from "@/lib/format";
import { useAuth } from "@/stores/use-auth";
import { useData } from "@/stores/use-data";
import type { VisitorPurpose, Notice, Helper, FamilyMember } from "@/types";

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    // Tone 1: 880Hz (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 1318.5Hz (E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.5, now + 0.12);
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch {
    // Audio context may be restricted before user interaction
  }
}

function useHome() {
  const user = useAuth((state) => state.user);
  const db = useData((state) => state.db);
  const visitors = db.visitors.filter((visitor) => user && visitor.hostUserId === user.id);
  const parcels = db.parcels.filter((parcel) => user && parcel.residentUserId === user.id);
  const notices = db.notices.filter((notice) => notice.societyId === user?.societyId);
  const helpers = db.helpers.filter((h) => h.societyId === user?.societyId && (!h.unitId || h.unitId === user?.unitId));
  const guard = db.users.find((u) => u.societyId === user?.societyId && u.role === "gatekeeper") || {
    id: "guard-default",
    name: "Rahul M",
    phone: "+91 72830 94259",
    photo: null,
  };
  const mainGate = db.gates.find((g) => g.societyId === user?.societyId) || { name: "Main Gate (Post 1)" };
  const society = db.societies.find((s) => s.id === user?.societyId);
  return { user, db, visitors, parcels, notices, helpers, guard, mainGate, society };
}

type PreApproveType = "cab" | "delivery" | "service" | "guest" | null;

const VISITING_CATEGORIES = [
  "Home repair",
  "Appliance repair",
  "Internet repair",
  "Beautician",
  "Tutor",
  "Maid / Housekeeping",
  "Plumbing / Electrical",
  "Others",
];

const DELIVERY_PARTNERS = ["Swiggy", "Zomato", "Amazon", "Blinkit", "Zepto", "Flipkart", "BlueDart", "Other"];

export function ResidentHome() {
  const { user, db, visitors, parcels, notices, helpers, guard, mainGate, society } = useHome();
  const setVisitorStatus = useData((state) => state.setVisitorStatus);
  const addVisitor = useData((state) => state.addVisitor);

  // Workflow Modal States (Matching Screenshots 1, 2, 3, 4)
  const [modalType, setModalType] = useState<PreApproveType>(null);
  const [modalTab, setModalTab] = useState<"Once" | "Frequently">("Once");
  const [duration, setDuration] = useState("1 hour");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [successCode, setSuccessCode] = useState<{ code: string; title: string; subtitle: string } | null>(null);

  // Shortcuts Modals & States (Guard Intercom, Weather, Notices)
  const [showIntercomModal, setShowIntercomModal] = useState(false);
  const [intercomStatus, setIntercomStatus] = useState<"dialing" | "connected" | "ended">("dialing");
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [cannedMsgSent, setCannedMsgSent] = useState<string | null>(null);

  // Cab Workflow State (Image 1)
  const [cabDigits, setCabDigits] = useState(["", "", "", ""]);
  const digitRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Visiting Help Category State (Image 2 & 3)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [servicePhone, setServicePhone] = useState("");

  // Delivery State (Image 4)
  const [surpriseDelivery, setSurpriseDelivery] = useState(false);
  const [deliveryPartner, setDeliveryPartner] = useState("Amazon");

  // Guest State
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Real-Time Announcement Alert & Audio State
  const [dismissedNoticeId, setDismissedNoticeId] = useState<string | null>(null);
  const [hasPlayedChime, setHasPlayedChime] = useState(false);
  const latestNotice = notices[0] || null;

  useEffect(() => {
    if (latestNotice && !hasPlayedChime) {
      playNotificationChime();
      setHasPlayedChime(true);
    }
  }, [latestNotice, hasPlayedChime]);

  if (!user) return null;

  const pending = visitors.filter((visitor) => visitor.status === "pending");
  const currentUnit = db.units.find((u) => u.id === user.unitId);

  // Handle Cab 4-digit input change with auto-advance
  function handleDigitChange(index: number, value: string) {
    const val = value.replace(/\D/g, "").slice(-1);
    const updated = [...cabDigits];
    updated[index] = val;
    setCabDigits(updated);
    if (val && index < 3) {
      digitRefs[index + 1].current?.focus();
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !cabDigits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
  }

  // Pre-approve Submissions
  function handleConfirmCab() {
    if (!user?.societyId || !user.unitId) return;
    const vehicleNo = cabDigits.join("");
    const newVis = addVisitor({
      societyId: user.societyId,
      unitId: user.unitId,
      hostUserId: user.id,
      name: vehicleNo ? `Cab (••• ${vehicleNo})` : "Cab / Taxi",
      phone: "+91 90000 00000",
      purpose: "cab",
      note: `Allowed for next ${duration}. Last 4 digits: ${vehicleNo || "N/A"}`,
      photo: null,
      helperId: null,
      createdBy: "resident",
      vehicleNumber: vehicleNo || null,
      validDurationHours: duration.includes("2") ? 2 : duration.includes("4") ? 4 : 1,
    });
    setModalType(null);
    setCabDigits(["", "", "", ""]);
    setSuccessCode({
      code: newVis.code,
      title: "Cab Entry Pre-Approved!",
      subtitle: `Share entry pass code with driver for entry in the next ${duration}.`,
    });
  }

  function handleConfirmService() {
    if (!user?.societyId || !user.unitId) return;
    const cat = selectedCategory || "Home repair";
    const newVis = addVisitor({
      societyId: user.societyId,
      unitId: user.unitId,
      hostUserId: user.id,
      name: serviceName.trim() || `${cat} Service`,
      phone: servicePhone.trim() || "+91 90000 00000",
      purpose: "staff",
      note: `Visiting help: ${cat} · valid ${duration}`,
      photo: null,
      helperId: null,
      createdBy: "resident",
      category: cat,
      validDurationHours: duration.includes("2") ? 2 : duration.includes("4") ? 4 : 1,
    });
    setModalType(null);
    setSelectedCategory(null);
    setServiceName("");
    setServicePhone("");
    setSuccessCode({
      code: newVis.code,
      title: `${cat} Entry Approved!`,
      subtitle: `Show or send code ${newVis.code} to gate security upon technician arrival.`,
    });
  }

  function handleConfirmDelivery() {
    if (!user?.societyId || !user.unitId) return;
    const newVis = addVisitor({
      societyId: user.societyId,
      unitId: user.unitId,
      hostUserId: user.id,
      name: `${deliveryPartner} Delivery`,
      phone: "+91 90000 00000",
      purpose: "delivery",
      note: surpriseDelivery ? "Surprise delivery (keep confidential)" : `Delivery via ${deliveryPartner}`,
      photo: null,
      helperId: null,
      createdBy: "resident",
      isSurpriseDelivery: surpriseDelivery,
      validDurationHours: duration.includes("2") ? 2 : duration.includes("4") ? 4 : 1,
    });
    setModalType(null);
    setSurpriseDelivery(false);
    setSuccessCode({
      code: newVis.code,
      title: "Delivery Pre-Approved!",
      subtitle: `Delivery executive can enter with code ${newVis.code} in next ${duration}.`,
    });
  }

  function handleConfirmGuest() {
    if (!user?.societyId || !user.unitId || !guestName.trim()) return;
    const newVis = addVisitor({
      societyId: user.societyId,
      unitId: user.unitId,
      hostUserId: user.id,
      name: guestName.trim(),
      phone: guestPhone.trim() || "+91 98000 00000",
      purpose: "guest",
      note: `Guest pre-approved by ${user.name}`,
      photo: null,
      helperId: null,
      createdBy: "resident",
      validDurationHours: 4,
    });
    setModalType(null);
    setGuestName("");
    setGuestPhone("");
    setSuccessCode({
      code: newVis.code,
      title: `Pass Code for ${newVis.name}!`,
      subtitle: `Share this 6-digit code via WhatsApp or SMS for seamless entry at the gate.`,
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="glass rounded-[28px] p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-line shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar src={user.photo} name={user.name} className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl shadow-sm text-base sm:text-lg shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-foreground truncate">
                Hello, {user.name.split(" ")[0]}!
              </h1>
              <span className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                Resident
              </span>
            </div>
            <p className="text-xs text-muted font-bold mt-0.5 truncate">
              Flat {unitLabel(db.units, user.unitId)} · {societyName(db, user.societyId)}
            </p>
          </div>
        </div>

        {/* Quick Header Status Shortcuts (Guard Intercom, Weather, Notices) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {/* Intercom Gate Shortcut */}
          <button
            type="button"
            onClick={() => {
              setShowIntercomModal(true);
              setIntercomStatus("dialing");
              setTimeout(() => setIntercomStatus("connected"), 1200);
            }}
            className="shrink-0 flex items-center gap-2 rounded-2xl border border-line bg-card/90 hover:bg-soft px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black text-foreground shadow-sm transition hover:border-emerald-500 cursor-pointer"
            title="Connect with Gate Guard Intercom"
          >
            <PhoneCall size={14} className="text-emerald-500 shrink-0" />
            <span className="truncate">Gate 1: {guard.name.split(" ")[0]}</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          </button>

          {/* Weather Shortcut */}
          <button
            type="button"
            onClick={() => setShowWeatherModal(true)}
            className="shrink-0 flex items-center gap-2 rounded-2xl border border-line bg-card/90 hover:bg-soft px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black text-foreground shadow-sm transition hover:border-amber-500 cursor-pointer"
            title="View Weather & Air Quality"
          >
            <CloudSun size={15} className="text-amber-500 shrink-0" />
            <span>27°C Sunny</span>
          </button>

          {/* Notices Badge Shortcut */}
          <button
            type="button"
            onClick={() => {
              if (notices[0]) setSelectedNotice(notices[0]);
            }}
            className="shrink-0 flex items-center gap-2 rounded-2xl border border-line bg-card/90 hover:bg-soft px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black text-primary shadow-sm transition hover:border-primary cursor-pointer"
            title="Read Important Society Announcements"
          >
            <Bell size={14} className="text-primary shrink-0" />
            <span>{notices.length} Alerts</span>
          </button>
        </div>
      </div>

      {/* FLASHING REAL-TIME ANNOUNCEMENT ALERT WITH AUDIO CHIME */}
      {latestNotice && dismissedNoticeId !== latestNotice.id && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4 sm:p-5 shadow-lg shadow-amber-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="relative mt-1 shrink-0">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-red-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider animate-bounce">
                  Live Announcement
                </span>
                <span className="text-xs text-amber-800 dark:text-amber-300 font-bold">
                  {formatWhen(latestNotice.createdAt)}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                {latestNotice.title}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 mt-0.5 font-medium">
                {latestNotice.body}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => playNotificationChime()}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white/90 dark:bg-card px-3 py-2 text-xs font-black text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer shadow-sm"
              title="Play Announcement Sound Chime"
            >
              <Volume2 size={15} className="text-amber-600" />
              <span>Chime</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedNotice(latestNotice)}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white px-3.5 py-2 text-xs font-black shadow-sm transition cursor-pointer"
            >
              View Notice →
            </button>
            <button
              type="button"
              onClick={() => setDismissedNoticeId(latestNotice.id)}
              className="rounded-xl border border-line bg-card hover:bg-soft p-2 text-muted hover:text-foreground transition cursor-pointer"
              title="Acknowledge Alert"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP PARCEL DESK SECTION: PARCELS AT GATE WITH HANDOVER OTP (SCREENSHOT 3) */}
      {/* ========================================================================= */}
      <Card className="border border-line shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-primary">
              <Package size={20} />
            </div>
            <h2 className="text-lg font-black text-foreground">Parcels at Gate</h2>
          </div>
          <span
            className={`rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wider ${
              parcels.length > 0
                ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                : "border-line bg-soft text-muted"
            }`}
          >
            {parcels.length} WAITING
          </span>
        </div>

        {parcels.length === 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-dashed border-line bg-soft/40 text-xs text-muted">
            <div className="flex items-center gap-2.5">
              <Package size={16} className="text-muted/70" />
              <span>No packages currently held at the security gate sentinel.</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Gate Locker Clear ✓
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parcels.map((parcel) => (
              <div
                key={parcel.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card p-4 shadow-sm hover:border-primary/40 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-base font-black text-[#0f2b5c] dark:text-blue-400">
                    {parcel.carrier}
                  </p>
                  <span className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    AT GATE
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                  {parcel.description || "Document Envelope / Amazon Package"}
                </p>
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-3 px-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                    HANDOVER OTP
                  </p>
                  <p className="text-3xl font-black tracking-widest text-[#0066ff]">
                    {parcel.otp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 3 HIGH-UTILITY SHORTCUT CARDS: GUARD DETAILS, WEATHER REPORT, NOTIFICATIONS */}
      {/* ========================================================================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Shortcut 1: Gate Security & Guard Details */}
        <div className="glass rounded-none p-5 border border-line shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={18} />
                <span>Gate Security On Duty</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sentinel Online
              </span>
            </div>
            <div className="flex items-center gap-3.5 mt-2">
              <Avatar src={guard.photo} name={guard.name} className="h-12 w-12 rounded-2xl shadow-sm text-base" />
              <div>
                <p className="text-base font-black text-foreground">{guard.name}</p>
                <p className="text-xs text-muted font-bold">{mainGate.name}</p>
                <p className="text-[11px] text-muted font-medium mt-0.5">Active Shift: 07:00 – 15:00</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowIntercomModal(true);
                setIntercomStatus("dialing");
                setTimeout(() => setIntercomStatus("connected"), 1200);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-black shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <PhoneCall size={14} /> Call Guard Desk
            </button>
            <button
              type="button"
              onClick={() => {
                setShowIntercomModal(true);
                setIntercomStatus("connected");
              }}
              className="rounded-xl border border-line bg-card hover:bg-soft p-2.5 text-muted hover:text-foreground transition cursor-pointer"
              title="Direct Gate Intercom Channel"
            >
              <Radio size={16} />
            </button>
          </div>
        </div>

        {/* Shortcut 2: Live Community Weather Report */}
        <div className="glass rounded-none p-5 border border-line shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400">
                <CloudSun size={18} />
                <span>Community Weather</span>
              </div>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                Live · {society?.city || "Bengaluru"}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div>
                <span className="text-3xl font-black text-foreground">27°C</span>
                <p className="text-xs font-bold text-muted">Mostly Sunny · Clear Sky</p>
              </div>
              <div className="text-right text-[11px] text-muted space-y-0.5">
                <p className="flex items-center justify-end gap-1">
                  <Droplets size={12} className="text-sky-500" /> Humidity: 54%
                </p>
                <p className="flex items-center justify-end gap-1">
                  <Wind size={12} className="text-slate-400" /> Wind: 11 km/h
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
              AQI: 42 (Clean Air)
            </span>
            <button
              type="button"
              onClick={() => setShowWeatherModal(true)}
              className="font-black text-primary hover:underline cursor-pointer"
            >
              Weather Insights →
            </button>
          </div>
        </div>

        {/* Shortcut 3: Important Info & Broadcast Notifications Feed */}
        <div className="glass rounded-none p-5 border border-line shadow-sm flex flex-col justify-between hover:border-primary/40 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-black text-primary">
                <Bell size={18} />
                <span>Important Info & Alerts</span>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/70 px-2.5 py-0.5 text-[10px] font-black text-red-700 dark:text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" /> {notices.length} Alerts
              </span>
            </div>
            <div className="space-y-2 mt-2">
              {notices.slice(0, 2).map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="rounded-2xl border border-line bg-card/80 p-2.5 hover:border-primary/50 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground line-clamp-1">{notice.title}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        notice.priority === "urgent"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {notice.priority || "notice"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{notice.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-xs">
            <span className="text-[10px] text-muted font-bold">Updated by Committee</span>
            <Link to="/resident/notices" className="font-black text-primary hover:underline">
              Bulletin Board →
            </Link>
          </div>
        </div>
      </div>

      {/* Live Approval Request Banner (if any) */}
      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((visitor) => (
            <div
              key={visitor.id}
              className="rounded-none bg-gradient-to-r from-[#0f2b5c] to-[#1e3a8a] p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse-subtle"
            >
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-xl font-black">
                  🚪
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                    Visitor at Gate Sentinel Now
                  </span>
                  <p className="text-lg font-black">{visitor.name} is waiting at the main gate</p>
                  <p className="text-xs text-white/75 font-medium">
                    Purpose: {visitor.purpose} · {visitor.note || "No specific note"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setVisitorStatus(visitor.id, "approved", user)}
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-600 cursor-pointer shadow-md transition"
                >
                  ✓ Allow Entry
                </button>
                <button
                  onClick={() => setVisitorStatus(visitor.id, "rejected", user)}
                  className="rounded-xl bg-red-500/80 px-4 py-2.5 text-xs font-black text-white hover:bg-red-600 cursor-pointer transition"
                >
                  ✕ Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUICK PRE-APPROVAL ACTIONS BAR (Images 1, 2, 3, 4 workflows) */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-foreground">Quick Pre-Approval</h2>
            <p className="text-xs text-muted">Generate instant 1-tap entry passes for your visitors</p>
          </div>
          <span className="text-[11px] font-bold text-primary flex items-center gap-1">
            <Sparkles size={14} /> MyGate Flow
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Cab Button */}
          <button
            type="button"
            onClick={() => {
              setModalType("cab");
              setCabDigits(["", "", "", ""]);
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-card p-4 transition-all hover:border-amber-400 hover:shadow-md cursor-pointer group"
          >
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 transition group-hover:scale-105">
              <Car size={24} />
            </div>
            <span className="text-xs font-extrabold text-foreground">Cab / Taxi</span>
            <span className="text-[10px] text-muted">Uber, Ola & Taxis</span>
          </button>

          {/* Delivery Button */}
          <button
            type="button"
            onClick={() => setModalType("delivery")}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-card p-4 transition-all hover:border-purple-400 hover:shadow-md cursor-pointer group"
          >
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 transition group-hover:scale-105">
              <ShoppingBag size={24} />
            </div>
            <span className="text-xs font-extrabold text-foreground">Delivery</span>
            <span className="text-[10px] text-muted">Food & Packages</span>
          </button>

          {/* Visiting Help / Service Button */}
          <button
            type="button"
            onClick={() => {
              setModalType("service");
              setSelectedCategory(null);
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-card p-4 transition-all hover:border-blue-400 hover:shadow-md cursor-pointer group"
          >
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 transition group-hover:scale-105">
              <Wrench size={24} />
            </div>
            <span className="text-xs font-extrabold text-foreground">Visiting Help</span>
            <span className="text-[10px] text-muted">Repairs & Services</span>
          </button>

          {/* Guest Button */}
          <button
            type="button"
            onClick={() => setModalType("guest")}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-card p-4 transition-all hover:border-emerald-400 hover:shadow-md cursor-pointer group"
          >
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 transition group-hover:scale-105">
              <UserRound size={24} />
            </div>
            <span className="text-xs font-extrabold text-foreground">Guest</span>
            <span className="text-[10px] text-muted">Friends & Family</span>
          </button>
        </div>
      </Card>

      {/* Responsive Grid: Left Column = Today's Updates, Right Column = Parcels & Notices */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Today's Entry Updates (from screenshot background) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-foreground">Today's Entry Updates</h3>
                <p className="text-xs text-muted">Live activity stream for flat {unitLabel(db.units, user.unitId)}</p>
              </div>
              <Link to="/resident/visitors" className="text-xs font-extrabold text-primary hover:underline">
                View All →
              </Link>
            </div>

            {visitors.length === 0 ? (
              <EmptyState title="No entries yet" body="Pre-approve a cab, delivery, or guest to see live entries here." />
            ) : (
              <div className="space-y-3">
                {visitors.slice(0, 8).map((vis) => (
                  <div
                    key={vis.id}
                    className="flex items-center justify-between rounded-2xl border border-line bg-card p-3.5 transition hover:border-primary/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-soft text-primary font-black">
                        {vis.purpose === "cab" ? (
                          <Car size={18} />
                        ) : vis.purpose === "delivery" ? (
                          <ShoppingBag size={18} />
                        ) : vis.purpose === "staff" ? (
                          <Wrench size={18} />
                        ) : (
                          <UserRound size={18} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-foreground">{vis.name}</p>
                          <span className="rounded-md bg-soft px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-muted">
                            {vis.purpose}
                          </span>
                        </div>
                        <p className="text-xs text-muted">
                          Pass Code: <span className="font-black text-foreground">{vis.code}</span> · {formatWhen(vis.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          vis.status === "checked_in"
                            ? "good"
                            : vis.status === "approved"
                            ? "info"
                            : vis.status === "pending"
                            ? "warn"
                            : "bad"
                        }
                      >
                        {vis.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (5 cols): Daily Help, Parcels held at gate & Notices */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Help & Domestic Staff Roster */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-primary" />
                <h3 className="text-base font-black text-foreground">My Daily Help & Staff</h3>
              </div>
              <Link to="/resident/helpers" className="text-xs font-extrabold text-primary hover:underline">
                View All ({helpers.length})
              </Link>
            </div>

            {helpers.length === 0 ? (
              <p className="text-xs text-muted py-2">No domestic helpers linked yet. Pre-approve maids, cooks, or drivers.</p>
            ) : (
              <div className="space-y-3">
                {helpers.slice(0, 3).map((helper) => (
                  <div key={helper.id} className="flex items-center justify-between rounded-2xl border border-line bg-card p-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={helper.photo} name={helper.name} className="h-10 w-10 rounded-xl" />
                      <div>
                        <p className="text-xs font-black text-foreground">{helper.name}</p>
                        <p className="text-[10px] text-muted">{helper.duty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[9px] font-black text-emerald-700 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Inside
                      </span>
                      <a
                        href={`tel:${helper.phone.replace(/\s+/g, "")}`}
                        className="rounded-xl border border-line bg-soft p-1.5 text-muted hover:text-primary transition"
                        title="Call Helper"
                      >
                        <Phone size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Emergency & Gate Intercom Quick Access */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <h3 className="text-base font-black text-foreground">Gate Intercom & Security</h3>
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Live Sentinel
              </span>
            </div>
            <p className="text-xs text-muted">
              Connected directly to Guard {guard.name} at {mainGate.name}.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowIntercomModal(true);
                  setIntercomStatus("dialing");
                  setTimeout(() => setIntercomStatus("connected"), 1200);
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white py-2.5 text-xs font-black shadow-sm transition cursor-pointer"
              >
                <PhoneCall size={14} /> Call Security Post
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CAB PRE-APPROVAL (UNIFIED DASHBOARD UI) */}
      {/* ========================================================================= */}
      {modalType === "cab" && (
        <Modal title="Pre-Approve Cab Entry" onClose={() => setModalType(null)}>
          <div className="space-y-4 py-1">
            <div className="flex items-center gap-3 rounded-2xl bg-primary/10 border border-primary/20 p-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white shadow-sm shrink-0">
                <Car size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-foreground">Ola / Uber / Rapid Cab Pass</p>
                <p className="text-[11px] text-muted">A 4-digit numeric pass code will be sent to the gate sentinel.</p>
              </div>
            </div>

            <div className="flex rounded-2xl bg-soft p-1">
              {["Once", "Frequently"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setModalTab(tab as any)}
                  className={`flex-1 rounded-xl py-2 text-xs font-black transition cursor-pointer ${
                    modalTab === tab ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Field label="Allowed Entry Window">
              <SelectInput value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="1 hour">Next 1 hour</option>
                <option value="2 hours">Next 2 hours</option>
                <option value="4 hours">Next 4 hours</option>
                <option value="Today">Valid today (Until midnight)</option>
              </SelectInput>
            </Field>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-2">
                Last 4 Digits of Cab Vehicle No.
              </p>
              <div className="grid grid-cols-4 gap-2.5">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={digitRefs[idx]}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    value={cabDigits[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    placeholder="•"
                    className="h-14 w-full rounded-2xl border-2 border-line bg-card text-center text-xl font-black text-foreground focus:border-primary focus:bg-primary/5 focus:outline-none"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
              <Button onClick={handleConfirmCab} className="gap-2">
                <Check size={16} /> Confirm Cab Entry Pass
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VISITING HELP CATEGORY SELECTOR */}
      {/* ========================================================================= */}
      {modalType === "service" && !selectedCategory && (
        <Modal title="Choose Visiting Help Category" onClose={() => setModalType(null)}>
          <div className="space-y-3 py-1">
            <p className="text-xs text-muted">Select service or utility type for quick gate approval:</p>
            <div className="grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {VISITING_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="flex items-center justify-between rounded-2xl border border-line bg-card hover:bg-soft p-3 text-left text-xs font-bold text-foreground hover:border-primary/40 transition cursor-pointer"
                >
                  <span>{cat}</span>
                  <span className="text-primary font-black">›</span>
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VISITING HELP CONFIRMATION */}
      {/* ========================================================================= */}
      {modalType === "service" && selectedCategory && (
        <Modal title={`Pre-Approve: ${selectedCategory}`} onClose={() => { setSelectedCategory(null); setModalType(null); }}>
          <div className="space-y-4 py-1">
            <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
                <Wrench size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-foreground">{selectedCategory} Service Pass</p>
                <p className="text-[11px] text-muted">Pre-approved entry for technician or domestic contractor.</p>
              </div>
            </div>

            <div className="flex rounded-2xl bg-soft p-1">
              {["Once", "Frequently"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setModalTab(tab as any)}
                  className={`flex-1 rounded-xl py-2 text-xs font-black transition cursor-pointer ${
                    modalTab === tab ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Field label="Entry Validity">
              <SelectInput value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="1 Hour">Next 1 Hour</option>
                <option value="2 Hours">Next 2 Hours</option>
                <option value="4 Hours">Next 4 Hours</option>
                <option value="Full Day">Full Day Access</option>
              </SelectInput>
            </Field>

            <Field label="Helper / Technician Name (Optional)">
              <TextInput
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Urban Company Technician"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" onClick={() => { setSelectedCategory(null); setModalType(null); }}>
                Cancel
              </Button>
              <Button onClick={handleConfirmService} className="gap-2">
                <Check size={16} /> Authorize Service Pass
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELIVERY PRE-APPROVAL WITH SURPRISE DELIVERY */}
      {/* ========================================================================= */}
      {modalType === "delivery" && (
        <Modal title="Pre-Approve Delivery Rider" onClose={() => setModalType(null)}>
          <div className="space-y-4 py-1">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-foreground">Delivery Partner Entry</p>
                <p className="text-[11px] text-muted">Swiggy, Zomato, Amazon, Blinkit seamless pass.</p>
              </div>
            </div>

            {/* Surprise Delivery Card */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50 dark:border-purple-900/60 dark:bg-purple-950/40 p-3.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={surpriseDelivery}
                  onChange={(e) => setSurpriseDelivery(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-purple-400 text-purple-600 focus:ring-purple-400"
                />
                <div>
                  <p className="text-xs font-black text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                    <Gift size={14} className="text-purple-600" /> Surprise Gift Delivery
                  </p>
                  <p className="mt-0.5 text-[11px] text-purple-800 dark:text-purple-300">
                    Allows deliveries without notifying other household members until delivered.
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Delivery Partner">
                <SelectInput value={deliveryPartner} onChange={(e) => setDeliveryPartner(e.target.value)}>
                  {DELIVERY_PARTNERS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Duration Window">
                <SelectInput value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="4 hours">4 hours</option>
                </SelectInput>
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
              <Button onClick={handleConfirmDelivery} className="gap-2">
                <Check size={16} /> Pre-Approve Delivery
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: GUEST PRE-APPROVAL */}
      {/* ========================================================================= */}
      {modalType === "guest" && (
        <Modal title="Pre-Approve Guest Pass" onClose={() => setModalType(null)}>
          <div className="space-y-4 py-1">
            <div className="flex items-center gap-3 rounded-2xl bg-primary/10 border border-primary/20 p-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white shadow-sm shrink-0">
                <UserRound size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-foreground">Guest VIP Access Pass</p>
                <p className="text-[11px] text-muted">Generate a 6-digit entry code you can share via WhatsApp.</p>
              </div>
            </div>

            <Field label="Guest Full Name">
              <TextInput
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                placeholder="e.g. Ramesh Verma"
              />
            </Field>

            <Field label="Guest Mobile (Optional)">
              <TextInput
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+91 98450..."
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
              <Button onClick={handleConfirmGuest} className="gap-2">
                <Check size={16} /> Generate Guest Pass
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* SUCCESS PASS CODE MODAL */}
      {/* ========================================================================= */}
      {successCode && (
        <Modal title="Entry Pass Ready" onClose={() => setSuccessCode(null)}>
          <div className="space-y-4 text-center py-3">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Check size={28} className="stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-foreground">{successCode.title}</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">{successCode.subtitle}</p>

            <div className="mx-auto my-3 w-fit rounded-2xl border-2 border-primary/20 bg-primary/5 px-8 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Entry Code</p>
              <p className="text-3xl font-black tracking-[0.25em] text-foreground mt-1">{successCode.code}</p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hello! Your AI Smartgate Estate OS entry pass code for Flat ${unitLabel(
                    db.units,
                    user.unitId,
                  )} is: ${successCode.code}. Please show this at the gate.`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-xs font-black text-white hover:brightness-105 shadow-md"
              >
                <Share2 size={16} /> Share on WhatsApp
              </a>
              <Button variant="ghost" onClick={() => setSuccessCode(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GATE SENTINEL INTERCOM */}
      {/* ========================================================================= */}
      {showIntercomModal && (
        <Modal title="Gate Sentinel Intercom" onClose={() => setShowIntercomModal(false)}>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-slate-950 p-5 text-white text-center shadow-lg border border-slate-800">
              <div className="relative mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Avatar src={guard.photo} name={guard.name} className="h-16 w-16 rounded-full border-2 border-emerald-400" />
                {intercomStatus === "dialing" && (
                  <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                )}
              </div>
              <p className="text-lg font-black">{guard.name}</p>
              <p className="text-xs text-white/70 font-bold">{mainGate.name} · Intercom Ext #1001</p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-black">
                {intercomStatus === "dialing" ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Connecting to Sentinel Kiosk…</span>
                  </>
                ) : intercomStatus === "connected" ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300">Live Voice Connected (00:24)</span>
                  </>
                ) : (
                  <span>Call Ended</span>
                )}
              </div>

              {intercomStatus === "connected" && (
                <div className="mt-5 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => alert("Microphone muted")}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                    title="Mute Mic"
                  >
                    <Mic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Speaker active")}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                    title="Speaker"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIntercomStatus("ended");
                      setTimeout(() => setShowIntercomModal(false), 600);
                    }}
                    className="flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-black text-white shadow-lg transition cursor-pointer"
                  >
                    End Call
                  </button>
                </div>
              )}
            </div>

            {/* Quick Canned Broadcast to Guard */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-black uppercase tracking-wider text-muted">Quick Dispatch to Guard Desk</p>
              {cannedMsgSent && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={15} /> {cannedMsgSent}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  "Expecting Ola/Uber Cab in 2 mins",
                  "Hold delivery parcel at gate desk",
                  "Guest is arriving, pass pre-approved",
                  "Swiggy/Zomato food delivery expected",
                ].map((msg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCannedMsgSent(`✓ Sent to ${guard.name}: "${msg}"`);
                      setTimeout(() => setCannedMsgSent(null), 3500);
                    }}
                    className="rounded-xl border border-line bg-card hover:bg-soft p-2.5 text-left font-bold text-foreground transition cursor-pointer hover:border-primary/40"
                  >
                    + {msg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowIntercomModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMMUNITY WEATHER INSIGHTS */}
      {/* ========================================================================= */}
      {showWeatherModal && (
        <Modal title="Community Weather & Environment" onClose={() => setShowWeatherModal(false)}>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-gradient-to-tr from-[#0284c7] via-[#0369a1] to-[#075985] p-5 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-200">
                    {society?.name || "Society"} · {society?.city || "Bengaluru"}
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl font-black">27°C</span>
                    <span className="text-sm font-bold text-sky-100">Feels like 28°C</span>
                  </div>
                  <p className="text-xs font-semibold text-sky-100 mt-1">Mostly Clear & Sunny · Gentle Breeze</p>
                </div>
                <CloudSun size={52} className="text-amber-300" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/20 text-center text-xs">
                <div>
                  <p className="text-[10px] text-white/70">Air Quality (AQI)</p>
                  <p className="text-base font-black text-emerald-300 mt-0.5">42 (Good)</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/70">Humidity</p>
                  <p className="text-base font-black mt-0.5">54%</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/70">Wind Speed</p>
                  <p className="text-base font-black mt-0.5">11 km/h</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-soft/70 p-3.5 space-y-2 text-xs">
              <p className="font-black text-foreground flex items-center gap-1.5">
                <Sun size={15} className="text-amber-500" /> Community Advisory for Residents
              </p>
              <p className="text-muted leading-relaxed">
                Pleasant weather conditions throughout the evening. Optimal for children park playtime, jogging tracks, and rooftop clubhouse activities. UV index will decrease after 4:30 PM.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowWeatherModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOTICE READER & ANNOUNCEMENT */}
      {/* ========================================================================= */}
      {selectedNotice && (
        <Modal title="Society Notice & Announcement" onClose={() => setSelectedNotice(null)}>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                  selectedNotice.priority === "urgent"
                    ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                }`}
              >
                {selectedNotice.priority || "Notice"} Priority
              </span>
              <span className="text-xs text-muted font-bold">{formatWhen(selectedNotice.createdAt)}</span>
            </div>

            <h2 className="text-lg font-black text-foreground">{selectedNotice.title}</h2>

            <div className="rounded-2xl border border-line bg-card p-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {selectedNotice.body}
            </div>

            <div className="rounded-2xl bg-soft p-3 text-xs text-muted font-medium flex items-center justify-between">
              <span>Author: Society Management Committee</span>
              <span className="font-bold text-foreground">Official Broadcast ✓</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setSelectedNotice(null)}>Acknowledge & Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function ResidentVisitors() {
  const { user, visitors, db } = useHome();
  const addVisitor = useData((state) => state.addVisitor);
  const setVisitorStatus = useData((state) => state.setVisitorStatus);
  const [photo, setPhoto] = useState<string | null>(null);

  if (!user || !user.societyId || !user.unitId) {
    return <EmptyState title="No flat linked" body="Ask your society admin to attach a flat to your account." />;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addVisitor({
      societyId: user!.societyId!,
      unitId: user!.unitId!,
      hostUserId: user!.id,
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      purpose: String(form.get("purpose") || "guest") as VisitorPurpose,
      note: String(form.get("note") || ""),
      photo,
      helperId: null,
      createdBy: "resident",
    });
    setPhoto(null);
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Visitor Directory & Pre-Approvals"
        subtitle="Manage expected guests, regular helpers, and verify gate check-in status."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card>
            <h3 className="text-base font-black text-foreground mb-4">Invite a Visitor</h3>
            <form onSubmit={onSubmit} className="space-y-3.5">
              <Field label="Visitor Full Name">
                <TextInput name="name" required placeholder="Guest name" />
              </Field>
              <Field label="Mobile Number">
                <TextInput name="phone" required placeholder="10-digit number" />
              </Field>
              <Field label="Purpose">
                <SelectInput name="purpose" defaultValue="guest">
                  <option value="guest">Guest</option>
                  <option value="delivery">Delivery</option>
                  <option value="cab">Cab / Taxi</option>
                  <option value="staff">Domestic Staff</option>
                </SelectInput>
              </Field>
              <Field label="Note">
                <TextInput name="note" placeholder="Optional notes for security" />
              </Field>
              <PhotoField label="Optional Photo" value={photo} onChange={setPhoto} />
              <Button type="submit" className="w-full min-h-12 text-sm font-black">
                Pre-Approve Visitor
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-foreground">Expected & Past Visitors</h3>
              <Badge tone="info">{visitors.length} total</Badge>
            </div>

            {visitors.length === 0 ? (
              <EmptyState title="No visitor history" body="Pre-approved guests will be listed here with their entry code." />
            ) : (
              <div className="space-y-3">
                {visitors.map((visitor) => (
                  <div key={visitor.id} className="rounded-2xl border border-line bg-card p-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-foreground truncate">{visitor.name}</p>
                          <Badge
                            tone={
                              visitor.status === "approved" || visitor.status === "checked_in"
                                ? "good"
                                : visitor.status === "rejected"
                                ? "bad"
                                : "warn"
                            }
                            className="shrink-0"
                          >
                            {visitor.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted mt-1 truncate">
                          {visitor.purpose} · Code: <span className="font-black text-foreground">{visitor.code}</span> · {formatWhen(visitor.createdAt)}
                        </p>
                      </div>

                      {visitor.status === "pending" && (
                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                          <Button onClick={() => setVisitorStatus(visitor.id, "approved", user)} className="flex-1 sm:flex-initial">Approve</Button>
                          <Button variant="danger" onClick={() => setVisitorStatus(visitor.id, "rejected", user)} className="flex-1 sm:flex-initial">Reject</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ResidentParcels() {
  const { user, parcels, db } = useHome();
  const setParcelStatus = useData((state) => state.setParcelStatus);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Parcels & Deliveries"
        subtitle="Track packages received at the gate desk or tell the guard to leave them securely."
      />
      {error && <ErrorNote>{error}</ErrorNote>}

      {parcels.length === 0 ? (
        <EmptyState title="No parcels" body="When delivery packages arrive at the gate, they appear here with an OTP." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parcels.map((parcel) => (
            <Card key={parcel.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-base text-foreground">{parcel.carrier}</h3>
                  <Badge>{parcel.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-xs text-muted">{parcel.description}</p>
                <div className="mt-4 rounded-2xl bg-soft p-3 text-center border border-line">
                  <p className="text-[10px] font-bold uppercase text-muted">Handover OTP</p>
                  <p className="text-2xl font-black text-primary tracking-widest mt-0.5">{parcel.otp}</p>
                </div>
              </div>

              {parcel.status === "at_gate" && (
                <Button
                  className="mt-4 w-full"
                  variant="soft"
                  onClick={() => {
                    const msg = setParcelStatus(parcel.id, "leave_at_gate", user);
                    setError(msg);
                  }}
                >
                  Leave at gate
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function ResidentUnit() {
  const { user, db } = useHome();
  if (!user) return null;
  const unit = db.units.find((item) => item.id === user.unitId);
  const society = db.societies.find((s) => s.id === user.societyId);

  if (!unit) return <EmptyState title="No flat on file" body="Your society admin has not linked a flat yet." />;

  return (
    <div className="space-y-6">
      <PageTitle title="My Residence" subtitle={`${society?.name || "Society"} · Unit Details`} />
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-primary">Unit Specification</p>
          <p className="text-4xl font-black text-foreground">
            {unit.block}-{unit.number}
          </p>
          <p className="text-sm font-semibold text-muted">Floor Level: {unit.floor}</p>
          <p className="text-xs text-muted">{society?.address}, {society?.city}</p>
        </Card>

        <Card className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-primary">Resident Profile</p>
          <p className="text-xl font-black text-foreground">{user.name}</p>
          <p className="text-xs text-muted font-medium">{user.email} · {user.phone}</p>
          <div className="pt-2">
            <Badge tone="good">Primary Resident Account</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function ResidentNotices() {
  const { notices } = useHome();
  return (
    <div className="space-y-6">
      <PageTitle title="Society Bulletin & Notices" subtitle="Official announcements from the management committee." />
      {notices.length === 0 ? (
        <EmptyState title="No notices" body="Your society management has not posted any announcements." />
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-foreground">{notice.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                      notice.priority === "urgent"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                    }`}
                  >
                    {notice.priority || "Notice"}
                  </span>
                  {notice.category && (
                    <span className="rounded-md bg-soft px-2 py-0.5 text-[10px] font-bold text-muted">
                      {notice.category}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted font-semibold">{formatWhen(notice.createdAt)}</span>
              </div>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{notice.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function ResidentHelpers() {
  const { user, db } = useHome();
  const addHelper = useData((state) => state.addHelper);
  const toggleHelperAllowed = useData((state) => state.toggleHelperAllowed);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [duty, setDuty] = useState("Maid / Housekeeping");
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user || !user.societyId) return null;
  const helpers = db.helpers.filter((h) => h.societyId === user.societyId && (!h.unitId || h.unitId === user.unitId));

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !user?.unitId || !user?.societyId) return;
    const err = addHelper({
      societyId: user.societyId,
      unitId: user.unitId,
      name: name.trim(),
      phone: phone.trim(),
      duty,
      photo,
    });
    if (err) {
      setError(err);
      return;
    }
    setShowAddModal(false);
    setName("");
    setPhone("");
    setPhoto(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageTitle
          title="Daily Help & Domestic Staff"
          subtitle="Manage maids, cooks, drivers, and daily service staff for your household."
        />
        <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto shrink-0">+ Register Daily Help</Button>
      </div>

      {helpers.length === 0 ? (
        <EmptyState
          title="No daily help registered"
          body="Add regular domestic staff such as housekeepers, cooks, or personal drivers for seamless gate entry."
          action={<Button onClick={() => setShowAddModal(true)}>+ Add Daily Staff</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {helpers.map((helper) => (
            <Card key={helper.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={helper.photo} name={helper.name} className="h-14 w-14 rounded-2xl shadow-sm text-lg" />
                    <div>
                      <h3 className="font-extrabold text-base text-foreground">{helper.name}</h3>
                      <p className="text-xs font-bold text-primary">{helper.duty}</p>
                      <p className="text-xs text-muted mt-0.5">{helper.phone}</p>
                    </div>
                  </div>
                  <Badge tone={helper.allowed ? "good" : "bad"}>
                    {helper.allowed ? "Allowed" : "Gate Blocked"}
                  </Badge>
                </div>

                <div className="mt-4 rounded-2xl bg-soft/70 p-3 flex items-center justify-between text-xs">
                  <span className="text-muted font-medium">Gate Sentinel Status</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Inside Society
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center gap-2">
                <a
                  href={`tel:${helper.phone.replace(/\s+/g, "")}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-2 text-xs font-black shadow-sm hover:brightness-105"
                >
                  <Phone size={13} /> Call Staff
                </a>
                <button
                  type="button"
                  onClick={() => toggleHelperAllowed(helper.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-black border transition cursor-pointer ${
                    helper.allowed
                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300"
                  }`}
                >
                  {helper.allowed ? "Block Gate" : "Allow"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && (
        <Modal title="Register Daily Domestic Help" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <ErrorNote>{error}</ErrorNote>}
            <Field label="Full Name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Lakshmi Bai" />
            </Field>
            <Field label="Mobile Number">
              <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="10-digit mobile number" />
            </Field>
            <Field label="Duty / Role">
              <SelectInput value={duty} onChange={(e) => setDuty(e.target.value)}>
                <option value="Housekeeping & Maid">Housekeeping & Maid</option>
                <option value="Cook & Meal Prep">Cook & Meal Prep</option>
                <option value="Personal Driver">Personal Driver</option>
                <option value="Nanny / Babysitter">Nanny / Babysitter</option>
                <option value="Elderly Care">Elderly Care</option>
                <option value="Car Cleaner">Car Cleaner</option>
                <option value="Gardener">Gardener</option>
                <option value="Other Service">Other Service</option>
              </SelectInput>
            </Field>
            <PhotoField label="Optional Photo" value={photo} onChange={setPhoto} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Helper to Gate</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function ResidentProfile() {
  const { user, db } = useHome();
  const logout = useAuth((state) => state.logout);
  const setUserPhoto = useData((state) => state.setUserPhoto);

  if (!user) return null;
  const person = db.users.find((item) => item.id === user.id) ?? user;

  return (
    <div className="space-y-6 max-w-xl">
      <PageTitle title="My Account" subtitle="Resident credentials and identity" />
      <Card className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar src={person.photo} name={person.name} className="h-20 w-20 text-2xl shadow-sm" />
          <div>
            <h2 className="text-xl font-black text-foreground">{person.name}</h2>
            <p className="text-xs text-muted">{person.email}</p>
            <p className="text-xs text-muted">{person.phone}</p>
          </div>
        </div>

        <PhotoField label="Update Avatar / Photo" value={person.photo} onChange={(p) => setUserPhoto(user.id, p)} />

        <div className="border-t border-line pt-4 flex items-center justify-between">
          <p className="text-xs font-bold text-muted">
            {unitLabel(db.units, person.unitId)} · {societyName(db, user.societyId)}
          </p>
          <Button variant="danger" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function ResidentFamily() {
  const { user, db } = useHome();
  const addFamilyMember = useData((state) => state.addFamilyMember);
  const deleteFamilyMember = useData((state) => state.deleteFamilyMember);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<FamilyMember["relation"]>("Spouse");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user || !user.societyId || !user.unitId) {
    return <EmptyState title="No flat linked" body="Ask your society admin to attach a flat to your account." />;
  }

  const family = (db.familyMembers || []).filter(
    (m) => m.societyId === user.societyId && m.unitId === user.unitId
  );
  const unit = db.units.find((u) => u.id === user.unitId);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!user || !user.societyId || !user.unitId) return;
    if (!name.trim()) {
      setError("Please enter member name.");
      return;
    }
    const err = addFamilyMember({
      societyId: user.societyId!,
      unitId: user.unitId!,
      primaryResidentId: user.id,
      name: name.trim(),
      relation,
      phone: phone.trim(),
      photo,
    });
    if (err) {
      setError(err);
      return;
    }
    setShowAddModal(false);
    setName("");
    setPhone("");
    setPhoto(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageTitle
          title="Family & Household Members"
          subtitle={`Registered residents residing in Flat ${unit ? `${unit.block}-${unit.number}` : ""}`}
        />
        <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto shrink-0">+ Register Family Member</Button>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs flex items-start gap-3">
        <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-foreground">Verified Resident Household Security</p>
          <p className="text-muted mt-0.5">
            Only registered phone numbers are recognized by the Sentinel Gate Intercom and authorized for community app access. All residents registered here count toward the flat's official society registry.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Primary Account Holder Card */}
        <Card className="flex flex-col justify-between border-2 border-primary/30">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar src={user.photo} name={user.name} className="h-14 w-14 rounded-lg shadow-sm text-lg border border-primary/20" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base text-foreground">{user.name}</h3>
                  </div>
                  <Badge tone="good">Primary Resident</Badge>
                  <p className="text-xs text-muted mt-1">{user.phone}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-soft/70 p-3 text-xs flex items-center justify-between">
              <span className="text-muted font-medium">Digital Access</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">Account Owner ✓</span>
            </div>
          </div>
        </Card>

        {/* Registered Family Members */}
        {family.map((member) => (
          <Card key={member.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={member.photo} name={member.name} className="h-14 w-14 rounded-2xl shadow-sm text-lg" />
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">{member.name}</h3>
                    <Badge tone="info">{member.relation}</Badge>
                    <p className="text-xs text-muted mt-1">{member.phone}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-soft/70 p-3 text-xs flex items-center justify-between">
                <span className="text-muted font-medium">Registered Access</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified Mobile ✓</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
              <span className="text-[11px] text-muted">Added {formatWhen(member.addedAt)}</span>
              <button
                type="button"
                onClick={() => deleteFamilyMember(member.id)}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          </Card>
        ))}
      </div>

      {showAddModal && (
        <Modal title="Register Family Member" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <ErrorNote>{error}</ErrorNote>}
            <Field label="Full Name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Priya Prithvi" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Relationship">
                <SelectInput value={relation} onChange={(e) => setRelation(e.target.value as any)}>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Relative">Relative</option>
                  <option value="Other">Other</option>
                </SelectInput>
              </Field>
              <Field label="Mobile Number (For Gate Access)">
                <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91 98450..." />
              </Field>
            </div>
            <PhotoField label="Member Picture / Avatar" value={photo} onChange={setPhoto} />
            <p className="text-[11px] text-muted">
              Registered members will be authorized on the society intercom and gate sentinel verification system.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit">Save Family Member</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
