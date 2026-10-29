import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { acceptTerms } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";
import { Notice } from "@/components/ui";
import { Consent } from "@/components/consent";

export const metadata: Metadata = { title: "Aceitar termos" };

export default async function AceitarTermosPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6 py-10">
      <header className="text-center">
        <h1 className="text-[26px] font-bold">Antes de continuar</h1>
        <p className="mt-2 text-text-2">Atualizamos nossos termos e nossa política. Leia e aceite para usar o FitneSAAS.</p>
      </header>
      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}
      <form action={acceptTerms} className="flex flex-col gap-4">
        <Consent />
        <button type="submit" className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-on-primary">
          Aceitar e continuar
        </button>
      </form>
      <p className="text-center text-xs text-text-2">
        Versões: termos {TERMS_VERSION}, política {PRIVACY_VERSION} ·{" "}
        <Link href="/termos" className="font-semibold text-primary">Ler termos</Link> ·{" "}
        <Link href="/privacidade" className="font-semibold text-primary">Ler política</Link>
      </p>
    </main>
  );
}
