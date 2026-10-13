import { FormEvent, useMemo, useState, useEffect } from "react";
import {
  LogOut,
  ShieldCheck,
  Check,
  Package,
  Users,
  KeyRound,
  AlertCircle,
  Clock,
  Search,
  Sparkles,
  Send,
  Bell,
  Truck,
  Copy,
  Share2,
  CheckCircle2,
  Phone,
  UserCheck,
  DoorOpen,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  Modal,
  PhotoField,
  SelectInput,
  TextInput,
} from "@/components/ui";
import { formatWhen, unitLabel } from "@/lib/format";
import { useAuth } from "@/stores/use-auth";
import { useData } from "@/stores/use-data";
import type { VisitorPurpose, VisitorStatus } from "@/types";

type Desk = "visitor" | "active" | "verify" | "parcel" | "staff";

const QUICK_CARRIERS = [
  "Amazon",
  "Flipkart",
  "BlueDart",
  "Swiggy",
  "Zomato",
  "Zepto",
  "Blinkit",
  "DTDC",
  "India Post",
  "Porter",
];

const QUICK_DESCRIPTIONS = [
  "Cardboard Box",
  "Document Envelope",
  "Food Delivery Bag",
  "Grocery Packet",
  "Amazon Package",
  "Electronics Carton",
];

