import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  FileEdit,
} from "lucide-react";
import { useToastStore, type ToastItem } from "@/stores/use-toast";

function ToastNotificationCard({ toast }: { toast: ToastItem }) {
  const removeToast = useToastStore((state) => state.removeToast);

  const config = {
    success: {
      border: "border-emerald-500/30 dark:border-emerald-500/40",
      bgBadge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      iconBg: "bg-emerald-500 text-white",
      icon: CheckCircle2,
      shadow: "shadow-emerald-500/10",
    },
    error: {
      border: "border-rose-500/30 dark:border-rose-500/40",
      bgBadge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
      iconBg: "bg-rose-500 text-white",
      icon: AlertCircle,
      shadow: "shadow-rose-500/10",
    },
    warning: {
      border: "border-amber-500/30 dark:border-amber-500/40",
      bgBadge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      iconBg: "bg-amber-500 text-white",
      icon: AlertTriangle,
      shadow: "shadow-amber-500/10",
    },
    info: {
      border: "border-sky-500/30 dark:border-sky-500/40",
      bgBadge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
      iconBg: "bg-sky-500 text-white",
      icon: Info,
      shadow: "shadow-sky-500/10",
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${config.border} bg-white/95 dark:bg-[#0c1a30]/95 p-3.5 sm:p-4 shadow-[0_12px_36px_rgba(15,43,92,0.14)] ${config.shadow} backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconBg} shadow-xs`}>
        {toast.fieldName ? <FileEdit size={16} /> : <Icon size={16} />}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {toast.fieldName && (
          <div className="mb-1 flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${config.bgBadge}`}>
              <FileEdit size={9} /> Input: {toast.fieldName}
            </span>
          </div>
        )}

        {toast.title && !toast.fieldName && (
          <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
            {toast.title}
          </p>
        )}

        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none w-[calc(100vw-2rem)] sm:w-auto"
    >
      {toasts.map((item) => (
        <ToastNotificationCard key={item.id} toast={item} />
      ))}
    </div>
  );
}
