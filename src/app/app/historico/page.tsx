import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { goalsFor, profileFromRow } from "@/lib/nutrition";
import { dayRange, saoPauloDay } from "@/lib/dates";
import { Icon } from "@/components/icons";
import { Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Histórico" };

const DAY_MS = 24 * 3600 * 1000;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** Lista de dias YYYY-MM-DD entre dois dias (inclusive) */
function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let t = new Date(`${from}T12:00:00-03:00`).getTime(); t <= new Date(`${to}T12:00:00-03:00`).getTime(); t += DAY_MS) {
    out.push(saoPauloDay(new Date(t)));
  }
  return out;
}

export default async function HistoricoPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("sex, age, weight_kg, height_cm, activity, diet, plan")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profileRow) redirect("/app/perfil");

  const plan = profileRow.plan as "free" | "pro" | "max";
  const goal = goalsFor(profileFromRow(profileRow)).dailyKcal;
  const today = saoPauloDay();

  // Período: 7 ou 30 dias, ou personalizado (from/to)
  let period = sp.periodo ?? "7";
  let days: string[];
  if (period === "personalizado" && sp.de && sp.ate && YMD.test(sp.de) && YMD.test(sp.ate) && sp.de <= sp.ate) {
    days = daysBetween(sp.de, sp.ate).slice(0, 366);
  } else {
    period = period === "30" ? "30" : "7";
    days = daysBetween(saoPauloDay(new Date(Date.now() - (Number(period) - 1) * DAY_MS)), today);
  }

  // Plano Free: só 7 dias. Período maior ou personalizado fica bloqueado.
  const locked = plan === "free" && days.length > 7;
  const visible = locked ? days.slice(-7) : days;

  const { data: meals } = await supabase
    .from("meals")
    .select("eaten_at, kcal, protein_g, carb_g, fat_g")
    .gte("eaten_at", dayRange(visible[0]!).from)
    .lt("eaten_at", dayRange(visible[visible.length - 1]!).to);

  const byDay = new Map<string, { kcal: number; protein: number; carb: number; fat: number }>();
  for (const m of meals ?? []) {
    const d = saoPauloDay(new Date(m.eaten_at));
    const cur = byDay.get(d) ?? { kcal: 0, protein: 0, carb: 0, fat: 0 };
    cur.kcal += Number(m.kcal);
    cur.protein += Number(m.protein_g);
    cur.carb += Number(m.carb_g);
    cur.fat += Number(m.fat_g);
    byDay.set(d, cur);
  }

  const rows = visible.map((d) => ({ day: d, ...(byDay.get(d) ?? { kcal: 0, protein: 0, carb: 0, fat: 0 }) }));
  const withData = rows.filter((r) => r.kcal > 0);
  const avgKcal = withData.length ? Math.round(withData.reduce((a, r) => a + r.kcal, 0) / withData.length) : 0;
  const diffPct = goal > 0 && avgKcal > 0 ? Math.round(((avgKcal - goal) / goal) * 100) : null;
  // Meta atingida: com registro e até 10% acima da meta
  const metOk = rows.filter((r) => r.kcal > 0 && r.kcal <= goal * 1.1).length;
  const maxBar = Math.max(goal * 1.2, ...rows.map((r) => r.kcal));

  const totalKcal = withData.reduce((a, r) => a + r.kcal, 0);
  const avgProtein = withData.length ? withData.reduce((a, r) => a + r.protein, 0) / withData.length : 0;
  const avgCarb = withData.length ? withData.reduce((a, r) => a + r.carb, 0) / withData.length : 0;
  const avgFat = withData.length ? withData.reduce((a, r) => a + r.fat, 0) / withData.length : 0;
  const pctProtein = totalKcal ? Math.round((withData.reduce((a, r) => a + r.protein * 4, 0) / totalKcal) * 100) : 0;
  const pctCarb = totalKcal ? Math.round((withData.reduce((a, r) => a + r.carb * 4, 0) / totalKcal) * 100) : 0;
  const pctFat = totalKcal ? Math.round((withData.reduce((a, r) => a + r.fat * 9, 0) / totalKcal) * 100) : 0;

  const periodHref = (p: string) => `/app/historico?periodo=${p}`;
  const isActive = (p: string) => (period === p ? "bg-card text-text shadow-sm" : "text-text-2");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-bold">Histórico</h1>

      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}

      <nav className="grid grid-cols-3 gap-1 rounded-2xl bg-track/70 p-1 text-sm font-semibold">
        <Link href={periodHref("7")} className={`rounded-xl py-2.5 text-center ${isActive("7")}`}>7 dias</Link>
        <Link href={periodHref("30")} className={`rounded-xl py-2.5 text-center ${isActive("30")}`}>30 dias</Link>
        <Link href="/app/historico?periodo=personalizado" className={`rounded-xl py-2.5 text-center ${isActive("personalizado")}`}>Personalizado</Link>
      </nav>

      {period === "personalizado" && (
        <form className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-2xl bg-card p-3" method="get">
          <input type="hidden" name="periodo" value="personalizado" />
          <label className="flex flex-col gap-1 text-xs text-text-2">De
            <input type="date" name="de" defaultValue={sp.de} className="h-10 rounded-lg border border-track bg-background px-2 text-sm text-text" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-2">Até
            <input type="date" name="ate" defaultValue={sp.ate} className="h-10 rounded-lg border border-track bg-background px-2 text-sm text-text" />
          </label>
          <button type="submit" className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary">Ver</button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-2">Média calórica</p>
            <Icon name="flame" className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-lg font-bold">{avgKcal.toLocaleString("pt-BR")} <span className="text-sm font-normal text-text-2">kcal/dia</span></p>
          {diffPct !== null && (
            <span className="mt-2 inline-block rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
              {diffPct > 0 ? "+" : ""}{diffPct}% vs. meta
            </span>
          )}
        </div>
        <div className="rounded-2xl bg-card p-4">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-2">Metas atingidas</p>
            <Icon name="check" className="h-4 w-4 text-info" />
          </div>
          <p className="mt-3 text-lg font-bold">{metOk}/{rows.length} <span className="text-sm font-normal text-text-2">dias</span></p>
          <span className="mt-2 inline-block rounded-full bg-info/15 px-2 py-1 text-xs font-semibold text-info">
            {metOk === rows.length && rows.length > 0 ? "Excelente ritmo" : "Continue assim"}
          </span>
        </div>
      </div>

      <section className="rounded-2xl bg-card p-4">
        <div className="mb-3">
          <p className="font-semibold">Calorias consumidas</p>
          <div className="mt-1 flex items-center justify-between text-xs text-text-2">
            <span>Meta diária: {goal.toLocaleString("pt-BR")} kcal</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Normal</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-excess" />Excedido</span>
            </span>
          </div>
        </div>
        <div className="flex h-44 items-end gap-1.5">
          {rows.map((r) => {
            const h = maxBar > 0 ? (r.kcal / maxBar) * 100 : 0;
            const over = r.kcal > goal * 1.1;
            const weekday = new Date(`${r.day}T12:00:00-03:00`).toLocaleDateString("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" }).replace(".", "").slice(0, 3);
            return (
              <div key={r.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[9px] text-text-2">{r.kcal > 0 ? r.kcal.toLocaleString("pt-BR") : ""}</span>
                <div className="flex w-full flex-1 items-end rounded-md bg-track">
                  <div className={`w-full rounded-md ${over ? "bg-excess" : "bg-primary"}`} style={{ height: `${h}%` }} />
                </div>
                <span className="text-[10px] capitalize text-text-2">{weekday}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold">Distribuição de macros</p>
          <span className="text-xs text-text-2">Média diária</span>
        </div>
        <MacroBar label="Proteínas" color="var(--protein)" grams={avgProtein} pct={pctProtein} />
        <MacroBar label="Carboidratos" color="var(--info)" grams={avgCarb} pct={pctCarb} />
        <MacroBar label="Gorduras" color="var(--carbs)" grams={avgFat} pct={pctFat} />
      </section>

      {locked && (
        <section className="rounded-2xl bg-card p-5">
          <div className="flex items-start justify-between">
            <span className="rounded-md bg-primary/15 px-2 py-1 text-[11px] font-bold text-primary">PRO / MAX</span>
            <Icon name="lock" className="h-5 w-5 text-text-2" />
          </div>
          <p className="mt-3 font-semibold">Histórico completo e relatórios</p>
          <p className="mt-1 text-sm text-text-2">Veja 30 dias, períodos personalizados e tendências com o plano Pro.</p>
          <Link href="/app/planos" className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-on-primary">
            <Icon name="award" className="h-5 w-5" />Fazer upgrade para FitneSAAS Pro
          </Link>
        </section>
      )}
    </div>
  );
}

function MacroBar({ label, color, grams, pct }: { label: string; color: string; grams: number; pct: number }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between text-[15px]">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</span>
        <span>{Math.round(grams)}g <span className="text-xs text-text-2">({pct}%)</span></span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </div>
  );
}
