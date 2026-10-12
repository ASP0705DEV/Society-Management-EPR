import { useEffect, type ReactNode } from "react";
import { Building2, ClipboardList, CreditCard, DoorOpen, Gauge, Home, LifeBuoy, Package, ScrollText, Ticket, UserCheck, UserRound, Users } from "lucide-react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { ToastContainer } from "@/components/ToastContainer";

function JoinRedirect() {
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  return <Navigate to={`/signup${search ? `?${search}` : ""}`} replace />;
}

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [location.pathname, location.hash]);

  return null;
}
import { Shell, type NavItem } from "@/components/Shell";
import { homePath } from "@/lib/format";
import { GatekeeperPage } from "@/pages/gate/GatekeeperPage";
import { LoginPage } from "@/pages/LoginPage";
import { BuyPage, GuidedDemoPage, HomePage, RequestDemoPage } from "@/pages/Website";
import { ResidentFamily, ResidentHelpers, ResidentHome, ResidentNotices, ResidentParcels, ResidentProfile, ResidentUnit, ResidentVisitors } from "@/pages/resident/ResidentPages";
import { SocietyGates, SocietyHelpers, SocietyNoticesAdmin, SocietyOverview, SocietyReports, SocietyResidents, SocietySupport } from "@/pages/society/SocietyAdminPages";
import { SuperOverview, SuperPlans, SuperSocieties, SuperTickets } from "@/pages/super/SuperAdminPages";
import { useAuth } from "@/stores/use-auth";
import { useData } from "@/stores/use-data";
import { joinSocketRooms, getSocket } from "@/lib/socket-client";
import type { Role } from "@/types";

const icon = { size: 18 };

/**
 * One React app. After sign-in, the route group matches the role.
 * A resident cannot open /super, and a super admin cannot open the gate desk.
 */
