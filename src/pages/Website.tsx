import { FormEvent, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CreditCard,
  DoorOpen,
  Smartphone,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Search,
  Lock,
  Layers,
  Zap,
  Globe2,
  Cpu,
  HeartHandshake,
  Check,
  ChevronRight,
  HelpCircle,
  Download,
  Sliders,
  SlidersHorizontal,
  Car,
  PackageCheck,
  Languages,
  UserCheck,
  BellRing,
  ParkingSquare,
  QrCode,
  Users,
  Navigation,
  MapPin,
} from "lucide-react";
import { Button, Card, ErrorNote, Field, Modal, PhotoField, SelectInput, TextArea, TextInput } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { openRazorpayCheckout, razorpayTestMode } from "@/lib/razorpay";
import type { CreatedSociety } from "@/stores/use-data";
import { useData } from "@/stores/use-data";
import { useAuth } from "@/stores/use-auth";
import { CommunityHeroLandscape } from "@/components/CommunityHeroLandscape";
import { VisitorStaffIllustration } from "@/components/VisitorStaffIllustration";
import { AppLogo } from "@/components/AppLogo";
import { ReadyToUpgradeSection, SiteFooter } from "@/components/SiteFooter";
import { OtpVerificationModal } from "@/components/OtpVerificationModal";
import { toast } from "@/stores/use-toast";

