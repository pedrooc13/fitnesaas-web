import type { Metadata } from "next";
import Link from "next/link";
import { forgotPassword } from "@/app/auth/actions";
import { Button, Field, Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default async function EsqueciPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <header className="text-center">
        <h1 className="text-[28px] font-bold">Recuperar senha</h1>
        <p className="text-text-2">Enviaremos um link para o seu email</p>
      </header>
      {sp.msg && <Notice tone="ok">{sp.msg}</Notice>}
      <form action={forgotPassword} className="flex flex-col gap-3">
        <Field name="email" type="email" label="Email" autoComplete="email" required />
        <Button type="submit">Enviar link</Button>
      </form>
      <Link href="/login" className="text-center text-sm font-semibold text-primary">Voltar ao login</Link>
    </main>
  );
}