export function App() {
  const user = useAuth((state) => state.user);
  const hydrate = useData((state) => state.hydrate);
  const ready = useData((state) => state.ready);
  const error = useData((state) => state.error);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    getSocket();
    if (user) {
      joinSocketRooms(user);
    }
  }, [user]);

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-sm font-bold text-muted">Loading AI Smartgate Estate OS…</div>;
  }

  return (
    <BrowserRouter>
      <ScrollToHash />
      <ToastContainer />
      {error ? <p className="bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">{error}</p> : null}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/join" element={<JoinRedirect />} />
        <Route path="/demo" element={<GuidedDemoPage />} />
        <Route path="/request-demo" element={<RequestDemoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<LoginPage initialMode="forgot_password" />} />
        <Route path="/signup" element={<LoginPage initialMode="signup" />} />
        <Route path="/super" element={<Guard allow={["super_admin"]}><Shell title="Platform" nav={superNav}><SuperOverview /></Shell></Guard>} />
        <Route path="/super/societies" element={<Guard allow={["super_admin"]}><Shell title="Platform" nav={superNav}><SuperSocieties /></Shell></Guard>} />
        <Route path="/super/plans" element={<Guard allow={["super_admin"]}><Shell title="Platform" nav={superNav}><SuperPlans /></Shell></Guard>} />
        <Route path="/super/tickets" element={<Guard allow={["super_admin"]}><Shell title="Platform" nav={superNav}><SuperTickets /></Shell></Guard>} />
        <Route path="/society" element={<Guard allow={["society_admin"]}><Shell title="Society admin" nav={societyNav}><SocietyOverview /></Shell></Guard>} />
        <Route path="/society/residents" element={<Guard allow={["society_admin"]}><Shell title="Society admin" nav={societyNav}><SocietyResidents /></Shell></Guard>} />
        <Route path="/society/helpers" element={<Guard allow={["society_admin"]}><Shell title="Society admin" nav={societyNav}><SocietyHelpers /></Shell></Guard>} />
        <Route path="/society/gates" element={<Guard allow={["society_admin"]}><Shell title="Society admin" nav={societyNav}><SocietyGates /></Shell></Guard>} />
        <Route path="/society/reports" element={<Guard allow={["society_admin"]}><Shell title="Society admin" nav={societyNav}><SocietyReports /></Shell></Guard>} />
        <Route path="/society/notices" element={<Guard allow={["society_admin"]}><Shell title="Society admin" nav={societyNav}><SocietyNoticesAdmin /></Shell></Guard>} />
        <Route path="/society/support" element={<Guard allow={["society_admin"]}><Shell title="Society admin" nav={societyNav}><SocietySupport /></Shell></Guard>} />
        <Route path="/resident" element={<Guard allow={["resident"]}><Shell title="Resident" nav={residentNav}><ResidentHome /></Shell></Guard>} />
        <Route path="/resident/family" element={<Guard allow={["resident"]}><Shell title="Resident" nav={residentNav}><ResidentFamily /></Shell></Guard>} />
        <Route path="/resident/helpers" element={<Guard allow={["resident"]}><Shell title="Resident" nav={residentNav}><ResidentHelpers /></Shell></Guard>} />
        <Route path="/resident/unit" element={<Guard allow={["resident"]}><Shell title="Resident" nav={residentNav}><ResidentUnit /></Shell></Guard>} />
        <Route path="/resident/notices" element={<Guard allow={["resident"]}><Shell title="Resident" nav={residentNav}><ResidentNotices /></Shell></Guard>} />
        <Route path="/resident/profile" element={<Guard allow={["resident"]}><Shell title="Resident" nav={residentNav}><ResidentProfile /></Shell></Guard>} />
        <Route path="/resident/visitors" element={<Navigate to="/resident" replace />} />
        <Route path="/resident/parcels" element={<Navigate to="/resident" replace />} />
        <Route path="/gate" element={<Guard allow={["gatekeeper"]}><Shell title="Gate desk" nav={gateNav} tablet><GatekeeperPage /></Shell></Guard>} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

const superNav: NavItem[] = [
  { to: "/super", label: "Overview", icon: <Gauge {...icon} /> },
  { to: "/super/societies", label: "Societies", icon: <Building2 {...icon} /> },
  { to: "/super/plans", label: "Plans", icon: <CreditCard {...icon} /> },
  { to: "/super/tickets", label: "Help desk", icon: <Ticket {...icon} /> },
];

const societyNav: NavItem[] = [
  { to: "/society", label: "Overview", icon: <Gauge {...icon} /> },
  { to: "/society/residents", label: "Residents", icon: <Users {...icon} /> },
  { to: "/society/helpers", label: "Daily Help", icon: <UserCheck {...icon} /> },
  { to: "/society/gates", label: "Gates", icon: <DoorOpen {...icon} /> },
  { to: "/society/reports", label: "Reports", icon: <ClipboardList {...icon} /> },
  { to: "/society/notices", label: "Broadcasts", icon: <ScrollText {...icon} /> },
  { to: "/society/support", label: "Support", icon: <LifeBuoy {...icon} /> },
];

const residentNav: NavItem[] = [
  { to: "/resident", label: "Home", icon: <Home {...icon} /> },
  { to: "/resident/family", label: "Family Members", icon: <Users {...icon} /> },
  { to: "/resident/helpers", label: "Daily Help", icon: <UserCheck {...icon} /> },
  { to: "/resident/unit", label: "Flat", icon: <Building2 {...icon} /> },
  { to: "/resident/notices", label: "Notices", icon: <ScrollText {...icon} /> },
  { to: "/resident/profile", label: "Profile", icon: <UserRound {...icon} /> },
];

const gateNav: NavItem[] = [{ to: "/gate", label: "Desk", icon: <DoorOpen {...icon} /> }];

function Guard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const user = useAuth((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={homePath(user.role)} replace />;
  return children;
}

function HomeRedirect() {
  const user = useAuth((state) => state.user);
  return <Navigate to={user ? homePath(user.role) : "/login"} replace />;
}
