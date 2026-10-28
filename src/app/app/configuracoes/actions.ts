"use server";

import { redirect } from "next/navigation";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Exclui a conta e todos os dados (LGPD, direito de eliminação).
 * Usa a service role key, que existe SOMENTE no servidor.
 * As tabelas têm ON DELETE CASCADE, então perfil e refeições são apagados junto.
 */
export async function deleteAccount(formData: FormData) {
  if (String(formData.get("confirm") ?? "") !== "EXCLUIR") {
    redirect("/app/configuracoes?erro=" + encodeURIComponent('Digite EXCLUIR para confirmar'));
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
  if (error) redirect("/app/configuracoes?erro=" + encodeURIComponent("Não foi possível excluir a conta"));

  await supabase.auth.signOut();
  redirect("/login?msg=" + encodeURIComponent("Sua conta e seus dados foram excluídos"));
}
