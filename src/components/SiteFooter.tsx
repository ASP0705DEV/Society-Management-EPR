import { Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { AppLogo } from "@/components/AppLogo";

/**
 * ReadyToUpgradeSection: Standalone conversion banner positioned cleanly
 * outside and directly above the site footer.
 */
export function ReadyToUpgradeSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 md:px-8 py-10 md:py-14">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-[#0f2b5c] via-[#12397c] to-[#081836] p-8 sm:p-12 text-white shadow-[0_25px_60px_-15px_rgba(15,43,92,0.35)]">
        {/* Ambient Lighting Gradients */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-teal-400/15 blur-[100px]" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-sky-200 mb-4 backdrop-blur-md">
              <Sparkles size={13} className="text-amber-300" />
              TRANSFORM YOUR RESIDENTIAL SOCIETY
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Ready to Upgrade Your Estate to an Ad-Free, Intelligent OS?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-blue-100/90 font-medium max-w-2xl leading-relaxed">
              Join modern RWAs, high-rise condominiums, and gated communities across India already enjoying 100% ad-free resident privacy, instant maintenance collections, and biometric gate sentinels.
            </p>

            {/* Guarantees Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs font-bold text-sky-200">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                <CheckCircle2 size={13} className="text-emerald-400" /> Zero Migration Downtime
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                <CheckCircle2 size={13} className="text-emerald-400" /> Free Committee Onboarding
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                <CheckCircle2 size={13} className="text-emerald-400" /> DPDP 2023 Compliant Vault
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:justify-end">
            <Link
              to="/buy"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-[#0f2b5c] shadow-lg hover:bg-sky-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/request-demo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Request Society Demo</span>
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-sky-200 hover:text-white transition pt-1"
            >
              <span>Take Interactive Guided Tour</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line/80 bg-white/90 dark:bg-[#050b17]/95 backdrop-blur-xl pt-12 pb-10 text-slate-600 dark:text-slate-400">
      {/* ========================================================================= */}
      {/* MAIN MULTI-COLUMN FOOTER NAVIGATION GRID                                  */}
      {/* ========================================================================= */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 pb-12">
          {/* Column 1: Brand & Mission Statement (4 columns) */}
          <div className="lg:col-span-4">
            <AppLogo size="md" subtitleText="Smart Society Operating System" />
            <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-sm">
              India's premier all-in-one Integrated Building Management System (IBMS). Engineered specifically for RWAs, apartment associations, and gated societies seeking pure data sovereignty with zero commercial advertisements.
            </p>

            {/* Live Sentinel SLA Status */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Sentinel Gate Desks Operational · 99.98% SLA</span>
            </div>

            {/* Security Badges Strip */}
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span className="rounded-lg border border-line bg-card/80 px-2.5 py-1 flex items-center gap-1.5 shadow-xs">
                <ShieldCheck size={12} className="text-emerald-500" /> DPDP 2023
              </span>
              <span className="rounded-lg border border-line bg-card/80 px-2.5 py-1 flex items-center gap-1.5 shadow-xs">
                <Sparkles size={12} className="text-blue-500" /> 100% Ad-Free
              </span>
              <span className="rounded-lg border border-line bg-card/80 px-2.5 py-1 flex items-center gap-1.5 shadow-xs">
                <Lock size={12} className="text-indigo-500" /> AES-256 Vault
              </span>
            </div>
          </div>

          {/* Column 2: Platform Desks (2 columns) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Platform Desks
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <a href="/#product" className="hover:text-primary transition flex items-center gap-1">
                  Estate Office Desk
                </a>
              </li>
              <li>
                <a href="/#product" className="hover:text-primary transition flex items-center gap-1">
                  Gate Sentinel Tablet
                </a>
              </li>
              <li>
                <a href="/#product" className="hover:text-primary transition flex items-center gap-1">
                  Resident Mobile App
                </a>
              </li>
              <li>
                <Link to="/demo" className="text-primary hover:underline transition font-bold flex items-center gap-1">
                  Interactive Guided Tour →
                </Link>
              </li>
              <li>
                <a href="/#society-guard" className="hover:text-primary transition">
                  Guard Sentinel Sync
                </a>
              </li>
              <li>
                <a href="/#why-platform" className="hover:text-primary transition">
                  Hardware & IoT Gateway
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions & Modules (2 columns) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Core Modules
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <a href="/#visitor-management" className="hover:text-primary transition">
                  Visitor & Cab Passes
                </a>
              </li>
              <li>
                <a href="/#visitor-management" className="hover:text-primary transition">
                  Handover Parcel OTP
                </a>
              </li>
              <li>
                <a href="/#visitor-management" className="hover:text-primary transition">
                  Staff RFID & Passports
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-primary transition">
                  Automated Razorpay Dues
                </a>
              </li>
              <li>
                <a href="/#why-platform" className="hover:text-primary transition">
                  Emergency Intercom
                </a>
              </li>
              <li>
                <a href="/#why-platform" className="hover:text-primary transition">
                  RWA Accounting & Dues
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Portals & Onboarding (2 columns) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Access Portals
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/login" className="hover:text-primary transition flex items-center gap-1 text-primary font-bold">
                  Single Sign-In Portal →
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-primary transition">
                  Resident Sign Up / Join
                </Link>
              </li>
              <li>
                <Link to="/buy" className="hover:text-primary transition">
                  Onboard New Community
                </Link>
              </li>
              <li>
                <Link to="/request-demo" className="hover:text-primary transition">
                  Schedule Committee Demo
                </Link>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-primary transition">
                  Pricing Calculator
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition text-slate-500">
                  Gate Guard Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Enterprise Verification & Support (2 columns) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Direct Support
            </h3>
            <div className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                <span>Indiranagar, Bengaluru, KA 560038</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-primary shrink-0" />
                <span>+91 (080) 4920-8000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-primary shrink-0" />
                <span className="truncate">contact@smartgate.dev</span>
              </div>
              <div className="pt-2">
                <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-black text-slate-600 dark:text-slate-300">
                  ISO 27001 & SOC 2 Type II
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-FOOTER LEGAL & COPYRIGHT BAR                                         */}
        {/* ========================================================================= */}
        <div className="border-t border-line/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted">
          <div>
            <p>© {new Date().getFullYear()} AI Smartgate Estate OS Inc. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-1.5 text-center">
            <span>Built exclusively for RWAs, CHS, & Gated Communities in India</span>
            <span>🇮🇳</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#why-platform" className="hover:text-primary transition">Privacy Policy</a>
            <a href="#why-platform" className="hover:text-primary transition">Terms of Service</a>
            <a href="#why-platform" className="hover:text-primary transition">DPDP Consent Vault</a>
            <a href="#why-platform" className="hover:text-primary transition">Security Disclosures</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
