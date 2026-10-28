import Link from "next/link";
import type { ReactNode } from "react";

const tabs = [
  { href: "/app", label: "Hoje", icon: "M3 6h18M3 12h18M3 18h12" },
  { href: "/app/historico", label: "Histórico", icon: "M12 8v4l3 2M3 12a9 9 0 1 0 3-6.7" },
  { href: "/app/planos", label: "Planos", icon: "M12 3l2.6 5.6 6.1.8-4.5 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.3 9.4l6.1-.8z" },
  { href: "/app/configuracoes", label: "Configurações", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md justify-around border-t border-track bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium text-text-2">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={t.icon} />
            </svg>
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
