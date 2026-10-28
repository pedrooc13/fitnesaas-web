import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-[22px] font-bold">Termos de uso</h1>
      <p className="text-text-2">Texto em revisão jurídica. Substitua este conteúdo antes de publicar.</p>
    </main>
  );
}
