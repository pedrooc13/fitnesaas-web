"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mealSchema, profileSchema } from "@/lib/schemas";

export async function addMeal(formData: FormData) {
  const parsed = mealSchema.safeParse({
    foodId: formData.get("foodId"),
    grams: formData.get("grams"),
    mealType: formData.get("mealType"),
  });
  if (!parsed.success) redirect("/app?erro=" + encodeURIComponent("Confira o alimento e a quantidade"));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Não enviamos user_id nem calorias: o banco define o dono (auth.uid) e calcula os valores
  const { error } = await supabase.from("meals").insert({
    food_id: parsed.data.foodId,
    grams: parsed.data.grams,
    meal_type: parsed.data.mealType,
  });
  if (error) redirect("/app?erro=" + encodeURIComponent("Não foi possível salvar a refeição"));

  revalidatePath("/app");
  redirect("/app");
}

export async function deleteMeal(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  // O RLS garante que só apaga se a refeição for do usuário logado
  await supabase.from("meals").delete().eq("id", id);
  revalidatePath("/app");
}

export async function saveProfile(formData: FormData) {
  const parsed = profileSchema.safeParse({
    sex: formData.get("sex"),
    age: formData.get("age"),
    weightKg: formData.get("weightKg"),
    heightCm: formData.get("heightCm"),
    activity: formData.get("activity"),
    diet: formData.get("diet"),
  });
  if (!parsed.success) redirect("/app/perfil?erro=" + encodeURIComponent("Confira os dados do perfil"));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const d = parsed.data;
  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    sex: d.sex,
    age: d.age,
    weight_kg: d.weightKg,
    height_cm: d.heightCm,
    activity: d.activity,
    diet: d.diet,
  });
  if (error) redirect("/app/perfil?erro=" + encodeURIComponent("Não foi possível salvar o perfil"));

  revalidatePath("/app");
  redirect("/app?msg=" + encodeURIComponent("Perfil salvo"));
}
