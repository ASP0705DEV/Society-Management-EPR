import { FormEvent, useState, useMemo } from "react";
import {
  Building2,
  Users,
  DoorOpen,
  ClipboardList,
  CreditCard,
  LifeBuoy,
  Calculator,
  Megaphone,
  Mail,
  Monitor,
  Calendar,
  Wrench,
  ShieldAlert,
  ListTodo,
  Search,
  Plus,
  Trash2,
  CloudSun,
  PhoneCall,
  Download,
  FileText,
  Share2,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  HelpCircle,
  Package,
  Phone,
  CheckCircle2,
  X,
} from "lucide-react";
import { getSocietyWeather } from "@/lib/weather";
import {
  Avatar,
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
  TextArea,
  TextInput,
} from "@/components/ui";
import { formatMoney, formatWhen, inSociety, unitLabel } from "@/lib/format";
import { useAuth } from "@/stores/use-auth";
import { useData } from "@/stores/use-data";
import type { TicketCategory, TicketPriority, SubscriptionStatus } from "@/types";

function useSocietyScope() {
  const user = useAuth((state) => state.user);
  const db = useData((state) => state.db);
  const societyId = user?.societyId ?? "";
  return { user, db, societyId };
}

/**
 * Society Overview - Redesigned to match the high-end Building ERP Dashboard from Image 5
 */