function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `/#${targetId}`);
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-white/85 dark:bg-[#070e1e]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <AppLogo size="md" subtitleText="Smart Society Operating System" />

        <nav className="hidden items-center gap-7 text-xs font-black text-slate-600 dark:text-slate-300 md:flex">
          <a href="/#product" onClick={(e) => handleNav(e, "product")} className="hover:text-primary transition">Platform Desks</a>
          <a href="/#visitor-management" onClick={(e) => handleNav(e, "visitor-management")} className="hover:text-primary transition">Visitors & Staff</a>
          <a href="/#society-guard" onClick={(e) => handleNav(e, "society-guard")} className="hover:text-primary transition">Society Guard</a>
          <a href="/#why-platform" onClick={(e) => handleNav(e, "why-platform")} className="hover:text-primary transition">Why AI Smartgate</a>
          <a href="/#pricing" onClick={(e) => handleNav(e, "pricing")} className="hover:text-primary transition">Plans & Pricing</a>
          <Link to="/demo" className="hover:text-primary transition">Watch Demo</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-black text-foreground hover:bg-soft transition"
          >
            Sign In
          </Link>
          <Link
            to="/buy"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:brightness-105 shadow-md shadow-primary/25 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function WindowChrome({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-none border border-line bg-card/95 shadow-[0_30px_90px_rgba(15,43,92,0.1)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-soft/50">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 rounded-full border border-line bg-card px-3 py-1 text-[11px] font-black text-muted tracking-wide">
            {title}
          </span>
        </div>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
}

export function HomePage() {
  const plans = useData((state) => state.db.plans);
  const societies = useData((state) => state.db.societies.length);

  return (
    <div className="site-canvas min-h-screen">
      <SiteHeader />

      {/* ========================================================================= */}
      {/* HERO SECTION: FULL-SCREEN VIEWPORT FIT WITH COMMUNITY LANDSCAPE            */}
      {/* ========================================================================= */}
      <section className="relative w-full h-[calc(100vh-65px)] min-h-[580px] max-h-[820px] flex flex-col justify-between overflow-hidden">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[340px] w-[850px] rounded-full bg-gradient-to-r from-blue-400/20 via-sky-300/20 to-teal-400/15 blur-[120px] dark:from-blue-600/15" />

        {/* Hero Centered Content (Max width for readable typography) */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 pt-4 sm:pt-7 text-center flex-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary mb-3">
            <Sparkles size={13} /> Integrated Building Management System (IBMS)
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-[#0f2b5c] dark:text-white leading-[1.12]">
            Apartment & Housing Society Management Platform
          </h1>

          <p className="mt-3 text-sm sm:text-base md:text-lg text-muted max-w-2xl font-medium leading-relaxed mx-auto">
            One unified operating system for modern residential communities. Connects your committee estate office, biometric gate sentinel tablets, and resident mobile workflows with zero ads.
          </p>

          {/* Enterprise Trust & Verification Badges */}
          <div className="mt-5 sm:mt-6 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-white/75 dark:bg-[#081224]/75 border border-slate-200/90 dark:border-white/10 shadow-[0_8px_30px_rgba(15,43,92,0.06)] backdrop-blur-md">
            {/* DPDP Certified */}
            <div className="group inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-50/60 dark:bg-emerald-950/30 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all duration-200 hover:scale-[1.03] hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-500/50 cursor-default">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                <ShieldCheck size={12} strokeWidth={2.5} />
              </span>
              <span className="font-extrabold tracking-tight">DPDP Certified</span>
              <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Privacy
              </span>
            </div>

            {/* 100% Ad-Free */}
            <div className="group inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-50/60 dark:bg-blue-950/30 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all duration-200 hover:scale-[1.03] hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-500/50 cursor-default">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                <Sparkles size={12} strokeWidth={2.5} />
              </span>
              <span className="font-extrabold tracking-tight">100% Ad-Free</span>
              <span className="rounded-full bg-blue-500/15 dark:bg-blue-500/25 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Clean UX
              </span>
            </div>

            {/* 99.98% Sentinel Uptime */}
            <div className="group inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50/60 dark:bg-cyan-950/30 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all duration-200 hover:scale-[1.03] hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:border-cyan-500/50 cursor-default">
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-white shadow-xs">
                <Activity size={12} strokeWidth={2.5} />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </span>
              <span className="font-extrabold tracking-tight">99.98% Sentinel Uptime</span>
              <span className="rounded-full bg-cyan-500/15 dark:bg-cyan-500/25 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                Live SLA
              </span>
            </div>
          </div>
        </div>

        {/* FULL WIDTH Community Landscape Illustration Background (Anchored cleanly to bottom) */}
        <div className="relative w-full flex flex-col justify-end overflow-hidden pointer-events-none z-0 mt-4 sm:mt-6">
          <CommunityHeroLandscape className="w-full h-[130px] sm:h-[160px] md:h-[190px] lg:h-[210px]" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3 PLATFORM DESKS PREVIEW (ADMIN, GATE TABLET, RESIDENT APP) - POSITIONED JUST BELOW HERO */}
      {/* ========================================================================= */}
      <section id="product" className="mx-auto max-w-7xl px-4 py-16 md:px-8 border-t border-line/60">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end mb-10">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary mb-3">
              <Layers size={14} /> COLLABORATIVE ESTATE ECOSYSTEM
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f2b5c] dark:text-white tracking-tight leading-[1.12]">
              One Unified Society, Three Specialized Desks
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted font-medium max-w-2xl leading-relaxed">
              Eliminate information silos. The same live records move seamlessly in real-time between the committee office, security tablet, and resident app.
            </p>
          </div>
          <div className="lg:col-span-4 flex items-center lg:justify-end gap-3">
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Real-Time Auto Sync
            </span>
          </div>
        </div>

        <WindowChrome title="app.smartgate.io/society-os">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Desk 1: Society Admin ERP */}
            <div className="rounded-2xl border border-line bg-card p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary transition group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-primary group-hover:scale-105 transition">
                    <Building2 size={22} />
                  </div>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                    Committee ERP
                  </span>
                </div>
                <h4 className="text-lg font-black text-foreground">1. Society Admin Desk</h4>
                <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
                  Full facility overview: manage registered flats, verify residents, issue work orders, and download audit-ready compliance logs.
                </p>
              </div>
              <Link to="/society" className="mt-5 pt-3 border-t border-line inline-flex items-center justify-between text-xs font-black text-primary hover:underline">
                <span>Open Admin Portal</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            {/* Desk 2: Gate Sentinel Kiosk */}
            <div className="rounded-2xl border border-line bg-card p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary transition group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 group-hover:scale-105 transition">
                    <DoorOpen size={22} />
                  </div>
                  <span className="rounded-full bg-amber-50 dark:bg-amber-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Guard Tablet
                  </span>
                </div>
                <h4 className="text-lg font-black text-foreground">2. Gate Sentinel Kiosk</h4>
                <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
                  Touch-screen tablet for guards: 6-digit code verification, helper face comparison check, parcel handover OTP, and shift sign-out.
                </p>
              </div>
              <Link to="/gate" className="mt-5 pt-3 border-t border-line inline-flex items-center justify-between text-xs font-black text-amber-700 dark:text-amber-400 hover:underline">
                <span>Launch Gate Kiosk</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            {/* Desk 3: Resident Portal */}
            <div className="rounded-2xl border border-line bg-card p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary transition group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 group-hover:scale-105 transition">
                    <Smartphone size={22} />
                  </div>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Mobile & Web
                  </span>
                </div>
                <h4 className="text-lg font-black text-foreground">3. Resident Mobile App</h4>
                <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
                  100% responsive across mobile & desktop. Fast pre-approvals: Cabs with 4-digit PIN, visiting help categories, and surprise delivery stealth mode.
                </p>
              </div>
              <Link to="/resident" className="mt-5 pt-3 border-t border-line inline-flex items-center justify-between text-xs font-black text-emerald-700 dark:text-emerald-400 hover:underline">
                <span>Explore Resident App</span>
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </WindowChrome>
      </section>

      {/* ========================================================================= */}
      {/* SECTION: VISITOR, CAB, DELIVERY & STAFF MANAGEMENT (Echoing Reference Flow) */}
      {/* ========================================================================= */}
      <section id="visitor-management" className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24 border-t border-line/60">
        {/* Dynamic Dual-Column Header Layout */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end mb-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary mb-3">
              <ShieldCheck size={14} /> AI GATE SENTINEL · ZERO MANUAL REGISTERS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0f2b5c] dark:text-white leading-[1.12]">
              Smart Visitor, Cab, Delivery & Staff Management
            </h2>
            <p className="mt-3.5 text-base sm:text-lg text-muted max-w-2xl font-medium leading-relaxed">
              Eliminate paper visitor logbooks and entry queues. AI Smartgate Estate OS connects your gate sentinel guards, resident smartphones, and delivery partners into a single verified entry pipeline.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <div className="rounded-2xl border border-line bg-card/85 p-4 shadow-sm backdrop-blur">
              <div className="text-2xl font-black text-primary">&lt; 3 Sec</div>
              <div className="text-xs font-black text-foreground mt-0.5">Gate Clearance</div>
              <p className="text-[11px] text-muted mt-1 leading-normal font-medium">Fast OTP & dynamic QR scan at the boom barrier.</p>
            </div>
            <div className="rounded-2xl border border-line bg-card/85 p-4 shadow-sm backdrop-blur">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs font-black text-foreground mt-0.5">Pre-Approved</div>
              <p className="text-[11px] text-muted mt-1 leading-normal font-medium">Zero unverified walk-ins without flat clearance.</p>
            </div>
          </div>
        </div>

        {/* Central Illustrated Showcase with User's Artwork & Interactive Floating Status Badges */}
        <div className="relative mb-14 rounded-none border border-line/80 dark:border-white/10 bg-gradient-to-b from-blue-50/50 via-card to-card dark:from-[#0a1628] dark:via-[#0c1d38] dark:to-[#081220] p-4 sm:p-8 lg:p-10 shadow-xl shadow-blue-500/5 overflow-hidden">
          {/* Subtle Ambient Light Accents */}
          <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />

          {/* Floating Smart Badges (Desktop Overlay framing the 4 key touchpoints in the artwork) */}
          <div className="relative z-10">
            {/* Top-Left: Guest Car Badge */}
            <div className="hidden lg:inline-flex absolute top-2 left-2 items-center gap-3 rounded-2xl border border-white/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md transition hover:scale-105 z-20">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white font-black text-xs shadow-md shadow-blue-600/30">
                <Car size={18} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-foreground">Guest Sedan #KA-03-MB-2024</span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400">Pass Verified</span>
                </div>
                <p className="text-[10px] text-muted font-bold">Visiting Flat B-201 · Pre-Approved by Sai Prithvi</p>
              </div>
            </div>

            {/* Top-Right: Delivery Scooter Badge */}
            <div className="hidden lg:inline-flex absolute top-2 right-2 items-center gap-3 rounded-2xl border border-white/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md transition hover:scale-105 z-20">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-white font-black text-xs shadow-md shadow-amber-500/30">
                <PackageCheck size={18} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-foreground">Verified Delivery Partner</span>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 text-[9px] font-black text-primary">OTP Matched</span>
                </div>
                <p className="text-[10px] text-muted font-bold">Swiggy & Amazon · Gate Parcel Drop Option</p>
              </div>
            </div>

            {/* Bottom-Left: Gate Sentinel Tablet Beacon */}
            <div className="hidden lg:inline-flex absolute bottom-2 left-2 items-center gap-3 rounded-2xl border border-white/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md transition hover:scale-105 z-20">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-600/30">
                <ShieldCheck size={18} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-foreground">AI Gate Sentinel Station</span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400">Live Sync</span>
                </div>
                <p className="text-[10px] text-muted font-bold">Boom Barrier Auto-Trigger · 3-Sec Fast Scan</p>
              </div>
            </div>

            {/* Bottom-Right: Staff Badge */}
            <div className="hidden lg:inline-flex absolute bottom-2 right-2 items-center gap-3 rounded-2xl border border-white/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md transition hover:scale-105 z-20">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-600 text-white font-black text-xs shadow-md shadow-purple-600/30">
                <Users size={18} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-foreground">Maintenance & Daily Help</span>
                  <span className="rounded-full bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 text-[9px] font-black text-purple-600 dark:text-purple-400">Clocked In</span>
                </div>
                <p className="text-[10px] text-muted font-bold">ID #STF-402 · Electrician, Plumber & Cook Active</p>
              </div>
            </div>

            {/* Main Hero Showcase Artwork */}
            <div className="flex items-center justify-center py-4 sm:py-6 lg:py-8">
              <img
                src="/visitor-management-hero.png"
                alt="Smart Visitor, Cab, Delivery & Staff Management Pipeline"
                className="w-full max-w-[760px] h-auto max-h-[460px] object-contain rounded-2xl mx-auto filter drop-shadow-[0_16px_36px_rgba(15,43,92,0.14)] transition duration-500 hover:scale-[1.01]"
                loading="lazy"
              />
            </div>
          </div>

          {/* Interactive Mobile & Tablet Pills (Shown cleanly below image on screens < lg) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:hidden">
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card/90 p-2.5 text-xs font-bold shadow-xs">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/10 text-primary shrink-0">
                <Car size={15} />
              </div>
              <div>
                <span className="text-foreground">Guest Sedan Pass #GP-8492</span>
                <p className="text-[10px] text-muted font-medium">Pre-Approved Clearance</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card/90 p-2.5 text-xs font-bold shadow-xs">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                <PackageCheck size={15} />
              </div>
              <div>
                <span className="text-foreground">Delivery Rider OTP Validated</span>
                <p className="text-[10px] text-muted font-medium">Swiggy & Amazon Express</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card/90 p-2.5 text-xs font-bold shadow-xs">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                <ShieldCheck size={15} />
              </div>
              <div>
                <span className="text-foreground">AI Gate Sentinel Desk</span>
                <p className="text-[10px] text-muted font-medium">Automatic Barrier Trigger</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card/90 p-2.5 text-xs font-bold shadow-xs">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-purple-500/10 text-purple-600 shrink-0">
                <Users size={15} />
              </div>
              <div>
                <span className="text-foreground">Domestic Staff Clocked In</span>
                <p className="text-[10px] text-muted font-medium">Maid & Driver Attendance</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Enhanced Specialized Management Cards with Rich Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Guests & Visitors */}
          <div className="rounded-none border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-b from-blue-50/40 via-card to-card p-6 shadow-sm hover:shadow-xl hover:border-primary transition group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/25 group-hover:scale-110 transition">
                  <UserCheck size={24} />
                </div>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                  6-Digit OTP / QR
                </span>
              </div>
              <h3 className="text-xl font-black text-foreground">Guest & Visitor Clearance</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
                Residents generate instant shareable digital invites via WhatsApp. Sentinel tablets scan the QR pass in 3 seconds or trigger 1-tap resident mobile approval.
              </p>

              {/* Live Preview Mini UI */}
              <div className="mt-4 rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/40 p-3 text-[11px]">
                <div className="flex items-center justify-between text-primary font-black">
                  <span>PASS: #849201</span>
                  <span className="text-[9px] uppercase bg-primary text-white px-1.5 py-0.5 rounded">Active</span>
                </div>
                <div className="text-muted font-bold mt-1">Visitor: Rohan Sharma · Flat B-201</div>
              </div>
            </div>

            <Link
              to="/resident"
              className="mt-5 pt-3.5 border-t border-line text-xs font-black text-primary flex items-center justify-between group-hover:translate-x-0.5 transition"
            >
              <span>Pre-Approve Guest Pass</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          {/* Card 2: Cabs & Taxis */}
          <div className="rounded-none border border-sky-200/80 dark:border-sky-900/60 bg-gradient-to-b from-sky-50/40 via-card to-card p-6 shadow-sm hover:shadow-xl hover:border-sky-500 transition group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/25 group-hover:scale-110 transition">
                  <Car size={24} />
                </div>
                <span className="rounded-full bg-sky-100 dark:bg-sky-950/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  4-Digit Vehicle PIN
                </span>
              </div>
              <h3 className="text-xl font-black text-foreground">Cab & Taxi Express Lane</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
                Pre-approved Uber & Ola rides pass through boom barriers automatically by speaking a 4-digit PIN. Automated 15-minute overstay timer ensures zero cab loitering.
              </p>

              {/* Live Preview Mini UI */}
              <div className="mt-4 rounded-xl border border-sky-200/70 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/40 p-3 text-[11px]">
                <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 font-black">
                  <span>CAB PIN: 3918</span>
                  <span className="text-[9px] uppercase bg-sky-500 text-white px-1.5 py-0.5 rounded">15m Window</span>
                </div>
                <div className="text-muted font-bold mt-1">Uber Premier · KA-01-AB-1234</div>
              </div>
            </div>

            <Link
              to="/resident"
              className="mt-5 pt-3.5 border-t border-line text-xs font-black text-sky-600 dark:text-sky-400 flex items-center justify-between group-hover:translate-x-0.5 transition"
            >
              <span>Pre-Approve Cab PIN</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          {/* Card 3: Deliveries & Parcels */}
          <div className="rounded-none border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/40 via-card to-card p-6 shadow-sm hover:shadow-xl hover:border-amber-500 transition group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/25 group-hover:scale-110 transition">
                  <PackageCheck size={24} />
                </div>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Surprise & Gate Drop
                </span>
              </div>
              <h3 className="text-xl font-black text-foreground">Delivery & Parcel Handover</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
                Real-time delivery arrival alerts with 'Leave at Gate' pickup PIN and photo verification. Stealth mode ensures birthday gifts and surprise cakes stay secret!
              </p>

              {/* Live Preview Mini UI */}
              <div className="mt-4 rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/40 p-3 text-[11px]">
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-black">
                  <span>PARCEL: Amazon</span>
                  <span className="text-[9px] uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded">Stealth ON</span>
                </div>
                <div className="text-muted font-bold mt-1">Surprise Delivery · Gate Locker Ready</div>
              </div>
            </div>

            <Link
              to="/resident"
              className="mt-5 pt-3.5 border-t border-line text-xs font-black text-amber-700 dark:text-amber-400 flex items-center justify-between group-hover:translate-x-0.5 transition"
            >
              <span>Delivery Handover OTP</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          {/* Card 4: Domestic Staff & Help */}
          <div className="rounded-none border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/40 via-card to-card p-6 shadow-sm hover:shadow-xl hover:border-emerald-500 transition group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 group-hover:scale-110 transition">
                  <Users size={24} />
                </div>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Photo ID & Attendance
                </span>
              </div>
              <h3 className="text-xl font-black text-foreground">Staff & Daily Help Roster</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
                Biometric & photo pass registry for maids, cooks, drivers, and electricians. Real-time arrival ping alerts the flat resident the instant their daily help clocks in.
              </p>

              {/* Live Preview Mini UI */}
              <div className="mt-4 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/40 p-3 text-[11px]">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-black">
                  <span>STAFF: Lakshmi B.</span>
                  <span className="text-[9px] uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded">Checked In</span>
                </div>
                <div className="text-muted font-bold mt-1">Cook & Maid · 08:30 AM Entry Logged</div>
              </div>
            </div>

            <Link
              to="/society"
              className="mt-5 pt-3.5 border-t border-line text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center justify-between group-hover:translate-x-0.5 transition"
            >
              <span>View Staff Directory</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION: SOCIETY GUARD - DIGITAL & SMART TRACKING (Echoing Reference Image) */}
      {/* ========================================================================= */}
      <section id="society-guard" className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 border-t border-line/60">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end mb-12">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary mb-3">
              <ShieldCheck size={14} /> PHYSICAL GATE AUTOMATION · SENTINEL DESK
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0f2b5c] dark:text-white leading-[1.12]">
              Society Guard Sentinel Operations
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted font-medium max-w-2xl leading-relaxed">
              Convert manual boom gates and handwritten entry registers into high-speed digital checkpoints. Real-time vehicle logging, automated boom barrier triggers, and multi-lingual guard tablets.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-wrap gap-2.5 lg:justify-end">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-card/80 px-4 py-2.5 text-xs font-bold text-foreground shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Boom Barrier Sync</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-card/80 px-4 py-2.5 text-xs font-bold text-foreground shadow-sm">
              <Globe2 size={14} className="text-primary" />
              <span>English, Hindi & Regional</span>
            </div>
          </div>
        </div>

        {/* 2x2 Grid Structure matching Image 2 with enhanced customer-facing UI */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: Visitor In/Out Tracking */}
          <Link
            to="/gate"
            className="group rounded-none border border-line bg-card p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-primary transition-all duration-300 flex items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="relative shrink-0 grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-primary border border-blue-100 dark:border-blue-900/60 group-hover:scale-105 transition">
                <QrCode size={30} className="stroke-[2.2]" />
                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white text-[10px] font-black">
                  ✓
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground group-hover:text-primary transition">
                    Visitor In/Out Tracking
                  </h3>
                  <span className="rounded-md bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 text-[9px] font-black uppercase text-primary">Live Log</span>
                </div>
                <p className="mt-1.5 text-xs text-muted leading-relaxed font-medium">
                  Instant call & notification for visitor arrival, staff in/out with QR codes & 6-digit OTPs, and emergency resident alerts.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-muted group-hover:text-primary group-hover:translate-x-1 transition">
              <ChevronRight size={22} className="stroke-[2.5]" />
            </div>
          </Link>

          {/* Card 2: Parking Management */}
          <Link
            to="/gate"
            className="group rounded-none border border-line bg-card p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-primary transition-all duration-300 flex items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="relative shrink-0 grid h-16 w-16 place-items-center rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/60 group-hover:scale-105 transition">
                <ParkingSquare size={30} className="stroke-[2.2]" />
                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-white text-[9px] font-black">
                  P
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground group-hover:text-sky-600 transition">
                    Parking Management
                  </h3>
                  <span className="rounded-md bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 text-[9px] font-black uppercase text-sky-600">Bay Allocation</span>
                </div>
                <p className="mt-1.5 text-xs text-muted leading-relaxed font-medium">
                  Visitor bay allocation, wrong-parking alerts, instant vehicle owner lookup by license plate, and 15-minute cab drop timers.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-muted group-hover:text-primary group-hover:translate-x-1 transition">
              <ChevronRight size={22} className="stroke-[2.5]" />
            </div>
          </Link>

          {/* Card 3: Pickup/Courier Arrival Alert */}
          <Link
            to="/resident"
            className="group rounded-none border border-line bg-card p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-primary transition-all duration-300 flex items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="relative shrink-0 grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60 group-hover:scale-105 transition">
                <BellRing size={30} className="stroke-[2.2]" />
                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-white text-[9px] font-black">
                  !
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground group-hover:text-amber-600 transition">
                    Pickup/Courier Arrival Alert
                  </h3>
                  <span className="rounded-md bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 text-[9px] font-black uppercase text-amber-600">Audio Buzz</span>
                </div>
                <p className="mt-1.5 text-xs text-muted leading-relaxed font-medium">
                  Automated audio notification & app buzz for school bus arrivals, pickup taxis, courier arrivals, and gate package drop-offs.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-muted group-hover:text-primary group-hover:translate-x-1 transition">
              <ChevronRight size={22} className="stroke-[2.5]" />
            </div>
          </Link>

          {/* Card 4: Support Multiple Languages */}
          <Link
            to="/gate"
            className="group rounded-none border border-line bg-card p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-primary transition-all duration-300 flex items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4">
              <div className="relative shrink-0 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 group-hover:scale-105 transition">
                <Languages size={30} className="stroke-[2.2]" />
                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white text-[9px] font-black">
                  Aa
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground group-hover:text-emerald-600 transition">
                    Support Multiple Languages
                  </h3>
                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-600">5+ Regional</span>
                </div>
                <p className="mt-1.5 text-xs text-muted leading-relaxed font-medium">
                  Guard tablet interface optimized in English, Hindi, Kannada, Telugu, and Tamil with large voice prompts and oversized buttons.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-muted group-hover:text-primary group-hover:translate-x-1 transition">
              <ChevronRight size={22} className="stroke-[2.5]" />
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6 FOUNDATION PILLARS (Harmonized Brand Colors & Professional Layout)      */}
      {/* ========================================================================= */}
      <section id="why-platform" className="mx-auto max-w-7xl px-4 py-16 md:px-8 border-t border-line/60">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end mb-12">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary mb-3">
              <ShieldAlert size={14} /> ENTERPRISE INTEGRITY & COMPLIANCE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0f2b5c] dark:text-white leading-[1.12]">
              Why Well-Run Communities Choose AI Smartgate Estate OS
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted font-medium max-w-2xl leading-relaxed">
              Engineered specifically for residential welfare associations, high-rise condominiums, and gated townships who value privacy and zero commercial advertising.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-wrap gap-2.5 lg:justify-end">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-card/80 px-4 py-2.5 text-xs font-bold text-foreground shadow-sm">
              <Lock size={14} className="text-emerald-500" />
              <span>100% DPDP Act Compliant</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-card/80 px-4 py-2.5 text-xs font-bold text-foreground shadow-sm">
              <Zap size={14} className="text-amber-500" />
              <span>99.98% Sentinel Uptime SLA</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: 100% Ad-Free */}
          <div className="glass rounded-none p-6 border-t-4 border-t-primary shadow-sm hover:shadow-xl transition">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-primary mb-4">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-black text-foreground">100% Ad-Free, Since Day One</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
              No sponsored ads, no uninvited commercial banners. Your community feed stays exclusively yours with zero marketing spam.
            </p>
          </div>

          {/* Card 2: No Conflict of Interest */}
          <div className="glass rounded-none p-6 border-t-4 border-t-emerald-500 shadow-sm hover:shadow-xl transition">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mb-4">
              <HeartHandshake size={24} />
            </div>
            <h3 className="text-lg font-black text-foreground">No Conflict of Interest</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
              We never monetize your residents' personal data or sell grocery subscriptions. We answer exclusively to the management committee.
            </p>
          </div>

          {/* Card 3: DPDP Certified */}
          <div className="glass rounded-none p-6 border-t-4 border-t-sky-500 shadow-sm hover:shadow-xl transition">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 mb-4">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-black text-foreground">DPDP Certified Consent Framework</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
              Engineered with full compliance with the Digital Personal Data Protection Act. Explicit consent recorded for every entry.
            </p>
          </div>

          {/* Card 4: 50+ Hardware Integrations */}
          <div className="glass rounded-none p-6 border-t-4 border-t-indigo-500 shadow-sm hover:shadow-xl transition">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 mb-4">
              <Cpu size={24} />
            </div>
            <h3 className="text-lg font-black text-foreground">50+ Hardware & IoT Integrations</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
              Boom barriers, ANPR vehicle cameras, biometrics, RFID tags, and clubhouse access gates deeply integrated with the software.
            </p>
          </div>

          {/* Card 5: Multi-Country Trust */}
          <div className="glass rounded-none p-6 border-t-4 border-t-blue-600 shadow-sm hover:shadow-xl transition">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 mb-4">
              <Globe2 size={24} />
            </div>
            <h3 className="text-lg font-black text-foreground">Trusted Across Communities</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
              Powering premium societies, high-rise towers, and residential estates with verified 99.98% service uptime.
            </p>
          </div>

          {/* Card 6: 1,250+ Enterprise Features */}
          <div className="glass rounded-none p-6 border-t-4 border-t-cyan-500 shadow-sm hover:shadow-xl transition">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 mb-4">
              <Layers size={24} />
            </div>
            <h3 className="text-lg font-black text-foreground">1,250+ Reliable ERP Features</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed font-medium">
              From work order generation to automatic parcel lockers, visitor PINs, and automated accounting ledgers.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PRICING PLANS SECTION (Integrated with Razorpay test checkout) */}
      {/* ========================================================================= */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 md:px-8 border-t border-line/60">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end mb-12">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary mb-3">
              <CreditCard size={14} /> TRANSPARENT SOCIETY BILLING
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f2b5c] dark:text-white tracking-tight leading-[1.12]">
              Choose Your AI Smartgate Estate OS Plan
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted font-medium max-w-2xl leading-relaxed">
              Straightforward pricing without hidden per-resident surcharges. All plans include automated Razorpay collection, unlimited resident app users, and gate kiosk licenses.
            </p>
          </div>

          <div className="lg:col-span-4 flex items-center lg:justify-end gap-3">
            <div className="rounded-2xl border border-line bg-card/80 px-4 py-2 text-xs font-bold text-muted shadow-sm">
              ⚡ Razorpay Test Payments Enabled
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => {
            const isPopular = plan.id === "plan-professional";
            return (
              <div
                key={plan.id}
                className={`relative rounded-none border p-8 flex flex-col justify-between transition ${isPopular
                    ? "border-primary bg-white dark:bg-[#0c1833] shadow-2xl ring-2 ring-primary/30"
                    : "border-line bg-card shadow-sm hover:shadow-lg"
                  }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    Most Popular Choice
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
                  <p className="text-3xl font-black text-primary mt-3">
                    {formatMoney(plan.monthlyPrice)}
                    <span className="text-xs text-muted font-normal"> / month</span>
                  </p>
                  <p className="text-xs text-muted mt-1 font-medium">Up to {plan.maxUnits} flats · {plan.maxGates} gate kiosks</p>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 font-medium">
                        <Check size={16} className="text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                    <li className="flex items-center gap-2 font-medium">
                      <Check size={16} className="text-emerald-500 shrink-0" />
                      <span>Razorpay payment gateway integration</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-line">
                  <Link
                    to="/buy"
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-lg text-xs font-black transition cursor-pointer ${isPopular
                        ? "bg-primary text-white hover:brightness-105 shadow-md shadow-primary/25"
                        : "border border-line bg-card hover:bg-soft text-foreground"
                      }`}
                  >
                    Select {plan.name} Plan →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Customer Trust Strip */}
        <div className="mt-12 rounded-none border border-line bg-card/60 p-6 backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-foreground">Zero Setup Fee</p>
                <p className="text-[11px] text-muted font-medium">Free data onboarding support</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-foreground">Instant Activation</p>
                <p className="text-[11px] text-muted font-medium">Immediate admin credentials</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-foreground">99.98% Uptime SLA</p>
                <p className="text-[11px] text-muted font-medium">Uninterrupted gate security</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-foreground">DPDP Compliant</p>
                <p className="text-[11px] text-muted font-medium">Audited consent data vault</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Upgrade Conversion Section - Outside and Directly Above Footer */}
      <ReadyToUpgradeSection />

      {/* Modern Industry-Standard Enterprise Footer */}
      <SiteFooter />
    </div>
  );
}

