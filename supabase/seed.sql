-- Base de alimentos inicial (valores aproximados por 100 g).
-- Substitua pela base TACO completa quando importar.
INSERT INTO public.foods (name, kcal_100g, protein_100g, carb_100g, fat_100g) VALUES
  ('Arroz integral cozido',     124, 2.6, 25.8, 1.0),
  ('Arroz branco cozido',       128, 2.5, 28.1, 0.2),
  ('Feijão carioca cozido',      76, 4.8, 13.6, 0.5),
  ('Peito de frango grelhado',  159, 32.0, 0.0, 2.5),
  ('Patinho bovino grelhado',   219, 35.9, 0.0, 7.3),
  ('Ovo cozido',                146, 13.3, 0.6, 9.5),
  ('Batata cozida',              52, 1.2, 11.9, 0.0),
  ('Banana prata',               98, 1.3, 26.0, 0.1),
  ('Pão francês',               300, 8.0, 58.6, 3.1),
  ('Aveia em flocos',           394, 13.9, 66.6, 8.5)
ON CONFLICT (name) DO NOTHING;