export function SocietyOverview() {
  const { db, societyId } = useSocietyScope();
  const updateSociety = useData((state) => state.updateSociety);
  const addNote = useData((state) => state.addNote);
  const deleteNote = useData((state) => state.deleteNote);
  const addWorkOrder = useData((state) => state.addWorkOrder);

  const society = db.societies.find((item) => item.id === societyId);
  const subscription = db.subscriptions.find((item) => item.societyId === societyId);
  const units = db.units.filter((unit) => unit.societyId === societyId);
  const residents = db.users.filter((person) => person.societyId === societyId && person.role === "resident");
  const visitors = db.visitors.filter((visitor) => visitor.societyId === societyId);
  const parcels = (db.parcels || []).filter((p) => p.societyId === societyId);
  const helpers = (db.helpers || []).filter((h) => h.societyId === societyId);
  const gates = (db.gates || []).filter((g) => g.societyId === societyId);
  const tickets = db.tickets.filter((ticket) => ticket.societyId === societyId);
  const workOrders = db.workOrders ? db.workOrders.filter((wo) => wo.societyId === societyId) : [];
  const notes = db.notes ? db.notes.filter((n) => n.societyId === societyId) : [];

  // Scoped Data Metrics
  const totalVisitorsCount = visitors.length;
  const deliveriesCount = visitors.filter((v) => v.purpose === "delivery").length + parcels.length;
  const cabsCount = visitors.filter((v) => v.purpose === "cab").length;
  const guestsCount = visitors.filter((v) => v.purpose === "guest").length;
  const dailyHelpCount = helpers.length;
  const residentsCount = residents.length;
  const pendingApprovalsCount = visitors.filter((v) => v.status === "pending").length;
  const pendingResidents = residents.filter((r) => r.status === "pending" || r.status === "invited");
  const pendingResidentsCount = pendingResidents.length;
  const parcelsWaitingCount = parcels.filter((p) => p.status === "at_gate").length;
  const activeHelpersCount = helpers.filter((h) => h.allowed).length;

  const weather = useMemo(() => {
    return getSocietyWeather(society?.city, society?.address);
  }, [society?.city, society?.address]);

  const formattedTodayDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, []);

  // Store actions
  const addNotice = useData((state) => state.addNotice);
  const addHelper = useData((state) => state.addHelper);

  // Form State for Society Name & Photo
  const [societyNameInput, setSocietyNameInput] = useState(society?.name || "Housing Society");
  const [addressInput, setAddressInput] = useState(society?.address || "Address");
  const [cityInput, setCityInput] = useState(society?.city || "City");
  const [photoInput, setPhotoInput] = useState<string | null>(society?.photo || null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Modals & Widgets
  const [showEditSociety, setShowEditSociety] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [showAddWO, setShowAddWO] = useState(false);
  const [newWOVendor, setNewWOVendor] = useState("");
  const [newWOCategory, setNewWOCategory] = useState("Electrical");
  const [newWODesc, setNewWODesc] = useState("");
  const [showImportantNumbers, setShowImportantNumbers] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // Notice & Helper Broadcast Modals
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticePriority, setNoticePriority] = useState<"urgent" | "normal" | "info">("normal");
  const [noticeCategory, setNoticeCategory] = useState("Security");
  const [showAddHelperModal, setShowAddHelperModal] = useState(false);
  const [helperName, setHelperName] = useState("");
  const [helperPhone, setHelperPhone] = useState("");
  const [helperDuty, setHelperDuty] = useState("Maid / Housekeeping");
  const [helperUnit, setHelperUnit] = useState(units[0]?.id || "");
  const [helperPhoto, setHelperPhoto] = useState<string | null>(null);

  // Filter notes
  const filteredNotes = useMemo(() => {
    if (!noteSearch.trim()) return notes;
    const q = noteSearch.toLowerCase();
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }, [notes, noteSearch]);

  // Save Society Profile Atomically (fixes bug where name wasn't saved)
  function handleSaveSociety(e: FormEvent) {
    e.preventDefault();
    if (!society || !subscription) return;
    const trimmed = societyNameInput.trim();
    if (!trimmed) return;
    updateSociety(society.id, {
      name: trimmed,
      address: addressInput.trim(),
      city: cityInput.trim(),
      planId: subscription.planId,
      status: subscription.status,
      photo: photoInput,
    });
    setSavedMessage(`✓ "${trimmed}" and building details updated successfully!`);
    setShowEditSociety(false);
    setTimeout(() => setSavedMessage(null), 4000);
  }

  function handleCreateNote(e: FormEvent) {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    addNote({
      societyId,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
    });
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowAddNote(false);
  }

  function handleCreateNotice(e: FormEvent) {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeBody.trim()) return;
    addNotice({
      societyId,
      title: noticeTitle.trim(),
      body: noticeBody.trim(),
      priority: noticePriority,
      category: noticeCategory,
    });
    setNoticeTitle("");
    setNoticeBody("");
    setShowAddNoticeModal(false);
    setSavedMessage("✓ Important broadcast notice published to all resident dashboards!");
    setTimeout(() => setSavedMessage(null), 4000);
  }

  function handleCreateHelper(e: FormEvent) {
    e.preventDefault();
    if (!helperName.trim() || !helperPhone.trim()) return;
    addHelper({
      societyId,
      unitId: helperUnit || units[0]?.id || "",
      name: helperName.trim(),
      phone: helperPhone.trim(),
      duty: helperDuty,
      photo: helperPhoto,
    });
    setHelperName("");
    setHelperPhone("");
    setHelperPhoto(null);
    setShowAddHelperModal(false);
    setSavedMessage(`✓ Domestic helper "${helperName.trim()}" registered and authorized at gate.`);
    setTimeout(() => setSavedMessage(null), 4000);
  }

  function handleCreateWorkOrder(e: FormEvent) {
    e.preventDefault();
    if (!newWOVendor.trim()) return;
    addWorkOrder({
      societyId,
      vendor: newWOVendor.trim(),
      category: newWOCategory,
      description: newWODesc.trim(),
    });
    setNewWOVendor("");
    setNewWODesc("");
    setShowAddWO(false);
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TOP HEADER BAR (From Image 5: Overview, Actions, Building Management, Date) */}
      {/* ========================================================================= */}
      <div className="glass rounded-[28px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border border-line shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Building Photo Thumbnail with Edit Trigger */}
          <div className="relative group cursor-pointer shrink-0" onClick={() => setShowEditSociety(true)}>
            {society?.photo ? (
              <img
                src={society.photo}
                alt={society.name}
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover border-2 border-primary/30 shadow-md group-hover:brightness-90 transition"
              />
            ) : (
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-tr from-primary to-sky-400 text-white font-black text-xl shadow-md group-hover:scale-105 transition">
                <Building2 size={24} />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-white text-[10px] shadow">
              ✎
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-foreground truncate">
                Overview · {society?.name || "Society ERP"}
              </h1>
              <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-black text-primary shrink-0">
                Active ERP
              </span>
            </div>
            <p className="text-xs text-muted font-bold mt-0.5 truncate">
              {society?.address || "Address"}, {society?.city || "City"} · Code:{" "}
              <span className="font-black text-foreground">{society?.code}</span>
            </p>
          </div>
        </div>

        {/* Quick Tool Icons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setShowAddNoticeModal(true)}
            className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border border-line bg-card hover:bg-soft text-muted hover:text-primary transition cursor-pointer shadow-sm shrink-0"
            title="Broadcast Notice to All Residents"
          >
            <Megaphone size={17} />
          </button>

          <button
            type="button"
            onClick={() => setShowImportantNumbers(true)}
            className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border border-line bg-card hover:bg-soft text-muted hover:text-primary transition cursor-pointer shadow-sm shrink-0"
            title="Emergency & Gate Phone Numbers"
          >
            <PhoneCall size={17} />
          </button>

          <Button
            type="button"
            variant="soft"
            onClick={() => setShowEditSociety(true)}
            className="rounded-xl px-3 py-2 text-xs font-black shrink-0"
          >
            Edit Society
          </Button>

          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-line bg-soft px-3.5 py-2 text-xs font-black text-slate-700 dark:text-slate-200 shrink-0">
            <Calendar size={14} className="text-primary" />
            <span>Today, {formattedTodayDate}</span>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3.5 text-sm font-black text-emerald-800 dark:text-emerald-300">
          <Check size={18} /> {savedMessage}
        </div>
      )}

      {/* Pending Resident Approvals Alert */}
      {pendingResidents.length > 0 && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-white font-bold shrink-0 shadow-sm">
              <UserCheck size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-amber-950 dark:text-amber-100">
                  {pendingResidents.length} Resident {pendingResidents.length === 1 ? "Registration Pending Approval" : "Registrations Pending Approval"}
                </p>
                <span className="rounded-full bg-amber-200 dark:bg-amber-900/80 px-2 py-0.5 text-[10px] font-black text-amber-900 dark:text-amber-200">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5 truncate">
                New residents registered using society code <b>{society?.code}</b>. Review details to approve and grant community access.
              </p>
            </div>
          </div>
          <a
            href="/society/residents"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-black transition shrink-0 shadow-sm"
          >
            Review & Approve ({pendingResidents.length}) →
          </a>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5 KPI STAT METRICS: Visitors, Deliveries, Cabs, Daily Help, Residents */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {/* Visitors Today */}
        <div className="glass rounded-2xl p-3.5 sm:p-4 border border-line shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">Visitors Today</span>
            <span className="text-emerald-500 font-black text-xs">▲</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{totalVisitorsCount}</p>
          <p className="text-[10px] text-muted font-bold mt-1 truncate">Guests, Cabs & Parcels</p>
        </div>

        {/* Deliveries Handled */}
        <div className="glass rounded-2xl p-3.5 sm:p-4 border border-line shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">Deliveries</span>
            <span className="text-emerald-500 font-black text-xs">▲</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{deliveriesCount}</p>
          <p className="text-[10px] text-muted font-bold mt-1 truncate">Food & Drop-offs</p>
        </div>

        {/* Cabs Tracked */}
        <div className="glass rounded-2xl p-3.5 sm:p-4 border border-line shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">Cabs Logged</span>
            <span className="text-amber-500 font-black text-xs">●</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{cabsCount}</p>
          <p className="text-[10px] text-muted font-bold mt-1 truncate">Ola, Uber & Taxis</p>
        </div>

        {/* Daily Staff & Helpers */}
        <div className="glass rounded-2xl p-3.5 sm:p-4 border border-line shadow-sm hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">Daily Help</span>
            <span className="text-emerald-500 font-black text-xs">▲</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{dailyHelpCount}</p>
          <p className="text-[10px] text-muted font-bold mt-1 truncate">Maids & Staff</p>
        </div>

        {/* Total Residents */}
        <div className="glass rounded-2xl p-3.5 sm:p-4 border border-line shadow-sm hover:border-primary/40 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">Residents</span>
            <span className="text-blue-500 font-black text-xs">●</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{residentsCount}</p>
          <p className="text-[10px] text-muted font-bold mt-1 truncate">Households</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MIDDLE SECTION: Items Requiring Action, Search Notes, Weather & Call Cards */}
      {/* ========================================================================= */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Card 1: Items Requiring Action (Security & Gate Focus) */}
        <Card className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ShieldAlert size={18} />
                </div>
                <h2 className="text-base font-black text-foreground">Items Requiring Action</h2>
              </div>
              <Badge tone={pendingApprovalsCount > 0 ? "warn" : "good"}>
                {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action` : "All Clear"}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-primary">
                    <DoorOpen size={16} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Pending Gate Approvals</span>
                </div>
                <span className="text-lg font-black text-foreground">{pendingApprovalsCount}</span>
              </div>

              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-primary">
                    <Package size={16} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Parcels Waiting at Gate</span>
                </div>
                <span className="text-lg font-black text-foreground">{parcelsWaitingCount}</span>
              </div>

              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-primary">
                    <UserCheck size={16} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Active Daily Helper Passes</span>
                </div>
                <span className="text-lg font-black text-foreground">{activeHelpersCount}</span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-emerald-600">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Sentinel Gate Kiosks Online</span>
                </div>
                <span className="text-lg font-black text-foreground">{gates.length}/{gates.length || 1}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-bold text-muted">
            <span>Gate Sentinel Security</span>
            <button
              type="button"
              onClick={() => setShowAddNoticeModal(true)}
              className="text-primary hover:underline cursor-pointer"
            >
              Broadcast Alert →
            </button>
          </div>
        </Card>

        {/* Card 2: Search Notes (From Image 5) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2.5 mb-4">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                    placeholder="Search gate notes..."
                    className="w-full rounded-lg border border-line bg-soft/80 py-2.5 pl-9 pr-3 text-xs font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setShowAddNote(true)}
                  className="rounded-lg px-3.5 py-2 text-xs font-bold bg-[#0f2b5c] hover:bg-[#1a3d7a] dark:bg-primary dark:hover:bg-primary/90 text-white flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                  title="Add Note"
                >
                  <Plus size={15} className="stroke-[2.5]" />
                  <span>Add Note</span>
                </Button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredNotes.length === 0 ? (
                  <p className="text-xs text-muted py-6 text-center">No notes found. Click + to add a quick reminder.</p>
                ) : (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="group flex items-start justify-between gap-3 rounded-lg border border-line bg-card p-3.5 transition hover:border-primary/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-xs text-foreground">{note.title}</p>
                          <span className="text-[10px] text-muted">· {note.date}</span>
                        </div>
                        <p className="text-xs text-muted mt-1 leading-relaxed">{note.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteNote(note.id)}
                        className="text-muted hover:text-red-600 p-1 opacity-60 group-hover:opacity-100 transition cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs text-muted">
              <span>{notes.length} total notes stored</span>
              <button
                type="button"
                onClick={() => setShowAddNote(true)}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                + New Note
              </button>
            </div>
          </Card>
        </div>

        {/* Card 3: Weather Card & Important Numbers Card */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          {/* Weather Widget */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400">
                  <CloudSun size={18} />
                  <span>Community Weather</span>
                </div>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                  Live · {weather.city}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <span className="text-3xl font-black text-foreground">{weather.temp}°C</span>
                  <p className="text-xs font-bold text-muted">{weather.condition} · {weather.city}</p>
                </div>
                <div className="text-right text-[11px] text-muted space-y-0.5">
                  <p>Humidity: {weather.humidity}%</p>
                  <p>Wind: {weather.wind} km/h</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                {weather.aqiLabel} ({weather.aqi})
              </span>
              <span className="text-[10px] text-muted font-bold">Auto-updated</span>
            </div>
          </Card>

          {/* Important Numbers Widget */}
          <Card
            onClick={() => setShowImportantNumbers(true)}
            className="flex items-center justify-between hover:border-red-400/50 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 group-hover:scale-105 transition">
                <PhoneCall size={22} />
              </div>
              <div>
                <p className="text-sm font-black text-foreground group-hover:text-red-600 transition">Gate & Emergency</p>
                <p className="text-xs text-muted font-medium mt-0.5">Security Desk, Fire, Medical, Intercom</p>
              </div>
            </div>
            <span className="text-xs font-black text-primary group-hover:translate-x-1 transition">
              View Directory →
            </span>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LOWER SECTION: Entry Traffic Breakdown */}
      {/* ========================================================================= */}
      <div className="mt-6">
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-line">
            <div>
              <h3 className="text-base font-black text-foreground">Entry Traffic Breakdown</h3>
              <p className="text-xs text-muted mt-0.5">Live distribution of delivery drop-offs, cabs, verified guests, and domestic staff</p>
            </div>
            <span className="self-start md:self-auto rounded-lg bg-soft border border-line px-3 py-1 text-xs font-bold text-muted">
              Today's Live Gate Activity
            </span>
          </div>

          {(() => {
            const totalTraffic = deliveriesCount + cabsCount + guestsCount + dailyHelpCount;
            const deliveryPct = totalTraffic > 0 ? Math.round((deliveriesCount / totalTraffic) * 100) : 0;
            const cabPct = totalTraffic > 0 ? Math.round((cabsCount / totalTraffic) * 100) : 0;
            const guestPct = totalTraffic > 0 ? Math.round((guestsCount / totalTraffic) * 100) : 0;
            const helperPct = totalTraffic > 0 ? Math.max(0, 100 - deliveryPct - cabPct - guestPct) : 0;

            if (totalTraffic === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-soft text-muted mb-3">
                    <DoorOpen size={28} className="text-muted/60" />
                  </div>
                  <p className="text-sm font-black text-foreground">No entries recorded yet today</p>
                  <p className="text-xs text-muted mt-1 max-w-sm">
                    Passes, courier delivery drop-offs, cabs and daily help check-ins will automatically chart here.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Donut Chart Visualization */}
                <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
                  <div className="relative">
                    <svg className="h-48 w-48 -rotate-90 transform" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#3b82f6"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={`${(deliveryPct / 100) * 238} 238`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#10b981"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={`${(cabPct / 100) * 238} 238`}
                        strokeDashoffset={`-${(deliveryPct / 100) * 238}`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#f97316"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={`${(guestPct / 100) * 238} 238`}
                        strokeDashoffset={`-${((deliveryPct + cabPct) / 100) * 238}`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#a855f7"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={`${(helperPct / 100) * 238} 238`}
                        strokeDashoffset={`-${((deliveryPct + cabPct + guestPct) / 100) * 238}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-foreground">{totalTraffic}</span>
                      <span className="text-[10px] uppercase font-bold text-muted">Passes</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown Legend & Progress Bars */}
                <div className="md:col-span-7 space-y-3.5">
                  <div className="p-3 rounded-xl border border-line bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-foreground">Deliveries & Couriers</p>
                        <p className="text-[11px] text-muted">Swiggy, Amazon, Zomato, Porter</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{deliveriesCount} <span className="text-xs text-muted font-normal">({deliveryPct}%)</span></p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-line bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-foreground">Cabs & Taxis</p>
                        <p className="text-[11px] text-muted">Ola, Uber, Airport Taxis</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{cabsCount} <span className="text-xs text-muted font-normal">({cabPct}%)</span></p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-line bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full bg-orange-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-foreground">Personal Guests & Visitors</p>
                        <p className="text-[11px] text-muted">Friends, Family, Pre-approved Passes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{guestsCount} <span className="text-xs text-muted font-normal">({guestPct}%)</span></p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-line bg-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full bg-purple-500 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-foreground">Daily Help & Staff</p>
                        <p className="text-[11px] text-muted">Maids, Cooks, Drivers, Technicians</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{dailyHelpCount} <span className="text-xs text-muted font-normal">({helperPct}%)</span></p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING ACTION BUTTON (SPEED DIAL) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40">
        {fabOpen && (
          <div className="mb-3 space-y-2 flex flex-col items-end animate-rise">
            <button
              onClick={() => {
                setShowAddNote(true);
                setFabOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg bg-card border border-line px-3.5 py-2 text-xs font-bold text-foreground shadow-xl hover:bg-soft cursor-pointer transition"
            >
              <span>+ Reminder Note</span>
            </button>
            <button
              onClick={() => {
                setShowAddNoticeModal(true);
                setFabOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg bg-card border border-line px-3.5 py-2 text-xs font-bold text-foreground shadow-xl hover:bg-soft cursor-pointer transition"
            >
              <Megaphone size={14} className="text-primary" />
              <span>+ Broadcast Notice</span>
            </button>
            <button
              onClick={() => {
                setShowAddHelperModal(true);
                setFabOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg bg-card border border-line px-3.5 py-2 text-xs font-bold text-foreground shadow-xl hover:bg-soft cursor-pointer transition"
            >
              <UserCheck size={14} className="text-emerald-600" />
              <span>+ Register Daily Help</span>
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setFabOpen(!fabOpen)}
          className="flex items-center gap-2 rounded-lg bg-[#0f2b5c] hover:bg-[#153e85] dark:bg-primary dark:hover:bg-primary/90 text-white px-4 py-2.5 text-xs font-black shadow-xl shadow-slate-900/20 border border-white/10 hover:scale-105 active:scale-95 transition cursor-pointer"
          title="Quick Actions"
        >
          {fabOpen ? <X size={15} className="stroke-[2.5]" /> : <Plus size={15} className="stroke-[2.5]" />}
          <span>{fabOpen ? "Close" : "Quick Action"}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT SOCIETY NAME & BUILDING DETAILS (ATOMIC FIX FOR BUG) */}
      {/* ========================================================================= */}
      {showEditSociety && (
        <Modal title="Society Identity & Details" onClose={() => setShowEditSociety(false)}>
          <form onSubmit={handleSaveSociety} className="space-y-4">
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 p-3.5 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300">
              Update both the society name (e.g. <b>Silverwood Heights</b>) and photo. Both will be saved together in the database.
            </div>

            <Field label="Society Name">
              <input
                type="text"
                required
                value={societyNameInput}
                onChange={(e) => setSocietyNameInput(e.target.value)}
                placeholder="e.g. Silverwood Heights"
                className="w-full rounded-2xl border border-line bg-card py-3 px-4 text-sm font-black focus:border-primary focus:outline-none"
              />
            </Field>

            <Field label="City">
              <input
                type="text"
                required
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Hyderabad / Bengaluru"
                className="w-full rounded-2xl border border-line bg-card py-3 px-4 text-sm font-semibold focus:border-primary focus:outline-none"
              />
            </Field>

            <Field label="Full Address">
              <input
                type="text"
                required
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="e.g. Survey No. 42, Gachibowli Main Road"
                className="w-full rounded-2xl border border-line bg-card py-3 px-4 text-sm font-semibold focus:border-primary focus:outline-none"
              />
            </Field>

            <PhotoField label="Building Picture" value={photoInput} onChange={setPhotoInput} />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="ghost" onClick={() => setShowEditSociety(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Society Name & Details
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD QUICK NOTE */}
      {/* ========================================================================= */}
      {showAddNote && (
        <Modal title="Create Reminder Note" onClose={() => setShowAddNote(false)}>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <Field label="Note Title">
              <input
                type="text"
                required
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="e.g. Check visitor gate 2 intercom"
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3.5 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Details">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter details..."
                className="w-full rounded-2xl border border-line bg-card p-3.5 text-xs font-medium focus:border-primary focus:outline-none min-h-24"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddNote(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Note</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BROADCAST ANNOUNCEMENT NOTICE TO RESIDENTS */}
      {/* ========================================================================= */}
      {showAddNoticeModal && (
        <Modal title="Broadcast Announcement to Residents" onClose={() => setShowAddNoticeModal(false)}>
          <form onSubmit={handleCreateNotice} className="space-y-4">
            <Field label="Announcement Title">
              <input
                type="text"
                required
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="e.g. Scheduled Water Tank Cleaning / Safety Drill"
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3.5 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority Level">
                <select
                  value={noticePriority}
                  onChange={(e) => setNoticePriority(e.target.value as "urgent" | "normal" | "info")}
                  className="w-full rounded-2xl border border-line bg-card py-2.5 px-3 text-xs font-bold"
                >
                  <option value="normal">Normal Notice</option>
                  <option value="urgent">Urgent Alert</option>
                  <option value="info">Informational</option>
                </select>
              </Field>
              <Field label="Category">
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-card py-2.5 px-3 text-xs font-bold"
                >
                  <option value="Security">Security & Gates</option>
                  <option value="Utility">Utility & Water</option>
                  <option value="Event">Event & Celebration</option>
                  <option value="General">General Notice</option>
                </select>
              </Field>
            </div>
            <Field label="Notice Body / Instructions">
              <textarea
                required
                value={noticeBody}
                onChange={(e) => setNoticeBody(e.target.value)}
                placeholder="Enter complete details for all residents..."
                className="w-full rounded-2xl border border-line bg-card p-3.5 text-xs font-medium focus:border-primary focus:outline-none min-h-24"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddNoticeModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Broadcast to Resident Dashboards</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER DAILY DOMESTIC HELP */}
      {/* ========================================================================= */}
      {showAddHelperModal && (
        <Modal title="Register Daily Domestic Help" onClose={() => setShowAddHelperModal(false)}>
          <form onSubmit={handleCreateHelper} className="space-y-4">
            <Field label="Full Name">
              <input
                type="text"
                required
                value={helperName}
                onChange={(e) => setHelperName(e.target.value)}
                placeholder="e.g. Lakshmi Bai"
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3.5 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Mobile Number">
              <input
                type="text"
                required
                value={helperPhone}
                onChange={(e) => setHelperPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3.5 text-sm font-semibold focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Duty / Category">
              <select
                value={helperDuty}
                onChange={(e) => setHelperDuty(e.target.value)}
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3 text-xs font-bold"
              >
                <option value="Housekeeping & Maid">Housekeeping & Maid</option>
                <option value="Cook & Meal Prep">Cook & Meal Prep</option>
                <option value="Personal Driver">Personal Driver</option>
                <option value="Nanny / Babysitter">Nanny / Babysitter</option>
                <option value="Car Cleaner">Car Cleaner</option>
                <option value="Contractor / Electrical">Contractor / Electrical</option>
                <option value="Other Service">Other Service</option>
              </select>
            </Field>
            <Field label="Assigned Unit / Flat">
              <select
                value={helperUnit}
                onChange={(e) => setHelperUnit(e.target.value)}
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3 text-xs font-bold"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.block}-{u.number} (Floor {u.floor})
                  </option>
                ))}
              </select>
            </Field>
            <PhotoField label="Optional Photo" value={helperPhoto} onChange={setHelperPhoto} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddHelperModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Authorize Helper at Gate</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ISSUE WORK ORDER */}
      {/* ========================================================================= */}
      {showAddWO && (
        <Modal title="Issue New Work Order" onClose={() => setShowAddWO(false)}>
          <form onSubmit={handleCreateWorkOrder} className="space-y-4">
            <Field label="Contractor / Vendor Name">
              <input
                type="text"
                required
                value={newWOVendor}
                onChange={(e) => setNewWOVendor(e.target.value)}
                placeholder="e.g. Otis Elevators / QuickPlumb"
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3.5 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Category">
              <select
                value={newWOCategory}
                onChange={(e) => setNewWOCategory(e.target.value)}
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3.5 text-xs font-bold"
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Elevator">Elevator & Lift</option>
                <option value="Security">Security & CCTV</option>
                <option value="Gardening">Landscape & Gardening</option>
                <option value="General">General Maintenance</option>
              </select>
            </Field>
            <Field label="Scope of Work / Instructions">
              <textarea
                required
                value={newWODesc}
                onChange={(e) => setNewWODesc(e.target.value)}
                placeholder="Describe work required..."
                className="w-full rounded-2xl border border-line bg-card p-3.5 text-xs font-medium focus:border-primary focus:outline-none min-h-24"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddWO(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Work Order</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMPORTANT EMERGENCY NUMBERS */}
      {/* ========================================================================= */}
      {showImportantNumbers && (
        <Modal title="Important & Emergency Numbers" onClose={() => setShowImportantNumbers(false)}>
          <div className="space-y-3">
            {[
              { label: "Main Gate Sentinel Desk", phone: "+91 98450 12001", role: "Security 24/7" },
              { label: "Facility Manager (Karthik)", phone: "+91 98450 10001", role: "Estate Office" },
              { label: "Elevator Emergency Breakdown", phone: "1800 200 4545", role: "24/7 Lift Helpline" },
              { label: "Electrician on Call", phone: "+91 98450 33022", role: "Facility Team" },
              { label: "Fire & Police Emergency", phone: "112", role: "National Emergency" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl border border-line bg-card p-3.5">
                <div>
                  <p className="text-xs font-black text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted">{item.role}</p>
                </div>
                <a
                  href={`tel:${item.phone.replace(/\s+/g, "")}`}
                  className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-black text-primary hover:bg-primary/20"
                >
                  {item.phone}
                </a>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowImportantNumbers(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/**
 * Society Residents & Staff Management - Complete Flow for Onboarding & Registration
 */
export function SocietyResidents() {
  const { db, societyId } = useSocietyScope();
  const inviteResident = useData((state) => state.inviteResident);
  const activateResident = useData((state) => state.activateResident);
  const rejectResident = useData((state) => state.rejectResident);
  const addStaff = useData((state) => state.addStaff);
  const addHelper = useData((state) => state.addHelper);
  const addUnit = useData((state) => state.addUnit);

  const society = db.societies.find((s) => s.id === societyId);
  const people = db.users.filter((person) => person.societyId === societyId && person.role === "resident");
  const pendingResidents = people.filter((person) => person.status === "pending" || person.status === "invited");
  const staff = db.users.filter((person) => person.societyId === societyId && person.role === "gatekeeper");
  const helpers = db.helpers.filter((helper) => helper.societyId === societyId);
  const units = db.units.filter((unit) => unit.societyId === societyId);
  const allFamily = (db.familyMembers || []).filter((m) => m.societyId === societyId);

  // Form states
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [staffPhoto, setStaffPhoto] = useState<string | null>(null);
  const [helperPhoto, setHelperPhoto] = useState<string | null>(null);
  const [autoActivate, setAutoActivate] = useState(true);
  const [activeTab, setActiveTab] = useState<"residents" | "family" | "flats" | "staff" | "helpers">("residents");
  const [filterQuery, setFilterQuery] = useState("");

  // Credentials dialog for newly created resident
  const [newResidentCredentials, setNewResidentCredentials] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    flat: string;
    status: string;
  } | null>(null);

  // Filtered residents
  const filteredResidents = useMemo(() => {
    if (!filterQuery.trim()) return people;
    const q = filterQuery.toLowerCase();
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        unitLabel(db.units, p.unitId).toLowerCase().includes(q),
    );
  }, [people, filterQuery, db.units]);

  function handleInviteResident(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const block = String(form.get("block") || "").trim();
    const number = String(form.get("number") || "").trim();
    const password = String(form.get("password") || "").trim() || "resident123";

    if (!name) {
      setError("Resident name is required.");
      return;
    }
    if (!block || !number) {
      setError("Please specify the block (e.g. A) and flat number (e.g. 101).");
      return;
    }

    const message = inviteResident({
      societyId,
      name,
      email,
      phone,
      block,
      number,
      password,
      photo,
      autoActivate,
    });

    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setPhoto(null);
    setNewResidentCredentials({
      name,
      email: email || `${phone.replace(/\D/g, "") || "user"}@invite.smartgate`,
      phone,
      password,
      flat: `${block}-${number}`,
      status: autoActivate ? "Active" : "Invited",
    });
    e.currentTarget.reset();
  }

  function handleAddUnit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const msg = addUnit({
      societyId,
      block: String(form.get("block") || ""),
      number: String(form.get("number") || ""),
      floor: Number(form.get("floor") || 1),
    });
    if (msg) setError(msg);
    else {
      setError(null);
      e.currentTarget.reset();
      alert("Flat registered successfully.");
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Community Directory & Residents"
        subtitle={`Manage households, security officers, and daily staff for ${society?.name || "your society"}`}
      />

      {/* Society Invite Code Banner for Self-Registration */}
      <div className="glass rounded-2xl p-4 border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white font-black text-sm shrink-0">
            <Share2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-foreground">Resident Self-Registration Code: <span className="text-primary font-black text-sm">{society?.code}</span></p>
            <p className="text-[11px] text-muted truncate">Residents can also join themselves by entering code <b>{society?.code}</b> on the website.</p>
          </div>
        </div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `Join our society on AI Smartgate Estate OS! Use code ${society?.code} at http://localhost:3100/signup?code=${society?.code} to link your flat.`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-black text-white hover:brightness-105 shadow-sm shrink-0"
        >
          <Share2 size={14} /> Invite Residents via WhatsApp
        </a>
      </div>

      {/* Pending Resident Approvals Alert Card */}
      {pendingResidents.length > 0 && (
        <Card className="border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-amber-200/80 dark:border-amber-900/60">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500 text-white font-black text-xs shadow-sm">
                {pendingResidents.length}
              </span>
              <div>
                <h3 className="text-sm font-black text-amber-950 dark:text-amber-100">
                  Pending Resident Approvals ({pendingResidents.length})
                </h3>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  Verify flat occupancy and click <b>Approve & Activate</b> to enable resident login.
                </p>
              </div>
            </div>
            <Badge tone="warn">Awaiting Admin Action</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingResidents.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-line bg-card p-3.5 flex flex-col justify-between gap-3 shadow-sm hover:border-primary/40 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-extrabold text-sm text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted truncate mt-0.5">{p.email}</p>
                    </div>
                    <span className="text-xs font-black text-primary px-2.5 py-1 rounded-xl bg-primary/10 shrink-0">
                      Flat {unitLabel(db.units, p.unitId)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    {p.emailVerified ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Email OTP Verified ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Email Pending
                      </span>
                    )}
                    {p.phone ? (
                      <span className="text-[10px] text-muted font-bold">📱 {p.phone}</span>
                    ) : (
                      <span className="text-[10px] text-muted italic">No phone provided</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2.5 border-t border-line">
                  <Button
                    onClick={() => {
                      activateResident(p.id);
                      alert(`✓ Approved & activated ${p.name}! They can now log in immediately.`);
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 shadow-sm"
                  >
                    <Check size={14} className="mr-1 inline" /> Approve & Activate
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm(`Decline and reject registration application for ${p.name}?`)) {
                        rejectResident(p.id);
                      }
                    }}
                    className="rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold py-2 px-3"
                    title="Reject Application"
                  >
                    <X size={14} className="mr-1 inline" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-line pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: "residents", label: `Residents (${people.length})`, icon: Users },
          { key: "family", label: `Family Members (${allFamily.length})`, icon: UserCheck },
          { key: "flats", label: `Flats / Units (${units.length})`, icon: Building2 },
          { key: "staff", label: `Gate Staff (${staff.length})`, icon: DoorOpen },
          { key: "helpers", label: `Daily Help (${helpers.length})`, icon: Wrench },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition cursor-pointer shrink-0 ${
              activeTab === key
                ? "bg-primary text-white shadow-sm"
                : "border border-line bg-card hover:bg-soft text-muted hover:text-foreground"
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {/* ========================================================================= */}
      {/* TAB 1: RESIDENTS */}
      {/* ========================================================================= */}
      {activeTab === "residents" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Create / Onboard Resident Form */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <h3 className="text-base font-black text-foreground mb-4">Add New Resident Account</h3>
              <form onSubmit={handleInviteResident} className="space-y-3.5">
                <Field label="Resident Full Name">
                  <TextInput name="name" required placeholder="e.g. Ananya Sharma" />
                </Field>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Block">
                    <TextInput name="block" required placeholder="e.g. A" />
                  </Field>
                  <Field label="Flat Number">
                    <TextInput name="number" required placeholder="e.g. 101" />
                  </Field>
                </div>
                <Field label="Mobile Number">
                  <TextInput name="phone" required placeholder="10-digit mobile" />
                </Field>
                <Field label="Email Address">
                  <TextInput name="email" type="email" placeholder="resident@email.com" />
                </Field>
                <Field label="Temporary Password">
                  <TextInput name="password" defaultValue="resident123" />
                </Field>
                <PhotoField label="Resident Photo (Optional)" value={photo} onChange={setPhoto} />

                {/* Instant Activation Toggle */}
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={autoActivate}
                    onChange={(e) => setAutoActivate(e.target.checked)}
                    className="rounded border-slate-300 text-primary"
                  />
                  <span>Activate immediately (Resident can sign in right away)</span>
                </label>

                <Button type="submit" className="w-full min-h-12 text-sm font-black">
                  Create & Link Resident Account
                </Button>
              </form>
            </Card>
          </div>

          {/* Resident Directory List */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search by name, flat, or phone..."
                    className="w-full rounded-2xl border border-line bg-soft/80 py-2.5 pl-10 pr-4 text-xs font-semibold focus:border-primary focus:outline-none"
                  />
                </div>
                <Badge tone="info">{filteredResidents.length} Residents</Badge>
              </div>

              {filteredResidents.length === 0 ? (
                <EmptyState title="No residents found" body="Register the first resident using the form on the left." />
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {filteredResidents.map((person) => (
                    <div
                      key={person.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-card p-3 sm:p-3.5 transition hover:border-primary/40"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={person.photo} name={person.name} className="h-10 w-10 sm:h-11 sm:w-11 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-extrabold text-sm text-foreground truncate">{person.name}</p>
                            <Badge tone={person.status === "active" ? "good" : "warn"}>{person.status}</Badge>
                            {person.emailVerified ? (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Email OTP Verified
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                Email Pending
                              </span>
                            )}
                            {person.phoneVerified ? (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                Mobile OTP Verified
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                Mobile Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted truncate">
                            Flat: <span className="font-bold text-foreground">{unitLabel(db.units, person.unitId)}</span> · {person.phone} · {person.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {(person.status === "pending" || person.status === "invited") && (
                          <Button
                            onClick={() => {
                              activateResident(person.id);
                              alert(`✓ Approved & activated ${person.name}!`);
                            }}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-black"
                          >
                            <Check size={14} className="mr-1 inline" />
                            Approve
                          </Button>
                        )}
                        {person.status === "pending" && (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (window.confirm(`Reject registration application for ${person.name}?`)) {
                                rejectResident(person.id);
                              }
                            }}
                            className="rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 px-2.5 py-1.5 text-xs font-bold"
                            title="Reject Registration"
                          >
                            <X size={14} className="mr-1 inline" />
                            Reject
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(`Email: ${person.email}\nPassword: ${person.password}\nFlat: ${unitLabel(db.units, person.unitId)}`);
                            alert(`Copied credentials for ${person.name}!`);
                          }}
                          className="rounded-xl px-2.5 py-1.5 text-xs shrink-0"
                          title="Copy login credentials"
                        >
                          <Copy size={14} />
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

      {/* ========================================================================= */}
      {/* TAB: FAMILY MEMBERS */}
      {/* ========================================================================= */}
      {activeTab === "family" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-foreground">Registered Family & Household Members</h3>
              <p className="text-xs text-muted">Official headcount of registered family members authorized for intercom and gate access.</p>
            </div>
            <Badge tone="info">{allFamily.length} Family Members</Badge>
          </div>

          {allFamily.length === 0 ? (
            <EmptyState title="No family members registered yet" body="Residents can add family members directly from their resident dashboard." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allFamily.map((mem) => {
                const flat = db.units.find((u) => u.id === mem.unitId);
                const primary = db.users.find((u) => u.id === mem.primaryResidentId);
                return (
                  <Card key={mem.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar src={mem.photo} name={mem.name} className="h-12 w-12 rounded-2xl shadow-sm text-base shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-foreground truncate">{mem.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge tone="info">{mem.relation}</Badge>
                          <span className="text-xs font-black text-primary">Flat {flat ? `${flat.block}-${flat.number}` : "—"}</span>
                        </div>
                        <p className="text-xs text-muted mt-1">{mem.phone}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-soft/70 p-2.5 text-[11px] flex items-center justify-between">
                      <span className="text-muted">Primary: <b>{primary?.name || "Resident"}</b></span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Authorized ✓</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FLATS / UNITS */}
      {/* ========================================================================= */}
      {activeTab === "flats" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Card>
              <h3 className="text-base font-black text-foreground mb-4">Add Building Flat / Unit</h3>
              <form onSubmit={handleAddUnit} className="space-y-3.5">
                <Field label="Block">
                  <TextInput name="block" required placeholder="e.g. A" />
                </Field>
                <Field label="Flat Number">
                  <TextInput name="number" required placeholder="e.g. 101" />
                </Field>
                <Field label="Floor Level">
                  <TextInput name="floor" type="number" defaultValue={1} />
                </Field>
                <Button type="submit" className="w-full min-h-12 text-sm font-black">
                  Add Flat to Inventory
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card>
              <h3 className="text-base font-black text-foreground mb-4">Unit Inventory ({units.length} total)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto">
                {units.map((u) => {
                  const resident = people.find((p) => p.unitId === u.id);
                  return (
                    <div key={u.id} className="rounded-2xl border border-line bg-card p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-base text-foreground">{u.block}-{u.number}</span>
                        <Badge tone={resident ? "good" : "neutral"}>{resident ? "Occupied" : "Vacant"}</Badge>
                      </div>
                      <p className="text-[11px] text-muted mt-1">Floor {u.floor}</p>
                      <p className="text-xs font-bold text-primary mt-1 truncate">
                        {resident ? resident.name : "Unassigned"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GATE STAFF */}
      {/* ========================================================================= */}
      {activeTab === "staff" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Card>
              <h3 className="text-base font-black text-foreground mb-4">Register Gate Sentinel Staff</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  const msg = addStaff({
                    societyId,
                    name: String(form.get("name") || ""),
                    email: String(form.get("email") || ""),
                    phone: String(form.get("phone") || ""),
                    password: String(form.get("password") || "guard123"),
                    photo: staffPhoto,
                  });
                  if (msg) setError(msg);
                  else {
                    setError(null);
                    setStaffPhoto(null);
                    e.currentTarget.reset();
                    alert("Gatekeeper account created.");
                  }
                }}
                className="space-y-3.5"
              >
                <Field label="Guard Name"><TextInput name="name" required placeholder="Guard full name" /></Field>
                <Field label="Mobile Number"><TextInput name="phone" required placeholder="10-digit mobile" /></Field>
                <Field label="Login Email"><TextInput name="email" type="email" placeholder="guard@society.in" /></Field>
                <Field label="Password"><TextInput name="password" defaultValue="guard123" /></Field>
                <PhotoField label="Officer Photo" value={staffPhoto} onChange={setStaffPhoto} />
                <Button type="submit" className="w-full min-h-12 text-sm font-black">
                  Create Gatekeeper Account
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card>
              <h3 className="text-base font-black text-foreground mb-4">Security Personnel ({staff.length})</h3>
              <div className="space-y-3">
                {staff.map((guard) => (
                  <div key={guard.id} className="flex items-center justify-between rounded-2xl border border-line bg-card p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar src={guard.photo} name={guard.name} className="h-11 w-11" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-foreground">{guard.name}</p>
                          {guard.emailVerified && guard.phoneVerified && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              2FA Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted">{guard.email} · {guard.phone}</p>
                      </div>
                    </div>
                    <Badge tone="good">Active Gatekeeper</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONTRACTORS & HELPERS */}
      {/* ========================================================================= */}
      {activeTab === "helpers" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Card>
              <h3 className="text-base font-black text-foreground mb-4">Register Daily Helper / Contractor</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  const msg = addHelper({
                    societyId,
                    unitId: String(form.get("unitId") || units[0]?.id || ""),
                    name: String(form.get("name") || ""),
                    phone: String(form.get("phone") || ""),
                    duty: String(form.get("duty") || "House help"),
                    photo: helperPhoto,
                  });
                  if (msg) setError(msg);
                  else {
                    setError(null);
                    setHelperPhoto(null);
                    e.currentTarget.reset();
                    alert("Contractor registered.");
                  }
                }}
                className="space-y-3.5"
              >
                <Field label="Contractor Name"><TextInput name="name" required placeholder="Name" /></Field>
                <Field label="Mobile Number"><TextInput name="phone" required placeholder="10-digit number" /></Field>
                <Field label="Duty / Trade"><TextInput name="duty" required placeholder="Maid / Driver / Electrician" /></Field>
                <Field label="Attached Unit">
                  <SelectInput name="unitId" defaultValue={units[0]?.id}>
                    {units.map((u) => <option key={u.id} value={u.id}>{u.block}-{u.number}</option>)}
                  </SelectInput>
                </Field>
                <PhotoField label="ID Photo" value={helperPhoto} onChange={setHelperPhoto} />
                <Button type="submit" className="w-full min-h-12 text-sm font-black">Register Helper</Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card>
              <h3 className="text-base font-black text-foreground mb-4">Verified Regular Helpers ({helpers.length})</h3>
              <div className="space-y-3">
                {helpers.map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-2xl border border-line bg-card p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar src={h.photo} name={h.name} className="h-11 w-11" />
                      <div>
                        <p className="font-extrabold text-sm text-foreground">{h.name}</p>
                        <p className="text-xs text-muted">{h.duty} · Flat {unitLabel(db.units, h.unitId)} · {h.phone}</p>
                      </div>
                    </div>
                    <Badge tone="good">Verified</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUCCESS MODAL: NEW RESIDENT CREDENTIALS */}
      {/* ========================================================================= */}
      {newResidentCredentials && (
        <Modal title="Resident Account Created!" onClose={() => setNewResidentCredentials(null)}>
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <UserCheck size={28} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-foreground">{newResidentCredentials.name} is Ready!</h3>
            <p className="text-xs text-muted">
              Flat: <b>{newResidentCredentials.flat}</b> · Status: <b>{newResidentCredentials.status}</b>
            </p>

            <div className="rounded-2xl border border-line bg-soft p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Login Email:</span>
                <span className="font-black text-foreground">{newResidentCredentials.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Mobile:</span>
                <span className="font-black text-foreground">{newResidentCredentials.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Password:</span>
                <span className="font-black text-primary">{newResidentCredentials.password}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Hello ${newResidentCredentials.name}! Your AI Smartgate Estate OS account is active for Flat ${newResidentCredentials.flat}.\nLogin: ${newResidentCredentials.email}\nPassword: ${newResidentCredentials.password}\nPortal: http://localhost:3100/login`,
                  );
                  alert("Credentials copied to clipboard!");
                }}
                className="gap-2 text-xs"
              >
                <Copy size={15} /> Copy Credentials
              </Button>
              <Button variant="ghost" onClick={() => setNewResidentCredentials(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function SocietyGates() {
  const { db, societyId } = useSocietyScope();
  const updateGate = useData((state) => state.updateGate);
  const gates = db.gates.filter((gate) => gate.societyId === societyId);

  return (
    <div className="space-y-6">
      <PageTitle title="Sentinel Gates & Barriers" subtitle="Configure automated entry rules and kiosk settings." />
      <div className="grid gap-4 md:grid-cols-2">
        {gates.map((gate) => (
          <Card key={gate.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground">{gate.name}</h2>
              <Badge tone="good">Online</Badge>
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={gate.visitorApprovalRequired}
                onChange={(e) => updateGate(gate.id, { visitorApprovalRequired: e.target.checked, deliveryAutoApprove: gate.deliveryAutoApprove })}
                className="rounded border-slate-300 text-primary"
              />
              <span>Require resident approval for all unknown visitors</span>
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={gate.deliveryAutoApprove}
                onChange={(e) => updateGate(gate.id, { visitorApprovalRequired: gate.visitorApprovalRequired, deliveryAutoApprove: e.target.checked })}
                className="rounded border-slate-300 text-primary"
              />
              <span>Auto-approve verified delivery executives (Swiggy, Amazon, Zomato)</span>
            </label>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SocietyReports() {
  const { db, societyId } = useSocietyScope();
  const visitors = db.visitors.filter((v) => v.societyId === societyId);
  const parcels = db.parcels.filter((p) => p.societyId === societyId);

  return (
    <div className="space-y-6">
      <PageTitle title="Audit Reports & Analytics" subtitle="Review complete activity logs and security compliance." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total Visitors Logged" value={visitors.length} />
        <Stat label="Parcels Handled" value={parcels.length} />
        <Stat label="Security Compliance" value="99.4%" hint="100% verified entries" />
      </div>
    </div>
  );
}

export function SocietySubscription() {
  const { db, societyId } = useSocietyScope();
  const sub = db.subscriptions.find((s) => s.societyId === societyId);
  const plan = db.plans.find((p) => p.id === sub?.planId);

  return (
    <div className="space-y-6 max-w-xl">
      <PageTitle title="Estate Plan & Subscription" subtitle="Software tier and facility billing" />
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-foreground">{plan?.name || "Professional"} Plan</h2>
          <Badge tone="good">{sub?.status || "active"}</Badge>
        </div>
        <p className="text-3xl font-black text-primary">{formatMoney(plan?.monthlyPrice || 5999)}<span className="text-xs text-muted font-normal"> / month</span></p>
        <p className="text-xs text-muted font-semibold">Renews on: {sub?.renewsOn || "2027-03-01"}</p>
        <div className="border-t border-line pt-4 flex gap-2">
          <Button onClick={() => alert("Subscription is active. Managed by AI Smartgate Estate OS Platform.")}>
            Manage Payment Method
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function SocietySupport() {
  const { user, db, societyId } = useSocietyScope();
  const raiseTicket = useData((state) => state.raiseTicket);
  const tickets = db.tickets.filter((t) => t.societyId === societyId);
  const [created, setCreated] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    raiseTicket({
      societyId,
      userId: user.id,
      subject: String(form.get("subject") || ""),
      body: String(form.get("body") || ""),
      category: String(form.get("category") || "other") as TicketCategory,
      priority: String(form.get("priority") || "medium") as TicketPriority,
    });
    setCreated(true);
    e.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Enterprise Support Desk" subtitle="Direct channel to AI Smartgate Estate OS platform support and engineering." />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="text-base font-black text-foreground mb-4">Open Support Ticket</h3>
          {created && <p className="mb-3 rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800">✓ Ticket dispatched to AI Smartgate Estate OS Platform team.</p>}
          <form onSubmit={onSubmit} className="space-y-3.5">
            <Field label="Subject"><TextInput name="subject" required placeholder="Brief description of issue" /></Field>
            <Field label="Category">
              <SelectInput name="category" defaultValue="access">
                <option value="access">Access Control & Gates</option>
                <option value="billing">Billing & Plan</option>
                <option value="bug">Feature / Software</option>
                <option value="other">General</option>
              </SelectInput>
            </Field>
            <Field label="Priority">
              <SelectInput name="priority" defaultValue="medium">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High - Gate Impacted</option>
              </SelectInput>
            </Field>
            <Field label="Description"><TextArea name="body" required placeholder="Detailed notes..." /></Field>
            <Button type="submit">Submit to Platform HQ</Button>
          </form>
        </Card>

        <Card>
          <h3 className="text-base font-black text-foreground mb-4">Recent Support Tickets</h3>
          {tickets.length === 0 ? (
            <EmptyState title="No open tickets" body="System is running smoothly with 100% uptime." />
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="rounded-2xl border border-line bg-card p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-foreground">{t.subject}</p>
                    <Badge tone={t.status === "resolved" ? "good" : "warn"}>{t.status}</Badge>
                  </div>
                  <p className="text-xs text-muted mt-1">{t.body}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export function SocietyHelpers() {
  const { db, societyId } = useSocietyScope();
  const addHelper = useData((state) => state.addHelper);
  const toggleHelperAllowed = useData((state) => state.toggleHelperAllowed);
  const deleteHelper = useData((state) => state.deleteHelper);
  const units = db.units.filter((u) => u.societyId === societyId);
  const helpers = db.helpers.filter((h) => h.societyId === societyId);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [duty, setDuty] = useState("Housekeeping & Maid");
  const [unitId, setUnitId] = useState(units[0]?.id || "");
  const [photo, setPhoto] = useState<string | null>(null);
  const [filterDuty, setFilterDuty] = useState("all");

  const filtered = helpers.filter((h) => filterDuty === "all" || h.duty === filterDuty);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    addHelper({
      societyId,
      unitId: unitId || units[0]?.id || "",
      name: name.trim(),
      phone: phone.trim(),
      duty,
      photo,
    });
    setName("");
    setPhone("");
    setPhoto(null);
    setShowAdd(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageTitle
          title="Daily Domestic Staff & Helpers"
          subtitle="Authorize and monitor regular maids, cooks, drivers, and maintenance contractors."
        />
        <Button onClick={() => setShowAdd(true)} className="w-full sm:w-auto shrink-0">+ Register New Staff</Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
          {["all", "Housekeeping & Maid", "Personal Driver", "Cook & Meal Prep", "Contractor / Electrical"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDuty(d)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                filterDuty === d
                  ? "bg-primary text-white shadow-sm"
                  : "border border-line bg-card hover:bg-soft text-muted"
              }`}
            >
              {d === "all" ? "All Staff" : d.split(" ")[0]}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted font-bold shrink-0">{filtered.length} helpers registered</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No daily help on file"
          body="Register maids, drivers, or gardeners to enable smooth gate kiosk verification."
          action={<Button onClick={() => setShowAdd(true)}>+ Register Staff</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((helper) => (
            <Card key={helper.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={helper.photo} name={helper.name} className="h-14 w-14 rounded-2xl shadow-sm text-lg" />
                    <div>
                      <h3 className="font-extrabold text-base text-foreground">{helper.name}</h3>
                      <p className="text-xs font-black text-primary">{helper.duty}</p>
                      <p className="text-xs text-muted mt-0.5">{helper.phone}</p>
                    </div>
                  </div>
                  <Badge tone={helper.allowed ? "good" : "bad"}>
                    {helper.allowed ? "Authorized" : "Blocked"}
                  </Badge>
                </div>

                <div className="mt-4 rounded-2xl bg-soft/70 p-3 flex items-center justify-between text-xs">
                  <span className="text-muted font-semibold">Assigned Flat: {unitLabel(units, helper.unitId)}</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Inside
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center gap-2">
                <a
                  href={`tel:${helper.phone.replace(/\s+/g, "")}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-2 text-xs font-black hover:brightness-105"
                >
                  <Phone size={13} /> Call
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

      {showAdd && (
        <Modal title="Register Daily Domestic Staff" onClose={() => setShowAdd(false)}>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Staff Full Name">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lakshmi Bai"
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3.5 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Mobile Number">
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3.5 text-sm font-semibold focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Duty / Category">
              <select
                value={duty}
                onChange={(e) => setDuty(e.target.value)}
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3 text-xs font-bold"
              >
                <option value="Housekeeping & Maid">Housekeeping & Maid</option>
                <option value="Cook & Meal Prep">Cook & Meal Prep</option>
                <option value="Personal Driver">Personal Driver</option>
                <option value="Nanny / Babysitter">Nanny / Babysitter</option>
                <option value="Car Cleaner">Car Cleaner</option>
                <option value="Contractor / Electrical">Contractor / Electrical</option>
                <option value="Other Service">Other Service</option>
              </select>
            </Field>
            <Field label="Assigned Household / Flat">
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3 text-xs font-bold"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.block}-{u.number} (Floor {u.floor})
                  </option>
                ))}
              </select>
            </Field>
            <PhotoField label="Optional Photo" value={photo} onChange={setPhoto} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Staff</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function SocietyNoticesAdmin() {
  const { db, societyId } = useSocietyScope();
  const addNotice = useData((state) => state.addNotice);
  const deleteNotice = useData((state) => state.deleteNotice);
  const notices = db.notices.filter((n) => n.societyId === societyId);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<"urgent" | "normal" | "info">("normal");
  const [category, setCategory] = useState("Security");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    addNotice({
      societyId,
      title: title.trim(),
      body: body.trim(),
      priority,
      category,
    });
    setTitle("");
    setBody("");
    setShowAdd(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageTitle
          title="Community Broadcasts & Notices"
          subtitle="Publish urgent announcements, security notices, and utility updates directly to resident dashboards."
        />
        <Button onClick={() => setShowAdd(true)} className="w-full sm:w-auto shrink-0">+ New Broadcast</Button>
      </div>

      {notices.length === 0 ? (
        <EmptyState
          title="No notices published"
          body="Broadcast updates to keep residents informed about gate procedures, water supply, and security alerts."
          action={<Button onClick={() => setShowAdd(true)}>+ Post Announcement</Button>}
        />
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h3 className="font-extrabold text-base text-foreground">{notice.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase shrink-0 ${
                      notice.priority === "urgent"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                    }`}
                  >
                    {notice.priority || "Notice"} Priority
                  </span>
                  {notice.category && (
                    <span className="rounded-md bg-soft px-2 py-0.5 text-[10px] font-bold text-muted shrink-0">
                      {notice.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-line">
                  <span className="text-xs text-muted font-bold">{formatWhen(notice.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => deleteNotice(notice.id)}
                    className="text-muted hover:text-red-600 transition cursor-pointer p-1"
                    title="Delete notice"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{notice.body}</p>
            </Card>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Broadcast New Society Announcement" onClose={() => setShowAdd(false)}>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Announcement Title">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Overhead Water Tank Cleaning"
                className="w-full rounded-2xl border border-line bg-card py-2.5 px-3.5 text-sm font-bold focus:border-primary focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority Level">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "urgent" | "normal" | "info")}
                  className="w-full rounded-2xl border border-line bg-card py-2.5 px-3 text-xs font-bold"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent Alert</option>
                  <option value="info">Informational</option>
                </select>
              </Field>
              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-card py-2.5 px-3 text-xs font-bold"
                >
                  <option value="Security">Security & Gates</option>
                  <option value="Utility">Utility & Water</option>
                  <option value="Event">Event & Festival</option>
                  <option value="General">General Announcement</option>
                </select>
              </Field>
            </div>
            <Field label="Announcement Body">
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Detailed instructions for residents..."
                className="w-full rounded-2xl border border-line bg-card p-3.5 text-xs font-medium focus:border-primary focus:outline-none min-h-28"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit">Broadcast to Resident Dashboards</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
