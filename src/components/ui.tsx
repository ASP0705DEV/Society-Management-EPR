import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { readPhotoFile } from "@/lib/photo";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "ghost" | "danger" | "soft";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const look: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white hover:brightness-95",
    ghost: "border border-line bg-card text-foreground hover:bg-soft",
    danger: "bg-red-600 text-white hover:bg-red-700",
    soft: "bg-primary/10 text-primary hover:bg-primary/15",
  };
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition disabled:opacity-50 cursor-pointer",
        look[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <section onClick={onClick} className={cn("glass rounded-none p-5", className)}>
      {children}
    </section>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "info"; className?: string }) {
  const tones = {
    neutral: "bg-soft text-muted border-line",
    good: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
    bad: "bg-red-50 text-red-700 border-red-200",
    info: "bg-primary/10 text-primary border-primary/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">{label}</span>
      {children}
    </label>
  );
}

const controlClass =
  "w-full rounded-lg border border-line bg-card px-3.5 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={controlClass} {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={controlClass} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, "min-h-24")} {...props} />;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-soft p-8 text-center">
      <p className="font-extrabold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{children}</p>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-none border border-line bg-card p-6 shadow-2xl modal-frame">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black">{title}</h2>
          <button onClick={onClose} className="rounded-md px-2.5 py-1 text-sm font-bold text-muted hover:bg-soft hover:text-foreground cursor-pointer transition">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Avatar({ src, name, className }: { src?: string | null; name: string; className?: string }) {
  if (src) {
    return <img src={src} alt="" className={cn("h-12 w-12 rounded-lg object-cover", className)} />;
  }
  return (
    <div className={cn("grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-sm font-black text-primary", className)}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function PhotoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <Avatar src={value} name="?" className="h-16 w-16 text-lg rounded-lg" />
        <label className="cursor-pointer rounded-lg border border-line bg-soft px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition">
          Take or choose photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void readPhotoFile(file)
                .then((photo) => {
                  setError(null);
                  onChange(photo);
                })
                .catch(() => setError("That picture could not be used."));
            }}
          />
        </label>
        {value ? (
          <button type="button" className="text-xs font-bold text-muted cursor-pointer" onClick={() => onChange(null)}>
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
