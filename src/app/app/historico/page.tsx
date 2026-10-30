import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { goalsFor, profileFromRow } from "@/lib/nutrition";
import { dayRange, saoPauloDay } from "@/lib/dates";
import { HistoricoView } from "@/components/historico-view";

export const metadata: Metadata = { title: "Histórico" };

const DAY_MS = 24 * 3600 * 1000;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

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

  let period: "7" | "30" | "personalizado" = sp.periodo === "30" ? "30" : sp.periodo === "personalizado" ? "personalizado" : "7";
  let days: string[];
  if (period === "personalizado" && sp.de && sp.ate && YMD.test(sp.de) && YMD.test(sp.ate) && sp.de <= sp.ate) {
    days = daysBetween(sp.de, sp.ate).slice(0, 366);
  } else {
    if (period === "personalizado") period = "7";
    days = daysBetween(saoPauloDay(new Date(Date.now() - (Number(period) - 1) * DAY_MS)), today);
  }

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
  const metOk = rows.filter((r) => r.kcal > 0 && r.kcal <= goal * 1.1).length;
  const maxBar = Math.max(goal * 1.2, ...rows.map((r) => r.kcal));

  const totalKcal = withData.reduce((a, r) => a + r.kcal, 0);
  const avg = (k: "protein" | "carb" | "fat") => (withData.length ? withData.reduce((a, r) => a + r[k], 0) / withData.length : 0);
  const pct = (factor: number, k: "protein" | "carb" | "fat") =>
    totalKcal ? Math.round((withData.reduce((a, r) => a + r[k] * factor, 0) / totalKcal) * 100) : 0;

  const weekday = (day: string) => new Date(`${day}T12:00:00-03:00`).toLocaleDateString("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" }).replace(".", "").slice(0, 3);
  const capWeekday = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <HistoricoView
      period={period}
      goal={goal}
      avgKcal={avgKcal}
      diffPct={diffPct}
      metOk={metOk}
      total={rows.length}
      days={rows.map((r) => ({ label: capWeekday(weekday(r.day)), kcal: Math.round(r.kcal), over: r.kcal > goal * 1.1 }))}
      maxBar={maxBar}
      macros={[
        { name: "Proteínas", color: "var(--protein)", grams: avg("protein"), pct: pct(4, "protein") },
        { name: "Carboidratos", color: "var(--info)", grams: avg("carb"), pct: pct(4, "carb") },
        { name: "Gorduras", color: "var(--carbs)", grams: avg("fat"), pct: pct(9, "fat") },
      ]}
      locked={locked}
      erro={sp.erro}
      customForm={period === "personalizado" ? (
        <form className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-2xl bg-card p-3" method="get">
          <input type="hidden" name="periodo" value="personalizado" />
          <label className="flex flex-col gap-1 text-[12px] text-text-2">De
            <input type="date" name="de" defaultValue={sp.de} className="h-10 rounded-lg border border-track bg-background px-2 text-[15px] text-text" />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-text-2">Até
            <input type="date" name="ate" defaultValue={sp.ate} className="h-10 rounded-lg border border-track bg-background px-2 text-[15px] text-text" />
          </label>
          <button type="submit" className="h-10 rounded-lg bg-primary px-3 text-[15px] font-semibold text-on-primary">Ver</button>
        </form>
      ) : undefined}
    />
  );
}
