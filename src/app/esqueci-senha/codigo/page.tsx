import type { Metadata } from "next";
import Link from "next/link";
import { forgotPassword, verifyRecoveryCode } from "@/app/auth/actions";
import { Button, Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Digite o código" };

export default async function CodigoPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const email = sp.email ?? "";

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-6 p-6 pt-10">
      <Link href="/esqueci-senha" className="text-sm font-semibold text-primary">‹ Voltar</Link>

      <header className="text-center">
        <h1 className="text-[28px] font-bold">Digite o código</h1>
        <p className="text-text-2">
          Enviamos 6 números para <span className="font-semibold text-text">{email || "seu email"}</span>.
        </p>
      </header>

      {sp.msg && <Notice tone="ok">{sp.msg}</Notice>}
      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}

      <form action={verifyRecoveryCode} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-2">Código de 6 dígitos</span>
          <input
            name="token"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="000000"
            required
            className="h-14 rounded-xl border border-track bg-card text-center text-2xl font-bold tracking-[0.4em] text-text outline-none focus:border-primary"
          />
        </label>
        <Button type="submit">Confirmar</Button>
      </form>

      <form action={forgotPassword} className="text-center">
        <input type="hidden" name="email" value={email} />
        <p className="text-sm text-text-2">
          Não recebeu?{" "}
          <button type="submit" className="font-semibold text-primary">Reenviar código</button>
        </p>
      </form>
    </main>
  );
}
