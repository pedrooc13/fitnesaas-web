import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-[22px] font-bold">Política de privacidade</h1>
      <p className="text-text-2">
        Texto em revisão para a LGPD. Antes de publicar, deve descrever: dados coletados (incluindo dados de saúde, que são sensíveis),
        finalidade, base legal (consentimento específico), prazo de guarda, subcontratados (Supabase, Vercel, provedor de email),
        direitos do titular e o contato do encarregado.
      </p>
    </main>
  );
}
