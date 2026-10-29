import type { Metadata } from "next";
import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { Button, Field, Notice } from "@/components/ui";
import { GoogleButton } from "@/components/google-button";

export const metadata: Metadata = { title: "Criar conta" };

export default async function CadastroPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <header className="text-center">
        <h1 className="text-[28px] font-bold">Criar conta</h1>
        <p className="text-text-2">Leva menos de um minuto</p>
      </header>

      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}

      <form action={signup} className="flex flex-col gap-3">
        <Field name="name" label="Nome" autoComplete="name" required />
        <Field name="email" type="email" label="Email" autoComplete="email" required />
        <Field name="password" type="password" label="Senha (mínimo 8 caracteres)" autoComplete="new-password" minLength={8} required />
        <Button type="submit">Criar conta</Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-text-2">
        <span className="h-px flex-1 bg-track" />ou<span className="h-px flex-1 bg-track" />
      </div>
      <GoogleButton next="/app/perfil" label="Cadastrar com Google" />

      <p className="text-center text-sm text-text-2">
        Já tem conta? <Link href="/login" className="font-semibold text-primary">Entrar</Link>
      </p>
    </main>
  );
}
