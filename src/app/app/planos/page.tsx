import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanosView } from "@/components/planos-view";
import { buildPlans } from "@/lib/plans";

export const metadata: Metadata = { title: "Planos" };

export default async function PlanosPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const cycle = sp.ciclo === "anual" ? "anual" : "mensal";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: row } = await supabase.from("profiles").select("plan").eq("user_id", user.id).maybeSingle();
  const current = ((row?.plan as "free" | "pro" | "max" | undefined) ?? "free");

  return <PlanosView cycle={cycle} plans={buildPlans(cycle, current)} />;
}
