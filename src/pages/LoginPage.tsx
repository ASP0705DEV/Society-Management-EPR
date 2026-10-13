import { FormEvent, useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Check,
  Sparkles,
  ChevronDown,
  Building2,
  Mail,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { CommunityHeroLandscape } from "@/components/CommunityHeroLandscape";
import { AppLogo } from "@/components/AppLogo";
import { OtpVerificationModal } from "@/components/OtpVerificationModal";
import { otpClient } from "@/lib/otp-client";
import { homePath } from "@/lib/format";
import { useAuth } from "@/stores/use-auth";
import { useData } from "@/stores/use-data";
import { toast } from "@/stores/use-toast";
import type { Role } from "@/types";

interface LoginPageProps {
  initialMode?: "signin" | "signup" | "forgot_password";
}

export function LoginPage({ initialMode: propMode }: LoginPageProps) {
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get("mode");

  const computedInitial: "signin" | "signup" | "forgot_password" =
    propMode ||
    (queryMode === "forgot" || queryMode === "forgot_password"
      ? "forgot_password"
      : queryMode === "signup"
      ? "signup"
      : "signin");

  const user = useAuth((state) => state.user);
  const login = useAuth((state) => state.login);
  const loginDemo = useAuth((state) => state.loginDemo);
  const resetPasswordWithOtp = useAuth((state) => state.resetPasswordWithOtp);
  const db = useData((state) => state.db);
  const ready = useData((state) => state.ready);
  const joinResident = useData((state) => state.joinResident);
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot_password">(computedInitial);

  // Sync state if initialMode prop or query param changes
  useEffect(() => {
    if (propMode) {
      setAuthMode(propMode);
    } else if (queryMode === "forgot" || queryMode === "forgot_password") {
      setAuthMode("forgot_password");
    } else if (queryMode === "signup") {
      setAuthMode("signup");
    }
  }, [propMode, queryMode]);

  // ==========================================
  // SIGN IN STATE
  // ==========================================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // ==========================================
  // FORGOT PASSWORD STATE (Screenshot 1 & Arch Flow)
  // ==========================================
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotStep, setForgotStep] = useState<"identifier" | "otp" | "success">("identifier");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpError, setForgotOtpError] = useState<string | null>(null);
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotShowPassword, setForgotShowPassword] = useState(false);

  // ==========================================
  // SIGN UP STATE (Industry-Standard: Society Code vs Invited by Admin)
  // ==========================================
  const initialCodeParam = searchParams.get("code")?.toUpperCase() || "";
  const [signUpTab, setSignUpTab] = useState<"code" | "invited">(
    searchParams.get("tab") === "invited" ? "invited" : "code"
  );
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpStep, setSignUpStep] = useState<"form" | "otp" | "details" | "success">("form");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpOtp, setSignUpOtp] = useState("");
  const [signUpOtpError, setSignUpOtpError] = useState<string | null>(null);
  const [signUpCooldown, setSignUpCooldown] = useState(0);

  // Sign up join code option
  const [joinCode, setJoinCode] = useState(initialCodeParam || "SW-2026");
  const [joinName, setJoinName] = useState("");
  const [joinBlock, setJoinBlock] = useState("A");
  const [joinNumber, setJoinNumber] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const [showJoinOtpModal, setShowJoinOtpModal] = useState(false);

  // Cooldown timers
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  useEffect(() => {
    if (signUpCooldown <= 0) return;
    const timer = setInterval(() => {
      setSignUpCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [signUpCooldown]);

  if (user) return <Navigate to={homePath(user.role)} replace />;

  // ------------------------------------------
  // Navigation helpers
  // ------------------------------------------
  const goToSignIn = () => {
    setAuthMode("signin");
    setLoginError(null);
    setForgotError(null);
    setSignUpError(null);
    navigate("/login", { replace: false });
  };

  const goToForgotPassword = () => {
    setAuthMode("forgot_password");
    setForgotStep("identifier");
    setForgotSubmitted(false);
    setForgotError(null);
    setForgotOtp("");
    setForgotOtpError(null);
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    if (email.trim()) {
      setForgotIdentifier(email.trim());
    }
    navigate("/forgot-password", { replace: false });
  };

  const goToSignUp = () => {
    setAuthMode("signup");
    setSignUpStep("form");
    setSignUpError(null);
    setSignUpOtp("");
    setSignUpOtpError(null);
    navigate("/signup", { replace: false });
  };

  // ------------------------------------------
  // Sign In Submission
  // ------------------------------------------
  function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setLoginError("Please provide your email address or 10-digit mobile number.");
      return;
    }
    if (!password) {
      setLoginError("Please provide your password.");
      return;
    }
    const message = login(email.trim(), password, db);
    if (message) {
      setLoginError(message);
      toast.error(message, "Sign In Failed");
      return;
    }
    setLoginError(null);
    toast.success("Welcome back! Signing you in...", "Authentication Successful");
    const next = useAuth.getState().user;
    if (next) navigate(homePath(next.role));
  }

  // ==========================================
  // DEVELOPMENT QUICK SIGN-IN (DEV ONLY)
  // ==========================================
  const [showDevQuickLogin, setShowDevQuickLogin] = useState(false);

  const DEV_USERS = [
    { name: "Sai Prithvi", role: "Super Admin", email: "saiprithvi0705@gmail.com", pass: "SuperAdmin@2026", badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" },
    { name: "Kritik Rao", role: "Society Admin", email: "saiggs62@gmail.com", pass: "SocietyAdmin@2026", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
    { name: "Prithvi A", role: "Resident (A-101)", email: "saiggs055@gmail.com", pass: "Resident@2026", badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300" },
    { name: "Rahul M", role: "Gate Guard", email: "saiggs739@gmail.com", pass: "GateGuard@2026", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
  ];

  function handleDevQuickSignIn(u: typeof DEV_USERS[0]) {
    setEmail(u.email);
    setPassword(u.pass);
    const err = login(u.email, u.pass, db);
    if (!err) {
      toast.success(`Signed in as ${u.name} (${u.role})`, "Dev Quick Sign-In");
      const next = useAuth.getState().user;
      if (next) navigate(homePath(next.role));
    } else {
      setLoginError(err);
      toast.error(err, "Dev Sign-In Error");
    }
  }

  // ------------------------------------------
  // Forgot Password: Step 1 (Screenshot 1)
  // ------------------------------------------
  async function handleForgotSubmit(event?: FormEvent) {
    if (event) event.preventDefault();
    setForgotError(null);

    const cleanInput = forgotIdentifier.trim();
    if (!cleanInput) {
      setForgotError("Please enter your registered email address.");
      return;
    }

    const isEmail = cleanInput.includes("@");
    const phoneDigits = cleanInput.replace(/\D/g, "");
    const isPhone = !isEmail && phoneDigits.length >= 10;

    if (!isEmail && !isPhone) {
      setForgotError("Please enter a valid email address or 10-digit mobile number.");
      return;
    }

    // Check against active users in society database
    const cleanLower = cleanInput.toLowerCase();
    const userMatch = db.users.find((person) => {
      const pEmail = (person.email || "").trim().toLowerCase();
      const pPhone = (person.phone || "").replace(/\D/g, "");
      return (
        (isEmail && pEmail === cleanLower) ||
        (isPhone && pPhone.length >= 10 && pPhone.endsWith(phoneDigits.slice(-10)))
      );
    });

    if (!userMatch) {
      // Matches reference Screenshot 4 error style
      setForgotError("Sorry, we couldn't find matching details. Please ask your community to add your email in the system.");
      return;
    }

    setForgotLoading(true);
    setForgotSubmitted(true);

    try {
      if (isEmail) {
        const res = await otpClient.sendEmailOtp(cleanInput, "password_reset");
        setForgotCooldown(res.cooldownSeconds || 60);
      } else {
        const res = await otpClient.sendSmsOtp(cleanInput, "password_reset");
        setForgotCooldown(res.cooldownSeconds || 60);
      }

      toast.info(`Password reset code sent to ${cleanInput}`, "OTP Dispatched");
    } catch (err: any) {
      setForgotError(err.message || "Failed to dispatch reset code.");
      setForgotSubmitted(false);
    } finally {
      setForgotLoading(false);
    }
  }

  // ------------------------------------------
  // Forgot Password: Step 2 (Reset with OTP)
  // ------------------------------------------
  async function handleResetPasswordWithOtp(event: FormEvent) {
    event.preventDefault();
    setForgotOtpError(null);

    if (!forgotOtp.trim() || forgotOtp.trim().length < 4) {
      setForgotOtpError("Invalid OTP.");
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotOtpError("Password must be at least 6 characters long.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotOtpError("Passwords do not match. Please re-enter.");
      return;
    }

    setForgotLoading(true);
    try {
      const isEmail = forgotIdentifier.includes("@");
      const type = isEmail ? "email" : "sms";
      const verifyRes = await otpClient.verifyOtp(
        forgotIdentifier.trim(),
        forgotOtp.trim(),
        type,
        "password_reset"
      );

      if (!verifyRes.success) {
        setForgotOtpError("Invalid OTP.");
        toast.error(verifyRes.message || "Invalid OTP.", "Verification Failed");
        setForgotLoading(false);
        return;
      }

      // Update password in authentication store & database
      const resetErr = resetPasswordWithOtp(forgotIdentifier.trim(), forgotNewPassword);
      if (resetErr) {
        setForgotOtpError(resetErr);
        toast.error(resetErr, "Password Reset Failed");
        setForgotLoading(false);
        return;
      }

      toast.success("Password has been reset successfully!", "Password Changed");

      // Auto-authenticate immediately with the newly reset password
      const loginErr = login(forgotIdentifier.trim(), forgotNewPassword);
      if (!loginErr) {
        toast.success("Signed in successfully with your new password!", "Welcome Back");
        const currentUser = useAuth.getState().user;
        if (currentUser) {
          navigate(homePath(currentUser.role));
          return;
        }
      }

      setForgotStep("success");
    } catch (err: any) {
      setForgotOtpError(err.message || "Verification failed. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  // ------------------------------------------
  // Sign Up: Step 1 Lookup & Request OTP for Invited Residents
  // ------------------------------------------
  async function handleSignUpRequestOtp() {
    setSignUpError(null);
    const clean = signUpEmail.trim().toLowerCase();

    if (!clean || !clean.includes("@")) {
      setSignUpError("Please enter a valid email address.");
      return;
    }

    // Check if society roster has an invited resident with this email
    const exists = db.users.find(
      (p) => (p.email || "").trim().toLowerCase() === clean && p.role === "resident"
    );

    if (!exists) {
      setSignUpError(
        "No invitation found for this email in our society roster. If you have a society code, switch to the 'Society Code' tab above."
      );
      return;
    }

    setSignUpLoading(true);
    try {
      const res = await otpClient.sendEmailOtp(clean, "registration");
      setSignUpCooldown(res.cooldownSeconds || 60);
      setSignUpStep("otp");
      toast.info(`Verification code sent to ${clean}`, "OTP Dispatched");
    } catch (err: any) {
      setSignUpError(err.message || "Failed to send verification code.");
    } finally {
      setSignUpLoading(false);
    }
  }

  // ------------------------------------------
  // Sign Up: Step 2 OTP Verification for Invited Residents
  // ------------------------------------------
  async function handleSignUpVerifyOtp() {
    setSignUpOtpError(null);
    if (!signUpOtp.trim() || signUpOtp.trim().length !== 6) {
      setSignUpOtpError("Please enter the 6-digit verification code.");
      return;
    }

    setSignUpLoading(true);
    try {
      const res = await otpClient.verifyOtp(
        signUpEmail.trim(),
        signUpOtp.trim(),
        "email",
        "registration"
      );

      if (!res.success) {
        setSignUpOtpError(res.message || "Invalid OTP.");
        toast.error(res.message || "Invalid OTP.", "Verification Failed");
        setSignUpLoading(false);
        return;
      }

      setSignUpStep("details");
      toast.success("Email verified! Please set your login password.", "Email Verified");
    } catch (err: any) {
      setSignUpOtpError(err.message || "Invalid OTP.");
    } finally {
      setSignUpLoading(false);
    }
  }

  // ------------------------------------------
  // Sign Up: Complete Password for Invited Resident
  // ------------------------------------------
  function handleCompleteInvitedSignup(e: FormEvent) {
    e.preventDefault();
    if (!joinPassword || joinPassword.length < 6) {
      setSignUpError("Password must be at least 6 characters.");
      return;
    }
    const clean = signUpEmail.trim().toLowerCase();
    const person = db.users.find(
      (p) => (p.email || "").trim().toLowerCase() === clean && p.role === "resident"
    );
    if (!person) {
      setSignUpError("User record not found in society roster.");
      return;
    }

    // Activate the resident
    useData.getState().activateResident(person.id);
    const err = login(clean, joinPassword, db);
    if (err) {
      goToSignIn();
      return;
    }
    toast.success("Welcome to AI Smartgate Estate OS!", "Account Activated");
    const next = useAuth.getState().user;
    if (next) navigate(homePath(next.role));
  }

  // ------------------------------------------
  // Sign Up with Society Join Code (Validates & Triggers Email OTP)
  // ------------------------------------------
  function handleJoinCodeSubmit(e: FormEvent) {
    e.preventDefault();
    setSignUpError(null);

    const code = joinCode.trim().toUpperCase();
    const name = joinName.trim();
    const block = joinBlock.trim().toUpperCase() || "A";
    const number = joinNumber.trim() || "101";
    const email = signUpEmail.trim().toLowerCase();
    const phone = joinPhone.trim();
    const password = joinPassword.trim();

    if (!code) {
      setSignUpError("Please enter your society join code (e.g. SW-2026).");
      return;
    }

    const cleanCode = code.replace(/[\s-]/g, "");
    const society = db.societies.find(
      (s) => s.code.toUpperCase().replace(/[\s-]/g, "") === cleanCode
    );
    if (!society) {
      setSignUpError(`Society code "${code}" was not found. Please confirm with your society committee.`);
      return;
    }

    if (!name) {
      setSignUpError("Please enter your full name.");
      return;
    }
    if (!block || !number) {
      setSignUpError("Please enter your block (e.g. A) and flat number (e.g. 101).");
      return;
    }
    if (!email || !email.includes("@")) {
      setSignUpError("Please enter a valid email address for account credentials and OTP verification.");
      return;
    }
    if (phone && phone.replace(/\D/g, "").length < 10) {
      setSignUpError("Mobile number must be a valid 10-digit number, or leave it blank.");
      return;
    }
    if (!password || password.length < 6) {
      setSignUpError("Password must be at least 6 characters.");
      return;
    }

    // Open clean Email OTP verification modal!
    setShowJoinOtpModal(true);
  }

  // ------------------------------------------
  // Finalize Registration After Successful Email OTP
  // ------------------------------------------
  async function handleJoinOtpComplete() {
    setShowJoinOtpModal(false);

    try {
      const res = await fetch("/api/auth/register-resident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: joinCode.trim(),
          name: joinName.trim(),
          email: signUpEmail.trim().toLowerCase(),
          phone: joinPhone.trim(),
          password: joinPassword,
          block: joinBlock.trim() || "A",
          number: joinNumber.trim() || "101",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSignUpError(data.error || "Registration failed.");
        toast.error(data.error || "Registration error.", "Registration Failed");
        return;
      }

      // Keep local state in sync
      joinResident({
        code: joinCode.trim(),
        name: joinName.trim(),
        email: signUpEmail.trim(),
        phone: joinPhone.trim(),
        password: joinPassword,
        block: joinBlock.trim() || "A",
        number: joinNumber.trim() || "101",
      });

      // Hydrate state from PostgreSQL so society admin immediately sees the new resident
      await useData.getState().hydrate();

      setSignUpStep("success");
      toast.success("Registration submitted! Pending society admin approval.", "Registration Received");
    } catch (err: any) {
      setSignUpError(err.message || "Failed to submit registration.");
    }
  }

  // ------------------------------------------
  // Quick 1-Click Role Login Shortcuts
  // ------------------------------------------
  function handleQuickLogin(targetEmail: string, targetPass: string, role: Role) {
    setEmail(targetEmail);
    setPassword(targetPass);
    setLoginError(null);

    const message = loginDemo(role, db);
    if (message) {
      setLoginError(message);
      toast.error(message, "Demo Sign In Failed");
      return;
    }
    toast.success(`Accessing ${role} dashboard...`, "Demo Access Granted");
    const next = useAuth.getState().user;
    if (next) navigate(homePath(next.role));
  }

  return (
    <div className="site-canvas min-h-screen md:h-screen md:max-h-screen md:overflow-hidden flex flex-col justify-between relative overflow-x-hidden selection:bg-primary/20 bg-[#edf1f5] dark:bg-[#070e1e]">
      {/* BACKGROUND BUILDINGS LANDSCAPE - Spans full width behind the card */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-0 w-full overflow-hidden flex flex-col justify-end select-none">
        <CommunityHeroLandscape className="w-full h-[140px] sm:h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px]" />
      </div>

      {/* Floating Development Quick Sign-In (Available everywhere on Login/Signup) */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDevQuickLogin((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 py-1.5 text-xs font-black text-amber-900 dark:text-amber-200 shadow-md hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle Quick Sign-In for Development"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>⚡ Dev Quick Sign-In</span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${showDevQuickLogin ? "rotate-180" : ""}`} />
          </button>

          {showDevQuickLogin && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 shadow-2xl animate-rise z-50 space-y-1">
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Dev Quick Access</span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">1-Tap Sign-In</span>
              </div>
              {DEV_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => handleDevQuickSignIn(u)}
                  className="w-full flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-blue-200 hover:bg-blue-50/70 dark:hover:bg-slate-800/80 text-left transition cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-primary transition">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[9px] font-black shrink-0 ${u.badge}`}>
                    {u.role.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex flex-1 flex-col items-center lg:items-start justify-center px-4 sm:px-8 lg:pl-20 xl:pl-28 py-4">
        {/* Crisp White Elevated Authentication Card */}
        <div className={`w-full ${authMode === "signup" ? "max-w-[440px] sm:max-w-[470px]" : "max-w-[420px] sm:max-w-[440px]"} max-h-[92vh] overflow-y-auto rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#0c1a30] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200/70 dark:border-white/10 flex flex-col justify-between transition-all`}>
          <div>
            {/* Signature Logo at Top: AI Smartgate Estate OS */}
            <div className="flex items-center justify-center mb-6">
              <AppLogo size="lg" to="/" showSubtitle={false} />
            </div>

            {/* ============================================================== */}
            {/* VIEW 1: FORGOT PASSWORD (EXACT MATCH FOR SCREENSHOT 1)          */}
            {/* ============================================================== */}
            {authMode === "forgot_password" && (
              <div>
                <h2 className="text-xl font-bold text-center text-[#1b2a47] dark:text-white mb-6 tracking-tight">
                  Forgot Password
                </h2>

                {forgotStep === "success" ? (
                  /* Success State */
                  <div className="text-center py-4 space-y-4">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check size={24} className="stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Password Reset Complete</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Your password has been successfully updated. You can now sign in with your new credentials.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const err = login(forgotIdentifier, forgotNewPassword);
                        if (!err) {
                          const currentUser = useAuth.getState().user;
                          if (currentUser) {
                            navigate(homePath(currentUser.role));
                            return;
                          }
                        }
                        setEmail(forgotIdentifier);
                        setPassword(forgotNewPassword);
                        goToSignIn();
                      }}
                      className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                    >
                      Sign In with New Password →
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* STEP 1: Email Form (Direct Screenshot 1 Match) */}
                    <form onSubmit={handleForgotSubmit}>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2.5">
                        Confirm your email
                      </p>

                      {/* Floating Label Outlined Input matching Screenshot 1 */}
                      <fieldset
                        className={`border ${
                          forgotError ? "border-red-500" : "border-slate-300 dark:border-slate-600 focus-within:border-slate-600"
                        } rounded-md px-3 pb-2 pt-0.5 bg-white dark:bg-slate-900 transition-colors`}
                      >
                        <legend className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1 ml-0.5">
                          Email *
                        </legend>
                        <input
                          type="text"
                          value={forgotIdentifier}
                          disabled={forgotLoading}
                          onChange={(e) => {
                            setForgotIdentifier(e.target.value);
                            setForgotError(null);
                          }}
                          required
                          placeholder=""
                          className="w-full bg-transparent border-0 outline-none text-sm font-medium text-slate-800 dark:text-white p-0"
                        />
                      </fieldset>

                      {/* Error message (matching Screenshot 4 style if email not in system) */}
                      {forgotError && (
                        <p className="text-xs text-red-600 font-medium mt-2 leading-relaxed">
                          {forgotError}
                        </p>
                      )}

                      {/* Submit Button: Blue Background */}
                      <button
                        type="submit"
                        disabled={forgotLoading || !forgotIdentifier.trim()}
                        className="w-full mt-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-sm transition-colors shadow-sm cursor-pointer text-center"
                      >
                        {forgotLoading ? "Submitting..." : "Submit"}
                      </button>

                      {/* Green Alert Notification (Matching Screenshot 1) */}
                      {forgotSubmitted && !forgotError && (
                        <div className="mt-4 p-3.5 rounded-md bg-[#d5ebd0] border border-[#c3e6cb] text-[#285b2a] text-xs font-medium leading-relaxed">
                          You will get a link to reset your password if this email is registered with AI Smartgate Estate OS.
                        </div>
                      )}
                    </form>

                    {/* STEP 2: Inline OTP Entry & New Password (Architectural Flow Continuation) */}
                    {forgotSubmitted && !forgotError && (
                      <form onSubmit={handleResetPasswordWithOtp} className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5">
                        {/* Verify Email Id Section (Matching Screenshot 3) */}
                        <div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Verify Email Id
                          </p>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              maxLength={6}
                              value={forgotOtp}
                              onChange={(e) => {
                                setForgotOtp(e.target.value.replace(/\D/g, ""));
                                setForgotOtpError(null);
                              }}
                              placeholder="Enter OTP"
                              className={`w-32 rounded-md border ${
                                forgotOtpError ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                              } bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white tracking-widest focus:outline-none`}
                            />
                            <button
                              type="button"
                              disabled={forgotCooldown > 0 || forgotLoading}
                              onClick={() => void handleForgotSubmit()}
                              className="text-xs text-[#0284c7] hover:underline cursor-pointer disabled:opacity-50"
                            >
                              {forgotCooldown > 0 ? `Resend OTP (${forgotCooldown}s)` : "Resend OTP"}
                            </button>
                          </div>
                          {forgotOtpError && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              {forgotOtpError}
                            </p>
                          )}
                        </div>

                        {/* New Password & Confirm Password */}
                        <div className="space-y-2.5">
                          <div className="relative">
                            <input
                              type={forgotShowPassword ? "text" : "password"}
                              value={forgotNewPassword}
                              onChange={(e) => setForgotNewPassword(e.target.value)}
                              placeholder="New Password * (min 6 chars)"
                              required
                              minLength={6}
                              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 pr-9 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setForgotShowPassword((v) => !v)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {forgotShowPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>

                          <input
                            type={forgotShowPassword ? "text" : "password"}
                            value={forgotConfirmPassword}
                            onChange={(e) => setForgotConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password *"
                            required
                            minLength={6}
                            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                          />
                        </div>

                        {/* Reset Password Button: Blue Background */}
                        <button
                          type="submit"
                          disabled={forgotLoading || !forgotOtp.trim() || !forgotNewPassword}
                          className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer text-center"
                        >
                          {forgotLoading ? "Resetting Password..." : "Reset Password"}
                        </button>
                      </form>
                    )}

                    {/* Footer Link to return to Sign In */}
                    <div className="mt-5 text-center">
                      <button
                        type="button"
                        onClick={goToSignIn}
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
                      >
                        Already a User? Sign In
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW 2: SIGN UP (INDUSTRY STANDARD: JOIN WITH CODE & INVITED)   */}
            {/* ============================================================== */}
            {authMode === "signup" && (
              <div>
                <div className="mb-4 text-center sm:text-left">
                  <h2 className="text-xl font-bold text-[#1b2a47] dark:text-white tracking-tight">
                    {signUpStep === "success" ? "Registration Status" : "Sign Up"}
                  </h2>
                  <p className="text-xs text-muted font-medium mt-0.5">
                    {signUpStep === "success"
                      ? "Your flat registration has been received"
                      : signUpTab === "code"
                      ? "Register your flat using your society code"
                      : "Activate your pre-invited resident account"}
                  </p>
                </div>

                {/* State: Success Screen */}
                {signUpStep === "success" ? (
                  <div className="text-center py-3 space-y-4">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-sm">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Registration Submitted!
                      </h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        Your email has been verified. For community safety, new flat registrations require admin verification.
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 text-left space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        ⏳ Pending Society Admin Approval
                      </p>
                      <p className="text-xs text-muted leading-relaxed">
                        Your society committee will review Flat <b>{joinBlock}-{joinNumber}</b>. Once approved, you can sign in directly with:
                      </p>
                      <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 pt-1">
                        Email: {signUpEmail}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEmail(signUpEmail);
                        setPassword(joinPassword);
                        goToSignIn();
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                    >
                      Go to Sign In →
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Modern Segmented Tab Switcher */}
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-4 border border-slate-200/80 dark:border-slate-700/80">
                      <button
                        type="button"
                        onClick={() => {
                          setSignUpTab("code");
                          setSignUpError(null);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer ${
                          signUpTab === "code"
                            ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <Building2 size={13} />
                        <span>Society Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSignUpTab("invited");
                          setSignUpError(null);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer ${
                          signUpTab === "invited"
                            ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <UserCheck size={13} />
                        <span>Invited by Admin</span>
                      </button>
                    </div>

                    {signUpError && (
                      <div className="mb-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 font-semibold leading-relaxed">
                        {signUpError}
                      </div>
                    )}

                    {/* TAB 1: JOIN WITH SOCIETY CODE (Primary & default for residents) */}
                    {signUpTab === "code" && (
                      <form onSubmit={handleJoinCodeSubmit} className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                              Society Code *
                            </label>
                            <input
                              type="text"
                              required
                              value={joinCode}
                              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                              placeholder="e.g. SW-2026"
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-black tracking-wider uppercase focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={joinName}
                              onChange={(e) => setJoinName(e.target.value)}
                              placeholder="e.g. Sai Petha"
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                              Block / Wing *
                            </label>
                            <input
                              type="text"
                              required
                              value={joinBlock}
                              onChange={(e) => setJoinBlock(e.target.value)}
                              placeholder="e.g. A / Tower 1"
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                              Flat No. *
                            </label>
                            <input
                              type="text"
                              required
                              value={joinNumber}
                              onChange={(e) => setJoinNumber(e.target.value)}
                              placeholder="e.g. 101"
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                            Email Address (For Verification) *
                          </label>
                          <input
                            type="email"
                            required
                            value={signUpEmail}
                            onChange={(e) => {
                              setSignUpEmail(e.target.value);
                              setSignUpError(null);
                            }}
                            placeholder="resident@email.com"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                            Mobile Number (Optional)
                          </label>
                          <input
                            type="tel"
                            value={joinPhone}
                            onChange={(e) => setJoinPhone(e.target.value)}
                            placeholder="10-digit mobile (optional)"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                            Create Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showJoinPassword ? "text" : "password"}
                              required
                              minLength={6}
                              value={joinPassword}
                              onChange={(e) => setJoinPassword(e.target.value)}
                              placeholder="Min 6 characters"
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 pr-9 text-xs font-medium focus:border-blue-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowJoinPassword((v) => !v)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showJoinPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs transition shadow-sm cursor-pointer mt-2"
                        >
                          Verify Email & Submit Registration
                        </button>
                      </form>
                    )}

                    {/* TAB 2: INVITED BY ADMIN */}
                    {signUpTab === "invited" && (
                      <div>
                        {signUpStep === "form" && (
                          <div className="space-y-3.5">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                                Registered Email Address *
                              </label>
                              <input
                                type="email"
                                value={signUpEmail}
                                onChange={(e) => {
                                  setSignUpEmail(e.target.value);
                                  setSignUpError(null);
                                }}
                                placeholder="name@society.in"
                                required
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                              />
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Enter the email given to your society office during onboarding.
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={signUpLoading || !signUpEmail.trim()}
                              onClick={() => void handleSignUpRequestOtp()}
                              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-xs transition shadow-sm cursor-pointer text-center"
                            >
                              {signUpLoading ? "Checking Roster..." : "Request OTP to Activate"}
                            </button>
                          </div>
                        )}

                        {signUpStep === "otp" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Email: {signUpEmail}</span>
                              <button
                                type="button"
                                onClick={() => setSignUpStep("form")}
                                className="text-red-600 hover:underline text-[11px] font-bold"
                              >
                                Change
                              </button>
                            </div>

                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                                Enter 6-Digit Email Code
                              </label>
                              <input
                                type="text"
                                maxLength={6}
                                value={signUpOtp}
                                onChange={(e) => {
                                  setSignUpOtp(e.target.value.replace(/\D/g, ""));
                                  setSignUpOtpError(null);
                                }}
                                placeholder="• • • • • •"
                                className="w-full text-center tracking-[6px] font-mono font-bold text-lg py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-blue-500 focus:outline-none"
                              />
                              {signUpOtpError && (
                                <p className="text-xs text-red-600 mt-1 font-semibold">{signUpOtpError}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted">
                              <button
                                type="button"
                                disabled={signUpCooldown > 0 || signUpLoading}
                                onClick={() => void handleSignUpRequestOtp()}
                                className="text-blue-600 hover:underline cursor-pointer disabled:opacity-50 text-[11px] font-bold"
                              >
                                {signUpCooldown > 0 ? `Resend code in ${signUpCooldown}s` : "Resend code"}
                              </button>
                              <span className="text-[11px]">Valid for 10m</span>
                            </div>

                            <button
                              type="button"
                              disabled={signUpLoading || signUpOtp.length !== 6}
                              onClick={() => void handleSignUpVerifyOtp()}
                              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                            >
                              {signUpLoading ? "Verifying..." : "Verify Code"}
                            </button>
                          </div>
                        )}

                        {signUpStep === "details" && (
                          <form onSubmit={handleCompleteInvitedSignup} className="space-y-3">
                            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                              <Check size={14} /> Email verified! Create your account password:
                            </p>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                                New Password (min 6 chars) *
                              </label>
                              <input
                                type="password"
                                required
                                minLength={6}
                                value={joinPassword}
                                onChange={(e) => setJoinPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs transition shadow-sm cursor-pointer"
                            >
                              Activate Account & Enter
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Footer link to Sign In */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
                      <button
                        type="button"
                        onClick={goToSignIn}
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
                      >
                        Already have an account? <span className="font-bold text-primary">Sign In</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW 3: SIGN IN (MATCHING REFERENCE SIGN IN SCREEN)             */}
            {/* ============================================================== */}
            {authMode === "signin" && (
              <div>
                <h2 className="text-xl font-bold text-center text-[#1b2a47] dark:text-white mb-6 tracking-tight">
                  Sign in
                </h2>

                {loginError && (
                  <div className="p-3 mb-4 rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs font-semibold">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      inputMode="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="Email *"
                      required
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-slate-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="Password *"
                      required
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 pr-10 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-slate-500 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-0.5"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!ready}
                    className={`w-full py-2.5 rounded-md text-sm font-bold text-white transition shadow-sm cursor-pointer mt-2 ${
                      email.trim() && password
                        ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                        : "bg-blue-500/80 hover:bg-blue-600"
                    }`}
                  >
                    Sign In
                  </button>

                  {/* Footer Links: Forgot password? and Sign Up */}
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1b2a47] dark:text-slate-300 pt-3">
                    <button
                      type="button"
                      onClick={goToForgotPassword}
                      className="hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                    <button
                      type="button"
                      onClick={goToSignUp}
                      className="hover:underline cursor-pointer font-bold"
                    >
                      Sign Up
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* Subtle In-Modal Development Quick Sign-In Toggle (Works on both Sign In & Sign Up) */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setShowDevQuickLogin((v) => !v)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 mx-auto cursor-pointer py-0.5"
              >
                <Sparkles size={12} className="text-amber-500" />
                <span>{showDevQuickLogin ? "Hide Quick Dev Sign-In" : "⚡ Dev Quick Sign-In"}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${showDevQuickLogin ? "rotate-180" : ""}`} />
              </button>

              {showDevQuickLogin && (
                <div className="grid grid-cols-2 gap-1.5 mt-2.5 text-[11px] text-left animate-rise">
                  {DEV_USERS.map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => handleDevQuickSignIn(u)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-700 text-left cursor-pointer transition shadow-xs group"
                    >
                      <span className="font-bold text-slate-800 dark:text-white block truncate group-hover:text-primary transition">{u.name}</span>
                      <span className="text-[10px] text-primary font-semibold block">{u.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer Matching Reference: Terms of Use • Privacy Policy */}
      <footer className="relative z-20 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        Terms of Use • Privacy Policy
      </footer>

      {showJoinOtpModal && (
        <OtpVerificationModal
          open={showJoinOtpModal}
          onClose={() => setShowJoinOtpModal(false)}
          email={signUpEmail}
          phone={joinPhone}
          purpose="registration"
          onVerificationComplete={handleJoinOtpComplete}
        />
      )}
    </div>
  );
}

export default LoginPage;
