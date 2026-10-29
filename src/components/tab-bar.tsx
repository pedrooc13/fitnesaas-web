"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

const TABS = [
  { href: "/app", label: "Hoje", icon: "calendar" },
  { href: "/app/historico", label: "Histórico", icon: "history" },
  { href: "/app/planos", label: "Planos", icon: "star" },
  { href: "/app/configuracoes", label: "Configurações", icon: "gear" },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md border-t border-track bg-card/95 px-1 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur">
      {TABS.map((t) => {
        const active = t.href === "/app" ? pathname === "/app" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium ${active ? "text-primary" : "text-text-2"}`}
          >
            <Icon name={t.icon} className="h-6 w-6" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