export function GatekeeperPage() {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const db = useData((state) => state.db);
  const addVisitor = useData((state) => state.addVisitor);
  const setVisitorStatus = useData((state) => state.setVisitorStatus);
  const addParcel = useData((state) => state.addParcel);
  const collectParcel = useData((state) => state.collectParcel);
  const checkInStaff = useData((state) => state.checkInStaff);
  const checkOutStaff = useData((state) => state.checkOutStaff);
  const setVisitorPhoto = useData((state) => state.setVisitorPhoto);
  const addNotification = useData((state) => state.addNotification);

  const [desk, setDesk] = useState<Desk>("visitor");
  const [query, setQuery] = useState("");
  const [hostId, setHostId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [handoverId, setHandoverId] = useState<string | null>(null);
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitPhoto, setVisitPhoto] = useState<string | null>(null);
  const [staffPhoto, setStaffPhoto] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [entryCodeInput, setEntryCodeInput] = useState("");

  // On-Premises & Exit tab filter & search
  const [activeFilter, setActiveFilter] = useState<"all" | "visitors" | "staff">("all");
  const [activeQuery, setActiveQuery] = useState("");

  // Parcel quick inputs
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [customCarrier, setCustomCarrier] = useState("");
  const [selectedDesc, setSelectedDesc] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [parcelLoggedModal, setParcelLoggedModal] = useState<{
    otp: string;
    carrier: string;
    description: string;
    residentName: string;
    flat: string;
  } | null>(null);

  // Keyboard shortcut listener for Sentinel desks (1: Entry, 2: On Premises & Exit, 3: Verify, 4: Parcel, 5: Staff)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "1") setDesk("visitor");
      else if (e.key === "2") setDesk("active");
      else if (e.key === "3") setDesk("verify");
      else if (e.key === "4") setDesk("parcel");
      else if (e.key === "5") setDesk("staff");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const societyId = user?.societyId ?? "";
  const residents = db.users.filter(
    (person) => person.societyId === societyId && person.role === "resident" && person.status === "active",
  );

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return residents;
    return residents.filter((person) => {
      const flat = unitLabel(db.units, person.unitId).toLowerCase();
      return person.name.toLowerCase().includes(needle) || person.phone.includes(needle) || flat.includes(needle);
    });
  }, [query, residents, db.units]);

  const host = residents.find((person) => person.id === hostId) ?? null;
  const gates = db.gates.filter((gate) => gate.societyId === societyId);
  const autoDelivery = gates.some((gate) => gate.deliveryAutoApprove);
  const visitors = db.visitors.filter((visitor) => visitor.societyId === societyId);
  const parcels = db.parcels.filter((parcel) => parcel.societyId === societyId && parcel.status !== "collected");
  const checks = db.staffCheckIns.filter((item) => item.societyId === societyId);
  const pendingVisitors = visitors.filter((v) => v.status === "pending");

  // People currently on premises
  const insideVisitors = visitors.filter((v) => v.status === "checked_in");
  const activeStaff = checks.filter((item) => !item.checkedOutAt);
  const totalInside = insideVisitors.length + activeStaff.length;

  const phoneDigits = visitorPhone.replace(/\D/g, "").slice(-10);
  const matchedHelper = host
    ? db.helpers.find(
        (helper) =>
          helper.societyId === societyId &&
          helper.unitId === host.unitId &&
          helper.allowed &&
          phoneDigits.length >= 10 &&
          helper.phone.replace(/\D/g, "").endsWith(phoneDigits),
      )
    : undefined;

  function sendVisitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!host || !user?.societyId || !host.unitId) return;
    const form = new FormData(event.currentTarget);
    const vName = String(form.get("name") || "").trim();
    const vPhone = String(form.get("phone") || "").trim();
    const vPurpose = String(form.get("purpose") || "guest") as VisitorPurpose;
    const vNote = String(form.get("note") || "").trim();

    const newVis = addVisitor(
      {
        societyId: user.societyId,
        unitId: host.unitId,
        hostUserId: host.id,
        name: vName,
        phone: vPhone,
        purpose: vPurpose,
        note: vNote,
        photo: visitPhoto,
        helperId: matchedHelper?.id ?? null,
        createdBy: "gatekeeper",
      },
      autoDelivery,
    );

    // Send instant gate approval notification to resident
    addNotification({
      societyId: user.societyId,
      userId: host.id,
      title: `🚪 Guest at Main Gate: ${vName}`,
      message: `${vName} (${vPurpose}) is waiting at Main Gate Sentinel for entry approval. Pass Code: ${newVis.code}`,
      type: "gate",
    });

    setError(null);
    setVisitPhoto(null);
    setVisitorPhone("");
    setMessage(`✓ Arrival request sent to ${host.name} (Flat ${unitLabel(db.units, host.unitId)}). Entry Code: ${newVis.code}`);
    event.currentTarget.reset();
  }

  function receiveParcel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!host || !user?.societyId || !host.unitId) return;
    const form = new FormData(event.currentTarget);
    const carrier = (customCarrier.trim() || selectedCarrier.trim() || String(form.get("carrier") || "")).trim();
    const description = (customDesc.trim() || selectedDesc.trim() || String(form.get("description") || "Package at Gate")).trim();

    if (!carrier) {
      setError("Please choose or enter a courier / delivery service name.");
      return;
    }

    const otp = addParcel({
      societyId: user.societyId,
      unitId: host.unitId,
      residentUserId: host.id,
      carrier,
      description: description || "Delivery Package",
    });

    // Send instant push alert & notification to resident
    addNotification({
      societyId: user.societyId,
      userId: host.id,
      title: `📦 Package Arrived: ${carrier}`,
      message: `${carrier} package (${description}) is waiting at Main Gate Sentinel. Handover OTP: ${otp}.`,
      type: "parcel",
    });

    setParcelLoggedModal({
      otp,
      carrier,
      description,
      residentName: host.name,
      flat: unitLabel(db.units, host.unitId),
    });

    setMessage(`✓ Parcel logged for ${host.name} (Flat ${unitLabel(db.units, host.unitId)}). Handover OTP: ${otp}. Resident notified.`);
    setError(null);
    setSelectedCarrier("");
    setCustomCarrier("");
    setSelectedDesc("");
    setCustomDesc("");
    event.currentTarget.reset();
  }

  function handleVerifyCode(event: FormEvent) {
    event.preventDefault();
    const code = entryCodeInput.trim();
    if (!code) return;

    // First check visitor code
    const foundVisitor = visitors.find((v) => v.code === code && v.societyId === societyId);
    if (foundVisitor) {
      if (foundVisitor.status === "checked_in") {
        setMessage(`Visitor ${foundVisitor.name} is already checked in.`);
        setError(null);
        return;
      }
      if (foundVisitor.status === "rejected") {
        setError(`Entry was denied by resident for ${foundVisitor.name}.`);
        setMessage(null);
        return;
      }
      setVisitorStatus(foundVisitor.id, "checked_in", user!);
      setMessage(`✓ Guest verified! ${foundVisitor.name} (Flat: ${unitLabel(db.units, foundVisitor.unitId)}) checked in.`);
      setError(null);
      setEntryCodeInput("");
      return;
    }

    // Next check parcel OTP
    const foundParcel = parcels.find((p) => p.otp === code && p.societyId === societyId);
    if (foundParcel) {
      collectParcel(foundParcel.id, code);
      setMessage(`✓ Parcel OTP verified! Handed over ${foundParcel.carrier} (${foundParcel.description}) for Flat ${unitLabel(db.units, foundParcel.unitId)}.`);
      setError(null);
      setEntryCodeInput("");
      return;
    }

    setError(`No visitor pass or parcel handover matching code "${code}". Please check with resident.`);
    setMessage(null);
  }

  // Handle Mark Exit for Visitor
  function handleMarkVisitorExit(v: (typeof visitors)[0]) {
    setVisitorStatus(v.id, "exited", user!);
    setMessage(`✓ Visitor ${v.name} checked out. Resident (Flat ${unitLabel(db.units, v.unitId)}) has been notified.`);
    setError(null);
  }

  // Handle Mark Exit for Staff
  function handleMarkStaffExit(s: (typeof checks)[0]) {
    checkOutStaff(s.id, s.helperId);
    setMessage(`✓ Staff member ${s.name} (${s.duty}) checked out. Activity recorded.`);
    setError(null);
  }

  // Helpers belonging to this society
  const societyHelpers = db.helpers.filter((h) => h.societyId === societyId && h.allowed);

  // Filtered on-premises list
  const filteredInsideVisitors = insideVisitors.filter((v) => {
    if (activeFilter === "staff") return false;
    if (!activeQuery.trim()) return true;
    const q = activeQuery.toLowerCase();
    const flat = unitLabel(db.units, v.unitId).toLowerCase();
    return v.name.toLowerCase().includes(q) || v.phone.includes(q) || flat.includes(q);
  });

  const filteredActiveStaff = activeStaff.filter((s) => {
    if (activeFilter === "visitors") return false;
    if (!activeQuery.trim()) return true;
    const q = activeQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.duty.toLowerCase().includes(q);
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Shift & Guard Top Status Banner */}
      <div className="glass rounded-[28px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-line shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <Avatar src={user.photo} name={user.name} className="h-13 w-13 rounded-2xl shadow-sm text-lg" />
            <span className="absolute -bottom-1 -right-1 block h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-foreground truncate">{user.name}</h1>
              <Badge tone="good">Security Gate Active</Badge>
            </div>
            <p className="text-xs text-muted font-bold mt-0.5 truncate">
              Main Gate Sentinel · Kiosk Post #1 · Shift: 08:00 – 16:00
            </p>
          </div>
        </div>

        {/* Instant Shortcut Pills & Shift Control */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-card text-[11px] font-bold text-muted">
            <span className="font-extrabold text-foreground">Hotkeys:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-soft text-foreground font-mono text-[10px]">1</kbd> Entry
            <kbd className="px-1.5 py-0.5 rounded bg-soft text-foreground font-mono text-[10px]">2</kbd> Exit Desk
            <kbd className="px-1.5 py-0.5 rounded bg-soft text-foreground font-mono text-[10px]">3</kbd> Pass
            <kbd className="px-1.5 py-0.5 rounded bg-soft text-foreground font-mono text-[10px]">4</kbd> Parcel
            <kbd className="px-1.5 py-0.5 rounded bg-soft text-foreground font-mono text-[10px]">5</kbd> Staff
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={() => setShowLogoutConfirm(true)}
            className="rounded-2xl px-4 py-2.5 text-xs font-black shadow-md shadow-red-500/20"
          >
            <LogOut size={16} /> End Shift & Handover
          </Button>
        </div>
      </div>

      {/* METRIC COUNTER TILES (PRIORITIZED FOR SECURITY ACTION) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Inside Society Now (Direct Exit Desk link) */}
        <button
          type="button"
          onClick={() => setDesk("active")}
          className={`rounded-2xl border p-4 shadow-sm text-left transition cursor-pointer flex items-center justify-between ${
            desk === "active" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-line bg-card hover:bg-soft"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Inside Society Now</p>
            <p className="text-2xl font-black text-foreground mt-1">{totalInside}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              {insideVisitors.length} visitors · {activeStaff.length} staff
            </p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <DoorOpen size={22} />
          </div>
        </button>

        {/* Metric 2: Pending Approvals */}
        <button
          type="button"
          onClick={() => setDesk("visitor")}
          className={`rounded-2xl border p-4 shadow-sm text-left transition cursor-pointer flex items-center justify-between ${
            desk === "visitor" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-line bg-card hover:bg-soft"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Pending Approvals</p>
            <p className="text-2xl font-black text-foreground mt-1">{pendingVisitors.length}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">Awaiting resident tap</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
            <Clock size={22} />
          </div>
        </button>

        {/* Metric 3: Parcels at Gate */}
        <button
          type="button"
          onClick={() => setDesk("parcel")}
          className={`rounded-2xl border p-4 shadow-sm text-left transition cursor-pointer flex items-center justify-between ${
            desk === "parcel" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-line bg-card hover:bg-soft"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Parcels Held at Gate</p>
            <p className="text-2xl font-black text-foreground mt-1">{parcels.length}</p>
            <p className="text-[10px] text-primary font-bold mt-0.5">Awaiting resident OTP</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-primary">
            <Package size={22} />
          </div>
        </button>

        {/* Metric 4: Total Entries Today */}
        <button
          type="button"
          onClick={() => setDesk("visitor")}
          className={`rounded-2xl border p-4 shadow-sm text-left transition cursor-pointer flex items-center justify-between ${
            desk === "visitor" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-line bg-card hover:bg-soft"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Total Entries Today</p>
            <p className="text-2xl font-black text-foreground mt-1">{visitors.length}</p>
            <p className="text-[10px] text-muted font-medium mt-0.5">All gate movements</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
            <Users size={22} />
          </div>
        </button>
      </div>

      {/* PRIORITY DESK SWITCHER TABS (ORDERED BY GATEKEEPER OPERATIONAL WORKFLOW) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { key: "visitor", label: "Quick Entry", shortcut: "1", icon: Users, count: pendingVisitors.length },
          { key: "active", label: "On Premises & Exit", shortcut: "2", icon: DoorOpen, count: totalInside, badgeTone: "good" },
          { key: "verify", label: "Verify Pass / PIN", shortcut: "3", icon: KeyRound },
          { key: "parcel", label: "Parcel Desk", shortcut: "4", icon: Package, count: parcels.length },
          { key: "staff", label: "Staff Roster", shortcut: "5", icon: ShieldCheck, count: activeStaff.length },
        ].map(({ key, label, shortcut, icon: Icon, count, badgeTone }) => (
          <button
            key={key}
            onClick={() => {
              setDesk(key as Desk);
              setError(null);
            }}
            className={`flex items-center justify-between gap-2 min-h-12 sm:min-h-14 rounded-2xl px-3 sm:px-4 text-xs sm:text-sm font-black transition cursor-pointer border ${
              desk === key
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "border-line bg-card text-foreground hover:bg-soft"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{label}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {typeof count === "number" && count > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    desk === key
                      ? "bg-white text-primary"
                      : badgeTone === "good"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {count}
                </span>
              )}
              <span
                className={`hidden md:inline-flex items-center justify-center h-4 w-4 rounded text-[9px] font-mono font-bold ${
                  desk === key ? "bg-white/20 text-white" : "bg-soft border border-line text-muted"
                }`}
              >
                {shortcut}
              </span>
            </div>
          </button>
        ))}
      </div>

      {message && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-300 animate-rise">
          <Check size={18} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}

      {/* ============================================================== */}
      {/* DESK 1: QUICK ENTRY (VISITORS / CAB / DELIVERY)                */}
      {/* ============================================================== */}
      {desk === "visitor" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Resident Flat Selection & Arrival Form */}
          <div className="lg:col-span-6 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-black text-foreground">1. Select Resident Flat</h3>
                  <p className="text-xs text-muted">Choose destination flat for arrival request</p>
                </div>
                <span className="text-xs text-muted font-bold">{residents.length} flats on file</span>
              </div>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search flat number, resident name, or mobile..."
                  className="w-full rounded-2xl border border-line bg-soft/80 py-2.5 pl-10 pr-4 text-xs font-semibold focus:border-primary focus:outline-none"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {matches.length === 0 ? (
                  <EmptyState title="No resident found" body="Try another flat or resident name." />
                ) : (
                  matches.map((person) => {
                    const isSelected = hostId === person.id;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => setHostId(person.id)}
                        className={`w-full rounded-2xl border p-3 text-left transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-line bg-card hover:bg-soft"
                        }`}
                      >
                        <div>
                          <p className="font-extrabold text-sm text-foreground">{person.name}</p>
                          <p className="text-xs text-muted font-medium">
                            Flat {unitLabel(db.units, person.unitId)} · {person.phone}
                          </p>
                        </div>
                        {isSelected && <Badge tone="info">Selected</Badge>}
                      </button>
                    );
                  })
                )}
              </div>
            </Card>

            {host && (
              <Card>
                <div className="mb-4 flex items-center justify-between pb-3 border-b border-line">
                  <div>
                    <h3 className="text-base font-black text-foreground">2. Visitor Details for {host.name}</h3>
                    <p className="text-xs text-muted">Arrival alert dispatched to resident immediately</p>
                  </div>
                  <Badge tone="good">Flat {unitLabel(db.units, host.unitId)}</Badge>
                </div>
                <form onSubmit={sendVisitor} className="space-y-3.5">
                  <Field label="Visitor Name">
                    <TextInput name="name" required placeholder="Guest / Cab Driver / Delivery Agent name" />
                  </Field>
                  <Field label="Visitor Mobile">
                    <TextInput
                      name="phone"
                      required
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                    />
                  </Field>
                  <Field label="Purpose of Visit">
                    <SelectInput name="purpose" defaultValue="guest">
                      <option value="guest">Guest / Friend / Family</option>
                      <option value="delivery">Delivery Courier</option>
                      <option value="cab">Cab / Taxi (Ola/Uber)</option>
                      <option value="staff">Domestic Staff / Service</option>
                    </SelectInput>
                  </Field>
                  <Field label="Visitor Note (Optional)">
                    <TextInput name="note" placeholder="e.g. Swiggy food delivery, electrician, etc." />
                  </Field>

                  {matchedHelper && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40 p-3.5">
                      <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Registered Daily Helper: {matchedHelper.name} ({matchedHelper.duty})
                      </p>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                        Pre-approved by flat resident. Verify facial resemblance.
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted">Registered Photo</p>
                          <Avatar src={matchedHelper.photo} name={matchedHelper.name} className="mt-1 h-16 w-16" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted">Photo at Gate</p>
                          <Avatar src={visitPhoto} name="?" className="mt-1 h-16 w-16" />
                        </div>
                      </div>
                    </div>
                  )}

                  <PhotoField label="Take Visitor Photo" value={visitPhoto} onChange={setVisitPhoto} />

                  <Button type="submit" className="w-full min-h-12 text-sm font-black shadow-md shadow-primary/20">
                    <Send size={15} /> Send Instant Gate Alert to Resident
                  </Button>
                </form>
              </Card>
            )}
          </div>

          {/* Right Column: Live Gate Stream & Instant Action Controls */}
          <div className="lg:col-span-6 space-y-4">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground">Today's Gate Stream</h3>
                  <p className="text-xs text-muted">Live incoming, inside, and expected visitors</p>
                </div>
                <Badge tone="info">{visitors.length} logged</Badge>
              </div>

              {visitors.length === 0 ? (
                <EmptyState title="No visitors yet today" body="Created visitor requests and pre-approvals will show here." />
              ) : (
                <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  {visitors.map((visitor) => {
                    const helper = db.helpers.find((item) => item.id === visitor.helperId);
                    return (
                      <div
                        key={visitor.id}
                        className="rounded-2xl border border-line bg-card p-3.5 transition hover:border-primary/40 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar src={helper?.photo ?? visitor.photo} name={visitor.name} className="h-11 w-11 rounded-xl shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-extrabold text-sm text-foreground truncate">{visitor.name}</p>
                                <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-black uppercase text-primary shrink-0">
                                  {visitor.purpose}
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-0.5 truncate">
                                Flat: {unitLabel(db.units, visitor.unitId)} · Code:{" "}
                                <span className="font-black text-foreground">{visitor.code}</span>
                              </p>
                            </div>
                          </div>
                          <Badge
                            tone={
                              visitor.status === "checked_in"
                                ? "good"
                                : visitor.status === "approved"
                                ? "info"
                                : visitor.status === "pending"
                                ? "warn"
                                : visitor.status === "exited"
                                ? "neutral"
                                : "bad"
                            }
                          >
                            {visitor.status === "checked_in"
                              ? "Inside Society"
                              : visitor.status === "exited"
                              ? "Checked Out"
                              : visitor.status.replace("_", " ")}
                          </Badge>
                        </div>

                        {/* Action buttons based on status */}
                        {visitor.status === "approved" && (
                          <div className="mt-3 flex items-center justify-end gap-2 border-t border-line/60 pt-2.5">
                            <Button
                              onClick={() => setVisitorStatus(visitor.id, "checked_in", user)}
                              className="rounded-xl px-4 py-2 text-xs font-black"
                            >
                              <Check size={14} /> Check In Visitor
                            </Button>
                          </div>
                        )}
                        {visitor.status === "checked_in" && (
                          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5">
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              Currently on premises
                            </span>
                            <Button
                              variant="danger"
                              onClick={() => handleMarkVisitorExit(visitor)}
                              className="rounded-xl px-3 py-1.5 text-xs font-black shadow-sm shadow-red-500/10"
                            >
                              <DoorOpen size={14} /> Mark Exit & Notify
                            </Button>
                          </div>
                        )}
                        {visitor.status === "pending" && (
                          <div className="mt-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Waiting for resident approval on phone / app
                          </div>
                        )}
                        {visitor.status === "exited" && (
                          <div className="mt-2 text-right">
                            <span className="text-[10px] text-muted font-bold">Checked out of gate</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DESK 2: ON PREMISES & EXIT (PRIORITY 2: MARK EXIT FOR ALL)     */}
      {/* ============================================================== */}
      {desk === "active" && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                    <DoorOpen size={18} />
                  </div>
                  <h2 className="text-lg font-black text-foreground">On Premises & Exit Control</h2>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  1-Click exit logging for visitors, guests, and daily staff. Residents are notified immediately when someone exits.
                </p>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center rounded-xl border border-line bg-soft p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeFilter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted hover:text-foreground"
                    }`}
                  >
                    All ({totalInside})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("visitors")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeFilter === "visitors" ? "bg-card text-foreground shadow-sm" : "text-muted hover:text-foreground"
                    }`}
                  >
                    Visitors ({insideVisitors.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("staff")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeFilter === "staff" ? "bg-card text-foreground shadow-sm" : "text-muted hover:text-foreground"
                    }`}
                  >
                    Staff ({activeStaff.length})
                  </button>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={activeQuery}
                    onChange={(e) => setActiveQuery(e.target.value)}
                    placeholder="Filter by name, flat, mobile..."
                    className="w-full sm:w-60 rounded-xl border border-line bg-card py-1.5 pl-8 pr-3 text-xs font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* List of People Inside */}
            <div className="pt-4 space-y-6">
              {/* SECTION: VISITORS ON PREMISES */}
              {activeFilter !== "staff" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-2">
                      <Users size={14} /> Visitors Inside Premises ({filteredInsideVisitors.length})
                    </h3>
                  </div>

                  {filteredInsideVisitors.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-line p-6 text-center">
                      <p className="text-xs font-bold text-muted">No visitors currently inside the premises.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredInsideVisitors.map((v) => {
                        const hostUser = db.users.find((u) => u.id === v.hostUserId);
                        return (
                          <div
                            key={v.id}
                            className="rounded-2xl border border-line bg-card p-4 shadow-sm flex flex-col justify-between hover:border-primary/40 transition"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Avatar src={v.photo} name={v.name} className="h-10 w-10 rounded-xl shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-sm text-foreground truncate">{v.name}</p>
                                    <p className="text-xs text-muted truncate">{v.phone}</p>
                                  </div>
                                </div>
                                <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-black uppercase text-primary shrink-0">
                                  {v.purpose}
                                </span>
                              </div>

                              <div className="mt-3 rounded-xl bg-soft p-2.5 space-y-1 text-xs">
                                <p className="font-bold text-foreground">
                                  Visiting: Flat {unitLabel(db.units, v.unitId)}
                                </p>
                                {hostUser && (
                                  <p className="text-muted text-[11px] truncate">
                                    Host: {hostUser.name} ({hostUser.phone})
                                  </p>
                                )}
                                <p className="text-muted text-[10px]">
                                  Entered: {formatWhen(v.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-line">
                              <Button
                                variant="danger"
                                onClick={() => handleMarkVisitorExit(v)}
                                className="w-full justify-center text-xs font-black shadow-sm shadow-red-500/10"
                              >
                                <DoorOpen size={15} /> Mark Exit & Notify Resident
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: DAILY HELP & STAFF ON PREMISES */}
              {activeFilter !== "visitors" && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-2">
                      <ShieldCheck size={14} /> Staff & Daily Help On Duty ({filteredActiveStaff.length})
                    </h3>
                  </div>

                  {filteredActiveStaff.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-line p-6 text-center">
                      <p className="text-xs font-bold text-muted">No staff or daily helpers currently checked in.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredActiveStaff.map((s) => {
                        const linkedHelper = db.helpers.find((h) => h.id === s.helperId || h.name.toLowerCase() === s.name.toLowerCase());
                        const linkedUnit = linkedHelper ? db.units.find((u) => u.id === linkedHelper.unitId) : null;
                        return (
                          <div
                            key={s.id}
                            className="rounded-2xl border border-line bg-card p-4 shadow-sm flex flex-col justify-between hover:border-primary/40 transition"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Avatar src={s.photo || linkedHelper?.photo} name={s.name} className="h-10 w-10 rounded-xl shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-sm text-foreground truncate">{s.name}</p>
                                    <p className="text-xs text-muted truncate">{s.duty}</p>
                                  </div>
                                </div>
                                <Badge tone="good">On Duty</Badge>
                              </div>

                              <div className="mt-3 rounded-xl bg-soft p-2.5 space-y-1 text-xs">
                                {linkedUnit ? (
                                  <p className="font-bold text-foreground">
                                    Assigned Flat: {linkedUnit.block}-{linkedUnit.number}
                                  </p>
                                ) : (
                                  <p className="font-bold text-foreground">Gate / Society Post</p>
                                )}
                                <p className="text-muted text-[10px]">
                                  Checked In: {formatWhen(s.checkedInAt)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-line">
                              <Button
                                variant="danger"
                                onClick={() => handleMarkStaffExit(s)}
                                className="w-full justify-center text-xs font-black shadow-sm shadow-red-500/10"
                              >
                                <LogOut size={15} /> Mark Exit & Notify Residents
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* DESK 3: VERIFY PASS / PIN (PRIORITY 3: PASS CODE LOOKUP)       */}
      {/* ============================================================== */}
      {desk === "verify" && (
        <Card>
          <div className="max-w-md mx-auto text-center py-6">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound size={28} />
            </div>
            <h2 className="text-xl font-black text-foreground">Verify 6-Digit Pass Code</h2>
            <p className="mt-1 text-xs text-muted">
              Enter visitor gate pass code or resident parcel handover OTP
            </p>

            <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                value={entryCodeInput}
                onChange={(e) => setEntryCodeInput(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="w-full text-center text-3xl font-black tracking-[0.35em] rounded-2xl border-2 border-line bg-card py-4 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground"
                autoFocus
              />

              {/* Quick Numpad for Touchscreen / Gate Kiosk */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "Clear", "0", "Submit"].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === "Clear") setEntryCodeInput("");
                      else if (btn === "Submit") handleVerifyCode({ preventDefault: () => {} } as any);
                      else if (entryCodeInput.length < 6) setEntryCodeInput((prev) => prev + btn);
                    }}
                    className={`py-3 rounded-xl border font-black text-sm transition cursor-pointer ${
                      btn === "Submit"
                        ? "bg-primary text-white border-primary"
                        : btn === "Clear"
                        ? "bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200"
                        : "border-line bg-soft/80 text-foreground hover:bg-soft"
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* DESK 4: PARCEL DESK (PRIORITY 4: LOG COURIER & HANDOVER)       */}
      {/* ============================================================== */}
      {desk === "parcel" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Log Unannounced Parcel & Notify Resident */}
          <div className="lg:col-span-6 space-y-4">
            <Card>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                    <Package size={18} />
                  </div>
                  <h3 className="text-base font-black text-foreground">Package Waiting at Gate Sentinel</h3>
                </div>
                <p className="text-xs text-muted mt-1">
                  Log the package to automatically generate a Handover OTP and dispatch an instant notification to the resident.
                </p>
              </div>

              {/* Step 1: Select Resident Flat */}
              <div className="pt-2 border-t border-line">
                <p className="text-xs font-black text-foreground mb-2">1. Select Recipient Flat</p>
                <div className="relative mb-2.5">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Find flat number or resident name..."
                    className="w-full rounded-2xl border border-line bg-soft/80 py-2.5 pl-10 pr-4 text-xs font-semibold focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 mb-4">
                  {matches.slice(0, 8).map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setHostId(person.id)}
                      className={`w-full rounded-xl border p-2.5 text-left text-xs transition cursor-pointer flex items-center justify-between ${
                        hostId === person.id
                          ? "border-primary bg-primary/10 font-bold"
                          : "border-line bg-card hover:bg-soft"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground">Flat {unitLabel(db.units, person.unitId)}</span>
                        <span className="text-muted">· {person.name}</span>
                      </div>
                      {hostId === person.id && <Badge tone="info">Selected</Badge>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Parcel Carrier & Description Form */}
              {host && (
                <form onSubmit={receiveParcel} className="space-y-4 border-t border-line pt-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black text-foreground">
                        2. Courier Service for {host.name} (Flat {unitLabel(db.units, host.unitId)})
                      </p>
                    </div>

                    {/* Quick Carrier Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {QUICK_CARRIERS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setSelectedCarrier(c);
                            setCustomCarrier("");
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition cursor-pointer border ${
                            selectedCarrier === c
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "border-line bg-soft text-foreground hover:border-primary/40"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    <TextInput
                      name="carrier"
                      value={customCarrier || (selectedCarrier ? selectedCarrier : "")}
                      onChange={(e) => {
                        setCustomCarrier(e.target.value);
                        setSelectedCarrier("");
                      }}
                      placeholder="Or enter courier name (e.g. DTDC, Swiggy, Amazon)..."
                      required
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black text-foreground mb-2">3. Package Description</p>
                    {/* Quick Description Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {QUICK_DESCRIPTIONS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setSelectedDesc(d);
                            setCustomDesc("");
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer border ${
                            selectedDesc === d
                              ? "bg-primary text-white border-primary"
                              : "border-line bg-soft text-muted hover:text-foreground"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    <TextInput
                      name="description"
                      value={customDesc || (selectedDesc ? selectedDesc : "")}
                      onChange={(e) => {
                        setCustomDesc(e.target.value);
                        setSelectedDesc("");
                      }}
                      placeholder="Package description (e.g. Cardboard box, envelope)..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full min-h-12 text-sm font-black shadow-md shadow-primary/20">
                    <Send size={15} /> 📦 Generate Handover OTP & Notify Resident
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Right Column: Parcels Waiting at Gate Desk */}
          <div className="lg:col-span-6 space-y-4">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground">Parcels Waiting at Gate</h3>
                  <p className="text-xs text-muted">Packages held until resident provides Handover OTP</p>
                </div>
                <span className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 text-xs font-black uppercase text-amber-800 dark:text-amber-300">
                  {parcels.length} WAITING
                </span>
              </div>

              {parcels.length === 0 ? (
                <EmptyState title="Gate locker is clear" body="No parcels currently waiting at the gate desk." />
              ) : (
                <div className="space-y-3">
                  {parcels.map((parcel) => (
                    <div
                      key={parcel.id}
                      className="rounded-2xl border border-line bg-card p-4 shadow-sm hover:border-primary/40 transition"
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-primary shrink-0">
                            <Package size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-sm text-foreground truncate">{parcel.carrier}</p>
                            <p className="text-xs text-muted truncate">
                              Flat {unitLabel(db.units, parcel.unitId)} · {parcel.description}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-lg border border-line bg-soft px-2.5 py-0.5 text-[11px] font-bold text-muted uppercase tracking-wider shrink-0">
                          AT GATE
                        </span>
                      </div>

                      {handoverId === parcel.id ? (
                        <form
                          className="mt-3.5 flex flex-col sm:flex-row gap-2 border-t border-line/60 pt-3"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const otp = String(new FormData(e.currentTarget).get("otp") || "");
                            const problem = collectParcel(parcel.id, otp);
                            if (problem) setError(problem);
                            else {
                              setError(null);
                              setMessage("✓ Parcel successfully handed over to resident.");
                              setHandoverId(null);
                            }
                          }}
                        >
                          <TextInput
                            name="otp"
                            inputMode="numeric"
                            placeholder="Enter 6-digit OTP from resident"
                            required
                            className="w-full sm:flex-1 font-mono tracking-widest font-black"
                            autoFocus
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <Button type="submit" className="flex-1 sm:flex-initial px-4 font-black">
                              Verify & Hand Over
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setHandoverId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5">
                          <span className="text-[11px] text-muted font-medium">
                            Logged {formatWhen(parcel.createdAt)}
                          </span>
                          <Button
                            variant="soft"
                            onClick={() => setHandoverId(parcel.id)}
                            className="text-xs font-bold"
                          >
                            Verify Resident OTP →
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DESK 5: STAFF ROSTER & DAILY HELP CHECK-IN                      */}
      {/* ============================================================== */}
      {desk === "staff" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Log Shift Check-In */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <h3 className="text-base font-black text-foreground mb-4">Log Guard / Personnel Shift</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  checkInStaff({
                    societyId,
                    gateId: String(form.get("gateId") || gates[0]?.id || ""),
                    name: String(form.get("name") || ""),
                    duty: String(form.get("duty") || ""),
                    photo: staffPhoto,
                  });
                  setStaffPhoto(null);
                  setMessage("Staff member checked in successfully.");
                  e.currentTarget.reset();
                }}
                className="space-y-3.5"
              >
                <Field label="Staff Member Name">
                  <TextInput name="name" required placeholder="e.g. Ramesh Singh" />
                </Field>
                <Field label="Duty / Role">
                  <TextInput name="duty" required placeholder="Security Guard / Cleaner / Electrician" />
                </Field>
                <Field label="Gate Post">
                  <SelectInput name="gateId" defaultValue={gates[0]?.id}>
                    {gates.map((gate) => (
                      <option key={gate.id} value={gate.id}>
                        {gate.name}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <PhotoField label="Staff Photo (Optional)" value={staffPhoto} onChange={setStaffPhoto} />
                <Button type="submit" className="w-full min-h-12 text-sm font-black shadow-md shadow-primary/20">
                  Record Staff Check-In
                </Button>
              </form>
            </Card>

            {/* Registered Daily Helpers Roster (Maids, Drivers, Cooks) */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-black text-foreground">Resident Daily Helpers</h4>
                  <p className="text-[11px] text-muted">1-Click morning entry at gate</p>
                </div>
                <Badge tone="info">{societyHelpers.length} registered</Badge>
              </div>

              {societyHelpers.length === 0 ? (
                <p className="text-xs text-muted">No domestic helpers registered yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {societyHelpers.map((helper) => {
                    const isAlreadyIn = activeStaff.some((s) => s.helperId === helper.id || s.name.toLowerCase() === helper.name.toLowerCase());
                    const unit = db.units.find((u) => u.id === helper.unitId);
                    return (
                      <div
                        key={helper.id}
                        className="rounded-xl border border-line bg-card p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar src={helper.photo} name={helper.name} className="h-9 w-9 rounded-lg shrink-0" />
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs text-foreground truncate">{helper.name}</p>
                            <p className="text-[10px] text-muted truncate">
                              {helper.duty} · Flat {unit ? `${unit.block}-${unit.number}` : ""}
                            </p>
                          </div>
                        </div>

                        {isAlreadyIn ? (
                          <Badge tone="good">Inside</Badge>
                        ) : (
                          <Button
                            variant="soft"
                            onClick={() => {
                              checkInStaff({
                                societyId,
                                gateId: gates[0]?.id || "",
                                name: helper.name,
                                duty: helper.duty,
                                photo: helper.photo,
                                helperId: helper.id,
                              });
                              setMessage(`✓ ${helper.name} checked in at gate.`);
                            }}
                            className="text-xs px-2.5 py-1 font-bold shrink-0"
                          >
                            Check In
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Active Staff On Site */}
          <div className="lg:col-span-7">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground">Staff On Duty</h3>
                  <p className="text-xs text-muted">Active shifts logged at this gate</p>
                </div>
                <Badge tone="good">{activeStaff.length} on site</Badge>
              </div>

              {activeStaff.length === 0 ? (
                <EmptyState title="No active staff on site" body="Check-ins recorded at the gate will appear here." />
              ) : (
                <div className="space-y-3">
                  {activeStaff.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-line bg-card p-3.5 shadow-sm gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={item.photo} name={item.name} className="h-10 w-10 rounded-xl shrink-0" />
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted truncate">
                            {item.duty} · {gates.find((g) => g.id === item.gateId)?.name || "Gate"} · {formatWhen(item.checkedInAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge tone="good">On Duty</Badge>
                        <Button
                          variant="danger"
                          onClick={() => handleMarkStaffExit(item)}
                          className="px-3 py-1.5 text-xs font-black"
                        >
                          <LogOut size={14} /> Exit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <Modal title="End Shift & Sign Out" onClose={() => setShowLogoutConfirm(false)}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-900/60">
              <p className="text-sm font-black text-amber-900 dark:text-amber-200">
                Are you ready to hand over the Gate Desk?
              </p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                Ending your shift will record your activity logs and return to the login screen for the next security officer.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl border border-line bg-soft p-3">
                <p className="text-[10px] font-bold uppercase text-muted">Visitors Today</p>
                <p className="mt-1 text-xl font-black text-foreground">{visitors.length}</p>
              </div>
              <div className="rounded-xl border border-line bg-soft p-3">
                <p className="text-[10px] font-bold uppercase text-muted">Parcels Held</p>
                <p className="mt-1 text-xl font-black text-foreground">{parcels.length}</p>
              </div>
              <div className="rounded-xl border border-line bg-soft p-3">
                <p className="text-[10px] font-bold uppercase text-muted">Staff on Site</p>
                <p className="mt-1 text-xl font-black text-foreground">{activeStaff.length}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
              >
                Confirm Logout
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PARCEL LOGGED SUCCESS MODAL WITH HANDOVER OTP */}
      {parcelLoggedModal && (
        <Modal title="Handover OTP Created & Resident Notified" onClose={() => setParcelLoggedModal(null)}>
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-primary">
              <Package size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">{parcelLoggedModal.carrier} Package Registered</h3>
              <p className="text-xs text-muted mt-1">
                Delivered for <span className="font-black text-foreground">{parcelLoggedModal.residentName}</span> ({parcelLoggedModal.flat})
              </p>
            </div>

            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-muted">HANDOVER OTP CODE</p>
              <p className="text-4xl font-black tracking-[0.25em] text-primary mt-1">{parcelLoggedModal.otp}</p>
              <p className="text-[11px] text-muted mt-2 font-medium">
                Sent to resident's app and mobile. Resident will read this code at the gate to collect the parcel.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={() => setParcelLoggedModal(null)} className="px-6">
                Done & Ready for Next
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
