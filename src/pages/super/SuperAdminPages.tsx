import { FormEvent, useState } from "react";
import {
  Globe,
  Radio,
  Server,
  ShieldCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Search,
  Plus,
  Users,
  Eye,
  FileCheck,
  Sparkles,
  Navigation,
  Compass,
  ArrowRight,
  Shield,
  CreditCard,
  Layers,
  Laptop,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  Modal,
  PageTitle,
  PhotoField,
  SelectInput,
  Stat,
  TextInput,
  Avatar,
} from "@/components/ui";
import { formatMoney, formatWhen, societyName } from "@/lib/format";
import { useData } from "@/stores/use-data";
import { IndiaMap } from "@/components/IndiaMap";
import type { SubscriptionStatus, TicketStatus } from "@/types";

// Prominent Indian city presets for 1-click geographic auto-fill
const CITY_PRESETS = [
  { city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { city: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { city: "New Delhi", state: "Delhi NCR", lat: 28.6139, lng: 77.209 },
  { city: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
];

/**
 * Super Admin Overview - Re-architected with Live India Map, Real-Time Society Sync,
 * Clean Light-Themed Industry-Standard Alignment.
 */
export function SuperOverview() {
  const db = useData((state) => state.db);
  const paid = db.purchases.filter((purchase) => purchase.status === "paid");
  const trials = db.purchases.filter((purchase) => purchase.status === "trial");
  const revenue = paid.reduce((sum, purchase) => sum + purchase.amount, 0);
  const openTickets = db.tickets.filter((ticket) => ticket.status !== "resolved").length;
  const residents = db.users.filter((person) => person.role === "resident" && person.status === "active").length;
  const totalUnits = db.units.length;

  return (
    <div className="space-y-6">
      {/* Top Header Command Strip: Clean Light Aesthetic */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
              <Compass size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  AI Smartgate Estate OS · Super Admin Command
                </h1>
                <span className="shrink-0 flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-black text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync · {db.societies.length} {db.societies.length === 1 ? "Society" : "Societies"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Multi-Tenant Kiosk Sentinel, Geolocation Telemetry & Access Clearance Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
            <div>
              <p className="text-xs font-black text-slate-900 leading-none">Pan-India Cloud Node</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Sentinel SLA: 99.98%</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-1 text-emerald-600 font-black text-xs">
              <CheckCircle2 size={15} /> All Gates Active
            </div>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Stat Cards (Industry Standard Light Colors) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Revenue</span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <CreditCard size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatMoney(revenue)}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Monthly recurring billing</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Societies</span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{db.societies.length}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{paid.length} Paid · {trials.length} Trial</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Secured Units</span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <Layers size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalUnits}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Flats under gate sentinel</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Residents</span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{residents}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Enrolled mobile app users</p>
        </div>
      </div>

      {/* Hero Section: Live India Map Component */}
      <IndiaMap societies={db.societies} />

      {/* Bottom Grid: Monitored Communities Table & Subscription Contracts */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Monitored Societies Directory (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Monitored Housing Societies</h3>
                <p className="text-xs text-slate-500 font-medium">Live geographic locations & hardware connectivity</p>
              </div>
              <Badge tone="good">{db.societies.length} Online</Badge>
            </div>

            <div className="divide-y divide-slate-100">
              {db.societies.map((society) => {
                const sub = db.subscriptions.find((s) => s.societyId === society.id);
                const plan = db.plans.find((p) => p.id === sub?.planId);
                const flatsCount = db.units.filter((u) => u.societyId === society.id).length;
                const lat = typeof society.latitude === "number" ? society.latitude : 12.9716;
                const lng = typeof society.longitude === "number" ? society.longitude : 77.5946;

                return (
                  <div key={society.id} className="p-4 hover:bg-slate-50/70 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {society.photo ? (
                          <img
                            src={society.photo}
                            alt={society.name}
                            className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700 font-black text-lg shrink-0">
                            <Building2 size={20} />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-900">{society.name}</h4>
                            <Badge tone={sub?.status === "active" ? "good" : "warn"}>
                              {sub?.status || "active"}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {society.address}, {society.city} ({society.state || "Karnataka"})
                          </p>
                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 mt-1">
                            <span className="flex items-center gap-1 text-blue-600 font-bold">
                              <Navigation size={11} /> {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                            </span>
                            <span>Flats: <b>{flatsCount}</b></span>
                            <span>Code: <b>{society.code}</b></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900">{plan?.name || "Professional"}</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 justify-end mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Gate Sentinel Sync
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Purchases & Contracts (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Subscription Purchases</h3>
                <p className="text-xs text-slate-500 font-medium">Direct Razorpay customer contracts</p>
              </div>
              <span className="text-xs font-bold text-slate-500">{db.purchases.length} Records</span>
            </div>

            {db.purchases.length === 0 ? (
              <p className="p-6 text-xs text-slate-500 text-center">No purchases recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {db.purchases.map((purchase) => {
                  const soc = db.societies.find((s) => s.id === purchase.societyId);
                  const plan = db.plans.find((p) => p.id === purchase.planId);

                  return (
                    <div key={purchase.id} className="p-4 hover:bg-slate-50/70 transition">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-xs text-slate-900">{purchase.buyerName}</span>
                        <span className="font-black text-sm text-blue-600">
                          {purchase.status === "paid" ? formatMoney(purchase.amount) : "Trial"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{purchase.buyerEmail}</p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                        <span className="font-bold text-slate-700">{soc?.name || "—"}</span>
                        <span className="font-mono text-slate-400">{purchase.paymentId || "Trial Mode"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Super Admin Societies Management - With GPS Geolocation Detection & Map Sync
 */
export function SuperSocieties() {
  const db = useData((state) => state.db);
  const createSociety = useData((state) => state.createSociety);
  const updateSociety = useData((state) => state.updateSociety);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states for Create Modal
  const [createPhoto, setCreatePhoto] = useState<string | null>(null);
  const [cityName, setCityName] = useState("Bengaluru");
  const [stateName, setStateName] = useState("Karnataka");
  const [latitude, setLatitude] = useState<number | null>(12.9716);
  const [longitude, setLongitude] = useState<number | null>(77.5946);
  const [isLocating, setIsLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Form states for Edit Modal
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editLat, setEditLat] = useState<number | null>(null);
  const [editLng, setEditLng] = useState<number | null>(null);

  // Browser Geolocation Detector for live current location
  function detectLiveLocation(isEdit = false) {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    setGeoNotice("Detecting real-time device coordinates via browser GPS...");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = Number(pos.coords.latitude.toFixed(4));
        const detectedLng = Number(pos.coords.longitude.toFixed(4));
        setIsLocating(false);

        if (isEdit) {
          setEditLat(detectedLat);
          setEditLng(detectedLng);
        } else {
          setLatitude(detectedLat);
          setLongitude(detectedLng);
        }

        setGeoNotice(
          `📍 Live GPS Acquired: ${detectedLat}° N, ${detectedLng}° E (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`
        );
      },
      (err) => {
        setIsLocating(false);
        setGeoNotice(null);
        setError(`GPS Location Error: ${err.message}. Please select a city preset below.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSelectPreset(preset: typeof CITY_PRESETS[0], isEdit = false) {
    if (isEdit) {
      setEditCity(preset.city);
      setEditState(preset.state);
      setEditLat(preset.lat);
      setEditLng(preset.lng);
    } else {
      setCityName(preset.city);
      setStateName(preset.state);
      setLatitude(preset.lat);
      setLongitude(preset.lng);
    }
    setGeoNotice(`📍 Applied preset coordinates for ${preset.city}, ${preset.state}`);
  }

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) {
      setError("Society name is required.");
      return;
    }

    const result = createSociety({
      name,
      address: String(form.get("address") || ""),
      city: cityName,
      state: stateName,
      latitude: latitude ?? 12.9716,
      longitude: longitude ?? 77.5946,
      planId: String(form.get("planId") || ""),
      adminName: String(form.get("adminName") || ""),
      adminEmail: String(form.get("adminEmail") || ""),
      adminPassword: String(form.get("adminPassword") || ""),
      paid: form.get("paid") === "on",
      photo: createPhoto,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setCreatePhoto(null);
    setError(null);
    setGeoNotice(null);
  }

  function onEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    updateSociety(editing, {
      name: String(form.get("name") || ""),
      address: String(form.get("address") || ""),
      city: editCity,
      state: editState,
      latitude: editLat ?? undefined,
      longitude: editLng ?? undefined,
      planId: String(form.get("planId") || ""),
      status: String(form.get("status") || "active") as SubscriptionStatus,
      photo: editPhoto,
    });
    setEditing(null);
  }

  const editingSociety = db.societies.find((society) => society.id === editing);
  const editingSub = db.subscriptions.find((sub) => sub.societyId === editing);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Societies Registry"
        subtitle="Manage housing societies, capture real-time GPS locations for India Map plotting, and provision administrator credentials."
        action={
          <Button
            onClick={() => {
              setError(null);
              setGeoNotice(null);
              setCreatePhoto(null);
              setCityName("Bengaluru");
              setStateName("Karnataka");
              setLatitude(12.9716);
              setLongitude(77.5946);
              setOpen(true);
            }}
          >
            + Add New Society
          </Button>
        }
      />

      {db.societies.length === 0 ? (
        <EmptyState title="No societies yet" body="Add the first society to start managing accounts." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {db.societies.map((society) => {
            const sub = db.subscriptions.find((item) => item.societyId === society.id);
            const plan = db.plans.find((item) => item.id === sub?.planId);
            const purchase = db.purchases.find((item) => item.societyId === society.id);
            const unitsCount = db.units.filter((u) => u.societyId === society.id).length;
            const resCount = db.users.filter((u) => u.societyId === society.id && u.role === "resident").length;
            const adminUser = db.users.find((u) => u.societyId === society.id && u.role === "society_admin");
            const lat = typeof society.latitude === "number" ? society.latitude : 12.9716;
            const lng = typeof society.longitude === "number" ? society.longitude : 77.5946;

            return (
              <div
                key={society.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-blue-400 transition"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    {society.photo ? (
                      <img
                        src={society.photo}
                        alt={society.name}
                        className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-blue-700 font-black text-xl shrink-0">
                        <Building2 size={28} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-base text-slate-900 truncate">{society.name}</h2>
                        <Badge tone={sub?.status === "active" ? "good" : "warn"}>{sub?.status ?? "active"}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {society.address}, {society.city}
                      </p>
                      <p className="text-[11px] font-bold text-blue-600 mt-1">Code: {society.code}</p>
                    </div>
                  </div>

                  {/* Verified Coordinates Pill */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-2.5 my-3 text-xs flex items-center justify-between">
                    <span className="font-black text-blue-900 flex items-center gap-1.5">
                      <Navigation size={12} className="text-blue-600" />
                      GPS Verified
                    </span>
                    <span className="font-mono text-[11px] text-blue-700 font-bold">
                      {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3 text-slate-600">
                    <span>Flats: <b className="text-slate-900">{unitsCount}</b></span>
                    <span>Residents: <b className="text-slate-900">{resCount}</b></span>
                    <span className="col-span-2">Plan: <b className="text-slate-900">{plan?.name || "Professional"}</b></span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Admin: <b className="text-slate-900">{adminUser?.name || purchase?.buyerName || "—"}</b>
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditing(society.id);
                      setEditPhoto(society.photo);
                      setEditCity(society.city);
                      setEditState(society.state || "Karnataka");
                      setEditLat(society.latitude ?? 12.9716);
                      setEditLng(society.longitude ?? 77.5946);
                    }}
                    className="text-xs px-3 py-1.5"
                  >
                    Edit Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Society with Live GPS Detection */}
      {open && (
        <Modal title="Create New Society & Register Location" onClose={() => setOpen(false)}>
          <form onSubmit={onCreate} className="space-y-4">
            {error && <ErrorNote>{error}</ErrorNote>}
            {geoNotice && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{geoNotice}</span>
              </div>
            )}

            <Field label="Society Name *">
              <TextInput name="name" required placeholder="e.g. Grandeur Palms" />
            </Field>

            {/* Geolocation Detection Box */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <Navigation size={14} className="text-blue-600" /> Live Geolocation Capture
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Syncs location directly onto the Super Admin India Map
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => detectLiveLocation(false)}
                  disabled={isLocating}
                  className="text-xs py-1.5 px-3 bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  {isLocating ? "Acquiring GPS..." : "📍 Detect Live Location"}
                </Button>
              </div>

              {/* City Presets */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Or pick prominent Indian Metro preset:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CITY_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.city}
                      onClick={() => handleSelectPreset(p, false)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                        cityName === p.city
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {p.city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Latitude and Longitude Inputs */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Latitude (° N)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude ?? ""}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Longitude (° E)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude ?? ""}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="City *">
                <TextInput
                  name="city"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  required
                  placeholder="e.g. Bengaluru"
                />
              </Field>
              <Field label="State *">
                <TextInput
                  name="state"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  required
                  placeholder="e.g. Karnataka"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Full Address *">
                <TextInput name="address" required placeholder="e.g. Road No 2, Whitefield" />
              </Field>
              <Field label="Plan">
                <SelectInput name="planId" defaultValue={db.plans[0]?.id}>
                  {db.plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({formatMoney(plan.monthlyPrice)})
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </div>

            <PhotoField label="Building Picture (Optional)" value={createPhoto} onChange={setCreatePhoto} />

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-slate-700">Admin Credentials</p>
              <Field label="Admin Full Name *">
                <TextInput name="adminName" required placeholder="e.g. Rajesh Kumar" />
              </Field>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Admin Email *">
                  <TextInput name="adminEmail" type="email" required placeholder="admin@society.in" />
                </Field>
                <Field label="Admin Password *">
                  <TextInput name="adminPassword" required defaultValue="SocietyAdmin@2026" />
                </Field>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer pt-1 text-slate-700">
              <input type="checkbox" name="paid" defaultChecked className="rounded border-slate-300 text-blue-600" />
              <span>Mark subscription as paid (Active immediately)</span>
            </label>

            <Button type="submit" className="w-full min-h-12 text-sm font-black bg-blue-600 text-white hover:bg-blue-700">
              Save & Provision Society
            </Button>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Society */}
      {editingSociety && editingSub && (
        <Modal title="Edit Society & Coordinates" onClose={() => setEditing(null)}>
          <form onSubmit={onEdit} className="space-y-4">
            <Field label="Society Name">
              <TextInput name="name" required defaultValue={editingSociety.name} />
            </Field>

            {/* Geolocation Section */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <Navigation size={14} className="text-blue-600" /> Update GPS Coordinates
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">India Map Pin Position</p>
                </div>
                <Button
                  type="button"
                  onClick={() => detectLiveLocation(true)}
                  disabled={isLocating}
                  className="text-xs py-1.5 px-3 bg-blue-600 text-white font-bold"
                >
                  {isLocating ? "Locating..." : "📍 Detect Live GPS"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLat ?? ""}
                    onChange={(e) => setEditLat(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLng ?? ""}
                    onChange={(e) => setEditLng(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="City">
                <TextInput
                  name="city"
                  required
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
              </Field>
              <Field label="State">
                <TextInput
                  name="state"
                  required
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Address">
              <TextInput name="address" required defaultValue={editingSociety.address} />
            </Field>

            <PhotoField label="Building Picture" value={editPhoto} onChange={setEditPhoto} />

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Subscription Plan">
                <SelectInput name="planId" defaultValue={editingSub.planId}>
                  {db.plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Subscription Status">
                <SelectInput name="status" defaultValue={editingSub.status}>
                  <option value="trial">trial</option>
                  <option value="active">active</option>
                  <option value="past_due">past_due</option>
                  <option value="cancelled">cancelled</option>
                </SelectInput>
              </Field>
            </div>

            <Button type="submit" className="w-full bg-blue-600 text-white font-black hover:bg-blue-700">
              Save Changes
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function SuperPlans() {
  const db = useData((state) => state.db);
  const updatePlanPrice = useData((state) => state.updatePlanPrice);

  return (
    <div className="space-y-6">
      <PageTitle title="Subscription Plans" subtitle="Configure tier pricing for housing societies." />
      <div className="grid gap-6 md:grid-cols-3">
        {db.plans.map((plan) => (
          <div key={plan.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">{plan.name}</h2>
              <p className="text-3xl font-black text-blue-600 mt-2">
                {formatMoney(plan.monthlyPrice)}
                <span className="text-xs text-slate-500 font-normal"> / month</span>
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <TextInput
                type="number"
                defaultValue={plan.monthlyPrice}
                onBlur={(e) => updatePlanPrice(plan.id, Number(e.target.value))}
                placeholder="Monthly price"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SuperTickets() {
  const db = useData((state) => state.db);
  const setTicketStatus = useData((state) => state.setTicketStatus);

  return (
    <div className="space-y-6">
      <PageTitle title="Enterprise Help Desk" subtitle="Incoming support requests from society administrators." />
      <div className="space-y-3">
        {db.tickets.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">{t.subject}</h3>
                <Badge tone={t.priority === "high" ? "bad" : "warn"}>{t.priority}</Badge>
                <Badge>{t.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">{t.body}</p>
              <p className="text-[10px] text-slate-400 mt-1">From: {societyName(db, t.societyId)}</p>
            </div>
            <div className="flex gap-2">
              {t.status !== "resolved" && (
                <Button onClick={() => setTicketStatus(t.id, "resolved")}>Mark Resolved</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
