import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { OPERATOR, PRIVACY_SECTIONS, PRIVACY_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacidadePage() {
  return (
    <main>
      <LegalDocument
        title="Política de privacidade"
        version={PRIVACY_VERSION}
        intro="Esta política descreve como seus dados pessoais são coletados, usados, armazenados e protegidos no FitneSAAS."
        sections={PRIVACY_SECTIONS}
        badges={["LGPD", "Dados de saúde: consentimento", "Sem venda de dados"]}
        backHref="/login"
        backLabel="Voltar"
      />
      <footer className="mx-auto max-w-md px-4 pb-10 text-center text-xs text-text-2">
        <p>Encarregado de dados (DPO): {OPERATOR.dpoEmail}</p>
        <p className="mt-1">{OPERATOR.company}</p>
      </footer>
    </main>
  );
}
