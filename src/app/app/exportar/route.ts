import { createClient } from "@/lib/supabase/server";

/** Exporta as refeições do usuário logado em CSV (LGPD: portabilidade) */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Não autorizado", { status: 401 });

  const { data, error } = await supabase
    .from("meals")
    .select("eaten_at, meal_type, grams, kcal, protein_g, carb_g, fat_g, foods(name)")
    .order("eaten_at", { ascending: true });
  if (error) return new Response("Erro ao exportar", { status: 500 });

  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = (data ?? []).map((m) => {
    const food = (m.foods as unknown as { name: string } | null)?.name ?? "";
    return [m.eaten_at, m.meal_type, food, m.grams, m.kcal, m.protein_g, m.carb_g, m.fat_g].map(esc).join(",");
  });
  const csv = ["data,refeicao,alimento,gramas,kcal,proteina_g,carboidrato_g,gordura_g", ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fitnesaas-refeicoes.csv"',
    },
  });
}
