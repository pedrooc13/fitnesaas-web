import type { InputHTMLAttributes, ReactNode } from "react";

/** Campo com ícone dentro, no estilo do design de login */
export function AuthInput({ icon, trailing, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="flex h-14 items-center gap-3 rounded-2xl bg-track/70 px-4 focus-within:ring-2 focus-within:ring-primary">
      <span className="text-text-2">{icon}</span>
      <input
        {...props}
        className="min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-text-2"
      />
      {trailing}
    </div>
  );
}

export const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
