import { z } from "zod";

// Toda entrada de formulário passa por aqui antes de ir ao banco.
export const mealSchema = z.object({
  foodId: z.coerce.number().int().positive(),
  grams: z.coerce.number().positive().max(5000),
  mealType: z.enum(["breakfast", "lunch", "snack", "dinner"]),
});

export const profileSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z.coerce.number().int().min(14).max(90),
  weightKg: z.coerce.number().min(30).max(250),
  heightCm: z.coerce.number().min(120).max(230),
  activity: z.enum(["sedentary", "light", "moderate", "intense", "very_intense"]),
  diet: z.enum(["equilibrada", "low_carb", "alta_proteina"]),
});