const BUY_CITY_PRESETS = [
  { city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { city: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { city: "New Delhi", state: "Delhi NCR", lat: 28.6139, lng: 77.209 },
  { city: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
];

export function BuyPage() {
  const plans = useData((state) => state.db.plans);
  const createSociety = useData((state) => state.createSociety);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedSociety | null>(null);
  const [paying, setPaying] = useState(false);
  const [testPay, setTestPay] = useState<HTMLFormElement | null>(null);
  const [buyPhoto, setBuyPhoto] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("plan-professional");
  const [copiedCode, setCopiedCode] = useState(false);

  // Geolocation capture state for live mapping
  const [buyCity, setBuyCity] = useState("Bengaluru");
  const [buyState, setBuyState] = useState("Karnataka");
  const [buyLat, setBuyLat] = useState<number | null>(12.9716);
  const [buyLng, setBuyLng] = useState<number | null>(77.5946);
  const [isLocating, setIsLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  function detectLiveLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by this browser.", "GPS Error");
      return;
    }
    setIsLocating(true);
    setGeoNotice("Detecting live device GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        setIsLocating(false);
        setBuyLat(lat);
        setBuyLng(lng);
        setGeoNotice(`📍 Live GPS Captured: ${lat}° N, ${lng}° E`);
        toast.success(`Live GPS Captured: ${lat}° N, ${lng}° E`, "Location Verified");
      },
      (err) => {
        setIsLocating(false);
        setGeoNotice(null);
        toast.warning(`GPS unavailable (${err.message}). Defaulting to city preset.`, "GPS Notice");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // OTP Verification state for Society Admin setup
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingSocietyData, setPendingSocietyData] = useState<{
    form: HTMLFormElement;
    paid: boolean;
    paymentId?: string;
    email: string;
    phone: string;
  } | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1] || plans[0];

  function requestSubmit(form: HTMLFormElement, paid: boolean, paymentId?: string) {
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const adminEmail = String(data.get("adminEmail") || "").trim();
    const adminPhone = String(data.get("adminPhone") || "").trim();
    const adminPassword = String(data.get("adminPassword") || "").trim();

    if (!name) {
      setError("Please enter the society name.");
      toast.field("Society Name", "Please enter your housing society or apartment name.", "warning");
      return;
    }
    if (!adminEmail) {
      setError("Please enter the administrator email address.");
      toast.field("Admin Email", "Admin email is required for login.", "warning");
      return;
    }
    if (!adminPhone || adminPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number for society admin verification.");
      toast.field("Admin Mobile", "10-digit mobile number is required.", "warning");
      return;
    }
    if (!adminPassword || adminPassword.length < 6) {
      setError("Admin password must be at least 6 characters.");
      toast.field("Password", "Password must be at least 6 characters.", "warning");
      return;
    }

    setError(null);
    setPendingSocietyData({ form, paid, paymentId, email: adminEmail, phone: adminPhone });
    setShowOtpModal(true);
  }

  function handleSocietyVerificationSuccess() {
    if (!pendingSocietyData) return;
    setShowOtpModal(false);
    const { form, paid, paymentId } = pendingSocietyData;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();

    const result = createSociety({
      name,
      address: String(data.get("address") || ""),
      city: buyCity,
      state: buyState,
      latitude: buyLat ?? 12.9716,
      longitude: buyLng ?? 77.5946,
      planId: selectedPlanId,
      adminName: String(data.get("adminName") || ""),
      adminEmail: String(data.get("adminEmail") || ""),
      adminPhone: String(data.get("adminPhone") || ""),
      adminPassword: String(data.get("adminPassword") || ""),
      paid,
      paymentId: paymentId ?? null,
      photo: buyPhoto,
    });

    if ("error" in result) {
      setError(result.error);
      toast.error(result.error, "Society Setup Failed");
      setCreated(null);
      return;
    }
    setError(null);
    setCreated(result);
    toast.success(`Society "${name}" verified and created with code ${result.code}!`, "Society Activated");
  }

  return (
    <div className="site-canvas min-h-screen flex flex-col justify-between relative selection:bg-primary/20 overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[380px] w-[900px] rounded-full bg-gradient-to-r from-blue-400/20 via-sky-300/20 to-teal-400/15 blur-[120px] dark:from-blue-600/15" />

      {/* BACKGROUND BUILDINGS LANDSCAPE - Spans Full Width Directly Behind The Modals */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-0 w-full overflow-hidden flex flex-col justify-end select-none">
        <CommunityHeroLandscape className="w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[290px] xl:h-[320px]" />
      </div>

      <SiteHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:py-12 md:px-8 w-full flex-1">
        {/* Page Top Title Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary mb-3">
            <Sparkles size={13} /> ENTERPRISE PROCUREMENT · ZERO SETUP FEE
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f2b5c] dark:text-white tracking-tight leading-[1.15]">
            Register Society & Activate Plan
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted font-medium max-w-2xl mx-auto leading-relaxed">
            Equip your gates and residents with AI-powered entry clearance, guard sentinel kiosks, automated billing, and zero commercial advertising.
          </p>
        </div>

        {created ? (
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-[32px] p-6 sm:p-10 backdrop-blur-2xl bg-card/90 dark:bg-[#0c1a30]/90 shadow-[0_20px_60px_rgba(15,43,92,0.12)] border border-line/80 dark:border-white/10 text-center space-y-6">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 shadow-lg shadow-emerald-500/20">
                <Check size={32} className="stroke-[3]" />
              </div>

              <div>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                  Active & Operational
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-black text-foreground">
                  {created.societyName} is Live!
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted font-medium">
                  Your society workspace and database have been provisioned in the secure cloud cluster.
                </p>
              </div>

              {/* Resident Join Code Box */}
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 text-center">
                <p className="text-[11px] font-black uppercase tracking-wider text-primary">
                  Resident Invitation Join Code
                </p>
                <p className="text-3xl sm:text-4xl font-black tracking-widest text-foreground mt-1">
                  {created.code}
                </p>
                <p className="mt-1.5 text-xs text-muted font-medium">
                  Residents can use this 6-character code at <span className="font-bold text-foreground">/signup</span> to link their flats.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(created.code);
                    setCopiedCode(true);
                    toast.success(`Copied society join code "${created.code}" to clipboard!`, "Code Copied");
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-soft cursor-pointer transition shadow-xs"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-500" /> : <QrCode size={14} className="text-primary" />}
                  <span>{copiedCode ? "Copied Code!" : "Copy Join Code"}</span>
                </button>
              </div>

              {/* Administrator Sign-In Credentials Box */}
              <div className="rounded-2xl border border-line bg-soft/60 p-5 text-left space-y-2.5">
                <p className="text-xs font-black uppercase tracking-wider text-muted">
                  Administrator Sign In Credentials
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-line/60 bg-card p-3">
                    <p className="text-[10px] font-bold text-muted uppercase">Admin Email</p>
                    <p className="font-black text-foreground text-sm mt-0.5 truncate">{created.email}</p>
                  </div>
                  <div className="rounded-xl border border-line/60 bg-card p-3">
                    <p className="text-[10px] font-bold text-muted uppercase">Initial Password</p>
                    <p className="font-black text-primary text-sm mt-0.5">{created.password}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/login"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-sm font-black text-white hover:brightness-105 shadow-xl shadow-primary/25 transition cursor-pointer"
                >
                  Sign In to Society Admin Portal <ArrowRight size={16} />
                </Link>
                <Link
                  to="/gate"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-card px-6 text-xs font-black text-foreground hover:bg-soft transition cursor-pointer"
                >
                  <DoorOpen size={16} className="text-amber-600" /> Launch Gate Kiosk
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Column: Interactive Plan Selector & Trust Badges */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <CreditCard size={18} className="text-primary" /> Step 1: Choose Subscription Plan
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                    Cancel Anytime
                  </span>
                </div>

                <div className="space-y-3">
                  {plans.map((p) => {
                    const isSelected = p.id === selectedPlanId;
                    const isPopular = p.id === "plan-professional";
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`relative rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-lg ring-2 ring-primary/30"
                            : "border-line bg-card hover:border-primary/40 hover:bg-soft/40 shadow-xs"
                          }`}
                      >
                        {isPopular && (
                          <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-3 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                            Most Popular
                          </span>
                        )}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-foreground">{p.name}</h4>
                              {isSelected && (
                                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
                                  <Check size={12} className="stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted mt-0.5 font-medium">
                              Up to {p.maxUnits} flats · {p.maxGates} gate kiosks
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-primary">
                              {formatMoney(p.monthlyPrice)}
                            </p>
                            <p className="text-[10px] text-muted font-medium">/ month</p>
                          </div>
                        </div>

                        <ul className="mt-3 pt-3 border-t border-line/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-muted font-medium">
                          {p.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guarantees & DPDP Compliance Card */}
              <div className="glass rounded-[28px] p-5 sm:p-6 border border-line bg-card/65 backdrop-blur shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-500" /> Platform Guarantees
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-line/70 bg-soft/60">
                    <p className="font-black text-foreground">100% DPDP Act</p>
                    <p className="text-[10px] text-muted font-medium mt-0.5">Audited Indian residency & encryption.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-line/70 bg-soft/60">
                    <p className="font-black text-foreground">Zero Hardware Lock</p>
                    <p className="text-[10px] text-muted font-medium mt-0.5">Runs on standard Android/iPads.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-line/70 bg-soft/60">
                    <p className="font-black text-foreground">30-Day Money Back</p>
                    <p className="text-[10px] text-muted font-medium mt-0.5">Full refund if unsatisfied.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-line/70 bg-soft/60">
                    <p className="font-black text-foreground">99.98% Sentinel SLA</p>
                    <p className="text-[10px] text-muted font-medium mt-0.5">Continuous gate uptime.</p>
                  </div>
                </div>

                <div className="pt-2 text-center border-t border-line/60">
                  <Link to="/request-demo" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                    Need a custom committee procurement walkthrough? Request demo <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Society Registration Form & Razorpay Payment */}
            <div className="lg:col-span-7">
              <div className="glass rounded-[32px] p-6 sm:p-8 backdrop-blur-2xl bg-card/90 dark:bg-[#0c1a30]/90 shadow-[0_20px_60px_rgba(15,43,92,0.12)] border border-line/80 dark:border-white/10">
                <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
                  <div>
                    <h3 className="text-lg font-black text-foreground">
                      Step 2: Society Setup & Admin Account
                    </h3>
                    <p className="text-xs text-muted font-medium mt-0.5">
                      Your credentials will give you full access to the society dashboard.
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                    Instant Setup
                  </span>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  {error && <ErrorNote>{error}</ErrorNote>}

                  {testPay && (
                    <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 p-4 text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" />
                        <p className="font-black text-sm text-foreground">Razorpay Test Mode Simulator</p>
                      </div>
                      <p className="text-muted">
                        Test merchant key <code className="font-bold text-foreground">rzp_test_TfRHsgXUj1hunV</code> is active. Click below to simulate successful payment authorization.
                      </p>
                      <div className="flex gap-2 pt-1.5">
                        <Button
                          type="button"
                          onClick={() => {
                            requestSubmit(testPay, true, `pay_test_${Date.now()}`);
                            setTestPay(null);
                          }}
                          className="text-xs font-black cursor-pointer"
                        >
                          Confirm & Complete Test Payment
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setTestPay(null)} className="text-xs cursor-pointer">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Society Details */}
                  <div className="space-y-3">
                    <Field label="Society / Community Name *">
                      <TextInput name="name" required placeholder="e.g. Grandeur Palms" />
                    </Field>

                    {/* Geolocation Section */}
                    <div className="rounded-2xl border border-blue-200/90 bg-blue-50/60 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                            <Navigation size={13} className="text-blue-600" /> Live Geolocation Capture
                          </p>
                          <p className="text-[10px] text-muted font-medium">
                            Automatically plots your society on the India Sentinel Radar
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={detectLiveLocation}
                          disabled={isLocating}
                          className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer transition shadow-xs"
                        >
                          {isLocating ? "Acquiring..." : "📍 Detect Live Location"}
                        </button>
                      </div>

                      {geoNotice && (
                        <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                          {geoNotice}
                        </p>
                      )}

                      {/* City presets */}
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">
                          Or select city preset:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {BUY_CITY_PRESETS.map((p) => (
                            <button
                              type="button"
                              key={p.city}
                              onClick={() => {
                                setBuyCity(p.city);
                                setBuyState(p.state);
                                setBuyLat(p.lat);
                                setBuyLng(p.lng);
                                setGeoNotice(`📍 Mapped to ${p.city}, ${p.state}`);
                              }}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                buyCity === p.city
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {p.city}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Coordinates */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Latitude</span>
                          <span className="font-bold text-slate-800">{buyLat?.toFixed(4)}° N</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Longitude</span>
                          <span className="font-bold text-slate-800">{buyLng?.toFixed(4)}° E</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="City *">
                        <TextInput
                          name="city"
                          required
                          value={buyCity}
                          onChange={(e) => setBuyCity(e.target.value)}
                          placeholder="e.g. Bengaluru"
                        />
                      </Field>
                      <Field label="State *">
                        <TextInput
                          name="state"
                          required
                          value={buyState}
                          onChange={(e) => setBuyState(e.target.value)}
                          placeholder="e.g. Karnataka"
                        />
                      </Field>
                      <Field label="Selected Plan">
                        <SelectInput
                          name="planId"
                          value={selectedPlanId}
                          onChange={(e) => setSelectedPlanId(e.target.value)}
                        >
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatMoney(p.monthlyPrice)}/mo)
                            </option>
                          ))}
                        </SelectInput>
                      </Field>
                    </div>

                    <Field label="Full Address / Landmark *">
                      <TextInput name="address" required placeholder="Road, Locality, Landmark, PIN Code" />
                    </Field>

                    <PhotoField label="Building Picture (Optional)" value={buyPhoto} onChange={setBuyPhoto} />
                  </div>

                  {/* Admin Credentials */}
                  <div className="border-t border-line pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wider text-muted">
                        Administrator Sign In Credentials
                      </p>
                      <span className="text-[10px] text-muted font-semibold">Will be used to login</span>
                    </div>

                    <Field label="Admin Full Name *">
                      <TextInput name="adminName" required placeholder="e.g. Ramesh Kumar" />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Admin Email *">
                        <TextInput name="adminEmail" type="email" required placeholder="admin@society.dev" />
                      </Field>
                      <Field label="Admin Mobile *">
                        <TextInput name="adminPhone" required placeholder="10-digit mobile" />
                      </Field>
                    </div>
                    <Field label="Admin Password *">
                      <TextInput name="adminPassword" required minLength={6} defaultValue="SocietyAdmin@2026" />
                    </Field>
                  </div>

                  {/* Order Summary Strip */}
                  <div className="rounded-2xl border border-line bg-soft/80 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted">Plan Selected</span>
                      <span className="text-xs font-black text-foreground">{selectedPlan.name} Plan</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted">Flats & Gates Included</span>
                      <span className="text-xs font-bold text-foreground">Up to {selectedPlan.maxUnits} flats · {selectedPlan.maxGates} kiosks</span>
                    </div>
                    <div className="border-t border-line/60 pt-2 flex items-center justify-between">
                      <span className="text-sm font-black text-foreground">Total Subscription Fee</span>
                      <div className="text-right">
                        <span className="text-xl font-black text-primary">{formatMoney(selectedPlan.monthlyPrice)}</span>
                        <span className="text-xs text-muted font-normal"> / month</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2.5">
                    <Button
                      type="button"
                      className="w-full min-h-12 text-sm font-black cursor-pointer shadow-lg shadow-primary/25"
                      disabled={paying}
                      onClick={async (event) => {
                        event.preventDefault();
                        const form = event.currentTarget.form;
                        if (!form?.reportValidity()) return;
                        const data = new FormData(form);
                        const plan = plans.find((item) => item.id === selectedPlanId) || selectedPlan;
                        if (!plan) return;
                        if (razorpayTestMode()) {
                          setTestPay(form);
                          return;
                        }
                        setPaying(true);
                        setError(null);
                        try {
                          const payment = await openRazorpayCheckout({
                            amount: plan.monthlyPrice,
                            description: `${plan.name} Plan for ${String(data.get("name") || "Society")}`,
                            name: String(data.get("adminName") || ""),
                            email: String(data.get("adminEmail") || ""),
                          });
                          if (!payment) return;
                          requestSubmit(form, true, payment.paymentId);
                        } catch {
                          setTestPay(form);
                        } finally {
                          setPaying(false);
                        }
                      }}
                    >
                      <CreditCard size={18} /> {paying ? "Connecting to Razorpay…" : `Pay ${formatMoney(selectedPlan.monthlyPrice)} & Activate via Razorpay`}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-xs font-bold cursor-pointer"
                      onClick={(event) => {
                        const form = event.currentTarget.form;
                        if (form?.reportValidity()) requestSubmit(form, false);
                      }}
                    >
                      Start 30-Day Free Trial Instead (No Card Required)
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-muted">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Instant Digital Activation · 256-Bit Bank-Grade Security</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* OTP Verification Modal for Society Admin Registration */}
        {pendingSocietyData && (
          <OtpVerificationModal
            open={showOtpModal}
            onClose={() => setShowOtpModal(false)}
            email={pendingSocietyData.email}
            phone={pendingSocietyData.phone}
            purpose="registration"
            onVerificationComplete={handleSocietyVerificationSuccess}
          />
        )}
      </main>

      {/* Uniform Minimal Footer */}
      <footer className="relative z-20 py-4 text-center text-xs font-semibold text-muted border-t border-line/60 bg-white/50 dark:bg-[#070e1e]/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AppLogo size="sm" showSubtitle={false} />
            <span className="text-[11px]">· Smart Society Operating System</span>
          </div>
          <div className="flex gap-4 text-xs">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/login" className="hover:text-primary">Sign In</Link>
            <Link to="/signup" className="hover:text-primary">Join Society</Link>
            <Link to="/demo" className="hover:text-primary">Interactive Tour</Link>
            <Link to="/request-demo" className="hover:text-primary">Request Demo</Link>
          </div>
          <p className="text-[11px]">© 2026 AI Smartgate Estate OS · Smart Society Operating System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export function RequestDemoPage() {
  const requestDemo = useData((state) => state.requestDemo);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    if (!name) {
      setError("Please provide your name.");
      toast.field("Name Required", "Please enter your full name.", "warning");
      return;
    }
    if (!phone) {
      setError("Please provide a contact phone number.");
      toast.field("Mobile Number Required", "Please enter a valid phone number.", "warning");
      return;
    }

    const message = requestDemo({
      name,
      phone,
      email: String(form.get("email") || ""),
      societyName: String(form.get("societyName") || ""),
      city: String(form.get("city") || ""),
      message: String(form.get("message") || ""),
    });
    if (message) {
      setError(message);
      toast.error(message, "Demo Request Failed");
      setDone(false);
      return;
    }
    setError(null);
    setDone(true);
    toast.success("Demo requested! Our solution architect will contact your committee.", "Demo Scheduled");
  }

  return (
    <div className="site-canvas min-h-screen flex flex-col justify-between relative selection:bg-primary/20 overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[380px] w-[900px] rounded-full bg-gradient-to-r from-blue-400/20 via-sky-300/20 to-teal-400/15 blur-[120px] dark:from-blue-600/15" />

      <SiteHeader />

      <main className="relative z-10 mx-auto max-w-lg px-4 py-12 flex-1 w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary mb-3">
            <Sparkles size={13} /> DEDICATED ARCHITECTURE WALKTHROUGH
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0f2b5c] dark:text-white tracking-tight">
            Schedule a Live Demo
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted font-medium">
            Our team will walk your management committee through gate security, resident apps, and accounting.
          </p>
        </div>

        <div className="glass rounded-[32px] p-6 sm:p-8 backdrop-blur-2xl bg-card/90 dark:bg-[#0c1a30]/90 shadow-[0_20px_60px_rgba(15,43,92,0.12)] border border-line/80 dark:border-white/10">
          {done ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                <Check size={28} className="stroke-[3]" />
              </div>
              <h2 className="text-lg font-black text-foreground">Demo Request Received!</h2>
              <p className="text-xs text-muted">An AI Smartgate solution specialist will contact your committee shortly.</p>
              <Link to="/" className="inline-block mt-3 text-xs font-bold text-primary hover:underline">
                ← Return to Homepage
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3.5">
              {error && <ErrorNote>{error}</ErrorNote>}
              <Field label="Your Name"><TextInput name="name" required placeholder="Full Name" /></Field>
              <Field label="Mobile Number"><TextInput name="phone" required placeholder="10-digit number" /></Field>
              <Field label="Email Address"><TextInput name="email" type="email" placeholder="name@domain.com" /></Field>
              <Field label="Society / Building Name"><TextInput name="societyName" required placeholder="e.g. Palm Meadows" /></Field>
              <Field label="City"><TextInput name="city" required placeholder="e.g. Pune, Bengaluru, Hyderabad" /></Field>
              <Field label="Specific Questions / Requirements"><TextArea name="message" placeholder="Number of flats, current challenges..." /></Field>
              <Button type="submit" className="w-full min-h-12 text-sm font-black cursor-pointer shadow-lg shadow-primary/25">
                Confirm Demo Request
              </Button>
            </form>
          )}
        </div>
      </main>

      <footer className="relative z-20 py-4 text-center text-xs font-semibold text-muted border-t border-line/60 bg-white/50 dark:bg-[#070e1e]/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AppLogo size="sm" showSubtitle={false} />
            <span className="text-[11px]">· Smart Society Operating System</span>
          </div>
          <p className="text-[11px]">© 2026 AI Smartgate Estate OS · Smart Society Operating System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export function GuidedDemoPage() {
  const steps = [
    { title: "1. Gate Sentinel Tablet", body: "Guard selects flat, enters guest details or verifies 6-digit pass code." },
    { title: "2. Resident Phone Workflow", body: "Resident receives instant notification or generates pre-approval for cab, delivery, or visiting help." },
    { title: "3. Access Granted & Logged", body: "Boom barrier triggers, guard completes visual verification, and visitor entry is stored in the cloud audit log." },
  ];

  return (
    <div className="site-canvas min-h-screen flex flex-col justify-between relative selection:bg-primary/20 overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-[380px] w-[900px] rounded-full bg-gradient-to-r from-blue-400/20 via-sky-300/20 to-teal-400/15 blur-[120px] dark:from-blue-600/15" />

      <SiteHeader />

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 flex-1 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-black uppercase tracking-wider text-primary">INTERACTIVE PRODUCT TOUR</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-[#0f2b5c] dark:text-white tracking-tight">
            How AI Smartgate Estate OS Operates
          </h1>
          <p className="mt-2 text-xs text-muted font-medium">Explore the end-to-end verification and entry experience.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((st, i) => (
            <Card key={i} className="space-y-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary font-black text-sm">
                0{i + 1}
              </span>
              <h3 className="text-base font-black text-foreground">{st.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{st.body}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/login" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-8 text-sm font-black text-white shadow-xl shadow-primary/25 cursor-pointer hover:brightness-105 transition">
            Test Live Interactive Dashboards →
          </Link>
        </div>
      </main>

      <footer className="relative z-20 py-4 text-center text-xs font-semibold text-muted border-t border-line/60 bg-white/50 dark:bg-[#070e1e]/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AppLogo size="sm" showSubtitle={false} />
            <span className="text-[11px]">· Smart Society Operating System</span>
          </div>
          <p className="text-[11px]">© 2026 AI Smartgate Estate OS · Smart Society Operating System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export function JoinPage() {
  return <Navigate to="/signup" replace />;
}

