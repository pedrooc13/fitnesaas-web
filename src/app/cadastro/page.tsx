import type { Metadata } from "next";
import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { GoogleButton } from "@/components/google-button";
import { AuthInput, LockIcon, MailIcon, UserIcon } from "@/components/auth-input";
import { Consent } from "@/components/consent";
import { Notice } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Criar conta" };

export default async function CadastroPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-5 px-5 py-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <Link href="/login" className="self-start text-sm font-semibold text-primary">‹ Voltar</Link>
        <h1 className="text-[28px] font-bold">Criar conta</h1>
        <p className="text-sm text-text-2">Comece sua jornada de nutrição e metas diárias com precisão.</p>
      </header>

      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}

      <form action={signup} className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-2">Dados cadastrais</p>
        <AuthInput name="name" placeholder="Nome completo" autoComplete="name" icon={<UserIcon />} required />
        <AuthInput name="email" type="email" placeholder="seu@email.com" autoComplete="email" icon={<MailIcon />} required />
        <AuthInput name="password" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} icon={<LockIcon />} required />
        <AuthInput name="confirm" type="password" placeholder="Repita a sua senha" autoComplete="new-password" minLength={8} icon={<Icon name="lock" className="h-5 w-5" />} required />

        <Consent />

        <button type="submit" className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-semibold text-on-primary">
          Criar minha conta →
        </button>
      </form>

      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-text-2">
        <span className="h-px flex-1 bg-track" />ou cadastre-se com<span className="h-px flex-1 bg-track" />
      </div>
      <GoogleButton next="/app/perfil" label="Continuar com o Google" />
      <p className="text-center text-xs text-text-2">Ao entrar com Google, você aceita os termos na próxima tela.</p>

      <p className="text-center text-text-2">
        Já possui uma conta?{" "}
        <Link href="/login" className="font-semibold text-primary">Entrar</Link>
      </p>
    </main>
  );
}
