import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { OPERATOR, TERMS_SECTIONS, TERMS_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <>
      <LegalDocument
        title="Termos de uso"
        version={TERMS_VERSION}
        intro="Ao acessar ou usar o FitneSAAS, você concorda com estes termos. Se não concordar, não use a plataforma."
        sections={TERMS_SECTIONS}
        badges={["Nutrição", "Sem substituir consulta"]}
        backHref="/login"
        backLabel="Voltar"
      />
      <p className="sr-only">Contato: {OPERATOR.dpoEmail}</p>
    </>
  );
}
