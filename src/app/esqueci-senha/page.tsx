import type { Metadata } from "next";
import Link from "next/link";
import { forgotPassword } from "@/app/auth/actions";
import { Button, Field, Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Recuperar senha" };

export default async function EsqueciPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-6 p-6 pt-10">
      <Link href="/login" className="text-sm font-semibold text-primary">‹ Voltar</Link>

      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
          <svg viewBox="0 0 24 24" className="h-9 w-9 fill-none stroke-primary" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" />
            <rect x="9" y="11" width="6" height="5" rx="1" />
            <path d="M10 11V9.5a2 2 0 0 1 4 0V11" />
          </svg>
        </div>
        <h1 className="text-[28px] font-bold">Recuperar senha</h1>
        <p className="text-text-2">Informe seu email cadastrado para receber um código de 6 dígitos.</p>
      </header>

      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}

      {/* Seletor de canal: SMS fica desativado até existir provedor de SMS */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-track p-1 text-sm font-semibold">
        <span className="rounded-lg bg-card py-2 text-center text-text">E-mail</span>
        <span className="py-2 text-center text-text-2" aria-disabled="true">SMS (em breve)</span>
      </div>

      <form action={forgotPassword} className="flex flex-col gap-4">
        <Field name="email" type="email" label="E-mail cadastrado" placeholder="seu.email@exemplo.com" autoComplete="email" required />
        <p className="text-sm text-text-2">O código vale por 15 minutos.</p>
        <Button type="submit">Enviar código</Button>
      </form>

      <p className="text-center text-sm text-text-2">
        Lembrou sua senha? <Link href="/login" className="font-semibold text-primary">Entrar</Link>
      </p>
    </main>
  );
}
