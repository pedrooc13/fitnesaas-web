import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { goalsFor, profileFromRow } from "@/lib/nutrition";
import { dayRange, formatTime, saoPauloDay } from "@/lib/dates";
import { HojeView } from "@/components/hoje-view";
import type { FoodOption } from "@/components/meal-form";

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
  // Claro: "Sexta-feira, 24 Out". Escuro: "Sexta-feira, 24 de Outubro".
  const dateShort = dateCap.replace(/ de (\w+)$/, (_, m: string) => ` ${m.slice(0, 3).replace(/^./, (c) => c.toUpperCase())}`);

  return (
    <HojeView
      firstName={firstName}
      dateCap={dateCap}
      dateShort={dateShort}
      greeting={greeting()}
      goalKcal={goals.dailyKcal}
      consumed={consumed}
      remaining={remaining}
      progress={progress}
      macros={[
        { name: "Proteína", color: "var(--protein)", consumed: sum("protein_g"), goal: goals.proteinG },
        { name: "Carboidratos", color: "var(--carbs)", consumed: sum("carb_g"), goal: goals.carbsG },
        { name: "Gorduras", color: "var(--fat)", consumed: sum("fat_g"), goal: goals.fatG },
      ]}
      meals={list.map((m) => ({
        id: m.id,
        name: m.foods?.name ?? "Alimento",
        grams: Number(m.grams),
        mealType: m.meal_type,
        time: formatTime(m.eaten_at),
        kcal: Number(m.kcal),
        protein: Number(m.protein_g),
      }))}
      foods={(foods ?? []) as FoodOption[]}
      erro={sp.erro}
      msg={sp.msg}
    />
  );
}

