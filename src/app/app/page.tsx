import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { goalsFor, profileFromRow } from "@/lib/nutrition";
import { dayRange, formatTime, saoPauloDay } from "@/lib/dates";
import { Card, MacroBar, Notice, Ring } from "@/components/ui";
import { MealForm, type FoodOption } from "@/components/meal-form";
import { deleteMeal } from "./actions";

export const metadata: Metadata = { title: "Hoje" };

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  snack: "Lanche da tarde",
  dinner: "Jantar",
};

type MealRow = {
  id: string;
  grams: number;
  meal_type: string;
  eaten_at: string;
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  foods: { name: string } | null;
};

export default async function HojePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("sex, age, weight_kg, height_cm, activity, diet")
    .eq("user_id", user.id)
    .maybeSingle();
  // Sem perfil, o primeiro acesso é o cadastro das medidas
  if (!profileRow) redirect("/app/perfil");

  const goals = goalsFor(profileFromRow(profileRow));
  const day = dayRange(saoPauloDay());

  const [{ data: meals }, { data: foods }] = await Promise.all([
    supabase
      .from("meals")
      .select("id, grams, meal_type, eaten_at, kcal, protein_g, carb_g, fat_g, foods(name)")
      .gte("eaten_at", day.from)
      .lt("eaten_at", day.to)
      .order("eaten_at", { ascending: false }),
    supabase.from("foods").select("id, name, kcal_100g").order("name"),
  ]);

  const list = (meals ?? []) as unknown as MealRow[];
  const sum = (k: "kcal" | "protein_g" | "carb_g" | "fat_g") => list.reduce((acc, m) => acc + Number(m[k]), 0);
  const consumedKcal = sum("kcal");
  const remaining = Math.max(goals.dailyKcal - consumedKcal, 0);
  const progress = goals.dailyKcal > 0 ? consumedKcal / goals.dailyKcal : 0;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-2">Hoje</p>
        <h1 className="text-[22px] font-semibold">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short", timeZone: "America/Sao_Paulo" })}
        </h1>
      </header>

      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}
      {sp.msg && <Notice tone="ok">{sp.msg}</Notice>}

      <Card>
        <Ring progress={progress} remaining={remaining} />
        <div className="mt-4 grid grid-cols-3 border-t border-track pt-4 text-center">
          <div><p className="text-sm text-text-2">Meta</p><p className="font-semibold">{goals.dailyKcal}</p><p className="text-xs text-text-2">kcal</p></div>
          <div><p className="text-sm text-text-2">Consumido</p><p className="font-semibold text-primary">{Math.round(consumedKcal)}</p><p className="text-xs text-text-2">kcal</p></div>
          <div><p className="text-sm text-text-2">Restante</p><p className="font-semibold text-carbs">{Math.round(remaining)}</p><p className="text-xs text-text-2">kcal</p></div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Macronutrientes</h2>
          <span className="text-sm text-text-2">Metas diárias</span>
        </div>
        <MacroBar label="Proteína" color="var(--protein)" consumed={sum("protein_g")} goal={goals.proteinG} />
        <MacroBar label="Carboidratos" color="var(--carbs)" consumed={sum("carb_g")} goal={goals.carbsG} />
        <MacroBar label="Gorduras" color="var(--fat)" consumed={sum("fat_g")} goal={goals.fatG} />
      </Card>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-semibold">Refeições de hoje</h2>
          <span className="text-sm text-text-2">{list.length} registradas</span>
        </div>
        {list.length === 0 && <Card><p className="text-sm text-text-2">Nenhuma refeição registrada ainda.</p></Card>}
        {list.map((m) => (
          <Card key={m.id} className="flex items-center gap-3 !p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{m.foods?.name ?? "Alimento"}</p>
              <p className="text-sm text-text-2">{Math.round(m.grams)} g • {MEAL_LABELS[m.meal_type]} • {formatTime(m.eaten_at)}</p>
            </div>
            <span className="text-sm font-semibold">{Math.round(m.kcal)} kcal</span>
            <form action={deleteMeal}>
              <input type="hidden" name="id" value={m.id} />
              <button className="px-2 text-sm font-semibold text-destructive" aria-label="Apagar refeição">✕</button>
            </form>
          </Card>
        ))}
      </section>

      <Card>
        <h2 className="mb-4 font-semibold">Registrar refeição</h2>
        <MealForm foods={(foods ?? []) as FoodOption[]} />
      </Card>
    </div>
  );
}
