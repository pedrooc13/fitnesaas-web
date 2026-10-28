import type { InputHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-card p-4 ${className}`}>{children}</section>;
}

export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-2">{label}</span>
      <input
        {...props}
        className="h-12 rounded-xl border border-track bg-card px-4 text-base text-text outline-none focus:border-primary"
      />
    </label>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }: { children: ReactNode; variant?: "primary" | "secondary" | "destructive" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-primary text-on-primary",
    secondary: "bg-track text-text",
    destructive: "bg-destructive/10 text-destructive",
  }[variant];
  return (
    <button
      {...props}
      className={`flex h-12 w-full items-center justify-center rounded-xl px-4 text-base font-semibold disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Notice({ tone, children }: { tone: "error" | "ok"; children: ReactNode }) {
  const styles = tone === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary";
  return <p role="alert" className={`rounded-xl px-4 py-3 text-sm font-medium ${styles}`}>{children}</p>;
}

export function MacroBar({ label, color, consumed, goal }: { label: string; color: string; consumed: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[15px]">
        <span className="flex items-center gap-2 text-text">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="text-text-2">
          {Math.round(consumed)}g / <b className="text-text">{Math.round(goal)}g</b>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/** Anel de progresso em SVG (sem JavaScript no cliente) */
export function Ring({ progress, remaining }: { progress: number; remaining: number }) {
  const r = 84;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(Math.max(progress, 0), 1));
  return (
    <div className="relative mx-auto h-[200px] w-[200px]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--track)" strokeWidth="16" />
        <circle
          cx="100" cy="100" r={r} fill="none" stroke="var(--primary)" strokeWidth="16"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm text-text-2">Restante</span>
        <span className="text-[34px] font-bold leading-tight">{Math.round(remaining)}</span>
        <span className="text-sm font-semibold text-primary">kcal disp.</span>
      </div>
    </div>
  );
}
