"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(72);

const msg = (text: string) => encodeURIComponent(text);

/** Prova do aceite: versão dos termos e da política, e o momento do aceite */
const consentData = (name: string) => ({
  name,
  terms_version: TERMS_VERSION,
  privacy_version: PRIVACY_VERSION,
  consent_at: new Date().toISOString(),
});

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
  const confirm = String(formData.get("confirm") ?? "");
  const acceptTerms = formData.get("accept_terms") === "on";
  const acceptPrivacy = formData.get("accept_privacy") === "on";

  if (password !== confirm) redirect(`/cadastro?erro=${msg("As senhas não conferem")}`);
  if (!acceptTerms || !acceptPrivacy) {
    redirect(`/cadastro?erro=${msg("Você precisa aceitar os termos e a política para criar a conta")}`);
  }

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
      data: consentData(name),
      emailRedirectTo: `${site()}/auth/callback?next=/app/perfil`,
    },
  });
  if (error) {
    const message = /already|registered/i.test(error.message)
      ? "Já existe uma conta com este email"
      : "Não foi possível criar a conta. Tente novamente.";
    redirect(`/cadastro?erro=${msg(message)}`);
  }
  redirect("/login?msg=" + msg("Enviamos um link de confirmação para o seu email"));
}

/** Passo 1: envia o código de 6 dígitos por email */
export async function forgotPassword(formData: FormData) {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? ""));
  if (parsed.success) {
    const supabase = await createClient();
    // Sem redirectTo: o email traz o código ({{ .Token }}), não um link
    await supabase.auth.resetPasswordForEmail(parsed.data);
    redirect(`/esqueci-senha/codigo?email=${encodeURIComponent(parsed.data)}&msg=${msg("Se o email estiver cadastrado, enviamos um código.")}`);
  }
  redirect(`/esqueci-senha?erro=${msg("Informe um email válido")}`);
}

/** Passo 2: confere o código de 6 dígitos. Se estiver certo, cria a sessão de recuperação */
export async function verifyRecoveryCode(formData: FormData) {
  const email = emailSchema.safeParse(String(formData.get("email") ?? ""));
  const token = String(formData.get("token") ?? "").replace(/\D/g, "");
  if (!email.success) redirect(`/esqueci-senha?erro=${msg("Informe seu email novamente")}`);
  if (token.length !== 6) {
    redirect(`/esqueci-senha/codigo?email=${encodeURIComponent(email.data)}&erro=${msg("Digite os 6 números do código")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email: email.data, token, type: "recovery" });
  if (error) {
    redirect(`/esqueci-senha/codigo?email=${encodeURIComponent(email.data)}&erro=${msg("Código inválido ou expirado")}`);
  }
  redirect("/redefinir-senha");
}

/** Passo 3: troca a senha usando a sessão criada pelo código */
export async function resetPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const p = passwordSchema.safeParse(password);
  if (!p.success) redirect(`/redefinir-senha?erro=${msg(p.error.issues[0]!.message)}`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/esqueci-senha?erro=${msg("Sua sessão expirou. Solicite um novo código.")}`);

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/redefinir-senha?erro=${msg("Não foi possível trocar a senha")}`);
  await supabase.auth.signOut();
  redirect("/login?msg=" + msg("Senha alterada. Entre com a nova senha."));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Login e cadastro com Google: o Supabase redireciona para o Google e volta para /auth/callback */
export async function loginWithGoogle(formData: FormData) {
  const requested = String(formData.get("next") ?? "/app");
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/app";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${site()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) {
    redirect(`/login?erro=${msg("Não foi possível entrar com Google. Tente novamente.")}`);
  }
  redirect(data.url);
}

/** Aceite para quem entrou com Google ou tem uma versão nova dos termos */
export async function acceptTerms(formData: FormData) {
  if (formData.get("accept_terms") !== "on" || formData.get("accept_privacy") !== "on") {
    redirect(`/aceitar-termos?erro=${msg("Marque os dois aceites para continuar")}`);
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({
    data: consentData(String(user.user_metadata?.name ?? "")),
  });
  if (error) redirect(`/aceitar-termos?erro=${msg("Não foi possível registrar o aceite. Tente novamente.")}`);
  redirect("/app");
}
