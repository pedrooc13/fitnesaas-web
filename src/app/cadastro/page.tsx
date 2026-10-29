import type { Metadata } from "next";
import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { GoogleButton } from "@/components/google-button";
import { AuthInput, LockIcon, MailIcon, UserIcon } from "@/components/auth-input";
import { Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Criar conta" };

export default async function CadastroPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-5 px-6 py-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-[28px] font-bold">Criar conta</h1>
        <p className="text-text-2">Leva menos de um minuto</p>
      </header>

      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}

      <form action={signup} className="flex flex-col gap-3">
        <AuthInput name="name" placeholder="Seu nome" autoComplete="name" icon={<UserIcon />} required />
        <AuthInput name="email" type="email" placeholder="seu@email.com" autoComplete="email" icon={<MailIcon />} required />
        <AuthInput name="password" type="password" placeholder="Senha (mínimo 8 caracteres)" autoComplete="new-password" minLength={8} icon={<LockIcon />} required />
        <button type="submit" className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-on-primary">
          Criar conta
        </button>
      </form>

      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-text-2">
        <span className="h-px flex-1 bg-track" />ou continue com<span className="h-px flex-1 bg-track" />
      </div>
      <GoogleButton next="/app/perfil" label="Cadastrar com o Google" />

      <p className="text-center text-text-2">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary">Entrar</Link>
      </p>
    </main>
  );
}
