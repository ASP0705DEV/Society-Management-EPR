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
import type { VisitorPurpose } from "@/types";

type Desk = "visitor" | "parcel" | "staff" | "verify";

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

  // Keyboard shortcut listener for Sentinel desks (1: Visitor, 2: Verify, 3: Parcel, 4: Staff)
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
      else if (e.key === "2") setDesk("verify");
      else if (e.key === "3") setDesk("parcel");
      else if (e.key === "4") setDesk("staff");
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

    // Send instant push alert & notification to resident!
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

    setMessage(`✓ Parcel logged for ${host.name} (Flat ${unitLabel(db.units, host.unitId)}). Handover OTP: ${otp}. Resident has been notified.`);
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
              <Badge tone="good">On Duty</Badge>
            </div>
            <p className="text-xs text-muted font-bold mt-0.5 truncate">
              Main Gate Sentinel · Kiosk Post #1 · Shift: 08:00 – 16:00
            </p>
          </div>
        </div>

        {/* High-Visibility End Shift / Logout Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            type="button"
            variant="danger"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full sm:w-auto rounded-2xl px-4 py-2.5 text-xs font-black shadow-md shadow-red-500/20 justify-center"
          >
            <LogOut size={16} /> End Shift & Handover
          </Button>
        </div>
      </div>

      {/* METRIC COUNTER TILES (MATCHING REST OF DASHBOARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-line bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Visitors Today</p>
            <p className="text-2xl font-black text-foreground mt-1">{visitors.length}</p>
            <p className="text-[10px] text-muted font-medium mt-0.5">Entries logged</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-primary">
            <Users size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Parcels at Gate</p>
            <p className="text-2xl font-black text-foreground mt-1">{parcels.length}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">Awaiting handover</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
            <Package size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Staff On Duty</p>
            <p className="text-2xl font-black text-foreground mt-1">{checks.length}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Active personnel</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Pending Approvals</p>
            <p className="text-2xl font-black text-foreground mt-1">{pendingVisitors.length}</p>
            <p className="text-[10px] text-muted font-medium mt-0.5">Resident response</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
            <Clock size={22} />
          </div>
        </div>
      </div>

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
                <p className="mt-1 text-xl font-black text-foreground">{checks.length}</p>
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

      {/* Desk Switcher Buttons with Shortcut Keys [1], [2], [3], [4] */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { key: "visitor", label: "New Visitor", shortcut: "1", icon: Users, count: pendingVisitors.length },
          { key: "parcel", label: "Parcel Desk", shortcut: "2", icon: Package, count: parcels.length },
          { key: "verify", label: "Verify Code", shortcut: "3", icon: KeyRound },
          { key: "staff", label: "Staff Check-in", shortcut: "4", icon: ShieldCheck, count: checks.length },
        ].map(({ key, label, shortcut, icon: Icon, count }) => (
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
                    desk === key ? "bg-white text-primary" : "bg-primary/10 text-primary"
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

      {/* VERIFY CODE TAB */}
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

      {/* VISITOR DESK */}
      {desk === "visitor" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Resident Search & Form */}
          <div className="lg:col-span-6 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-black text-foreground">1. Select Resident Flat</h3>
                  <p className="text-xs text-muted">Choose recipient flat for arrival request</p>
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
                    <p className="text-xs text-muted">Arrival alert will be dispatched to resident immediately</p>
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

          {/* Right Column: Live Expected & On-Site Stream */}
          <div className="lg:col-span-6 space-y-4">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground">Today's Gate Stream</h3>
                  <p className="text-xs text-muted">Expected guests and on-site visitors</p>
                </div>
                <Badge tone="info">{visitors.length} total</Badge>
              </div>

              {visitors.length === 0 ? (
                <EmptyState title="No visitors yet today" body="Created visitor requests and pre-approvals will show here." />
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {visitors.map((visitor) => {
                    const helper = db.helpers.find((item) => item.id === visitor.helperId);
                    return (
                      <div
                        key={visitor.id}
                        className="rounded-2xl border border-line bg-card p-3.5 transition hover:border-primary/40 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar src={helper?.photo ?? visitor.photo} name={visitor.name} className="h-11 w-11 rounded-xl" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-extrabold text-sm text-foreground">{visitor.name}</p>
                                <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
                                  {visitor.purpose}
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-0.5">
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
                                : "bad"
                            }
                          >
                            {visitor.status.replace("_", " ")}
                          </Badge>
                        </div>

                        {visitor.status === "approved" && (
                          <div className="mt-3 flex items-center justify-end gap-2 border-t border-line/60 pt-2.5">
                            <Button
                              onClick={() => setVisitorStatus(visitor.id, "checked_in", user)}
                              className="rounded-xl px-4 py-2 text-xs font-black"
                            >
                              ✓ Check In Visitor
                            </Button>
                          </div>
                        )}
                        {visitor.status === "pending" && (
                          <div className="mt-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Waiting for resident approval on phone/app
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

      {/* PARCEL DESK */}
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
                  If resident has not pre-created a token, register the package here to automatically create a Handover OTP and alert the resident.
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

      {/* STAFF CHECK-IN */}
      {desk === "staff" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Card>
              <h3 className="text-base font-black text-foreground mb-4">Log Guard / Staff Shift</h3>
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
                  setMessage("Staff checked in successfully.");
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
          </div>

          <div className="lg:col-span-7">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-foreground">Staff On Duty</h3>
                  <p className="text-xs text-muted">Active shifts logged at this gate</p>
                </div>
                <Badge tone="good">{checks.length} active</Badge>
              </div>

              {checks.length === 0 ? (
                <EmptyState title="No other staff on record" body="Staff checked in will appear here." />
              ) : (
                <div className="space-y-3">
                  {checks.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-line bg-card p-3.5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={item.photo} name={item.name} className="h-10 w-10 rounded-xl" />
                        <div>
                          <p className="font-extrabold text-sm text-foreground">{item.name}</p>
                          <p className="text-xs text-muted">
                            {item.duty} · {gates.find((g) => g.id === item.gateId)?.name || "Gate"} · {formatWhen(item.checkedInAt)}
                          </p>
                        </div>
                      </div>
                      <Badge tone="good">On Duty</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
