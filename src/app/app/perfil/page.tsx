import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DIET_LABELS, goalsFor, profileFromRow } from "@/lib/nutrition";
import { Button, Card, Notice } from "@/components/ui";
import { saveProfile } from "../actions";

export const metadata: Metadata = { title: "Seu perfil" };

const ACTIVITY = [
  ["sedentary", "Sedentário"],
  ["light", "Leve"],
  ["moderate", "Moderado"],
  ["intense", "Intenso"],
  ["very_intense", "Muito intenso"],
] as const;

export default async function PerfilPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: row } = await supabase
    .from("profiles")
    .select("sex, age, weight_kg, height_cm, activity, diet")
    .eq("user_id", user!.id)
    .maybeSingle();

  const current = row ? profileFromRow(row) : null;
  const goals = current ? goalsFor(current) : null;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-[22px] font-semibold">Seu perfil</h1>
        <p className="text-sm text-text-2">Usamos estes dados para calcular sua meta diária.</p>
      </header>

      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}

      <Card>
        <form action={saveProfile} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-2">Sexo</span>
            <select name="sex" defaultValue={current?.sex ?? "male"} className="h-12 rounded-xl border border-track bg-background px-4">
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
            </select>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Num name="age" label="Idade" defaultValue={current?.age ?? 30} min={14} max={90} />
            <Num name="weightKg" label="Peso (kg)" defaultValue={current?.weightKg ?? 70} min={30} max={250} step="0.1" />
            <Num name="heightCm" label="Altura (cm)" defaultValue={current?.heightCm ?? 170} min={120} max={230} />
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-2">Nível de atividade</span>
            <select name="activity" defaultValue={current?.activity ?? "moderate"} className="h-12 rounded-xl border border-track bg-background px-4">
              {ACTIVITY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-2">Plano de dieta</span>
            <select name="diet" defaultValue={current?.diet ?? "equilibrada"} className="h-12 rounded-xl border border-track bg-background px-4">
              {Object.entries(DIET_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <Button type="submit">Salvar perfil</Button>
        </form>
      </Card>

      {goals && (
        <Card className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="TMB" value={`${goals.bmr} kcal`} />
          <Stat label="Meta diária" value={`${goals.dailyKcal} kcal`} />
          <Stat label="Carboidratos" value={`${goals.carbsG} g`} />
          <Stat label="Proteínas" value={`${goals.proteinG} g`} />
          <Stat label="Gorduras" value={`${goals.fatG} g`} />
        </Card>
      )}
    </div>
  );
}

function Num(props: { name: string; label: string; defaultValue: number; min: number; max: number; step?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-2">{props.label}</span>
      <input
        type="number"
        name={props.name}
        defaultValue={props.defaultValue}
        min={props.min}
        max={props.max}
        step={props.step ?? "1"}
        required
        className="h-12 rounded-xl border border-track bg-background px-3 text-center"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-2">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
