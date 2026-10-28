import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/app/auth/actions";
import { Button, Field, Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const erro = sp.erro === "link-invalido" ? "Link inválido ou expirado" : sp.erro;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <header className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-on-primary">F</div>
        <h1 className="text-[28px] font-bold">FitneSAAS</h1>
        <p className="text-text-2">Acompanhe calorias e macros do dia</p>
      </header>

      {erro && <Notice tone="error">{erro}</Notice>}
      {sp.msg && <Notice tone="ok">{sp.msg}</Notice>}

      <form action={login} className="flex flex-col gap-3">
        <Field name="email" type="email" label="Email" autoComplete="email" defaultValue={sp.email} required />
        <Field name="password" type="password" label="Senha" autoComplete="current-password" required />
        <Button type="submit">Entrar</Button>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm">
        <Link href="/esqueci-senha" className="font-semibold text-primary">Esqueci minha senha</Link>
        <p className="text-text-2">
          Não tem conta? <Link href="/cadastro" className="font-semibold text-primary">Criar conta</Link>
        </p>
      </div>
    </main>
  );
}
