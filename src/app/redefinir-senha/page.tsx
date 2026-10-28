import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resetPassword } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { Button, Field, Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Nova senha" };

export default async function RedefinirPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Sem sessão (link expirado ou aberto direto) volta para o login
  if (!user) redirect("/login?erro=" + encodeURIComponent("O link expirou. Solicite um novo."));

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <header className="text-center">
        <h1 className="text-[28px] font-bold">Nova senha</h1>
        <p className="text-text-2">Escolha uma senha com pelo menos 8 caracteres</p>
      </header>
      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}
      <form action={resetPassword} className="flex flex-col gap-3">
        <Field name="password" type="password" label="Nova senha" autoComplete="new-password" minLength={8} required />
        <Button type="submit">Salvar senha</Button>
      </form>
    </main>
  );
}
