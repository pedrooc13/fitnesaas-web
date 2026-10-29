import Link from "next/link";

/** Os dois aceites obrigatórios: termos e política, com consentimento para dados de saúde */
export function Consent() {
  return (
    <fieldset className="flex flex-col gap-3 rounded-2xl bg-card p-4">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-2">Termos e privacidade</legend>
      <label className="flex gap-3 text-sm leading-relaxed">
        <input type="checkbox" name="accept_terms" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]" />
        <span>
          Li e concordo com os{" "}
          <Link href="/termos" className="font-semibold text-primary underline">Termos de uso</Link> da plataforma FitneSAAS.
        </span>
      </label>
      <label className="flex gap-3 text-sm leading-relaxed">
        <input type="checkbox" name="accept_privacy" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]" />
        <span>
          Li e aceito a{" "}
          <Link href="/privacidade" className="font-semibold text-primary underline">Política de privacidade</Link> e consinto com o tratamento dos meus dados de saúde e nutrição para o acompanhamento.
        </span>
      </label>
      <p className="rounded-xl bg-track/70 p-3 text-xs text-text-2">
        Você pode retirar esse consentimento a qualquer momento, excluindo sua conta em Configurações.
      </p>
    </fieldset>
  );
}
