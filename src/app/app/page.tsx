import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { goalsFor, profileFromRow } from "@/lib/nutrition";
import { dayRange, formatTime, saoPauloDay } from "@/lib/dates";
import { Icon } from "@/components/icons";
import { Notice, Ring } from "@/components/ui";
import { MealForm, type FoodOption } from "@/components/meal-form";
import { deleteMeal } from "./actions";

export const metadata: Metadata = { title: "Hoje" };

const MEAL_STYLE: Record<string, { label: string; icon: string; color: string }> = {
  breakfast: { label: "Café da manhã", icon: "sun", color: "text-primary" },
  lunch: { label: "Almoço", icon: "utensils", color: "text-carbs" },
  snack: { label: "Lanche da tarde", icon: "cup", color: "text-info" },
  dinner: { label: "Jantar", icon: "moon", color: "text-text-2" },
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

function greeting(): string {
  const hour = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }));
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function HojePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("sex, age, weight_kg, height_cm, activity, diet")
    .eq("user_id", user.id)
    .maybeSingle();
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
  const consumed = sum("kcal");
  const remaining = Math.max(goals.dailyKcal - consumed, 0);
  const progress = goals.dailyKcal > 0 ? consumed / goals.dailyKcal : 0;
  const firstName = ((user.user_metadata?.name as string | undefined) ?? "").split(" ")[0];
  const dateText = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" });
  const dateCap = dateText.charAt(0).toUpperCase() + dateText.slice(1);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold">Hoje</h1>
        <Link href="/app/configuracoes" aria-label="Minha conta" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="user" className="h-5 w-5" />
        </Link>
      </header>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[15px] text-text-2">{dateCap}</p>
          <p className="text-[15px] text-text-2">{greeting()}{firstName ? `, ${firstName}` : ""}</p>
        </div>
        <Link href="/app/historico" className="flex items-center gap-1.5 rounded-full bg-track px-3 py-2 text-sm font-semibold text-primary">
          <Icon name="history" className="h-4 w-4" />Histórico
        </Link>
      </div>

      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}
      {sp.msg && <Notice tone="ok">{sp.msg}</Notice>}

      <section className="rounded-2xl bg-card p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm text-text-2">Balanço energético</p>
            <p className="font-semibold">Calorias diárias</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Icon name="flame" className="h-5 w-5" />
          </span>
        </div>
        <div className="grid grid-cols-[1fr_1.1fr] items-center gap-4">
          <Ring progress={progress} remaining={remaining} />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5">
              <span className="text-sm text-text-2">Meta</span>
              <span className="font-bold">{goals.dailyKcal} kcal</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5">
              <span className="text-sm text-text-2">Consumido</span>
              <span className="font-bold text-primary">{Math.round(consumed)} kcal</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5">
              <span className="text-sm text-text-2">Restante</span>
              <span className="font-bold text-carbs">{Math.round(remaining)} kcal</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-2">Macronutrientes</p>
          <MacroLine name="Proteína" color="var(--protein)" consumed={sum("protein_g")} goal={goals.proteinG} />
          <MacroLine name="Carboidratos" color="var(--carbs)" consumed={sum("carb_g")} goal={goals.carbsG} />
          <MacroLine name="Gorduras" color="var(--fat)" consumed={sum("fat_g")} goal={goals.fatG} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-semibold">Refeições de hoje</h2>
          <span className="text-sm text-text-2">{list.length} registradas</span>
        </div>
        {list.length === 0 && (
          <div className="rounded-2xl bg-card p-4 text-sm text-text-2">Nenhuma refeição registrada ainda.</div>
        )}
        {list.map((m) => {
          const style = MEAL_STYLE[m.meal_type] ?? MEAL_STYLE.snack!;
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card p-3">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-track ${style.color}`}>
                <Icon name={style.icon} className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{m.foods?.name ?? "Alimento"}</p>
                <p className="truncate text-sm text-text-2">{style.label} • {formatTime(m.eaten_at)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{Math.round(m.kcal)} kcal</p>
                <p className="text-sm font-semibold text-primary">P: {Math.round(m.protein_g)}g</p>
              </div>
              <form action={deleteMeal}>
                <input type="hidden" name="id" value={m.id} />
                <button className="flex h-9 w-9 items-center justify-center text-destructive" aria-label="Apagar refeição">
                  <Icon name="trash" className="h-5 w-5" />
                </button>
              </form>
            </div>
          );
        })}
      </section>

      <section id="registrar" className="rounded-2xl bg-card p-5">
        <h2 className="mb-4 font-semibold">Registrar refeição</h2>
        <MealForm foods={(foods ?? []) as FoodOption[]} />
      </section>

      <a
        href="#registrar"
        aria-label="Registrar refeição"
        className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg"
      >
        <Icon name="plus" className="h-7 w-7" />
      </a>
    </div>
  );
}

function MacroLine({ name, color, consumed, goal }: { name: string; color: string; consumed: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[15px]">
        <span>{name}</span>
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
