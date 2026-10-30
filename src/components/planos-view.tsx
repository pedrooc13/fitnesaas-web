import Link from "next/link";
import { Icon } from "@/components/icons";

export interface PlanCardData {
  id: "free" | "pro" | "max";
  eyebrow: string;
  tag: string;
  price: string;
  note: string;
  description: string;
  features: Array<{ text: string; included: boolean }>;
  badge?: { text: string; tone: "popular" | "ai" };
  current: boolean;
}

export function PlanosView({ cycle, plans }: { cycle: "mensal" | "anual"; plans: PlanCardData[] }) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Icon name="award" className="h-8 w-8" />
        </span>
        <h1 className="text-[22px] font-bold">Eleve seus resultados</h1>
        <p className="max-w-[320px] text-[15px] text-text-2">Escolha o plano ideal para alcançar seus objetivos de saúde com precisão.</p>
      </header>

      <nav className="mx-auto grid w-full grid-cols-2 gap-1 rounded-full bg-track p-1 text-[15px] font-medium">
        <Link href="/app/planos?ciclo=mensal" className={`rounded-full py-2 text-center ${cycle === "mensal" ? "seg-active" : "text-text-2"}`}>Mensal</Link>
        <Link href="/app/planos?ciclo=anual" className={`rounded-full py-2 text-center ${cycle === "anual" ? "seg-active" : "text-text-2"}`}>
          Anual <span className="text-primary">(-20%)</span>
        </Link>
      </nav>

      {plans.map((plan) => {
        const accent = plan.id === "max" ? "text-plan-max" : plan.id === "pro" ? "text-primary" : "text-plan-free";
        return (
          <section key={plan.id} className={`relative flex flex-col gap-3 rounded-2xl bg-card p-5 ${plan.id === "pro" ? "ring-1 ring-primary" : ""}`}>
            {plan.badge && (
              <span className={`absolute -top-3 right-5 rounded-full px-3 py-1 text-[12px] font-semibold ${plan.badge.tone === "popular" ? "bg-primary text-on-primary" : "bg-carbs text-black"}`}>
                {plan.badge.text}
              </span>
            )}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-[12px] font-bold uppercase tracking-[0.1em] ${accent}`}>{plan.eyebrow}</p>
                <p className="text-[17px] font-semibold">{plan.tag}</p>
              </div>
              <div className="text-right">
                <p className="text-[17px] font-semibold whitespace-nowrap">{plan.price} <span className="text-[13px] font-normal text-text-2">{plan.note}</span></p>
              </div>
            </div>
            <p className="text-[15px] text-text-2">{plan.description}</p>
            <ul className="flex flex-col gap-2.5 text-[15px]">
              {plan.features.map((f) => (
                <li key={f.text} className={`flex gap-2 ${f.included ? "" : "text-text-2 opacity-60"}`}>
                  <Icon name={f.included ? "check" : "close"} className={`mt-0.5 h-4 w-4 shrink-0 ${f.included ? accent : ""}`} />
                  {f.text}
                </li>
              ))}
            </ul>
            <div className="mt-1">
              {plan.current ? (
                <span className="flex h-12 w-full items-center justify-center rounded-xl bg-track text-[17px] font-medium text-text-2">Seu plano atual</span>
              ) : (
                <span className={`flex h-12 w-full items-center justify-center rounded-xl text-[17px] font-semibold text-on-primary ${plan.id === "max" ? "bg-plan-max" : "bg-primary"}`}>
                  {plan.id === "free" ? "Plano gratuito" : `Assinar ${plan.tag}`}
                </span>
              )}
            </div>
          </section>
        );
      })}

      <p className="px-2 text-center text-[12px] text-text-2">
        A assinatura é cobrada mensalmente e renovada automaticamente. Você pode cancelar a qualquer momento nas configurações da sua conta.
      </p>
      <nav className="flex items-center justify-center gap-3 text-[15px] font-medium text-primary">
        <Link href="/termos">Termos de uso</Link><span className="text-text-2">•</span>
        <Link href="/privacidade">Política de privacidade</Link>
      </nav>
    </div>
  );
}
