type PlanId = "free" | "pro" | "max";
import type { PlanCardData } from "@/components/planos-view";

const PRICES = { pro: 15, max: 35 };
const ANNUAL_DISCOUNT = 0.2;
const money = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;


export function buildPlans(cycle: "mensal" | "anual", current: PlanId): PlanCardData[] {
  const priceOf = (id: PlanId): { price: string; note: string } => {
    if (id === "free") return { price: "R$ 0", note: "/mês" };
    const monthly = PRICES[id];
    if (cycle === "mensal") return { price: money(monthly), note: "/mês" };
    const perMonth = monthly * (1 - ANNUAL_DISCOUNT);
    return { price: money(perMonth), note: `/mês • ${money(perMonth * 12)} por ano` };
  };
  return [
    {
      id: "free", eyebrow: "Iniciante", tag: "Free", ...priceOf("free"),
      description: "Essencial para quem está começando a registrar as refeições.",
      features: [
        { text: "Rastreamento básico de calorias", included: true },
        { text: "Histórico de 7 dias", included: true },
        { text: "Relatórios avançados e exportação", included: false },
      ],
      current: current === "free",
    },
    {
      id: "pro", eyebrow: "Performance", tag: "Pro", ...priceOf("pro"),
      description: "Para quem quer acompanhar métricas com mais profundidade.",
      features: [
        { text: "Tudo do Free + histórico ilimitado", included: true },
        { text: "Relatórios detalhados e metas personalizadas", included: true },
        { text: "Exportação de dados em CSV", included: true },
      ],
      badge: { text: "Mais popular", tone: "popular" },
      current: current === "pro",
    },
    {
      id: "max", eyebrow: "Inteligência total", tag: "Max", ...priceOf("max"),
      description: "A experiência completa, com inteligência artificial.",
      features: [
        { text: "Análise nutricional completa por IA", included: true },
        { text: "Sugestões de refeições personalizadas", included: true },
        { text: "Registro por foto e código de barras", included: true },
        { text: "Compartilhamento direto com nutricionista", included: true },
      ],
      badge: { text: "IA Avançada", tone: "ai" },
      current: current === "max",
    },
  ];
}

