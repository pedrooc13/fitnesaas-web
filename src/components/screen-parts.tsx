import Link from "next/link";
import { Icon } from "@/components/icons";

/** Cabeçalho padrão das telas: título à esquerda, sino e conta à direita (como nos designs) */
export function TopBar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-[17px] font-semibold text-text">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-text-2" aria-hidden><Icon name="bell" className="h-5 w-5" /></span>
        <Link href="/app/configuracoes" aria-label="Minha conta" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="user" className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

export function Pill({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "info" | "excess" }) {
  const cls = tone === "primary" ? "bg-primary/15 text-primary" : tone === "info" ? "bg-info/15 text-info" : "bg-excess/15 text-excess";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}>{children}</span>;
}
