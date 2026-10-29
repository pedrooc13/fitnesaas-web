import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/app/auth/actions";
import { GoogleButton } from "@/components/google-button";
import { AuthInput, LockIcon, MailIcon } from "@/components/auth-input";
import { Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const erro = sp.erro === "link-invalido" ? "Link inválido ou expirado" : sp.erro;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-5 px-6 py-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-track">
          <svg viewBox="0 0 24 24" className="h-9 w-9 fill-primary" aria-hidden>
            <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
          </svg>
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-primary" />
        </div>
        <h1 className="text-[32px] font-bold tracking-tight">
          Fitne<span className="text-primary">SAAS</span>
        </h1>
        <p className="text-text-2">Nutrição e equilíbrio na sua rotina</p>
      </header>

      {erro && <Notice tone="error">{erro}</Notice>}
      {sp.msg && <Notice tone="ok">{sp.msg}</Notice>}

      {/* Seletor de canal: telefone fica desativado até existir provedor de SMS */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-track/70 p-1 text-sm font-semibold">
        <span className="rounded-xl bg-card py-2.5 text-center text-text shadow-sm">E-mail</span>
        <span className="py-2.5 text-center text-text-2" aria-disabled="true">Telefone (em breve)</span>
      </div>

      <form action={login} className="flex flex-col gap-3">
        <AuthInput name="email" type="email" placeholder="seu@email.com" autoComplete="email" icon={<MailIcon />} defaultValue={sp.email} required />
        <AuthInput name="password" type="password" placeholder="Sua senha secreta" autoComplete="current-password" icon={<LockIcon />} required />
        <div className="flex justify-end">
          <Link href="/esqueci-senha" className="text-sm font-semibold text-primary">Esqueceu a senha?</Link>
        </div>
        <button type="submit" className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-semibold text-on-primary">
          Entrar →
        </button>
      </form>

      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-text-2">
        <span className="h-px flex-1 bg-track" />ou continue com<span className="h-px flex-1 bg-track" />
      </div>
      <GoogleButton next="/app" />

      <p className="text-center text-text-2">
        Não tem uma conta?{" "}
        <Link href="/cadastro" className="font-semibold text-primary">Cadastre-se</Link>
      </p>
    </main>
  );
}
