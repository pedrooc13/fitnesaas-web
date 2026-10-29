import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Planos" };

const PRICES = { pro: 15, max: 35 };
const ANNUAL_DISCOUNT = 0.2; // -20% no plano anual

type PlanId = "free" | "pro" | "max";

const PLANS: Array<{
  id: PlanId;
  name: string;
  tag: string;
  description: string;
  features: Array<{ text: string; included: boolean }>;
  badge?: { text: string; tone: "popular" | "ai" };
}> = [
  {
    id: "free",
    name: "Iniciante",
    tag: "Free",
    description: "Essencial para quem está começando a registrar as refeições.",
    features: [
      { text: "Rastreamento básico de calorias e macros", included: true },
      { text: "Histórico de 7 dias", included: true },
      { text: "Relatórios avançados e exportação", included: false },
    ],
  },
  {
    id: "pro",
    name: "Performance",
    tag: "Pro",
    description: "Para quem quer acompanhar métricas com mais profundidade.",
    features: [
      { text: "Tudo do Free, com histórico ilimitado", included: true },
      { text: "Relatórios detalhados e metas personalizadas", included: true },
      { text: "Exportação de dados em CSV", included: true },
    ],
    badge: { text: "Mais popular", tone: "popular" },
  },
  {
    id: "max",
    name: "Inteligência total",
    tag: "Max",
    description: "A experiência completa, com inteligência artificial.",
    features: [
      { text: "Análise nutricional completa por IA", included: true },
      { text: "Sugestões de refeições personalizadas", included: true },
      { text: "Registro por foto e código de barras", included: true },
      { text: "Compartilhamento direto com nutricionista", included: true },
    ],
    badge: { text: "IA avançada", tone: "ai" },
  },
];

function priceFor(plan: PlanId, cycle: "mensal" | "anual"): { main: string; note: string } {
  if (plan === "free") return { main: "R$ 0", note: "/mês" };
  const monthly = PRICES[plan];
  if (cycle === "mensal") {
    return { main: `R$ ${monthly.toFixed(2).replace(".", ",")}`, note: "/mês" };
  }
  const perMonth = monthly * (1 - ANNUAL_DISCOUNT);
  const total = perMonth * 12;
  return {
    main: `R$ ${perMonth.toFixed(2).replace(".", ",")}`,
    note: `/mês • R$ ${total.toFixed(2).replace(".", ",")} por ano`,
  };
}

export default async function PlanosPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const cycle = sp.ciclo === "anual" ? "anual" : "mensal";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: row } = await supabase.from("profiles").select("plan").eq("user_id", user.id).maybeSingle();
  const current = ((row?.plan as PlanId | undefined) ?? "free");

  const cycleLink = (c: string) => `/app/planos?ciclo=${c}`;
  const active = (c: string) => (cycle === c ? "bg-card text-text shadow-sm" : "text-text-2");

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Icon name="award" className="h-7 w-7" />
        </span>
        <h1 className="text-[22px] font-bold">Eleve seus resultados</h1>
        <p className="text-sm text-text-2">Escolha o plano ideal para alcançar seus objetivos de saúde com precisão.</p>
      </header>

      <nav className="mx-auto grid w-full grid-cols-2 gap-1 rounded-full bg-track/70 p-1 text-sm font-semibold">
        <Link href={cycleLink("mensal")} className={`rounded-full py-2 text-center ${active("mensal")}`}>Mensal</Link>
        <Link href={cycleLink("anual")} className={`rounded-full py-2 text-center ${active("anual")}`}>
          Anual <span className="text-primary">(-20%)</span>
        </Link>
      </nav>

      {PLANS.map((plan) => {
        const price = priceFor(plan.id, cycle);
        const isCurrent = current === plan.id;
        const isPro = plan.id === "pro";
        const color = plan.id === "pro" ? "text-primary" : plan.id === "max" ? "text-plan-max" : "text-plan-free";
        return (
          <section
            key={plan.id}
            className={`relative rounded-2xl bg-card p-5 ${isPro ? "ring-2 ring-primary" : ""}`}
          >
            {plan.badge && (
              <span className={`absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-bold ${plan.badge.tone === "popular" ? "bg-primary text-on-primary" : "bg-carbs text-black"}`}>
                {plan.badge.text}
              </span>
            )}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${color}`}>{plan.name}</p>
                <p className="font-semibold">{plan.tag}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{price.main}</p>
                <p className="text-xs text-text-2">{price.note}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-text-2">{plan.description}</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-[15px]">
              {plan.features.map((f) => (
                <li key={f.text} className={`flex gap-2 ${f.included ? "" : "text-text-2 opacity-60"}`}>
                  <Icon name={f.included ? "check" : "close"} className={`mt-0.5 h-4 w-4 shrink-0 ${f.included ? color : ""}`} />
                  {f.text}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              {isCurrent ? (
                <button disabled className="h-12 w-full rounded-2xl bg-track font-semibold text-text-2">Seu plano atual</button>
              ) : (
                <button disabled className="h-12 w-full rounded-2xl bg-primary/40 font-semibold text-on-primary">
                  {plan.id === "free" ? "Plano gratuito" : "Em breve"}
                </button>
              )}
            </div>
          </section>
        );
      })}

      <p className="px-2 text-center text-xs text-text-2">
        A assinatura é cobrada mensalmente e renovada automaticamente. Você pode cancelar a qualquer momento nas configurações da sua conta.
      </p>
      <nav className="flex justify-center gap-3 text-sm font-semibold text-primary">
        <Link href="/termos">Termos de uso</Link><span className="text-text-2">•</span>
        <Link href="/privacidade">Política de privacidade</Link>
      </nav>
    </div>
  );
}
