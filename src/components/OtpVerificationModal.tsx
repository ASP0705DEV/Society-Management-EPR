import { useState, useEffect, useRef } from "react";
import { Mail, Smartphone, ShieldCheck, ArrowRight, RotateCw, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { otpClient } from "@/lib/otp-client";
import { toast } from "@/stores/use-toast";
import type { OtpPurpose } from "@/types";

interface OtpVerificationModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  phone: string;
  purpose?: OtpPurpose;
  onVerificationComplete: () => void;
}

export function OtpVerificationModal({
  open,
  onClose,
  email,
  phone,
  purpose = "registration",
  onVerificationComplete,
}: OtpVerificationModalProps) {
  const [step, setStep] = useState<"email" | "mobile" | "done">("email");

  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailLoading, setEmailLoading] = useState(false);

  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileCooldown, setMobileCooldown] = useState(0);
  const [mobileLoading, setMobileLoading] = useState(false);

  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanEmail = email.trim();
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);

  const hasInitiated = useRef(false);

  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = setInterval(() => setEmailCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [emailCooldown]);

  useEffect(() => {
    if (mobileCooldown <= 0) return;
    const timer = setInterval(() => setMobileCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [mobileCooldown]);

  useEffect(() => {
    if (open && !hasInitiated.current) {
      hasInitiated.current = true;
      setStep("email");
      setEmailOtp("");
      setMobileOtp("");
      setError(null);
      void requestEmailOtp();
    } else if (!open) {
      hasInitiated.current = false;
    }
  }, [open]);

  async function requestEmailOtp() {
    if (!cleanEmail) {
      setError("Email address is required.");
      return;
    }
    setEmailLoading(true);
    setError(null);
    try {
      const res = await otpClient.sendEmailOtp(cleanEmail, purpose);
      setEmailCooldown(res.cooldownSeconds || 60);
      if (res.devOtp) {
        setDevOtpCode(res.devOtp);
      }
      toast.info(`Verification code sent to ${cleanEmail}`, "Email OTP Dispatched");
    } catch (err: any) {
      setError(err.message || "Failed to dispatch email verification code.");
      toast.error(err.message || "Email OTP dispatch failed", "SMTP Error");
    } finally {
      setEmailLoading(false);
    }
  }

  async function requestMobileOtp() {
    if (!cleanPhone) {
      setError("Mobile phone number is required.");
      return;
    }
    setMobileLoading(true);
    setError(null);
    try {
      const res = await otpClient.sendSmsOtp(cleanPhone, purpose);
      setMobileCooldown(res.cooldownSeconds || 60);
      toast.info(`SMS code sent to +91 ${cleanPhone}`, "Mobile OTP Dispatched");
    } catch (err: any) {
      setError(err.message || "Failed to dispatch mobile verification code.");
      toast.error(err.message || "SMS OTP dispatch failed", "SMS Provider Error");
    } finally {
      setMobileLoading(false);
    }
  }

  async function handleVerifyEmail() {
    if (!emailOtp.trim() || emailOtp.trim().length !== 6) {
      setError("Please enter the 6-digit code sent to your email.");
      return;
    }
    setEmailLoading(true);
    setError(null);
    try {
      const res = await otpClient.verifyOtp(cleanEmail, emailOtp.trim(), "email", purpose);
      if (!res.success) {
        setError(res.message);
        toast.error(res.message, "Email Verification Failed");
        return;
      }
      setEmailVerified(true);
      toast.success("Email verified successfully!", "Verification Complete");
      setStep("done");
      onVerificationComplete();
    } catch (err: any) {
      setError(err.message || "Email verification failed.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleVerifyMobile() {
    setStep("done");
    onVerificationComplete();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1a30] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Verify Your Account</h3>
              <p className="text-xs text-muted font-semibold">Email Security Verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-3">
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 p-2.5 border border-blue-100 dark:border-blue-900/50">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-white text-[11px] font-black shrink-0">
              {emailVerified ? "✓" : "1"}
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">Email OTP Verification</span>
              <span className="text-[11px] text-muted ml-1.5">(SMS verification optional for this phase)</span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {step === "email" && (
            <div className="space-y-3.5">
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-muted">
                  We've sent a 6-digit verification code to:
                </p>
                <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{cleanEmail}</p>
              </div>

              {devOtpCode && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-2.5 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                  <span>Code Sent to Inbox: <strong className="font-mono text-sm tracking-widest text-primary">{devOtpCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setEmailOtp(devOtpCode)}
                    className="text-[11px] font-bold underline cursor-pointer text-blue-600 hover:text-blue-800"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Email Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[8px] font-mono font-black text-xl py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-muted pt-1">
                <button
                  type="button"
                  disabled={emailCooldown > 0 || emailLoading}
                  onClick={() => void requestEmailOtp()}
                  className="flex items-center gap-1.5 hover:text-blue-600 disabled:opacity-50 cursor-pointer transition"
                >
                  <RotateCw size={12} className={emailLoading ? "animate-spin" : ""} />
                  {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : "Resend Email Code"}
                </button>
                <span className="text-[11px] text-muted">Expires in 10 mins</span>
              </div>

              <button
                type="button"
                onClick={() => void handleVerifyEmail()}
                disabled={emailLoading || emailOtp.length !== 6}
                className="w-full min-h-11 rounded-lg text-sm font-black cursor-pointer mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white transition flex items-center justify-center gap-2"
              >
                {emailLoading ? "Verifying..." : "Verify Email & Continue"} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === "mobile" && (
            <div className="space-y-3.5">
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-muted">
                  We've sent a 6-digit SMS verification code to:
                </p>
                <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                  +91 {cleanPhone.slice(0, 5)} {cleanPhone.slice(5)}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Mobile Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mobileOtp}
                  onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[8px] font-mono font-black text-xl py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-muted pt-1">
                <button
                  type="button"
                  disabled={mobileCooldown > 0 || mobileLoading}
                  onClick={() => void requestMobileOtp()}
                  className="flex items-center gap-1.5 hover:text-blue-600 disabled:opacity-50 cursor-pointer transition"
                >
                  <RotateCw size={12} className={mobileLoading ? "animate-spin" : ""} />
                  {mobileCooldown > 0 ? `Resend in ${mobileCooldown}s` : "Resend SMS Code"}
                </button>
                <span className="text-[11px] text-muted">Expires in 10 mins</span>
              </div>

              <button
                type="button"
                onClick={() => void handleVerifyMobile()}
                disabled={mobileLoading || mobileOtp.length !== 6}
                className="w-full min-h-11 rounded-lg text-sm font-black cursor-pointer mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white transition flex items-center justify-center gap-2"
              >
                {mobileLoading ? "Verifying..." : "Verify Mobile & Complete"} <CheckCircle2 size={16} />
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 size={28} className="stroke-[2.5]" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">Verification Complete!</h4>
              <p className="text-xs text-muted max-w-xs mx-auto">
                Your email and mobile credentials have been verified.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-11 rounded-lg text-sm font-black cursor-pointer mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtpVerificationModal;
