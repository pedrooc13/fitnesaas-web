-- FitneSAAS: esquema, RLS e regras no banco.
-- Rode no SQL Editor do Supabase (ou via CLI: supabase db push).

-- ========== PERFIS (1 por usuário autenticado) ==========
CREATE TABLE public.profiles (
  user_id    uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  sex        text NOT NULL CHECK (sex IN ('male', 'female')),
  age        integer NOT NULL CHECK (age BETWEEN 14 AND 90),
  weight_kg  numeric(5,2) NOT NULL CHECK (weight_kg BETWEEN 30 AND 250),
  height_cm  numeric(5,2) NOT NULL CHECK (height_cm BETWEEN 120 AND 230),
  activity   text NOT NULL CHECK (activity IN ('sedentary','light','moderate','intense','very_intense')),
  diet       text NOT NULL CHECK (diet IN ('equilibrada','low_carb','alta_proteina')),
  -- Plano é controlado pelo sistema de pagamento, nunca pelo cliente (ver GRANTs abaixo)
  plan       text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','max')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========== ALIMENTOS (base pública, leitura para logados) ==========
CREATE TABLE public.foods (
  id            serial PRIMARY KEY,
  name          text NOT NULL UNIQUE,
  kcal_100g     numeric(7,2) NOT NULL,
  protein_100g  numeric(7,2) NOT NULL,
  carb_100g     numeric(7,2) NOT NULL,
  fat_100g      numeric(7,2) NOT NULL
);

-- ========== REFEIÇÕES (de cada usuário) ==========
CREATE TABLE public.meals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  food_id    integer NOT NULL REFERENCES public.foods (id),
  grams      numeric(7,2) NOT NULL CHECK (grams > 0 AND grams <= 5000),
  meal_type  text NOT NULL CHECK (meal_type IN ('breakfast','lunch','snack','dinner')),
  eaten_at   timestamptz NOT NULL DEFAULT now(),
  -- Preenchidos pelo trigger abaixo. O cliente não consegue informar esses valores.
  kcal       numeric(8,2) NOT NULL DEFAULT 0,
  protein_g  numeric(8,2) NOT NULL DEFAULT 0,
  carb_g     numeric(8,2) NOT NULL DEFAULT 0,
  fat_g      numeric(8,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX meals_user_eaten_idx ON public.meals (user_id, eaten_at);

-- Calcula calorias e macros a partir da base, e rejeita refeição no futuro
CREATE OR REPLACE FUNCTION public.meals_compute_nutrients()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  f foods%ROWTYPE;
BEGIN
  SELECT * INTO f FROM foods WHERE id = NEW.food_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'alimento não encontrado';
  END IF;
  IF NEW.eaten_at > now() + interval '5 minutes' THEN
    RAISE EXCEPTION 'a refeição não pode estar no futuro';
  END IF;

  NEW.kcal      := round(f.kcal_100g    * NEW.grams / 100, 2);
  NEW.protein_g := round(f.protein_100g * NEW.grams / 100, 2);
  NEW.carb_g    := round(f.carb_100g    * NEW.grams / 100, 2);
  NEW.fat_g     := round(f.fat_100g     * NEW.grams / 100, 2);
  RETURN NEW;
END;
$$;

CREATE TRIGGER meals_before_insert
  BEFORE INSERT ON public.meals
  FOR EACH ROW EXECUTE FUNCTION public.meals_compute_nutrients();

-- Atualiza updated_at do perfil
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ========== RLS: cada usuário vê só o que é dele ==========
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfil: ler o próprio" ON public.profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "perfil: criar o próprio" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "perfil: atualizar o próprio" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "alimentos: leitura para logados" ON public.foods
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "refeições: ler as próprias" ON public.meals
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "refeições: criar as próprias" ON public.meals
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "refeições: apagar as próprias" ON public.meals
  FOR DELETE TO authenticated USING (user_id = auth.uid());
-- Refeição não é editada: se errou, apague e registre de novo (mantém o histórico íntegro)

-- ========== GRANTS: colunas sensíveis fora do alcance do cliente ==========
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT (user_id, sex, age, weight_kg, height_cm, activity, diet) ON public.profiles TO authenticated;
GRANT UPDATE (sex, age, weight_kg, height_cm, activity, diet) ON public.profiles TO authenticated;

REVOKE ALL ON public.foods FROM anon;
GRANT SELECT ON public.foods TO authenticated;

REVOKE ALL ON public.meals FROM anon;
GRANT SELECT, INSERT (food_id, grams, meal_type, eaten_at, user_id), DELETE ON public.meals TO authenticated;
