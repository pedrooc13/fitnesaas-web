import Link from "next/link";
import { Icon } from "@/components/icons";
import { Notice } from "@/components/ui";
import { Pill, TopBar } from "@/components/screen-parts";

export interface HistDay { label: string; kcal: number; over: boolean; }
export interface HistProps {
  period: "7" | "30" | "personalizado";
  goal: number;
  avgKcal: number;
  diffPct: number | null;
  metOk: number;
  total: number;
  days: HistDay[];
  maxBar: number;
  macros: Array<{ name: string; color: string; grams: number; pct: number }>;
  locked: boolean;
  erro?: string;
  customForm?: React.ReactNode;
}

const TAB = (active: boolean) => (active ? "bg-track text-text shadow-sm" : "text-text-2");

export function HistoricoView(p: HistProps) {
  return (
    <div className="flex flex-col gap-4">
      <TopBar title="Histórico" />
      {p.erro && <Notice tone="error">{p.erro}</Notice>}

      <nav className="grid grid-cols-3 gap-1 rounded-2xl bg-track p-1 text-[15px] font-medium">
        <Link href="/app/historico?periodo=7" className={`rounded-xl py-2 text-center ${TAB(p.period === "7")}`}>7 dias</Link>
        <Link href="/app/historico?periodo=30" className={`rounded-xl py-2 text-center ${TAB(p.period === "30")}`}>30 dias</Link>
        <Link href="/app/historico?periodo=personalizado" className={`rounded-xl py-2 text-center ${TAB(p.period === "personalizado")}`}>Personalizado</Link>
      </nav>
      {p.customForm}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3 rounded-2xl bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-2">Média calórica</p>
            <Icon name="flame" className="h-4 w-4 text-primary" />
          </div>
          <p className="text-[20px] font-bold leading-tight">{p.avgKcal.toLocaleString("pt-BR")} <span className="text-[13px] font-normal text-text-2">kcal/dia</span></p>
          {p.diffPct !== null && <Pill>{p.diffPct > 0 ? "+" : ""}{p.diffPct}% vs. meta</Pill>}
        </div>
        <div className="flex flex-col gap-3 rounded-2xl bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-2">Metas atingidas</p>
            <Icon name="check" className="h-4 w-4 text-info" />
          </div>
          <p className="text-[20px] font-bold leading-tight">{p.metOk}/{p.total} <span className="text-[13px] font-normal text-text-2">dias</span></p>
          <Pill tone="info">{p.total > 0 && p.metOk / p.total >= 0.8 ? "Excelente ritmo" : "Continue assim"}</Pill>
        </div>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl bg-card p-4">
        <div>
          <p className="text-[17px] font-semibold">Calorias consumidas</p>
          <div className="mt-1 flex items-center justify-between text-[13px] text-text-2">
            <span>Meta diária: {p.goal.toLocaleString("pt-BR")} kcal</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Normal</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-excess" />Excedido</span>
            </span>
          </div>
        </div>
        <div className="flex h-44 items-end gap-2">
          {p.days.map((d, i) => {
            const h = p.maxBar > 0 ? (d.kcal / p.maxBar) * 100 : 0;
            return (
              <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span className={`text-[10px] ${d.over ? "text-excess" : "text-text-2"}`}>{d.kcal > 0 ? d.kcal.toLocaleString("pt-BR") : ""}</span>
                <div className="flex w-full flex-1 items-end rounded-md bg-track">
                  <div className={`w-full rounded-md ${d.over ? "bg-excess" : "bg-primary"}`} style={{ height: `${h}%` }} />
                </div>
                <span className="text-[11px] text-text-2">{d.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-[17px] font-semibold">Distribuição de macros</p>
          <span className="text-[15px] text-text-2">Média diária</span>
        </div>
        {p.macros.map((m) => (
          <div key={m.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[15px]">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.name}</span>
              <span>{Math.round(m.grams)}g <span className="text-[12px] text-text-2">({m.pct}%)</span></span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-track">
              <div className="h-full rounded-full" style={{ width: `${Math.min(m.pct, 100)}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </section>

      {p.locked && (
        <section className="flex flex-col gap-3 rounded-2xl bg-card p-5">
          <div className="flex items-start justify-between">
            <span className="rounded-md bg-primary/15 px-2 py-1 text-[11px] font-bold text-primary">PRO / MAX</span>
            <Icon name="lock" className="h-5 w-5 text-text-2" />
          </div>
          <p className="text-[17px] font-semibold">Relatórios avançados</p>
          <p className="text-[15px] text-text-2">Desbloqueie tendências de calorias por mês e análises de padrões alimentares.</p>
          <Link href="/app/planos" className="flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-primary text-[15px] font-semibold text-on-primary">
            <Icon name="award" className="h-5 w-5" />Fazer upgrade para FitneSAAS Pro
          </Link>
        </section>
      )}
    </div>
  );
}
