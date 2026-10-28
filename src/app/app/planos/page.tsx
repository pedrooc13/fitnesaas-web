import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Card } from "@/components/ui";

export const metadata: Metadata = { title: "Planos" };

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "Grátis",
    color: "var(--plan-free)",
    features: ["Cálculo de TMB, GETD e metas", "Registro por busca e gramas", "Painel de metas do dia", "Histórico dos últimos 7 dias"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 15,00/mês",
    color: "var(--primary)",
    features: ["Histórico ilimitado", "Relatórios semanais e mensais", "Metas personalizadas", "Planos de dieta próprios", "Refeições favoritas", "Exportação em PDF e CSV"],
  },
  {
    id: "max",
    name: "Max",
    price: "R$ 35,00/mês",
    color: "var(--plan-max)",
    features: ["Tudo do plano Pro", "Análise de padrões alimentares", "Sugestões para completar os macros", "Registro por foto do prato", "Leitura de código de barras", "Compartilhar com nutricionista (somente leitura)"],
  },
];

export default async function PlanosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: row } = await supabase.from("profiles").select("plan").eq("user_id", user.id).maybeSingle();
  const current = row?.plan ?? "free";

  return (
    <div className="flex flex-col gap-4">
      <header className="text-center">
        <h1 className="text-[22px] font-semibold">Eleve seus resultados</h1>
        <p className="text-sm text-text-2">Histórico completo, relatórios e análises para acompanhar sua evolução.</p>
      </header>

      {PLANS.map((p) => {
        const isCurrent = p.id === current;
        return (
          <Card key={p.id} className={p.id === "pro" ? "ring-2 ring-primary" : ""}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: p.color }}>{p.name}</span>
              {isCurrent && <span className="rounded-full bg-track px-3 py-1 text-xs font-bold">Seu plano</span>}
            </div>
            <p className="mt-1 text-[22px] font-bold">{p.price}</p>
            <ul className="mt-3 flex flex-col gap-2 text-[15px]">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2"><span style={{ color: p.color }}>✓</span>{f}</li>
              ))}
            </ul>
            <div className="mt-4">
              {/* Pagamento ainda não está ligado: os botões de upgrade ficam desativados */}
              <Button disabled variant={isCurrent ? "secondary" : "primary"}>
                {isCurrent ? "Plano atual" : p.id === "free" ? "Plano Free" : "Em breve"}
              </Button>
            </div>
          </Card>
        );
      })}

      <p className="px-2 text-center text-[11px] text-text-2">
        A assinatura é renovada automaticamente todo mês, a menos que seja cancelada pelo menos 24 horas antes do fim do período.
      </p>
    </div>
  );
}
