"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(72);

const msg = (text: string) => encodeURIComponent(text);

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success || !password) {
    redirect(`/login?erro=${msg("Preencha email e senha")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data, password });
  if (error) {
    // Mensagem genérica: não revela se o email existe
    redirect(`/login?erro=${msg("Email ou senha incorretos")}&email=${encodeURIComponent(parsed.data)}`);
  }
  redirect("/app");
}

export async function signup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const e = emailSchema.safeParse(email);
  if (!e.success) redirect(`/cadastro?erro=${msg("Email inválido")}`);
  const p = passwordSchema.safeParse(password);
  if (!p.success) redirect(`/cadastro?erro=${msg(p.error.issues[0]!.message)}`);
  if (!name || name.length > 80) redirect(`/cadastro?erro=${msg("Informe seu nome")}`);

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: e.data,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${site()}/auth/callback?next=/app/perfil`,
    },
  });
  if (error) {
    const message = /already|registered/i.test(error.message)
      ? "Já existe uma conta com este email"
      : "Não foi possível criar a conta. Tente novamente.";
    redirect(`/cadastro?erro=${msg(message)}`);
  }
  // Com confirmação de email ativa, o usuário precisa clicar no link antes de entrar
  redirect("/login?msg=" + msg("Enviamos um link de confirmação para o seu email"));
}

export async function forgotPassword(formData: FormData) {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? ""));
  if (parsed.success) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${site()}/auth/callback?next=/redefinir-senha`,
    });
  }
  // Resposta igual exista ou não o email
  redirect("/esqueci-senha?msg=" + msg("Se o email estiver cadastrado, você receberá o link em instantes."));
}

export async function resetPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const p = passwordSchema.safeParse(password);
  if (!p.success) redirect(`/redefinir-senha?erro=${msg(p.error.issues[0]!.message)}`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?erro=${msg("O link expirou. Solicite um novo.")}`);

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/redefinir-senha?erro=${msg("Não foi possível trocar a senha")}`);
  redirect("/app?msg=" + msg("Senha alterada com sucesso"));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
