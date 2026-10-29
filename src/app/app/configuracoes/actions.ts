"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const err = (text: string) => `/app/configuracoes?erro=${encodeURIComponent(text)}`;
const ok = (text: string) => `/app/configuracoes?msg=${encodeURIComponent(text)}`;

/** Tema escolhido pelo usuário: sistema (segue o celular), claro ou escuro */
export async function setTheme(formData: FormData) {
  const value = String(formData.get("theme") ?? "");
  if (value !== "system" && value !== "light" && value !== "dark") return;
  const jar = await cookies();
  if (value === "system") {
    jar.delete("theme");
  } else {
    jar.set("theme", value, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  revalidatePath("/", "layout");
}

/** Troca a foto de perfil: bucket privado, pasta do próprio usuário, limite de 2 MB */
export async function uploadAvatar(formData: FormData) {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) redirect(err("Escolha uma imagem"));
  if (file.size > MAX_AVATAR_BYTES) redirect(err("A imagem precisa ter no máximo 2 MB"));
  const ext = AVATAR_EXT[file.type];
  if (!ext) redirect(err("Use uma imagem JPG, PNG ou WEBP"));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("avatar_path").eq("user_id", user.id).maybeSingle();
  if (!profile) redirect("/app/perfil?erro=" + encodeURIComponent("Preencha seu perfil antes de trocar a foto"));

  const path = `${user.id}/avatar-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) redirect(err("Não foi possível enviar a foto"));

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("user_id", user.id);
  if (updateError) {
    await supabase.storage.from("avatars").remove([path]);
    redirect(err("Não foi possível salvar a foto"));
  }

  // Apaga a foto anterior, se existia
  if (profile.avatar_path && profile.avatar_path !== path) {
    await supabase.storage.from("avatars").remove([profile.avatar_path]);
  }
  revalidatePath("/app/configuracoes");
  redirect(ok("Foto atualizada"));
}

/**
 * Exclui a conta e todos os dados (LGPD).
 * Usa a service role key, que existe SOMENTE no servidor.
 */
export async function deleteAccount(formData: FormData) {
  if (String(formData.get("confirm") ?? "") !== "EXCLUIR") {
    redirect(err("Digite EXCLUIR para confirmar"));
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) redirect(err("Não foi possível excluir a conta"));

  await supabase.auth.signOut();
  redirect("/login?msg=" + encodeURIComponent("Sua conta e seus dados foram excluídos"));
}
