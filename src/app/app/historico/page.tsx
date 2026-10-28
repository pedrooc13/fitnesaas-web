import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { goalsFor, profileFromRow } from "@/lib/nutrition";
import { dayRange, formatDayLabel, lastDays, saoPauloDay } from "@/lib/dates";
import { Card, Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Histórico" };

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
  const historyDays = plan === "free" ? 7 : 365;
  const goal = goalsFor(profileFromRow(profileRow)).dailyKcal;

  const days = lastDays(historyDays);
  const range = { from: dayRange(days[0]!).from, to: dayRange(days[days.length - 1]!).to };

  const { data: meals } = await supabase
    .from("meals")
    .select("eaten_at, kcal")
    .gte("eaten_at", range.from)
    .lt("eaten_at", range.to);

  // Soma por dia em horário de São Paulo
  const totals = new Map<string, number>();
  for (const m of meals ?? []) {
    const day = saoPauloDay(new Date(m.eaten_at));
    totals.set(day, (totals.get(day) ?? 0) + Number(m.kcal));
  }
  const rows = days.map((d) => ({ day: d, kcal: Math.round(totals.get(d) ?? 0) }));
  const max = Math.max(goal, ...rows.map((r) => r.kcal));
  const withData = rows.filter((r) => r.kcal > 0);
  const average = withData.length ? Math.round(withData.reduce((a, r) => a + r.kcal, 0) / withData.length) : 0;
  const onGoal = rows.filter((r) => r.kcal > 0 && Math.abs(r.kcal - goal) <= goal * 0.1).length;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-[22px] font-semibold">Histórico</h1>
        <p className="text-sm text-text-2">Últimos {historyDays} dias</p>
      </header>

      {sp.msg && <Notice tone="ok">{sp.msg}</Notice>}

      <Card>
        <div className="flex h-48 items-end gap-1.5">
          {rows.map((r) => {
            const h = max > 0 ? (r.kcal / max) * 100 : 0;
            return (
              <div key={r.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div className="w-full rounded-t bg-primary" style={{ height: `${h}%`, minHeight: r.kcal > 0 ? 4 : 0 }} title={`${r.kcal} kcal`} />
                <span className="text-[10px] capitalize text-text-2">{formatDayLabel(r.day).slice(0, 3)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-text-2">Meta diária: {goal} kcal</p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-text-2">Média diária</p>
          <p className="font-semibold">{average} kcal</p>
        </Card>
        <Card>
          <p className="text-sm text-text-2">Dias na meta</p>
          <p className="font-semibold">{onGoal} de {withData.length || 0}</p>
        </Card>
      </div>

      {plan === "free" && (
        <Card className="text-sm">
          <p className="font-semibold">Quer ver mais?</p>
          <p className="text-text-2">O plano Pro libera histórico completo.</p>
          <Link href="/app/planos" className="mt-2 inline-block font-semibold text-primary">Ver planos</Link>
        </Card>
      )}
    </div>
  );
}
