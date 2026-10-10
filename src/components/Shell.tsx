import {
  Moon,
  Sun,
  LogOut,
  Building2,
  Bell,
  Check,
  MapPin,
  Shield,
  CheckCircle2,
  User,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Command,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, cn } from "@/components/ui";
import { AppLogo, AppLogoIcon } from "@/components/AppLogo";
import { roleLabel, societyName, unitLabel, formatWhen, homePath } from "@/lib/format";
import { useAuth } from "@/stores/use-auth";
import { useData } from "@/stores/use-data";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

/**
 * Shared frame for every signed-in role.
 * Uniform glassmorphic aesthetic matching the Resident Design system.
 * Highly responsive across Mobile, iPad, and Desktop with zero horizontal squishing.
 */
export function Shell({
  title,
  nav,
  tablet = false,
  phone = false,
  children,
}: {
  title: string;
  nav: NavItem[];
  tablet?: boolean;
  phone?: boolean;
  children: ReactNode;
}) {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const db = useData((state) => state.db);
  const markNotificationRead = useData((state) => state.markNotificationRead);
  const markAllNotificationsRead = useData((state) => state.markAllNotificationsRead);
  const navigate = useNavigate();
  const location = useLocation();

  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("gagellan-theme", dark ? "dark" : "light");
  }, [dark]);

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setShowNotifs(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Shortcuts (D = toggle dark mode, Escape = close)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "d" || e.key === "D") {
        setDark((prev) => !prev);
      } else if (e.key === "Escape") {
        setMobileDrawerOpen(false);
        setShowNotifs(false);
        setShowProfileMenu(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!user) return null;

  const currentSociety = db.societies.find((s) => s.id === user.societyId);
  const userUnit = db.units.find((u) => u.id === user.unitId);

  // Relevant notifications
  const allNotifications = (db.notifications || []).filter(
    (n) => n.societyId === user.societyId && (!n.userId || n.userId === user.id)
  );
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  // Primary nav items for mobile bottom bar (first 4 items, 5th is Menu drawer trigger)
  const mobilePrimaryNav = nav.slice(0, 4);

  const navLinksContent = (
    <nav className="space-y-1.5">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          onClick={() => setMobileDrawerOpen(false)}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-bold text-muted transition hover:bg-soft hover:text-primary",
              isActive && "bg-primary/10 font-black text-primary shadow-xs ring-1 ring-primary/20",
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-sm bg-primary" />
              )}
              <span className={cn("transition group-hover:scale-110", isActive ? "text-primary" : "text-muted")}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className={cn("min-h-screen site-canvas text-foreground", tablet ? "flex flex-col" : "lg:flex")}>
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (Visible on lg: >= 1024px screens)                         */}
      {/* ========================================================================= */}
      {!tablet && (
        <aside className="hidden w-[260px] xl:w-[280px] shrink-0 flex-col border-r border-line bg-card/90 backdrop-blur-2xl px-4 py-5 lg:flex">
          {/* Society Building Card / Estate Management Brand */}
          <Link
            to={homePath(user.role)}
            className="mb-5 block rounded-none border border-line bg-soft/70 p-3.5 shadow-sm overflow-hidden transition hover:border-primary/40 cursor-pointer"
            title="Dashboard Overview"
          >
            {currentSociety ? (
              <div>
                {currentSociety.photo ? (
                  <img
                    src={currentSociety.photo}
                    alt={currentSociety.name}
                    className="h-20 w-full rounded-lg object-cover border border-line shadow-xs mb-2.5"
                  />
                ) : (
                  <div className="h-14 w-full rounded-lg bg-primary/10 grid place-items-center text-primary mb-2.5">
                    <Building2 size={24} />
                  </div>
                )}
                <h2 className="text-xs font-black text-foreground leading-tight truncate">{currentSociety.name}</h2>
                <p className="mt-0.5 text-[10px] text-muted flex items-center gap-1 leading-snug truncate">
                  <MapPin size={11} className="shrink-0 text-primary" />
                  <span className="truncate">{currentSociety.city}</span>
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-line/60 pt-1.5 text-[10px] font-bold text-primary">
                  <span>Code: {currentSociety.code}</span>
                  <span className="text-[9px] uppercase tracking-wider text-muted">Estate OS</span>
                </div>
              </div>
            ) : (
              <div className="py-0.5">
                <AppLogo size="sm" subtitleText="Estate OS" to={homePath(user.role)} />
              </div>
            )}
          </Link>

          {/* Navigation Title & Links */}
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">
              Menu Navigation
            </span>
          </div>
          {navLinksContent}

          {/* User Profile Footer Card */}
          <div className="mt-auto border-t border-line pt-3.5">
            <div className="flex items-center justify-between rounded-lg border border-line bg-soft/80 p-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar src={user.photo} name={user.name} className="h-8 w-8 rounded-full border border-line shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-black">{user.name}</p>
                  <p className="truncate text-[10px] uppercase font-bold tracking-wide text-primary">
                    {userUnit ? `Flat ${userUnit.block}-${userUnit.number}` : roleLabel(user.role)}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 rounded-md border border-red-200/80 bg-red-50 p-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 cursor-pointer transition shadow-xs"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* MOBILE / IPAD SLIDE-OUT DRAWER                                            */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[280px] max-w-[80vw] bg-card border-r border-line shadow-2xl p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Header with Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
                <div className="flex items-center gap-2.5">
                  <AppLogo size="sm" showSubtitle={false} to={homePath(user.role)} />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-none border border-line bg-soft text-muted hover:text-foreground cursor-pointer"
                  title="Close navigation"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Society Badge */}
              {currentSociety && (
                <div className="mb-4 rounded-none border border-line bg-soft/70 p-3">
                  <p className="text-xs font-black text-foreground truncate">{currentSociety.name}</p>
                  <p className="text-[10px] text-muted truncate">{currentSociety.city}</p>
                  <span className="mt-1 inline-block text-[10px] font-black text-primary">Code: {currentSociety.code}</span>
                </div>
              )}

              {/* Drawer Links */}
              <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-wider text-muted">Navigation</p>
              {navLinksContent}
            </div>

            {/* Bottom Logout */}
            <div className="border-t border-line pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar src={user.photo} name={user.name} className="h-8 w-8 rounded-none border border-line shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black">{user.name}</p>
                    <p className="truncate text-[10px] text-primary font-bold">
                      {userUnit ? `Flat ${userUnit.block}-${userUnit.number}` : roleLabel(user.role)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="rounded-none border border-red-200 bg-red-50 p-2 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 cursor-pointer"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTAINER                                                   */}
      {/* ========================================================================= */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Tablet / Gate Mode Header */}
        {tablet ? (
          <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur-xl px-3 sm:px-6 py-2.5 sm:py-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <AppLogo size="sm" showSubtitle={false} to={homePath(user.role)} />
                <span className="hidden sm:inline-block text-[11px] font-bold text-muted truncate">
                  · Sentinel Gate Kiosk ({currentSociety?.name || "Main Gate Desk"})
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden md:inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                  Shift: {user.name}
                </span>

                <button
                  onClick={() => setDark((v) => !v)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-card cursor-pointer hover:bg-soft transition shadow-xs"
                  title="Toggle dark mode (D)"
                >
                  {dark ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40 px-3 py-2 text-xs font-black text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 cursor-pointer shadow-xs transition"
                  title="End shift & sign out"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">End Shift</span>
                </button>
              </div>
            </div>

            {/* Tablet Desk Links */}
            <div className="pt-1 overflow-x-auto no-scrollbar">
              <nav className="flex items-center gap-2">
                {nav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold text-muted transition whitespace-nowrap",
                        isActive && "bg-primary text-white font-black shadow-md shadow-primary/25",
                      )
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </header>
        ) : (
          /* Standard Responsive Top Header (Mobile & iPad & Desktop) */
          <header className="sticky top-0 z-20 flex h-14 sm:h-16 items-center justify-between border-b border-line bg-card/90 px-3 sm:px-6 md:px-8 backdrop-blur-xl">
            {/* Left: Mobile Drawer Trigger + Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-card lg:hidden text-foreground hover:bg-soft transition cursor-pointer shadow-xs shrink-0"
                title="Open menu drawer"
              >
                <Menu size={18} />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="lg:hidden grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-primary to-sky-400 text-white shrink-0">
                  <Shield size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black text-foreground truncate">
                    {currentSociety?.name || societyName(db, user.societyId)}
                  </p>
                  {userUnit ? (
                    <span className="hidden sm:inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                      Flat {userUnit.block}-{userUnit.number}
                    </span>
                  ) : (
                    <span className="hidden sm:inline-block text-[10px] text-muted font-bold">
                      {roleLabel(user.role)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifs((v) => !v)}
                  className="relative grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-lg border border-line bg-card hover:bg-soft text-foreground cursor-pointer transition shadow-xs"
                  title="Notifications & Alerts"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 grid h-4 min-w-4 sm:h-5 sm:min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[9px] sm:text-[10px] font-black text-white shadow-xs animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-96 rounded-none border border-line bg-card/95 backdrop-blur-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 modal-frame">
                    <div className="flex items-center justify-between border-b border-line pb-2.5">
                      <div className="flex items-center gap-2">
                        <Bell size={15} className="text-primary" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                          Activity & Alerts
                        </h4>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (user.societyId) markAllNotificationsRead(user.societyId, user.id);
                          }}
                          className="text-[10px] sm:text-[11px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                      {allNotifications.length === 0 ? (
                        <p className="text-center py-6 text-xs text-muted font-medium">No recent notifications</p>
                      ) : (
                        allNotifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={cn(
                              "rounded-lg p-2.5 sm:p-3 text-xs transition cursor-pointer border",
                              n.read
                                ? "bg-soft/40 border-line/60 opacity-80"
                                : "bg-primary/5 border-primary/20 shadow-xs"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("font-black text-foreground text-xs", !n.read && "text-primary")}>
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-muted leading-relaxed">{n.message}</p>
                            <p className="mt-1.5 text-[9px] font-bold text-muted/70">{formatWhen(n.createdAt)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setDark((v) => !v)}
                className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-lg border border-line bg-card cursor-pointer hover:bg-soft transition shadow-xs"
                title="Toggle colour mode (D)"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-lg border border-line bg-card hover:bg-soft p-1 sm:p-1.5 sm:pr-2.5 text-left transition cursor-pointer shadow-xs"
                >
                  <Avatar src={user.photo} name={user.name} className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-primary/20" />
                  <div className="hidden md:block leading-tight max-w-[100px]">
                    <p className="text-xs font-black text-foreground truncate">{user.name.split(" ")[0]}</p>
                    <p className="text-[9px] text-primary font-bold truncate">
                      {userUnit ? `Flat ${userUnit.block}-${userUnit.number}` : roleLabel(user.role)}
                    </p>
                  </div>
                  <ChevronDown size={13} className="text-muted hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-none border border-line bg-card/95 backdrop-blur-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 modal-frame">
                    <div className="flex items-center gap-2.5 p-2 border-b border-line pb-2.5">
                      <Avatar src={user.photo} name={user.name} className="h-9 w-9 rounded-full border border-primary/30" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-foreground truncate">{user.name}</p>
                        <p className="text-[10px] text-muted truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-2 space-y-1 text-xs font-bold">
                      {user.role === "resident" && (
                        <>
                          <Link
                            to="/resident/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-soft transition"
                          >
                            <User size={14} className="text-primary" /> Profile & Picture
                          </Link>
                          <Link
                            to="/resident/family"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-soft transition"
                          >
                            <Shield size={14} className="text-emerald-500" /> Family Access
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-line pt-2">
                      <button
                        onClick={logout}
                        className="w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                      >
                        <span>Sign Out</span>
                        <LogOut size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* ========================================================================= */}
        {/* RESPONSIVE CONTENT AREA (Mobile, iPad, Desktop Optimized Spacing)          */}
        {/* ========================================================================= */}
        <main
          className={cn(
            "w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-7 lg:px-8 py-4 sm:py-6 transition-all flex-1",
            !tablet && "pb-24 lg:pb-8",
          )}
        >
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Phones < 1024px, Non-Tablet)                */}
      {/* ========================================================================= */}
      {!tablet && (
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-card/95 backdrop-blur-xl lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
          {mobilePrimaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-muted transition",
                  isActive && "text-primary font-black",
                )
              }
            >
              {item.icon}
              <span className="truncate max-w-[64px] text-center">{item.label}</span>
            </NavLink>
          ))}

          {/* 5th Button: Opens Mobile Menu Drawer with all items */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-muted transition hover:text-primary cursor-pointer"
          >
            <MoreHorizontal size={18} />
            <span className="text-center">More</span>
          </button>
        </nav>
      )}

    </div>
  );
}
