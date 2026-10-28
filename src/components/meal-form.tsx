"use client";

import { useMemo, useState } from "react";
import { addMeal } from "@/app/app/actions";
import { Button } from "@/components/ui";

export interface FoodOption {
  id: number;
  name: string;
  kcal_100g: number;
}

const MEAL_TYPES = [
  { value: "breakfast", label: "Café da manhã" },
  { value: "lunch", label: "Almoço" },
  { value: "snack", label: "Lanche da tarde" },
  { value: "dinner", label: "Jantar" },
];

/** Hora de São Paulo para sugerir o tipo de refeição */
function suggestedMealType(): string {
  const hour = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }));
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 19) return "snack";
  return "dinner";
}

export function MealForm({ foods }: { foods: FoodOption[] }) {
  const [search, setSearch] = useState("");
  const [foodId, setFoodId] = useState<number | null>(null);
  const [mode, setMode] = useState<"grams" | "plate">("grams");
  const [grams, setGrams] = useState("");
  const [plateFull, setPlateFull] = useState("");
  const [plateEmpty, setPlateEmpty] = useState("");

  const filtered = useMemo(
    () => foods.filter((f) => f.name.toLowerCase().includes(search.trim().toLowerCase())),
    [foods, search],
  );

  // Gramas finais: direto, ou peso do prato cheio menos o vazio (tara)
  const finalGrams = useMemo(() => {
    if (mode === "grams") return Number(grams.replace(",", ".")) || 0;
    const full = Number(plateFull.replace(",", ".")) || 0;
    const empty = Number(plateEmpty.replace(",", ".")) || 0;
    return Math.max(full - empty, 0);
  }, [mode, grams, plateFull, plateEmpty]);

  const selected = foods.find((f) => f.id === foodId);
  const kcal = selected ? Math.round((selected.kcal_100g * finalGrams) / 100) : 0;
  const canSubmit = !!selected && finalGrams > 0;

  return (
    <form action={addMeal} className="flex flex-col gap-4">
      <input type="hidden" name="foodId" value={foodId ?? ""} />
      <input type="hidden" name="grams" value={finalGrams || ""} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-2">Refeição</span>
        <select name="mealType" defaultValue={suggestedMealType()} className="h-12 rounded-xl border border-track bg-card px-4 text-text">
          {MEAL_TYPES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-2">Buscar alimento</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ex: arroz, frango"
          className="h-12 rounded-xl border border-track bg-card px-4 text-text outline-none focus:border-primary"
        />
      </label>

      <ul className="max-h-56 overflow-y-auto rounded-xl bg-card">
        {filtered.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setFoodId(f.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-[15px] hover:bg-track/50"
            >
              <span>{f.name}</span>
              <span className="flex items-center gap-2 text-xs text-text-2">
                {Math.round(f.kcal_100g)} kcal/100g
                {foodId === f.id && <span className="font-bold text-primary">✓</span>}
              </span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && <li className="px-4 py-3 text-sm text-text-2">Nenhum alimento encontrado</li>}
      </ul>

      {selected && (
        <fieldset className="flex flex-col gap-3 rounded-xl bg-card p-4">
          <div className="flex gap-2">
            {(["grams", "plate"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === m ? "bg-primary text-on-primary" : "bg-track text-text"}`}
              >
                {m === "grams" ? "Gramas" : "Pesar o prato"}
              </button>
            ))}
          </div>

          {mode === "grams" ? (
            <input
              inputMode="decimal"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="Gramas do alimento"
              className="h-12 rounded-xl border border-track bg-background px-4 text-text outline-none focus:border-primary"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <input
                inputMode="decimal"
                value={plateFull}
                onChange={(e) => setPlateFull(e.target.value)}
                placeholder="Prato cheio (g)"
                className="h-12 rounded-xl border border-track bg-background px-4 text-text outline-none focus:border-primary"
              />
              <input
                inputMode="decimal"
                value={plateEmpty}
                onChange={(e) => setPlateEmpty(e.target.value)}
                placeholder="Prato vazio (g)"
                className="h-12 rounded-xl border border-track bg-background px-4 text-text outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="flex justify-between text-[15px]">
            <span className="text-text-2">{Math.round(finalGrams)} g</span>
            <span className="font-bold text-primary">{kcal} kcal</span>
          </div>
        </fieldset>
      )}

      <Button type="submit" disabled={!canSubmit}>Adicionar refeição</Button>
    </form>
  );
}
