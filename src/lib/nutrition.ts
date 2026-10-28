// Cálculos puros (mesma lógica da API anterior). Usados na renderização das telas.

export type Sex = "male" | "female";
export type Diet = "equilibrada" | "low_carb" | "alta_proteina";
export type Activity = "sedentary" | "light" | "moderate" | "intense" | "very_intense";

export const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  intense: 1.725,
  very_intense: 1.9,
};

export const DIET_SPLITS: Record<Diet, { carb: number; protein: number; fat: number }> = {
  equilibrada: { carb: 0.4, protein: 0.3, fat: 0.3 },
  low_carb: { carb: 0.2, protein: 0.4, fat: 0.4 },
  alta_proteina: { carb: 0.35, protein: 0.4, fat: 0.25 },
};

export const DIET_LABELS: Record<Diet, string> = {
  equilibrada: "Equilibrada (40/30/30)",
  low_carb: "Low carb (20/40/40)",
  alta_proteina: "Alta proteína (35/40/25)",
};

export interface ProfileInput {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: Activity;
  diet: Diet;
}

export function bmr(p: ProfileInput): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === "male" ? base + 5 : base - 161;
}

export function goalsFor(p: ProfileInput) {
  const tdee = bmr(p) * ACTIVITY_FACTORS[p.activity];
  const dailyKcal = Math.round(tdee);
  const split = DIET_SPLITS[p.diet];
  return {
    bmr: Math.round(bmr(p)),
    dailyKcal,
    carbsG: Math.round((dailyKcal * split.carb) / 4),
    proteinG: Math.round((dailyKcal * split.protein) / 4),
    fatG: Math.round((dailyKcal * split.fat) / 9),
  };
}

/** Converte a linha do banco (snake_case) para o formato de cálculo */
export function profileFromRow(row: {
  sex: Sex;
  age: number;
  weight_kg: number | string;
  height_cm: number | string;
  activity: Activity;
  diet: Diet;
}): ProfileInput {
  return {
    sex: row.sex,
    age: row.age,
    weightKg: Number(row.weight_kg),
    heightCm: Number(row.height_cm),
    activity: row.activity,
    diet: row.diet,
  };
}
