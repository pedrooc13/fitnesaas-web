import Link from "next/link";
import { Icon } from "@/components/icons";
import { Notice, Ring } from "@/components/ui";
import { MealForm, type FoodOption } from "@/components/meal-form";
import { deleteMeal } from "@/app/app/actions";

export interface MealItem {
  id: string;
  name: string;
  grams: number;
  mealType: string;
  time: string;
  kcal: number;
  protein: number;
}

export interface HojeProps {
  firstName: string;
  dateCap: string;
  dateShort: string;
  greeting: string;
  goalKcal: number;
  consumed: number;
  remaining: number;
  progress: number;
  macros: Array<{ name: string; color: string; consumed: number; goal: number }>;
  meals: MealItem[];
  foods: FoodOption[];
  erro?: string;
  msg?: string;
}

const MEAL_STYLE: Record<string, { label: string; icon: string; color: string }> = {
  breakfast: { label: "Café da manhã", icon: "sun", color: "text-primary" },
  lunch: { label: "Almoço", icon: "utensils", color: "text-carbs" },
  snack: { label: "Lanche", icon: "cup", color: "text-info" },
  dinner: { label: "Jantar", icon: "moon", color: "text-text-2" },
};

/** Tela Hoje no padrão do design: claro (fitnesaas_1) e escuro (fitnesaas_2) */
export function HojeView(p: HojeProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho: no claro é a marca; no escuro é o título da tela */}
      <header className="flex items-center justify-between">
        <span className="hoje-light-only text-[17px] font-semibold text-text">FitneSAAS</span>
        <h1 className="hoje-dark-only text-[28px] font-bold">Hoje</h1>
        <div className="flex items-center gap-4">
          <span className="text-text-2" aria-hidden><Icon name="bell" className="h-5 w-5" /></span>
          <Link href="/app/configuracoes" aria-label="Minha conta" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="user" className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="hoje-light-only text-[12px] font-semibold uppercase tracking-[0.12em] text-text-2">Hoje</p>
          <p className="hoje-light-only text-[17px] text-text">{p.dateShort}</p>
          <p className="hoje-dark-only text-[17px] text-text">{p.dateCap}</p>
          <p className="hoje-dark-only text-[15px] text-text-2">{p.greeting}{p.firstName ? `, ${p.firstName}` : ""}</p>
        </div>
        <Link href="/app/historico" className="flex items-center gap-1.5 rounded-full bg-track px-3.5 py-2 text-[15px] font-medium text-primary">
          <Icon name="history" className="h-4 w-4" />Histórico
        </Link>
      </div>

      {p.erro && <Notice tone="error">{p.erro}</Notice>}
      {p.msg && <Notice tone="ok">{p.msg}</Notice>}

      <section className="flex flex-col gap-5 rounded-2xl bg-card p-5">
        <div className="hoje-dark-only">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[15px] text-text-2">Balanço Energético</p>
              <p className="text-[17px] font-medium">Calorias Diárias</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Icon name="flame" className="h-5 w-5" />
            </span>
          </div>
        </div>

        <div className="hoje-light-only flex flex-col items-center gap-4">
          <Ring progress={p.progress} remaining={p.remaining} />
          <div className="grid w-full grid-cols-3 text-center">
            <Stat label="Meta" value={`${p.goalKcal.toLocaleString("pt-BR")}`} unit="kcal" />
            <Stat label="Consumido" value={`${Math.round(p.consumed).toLocaleString("pt-BR")}`} unit="kcal" tone="primary" />
            <Stat label="Restante" value={`${Math.round(p.remaining).toLocaleString("pt-BR")}`} unit="kcal" tone="carbs" />
          </div>
        </div>

        <div className="hoje-dark-only">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3">
            <Ring progress={p.progress} remaining={p.remaining} size={164} />
            <div className="flex min-w-0 flex-col gap-2">
              <Box label="Meta" value={`${p.goalKcal.toLocaleString("pt-BR")} kcal`} />
              <Box label="Restante" value={`${Math.round(p.remaining).toLocaleString("pt-BR")} kcal`} tone="primary" />
            </div>
          </div>
        </div>

      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-card p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-text-2">Macronutrientes</p>
            <span className="text-[15px] text-text-2">Metas diárias</span>
          </div>
          {p.macros.map((m) => {
            const pct = m.goal > 0 ? Math.min(100, (m.consumed / m.goal) * 100) : 0;
            return (
              <div key={m.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[15px]">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.name}</span>
                  <span className="text-text-2">{Math.round(m.consumed)}g / <b className="text-text">{Math.round(m.goal)}g</b></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-track">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[17px] font-semibold">Refeições de Hoje</h2>
          <span className="text-[15px] text-text-2">{p.meals.length} registradas</span>
        </div>
        {p.meals.length === 0 && (
          <div className="rounded-2xl bg-card p-4 text-[15px] text-text-2">Nenhuma refeição registrada ainda.</div>
        )}
        {p.meals.map((m) => {
          const style = MEAL_STYLE[m.mealType] ?? MEAL_STYLE.snack!;
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card p-3.5">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-track ${style.color}`}>
                <Icon name={style.icon} className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-medium leading-snug">{m.name}</p>
                <p className="text-[15px] text-text-2">{style.label} • {m.time}</p>
              </div>
              <div className="shrink-0 whitespace-nowrap text-right">
                <p className="text-[17px] font-semibold">{Math.round(m.kcal)} kcal</p>
                <p className="text-[15px] font-semibold text-primary">P: {Math.round(m.protein)}g</p>
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
        <h2 className="mb-4 text-[17px] font-semibold">Registrar refeição</h2>
        <MealForm foods={p.foods} />
      </section>

      <a href="#registrar" aria-label="Registrar refeição" className="fixed bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg">
        <Icon name="plus" className="h-7 w-7" />
      </a>
    </div>
  );
}

function Stat({ label, value, unit, tone }: { label: string; value: string; unit: string; tone?: "primary" | "carbs" }) {
  const color = tone === "primary" ? "text-primary" : tone === "carbs" ? "text-carbs" : "text-text";
  return (
    <div>
      <p className="text-[13px] text-text-2">{label}</p>
      <p className={`text-[17px] font-semibold ${color}`}>{value}</p>
      <p className="text-[12px] text-text-2">{unit}</p>
    </div>
  );
}

function Box({ label, value, tone }: { label: string; value: string; tone?: "primary" }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-background px-3 py-3">
      <span className="text-[15px] text-text-2">{label}</span>
      <span className={`whitespace-nowrap text-[15px] font-bold ${tone === "primary" ? "text-primary" : "text-text"}`}>{value}</span>
    </div>
  );
}
