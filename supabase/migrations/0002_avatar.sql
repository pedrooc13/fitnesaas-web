-- Foto de perfil: coluna no perfil + bucket privado "avatars" com RLS por pasta do usuário.
-- Rode uma vez, depois de 0001_init.sql.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_path text;
GRANT UPDATE (avatar_path) ON public.profiles TO authenticated;

-- Bucket privado: nenhuma foto é pública. Limite de 2 MB e só imagens.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Cada usuário só mexe na pasta cujo nome é o próprio id: <user_id>/arquivo.jpg
CREATE POLICY "avatar: ler a própria pasta" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatar: enviar na própria pasta" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatar: trocar na própria pasta" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatar: apagar na própria pasta" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
