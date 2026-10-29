import Link from "next/link";
import type { LegalSection } from "@/lib/legal";
import { LEGAL_UPDATED } from "@/lib/legal";
import { Icon } from "@/components/icons";

export function LegalDocument({
  title,
  version,
  intro,
  sections,
  badges,
  backHref,
  backLabel,
}: {
  title: string;
  version: string;
  intro: string;
  sections: LegalSection[];
  badges: string[];
  backHref: string;
  backLabel: string;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pb-10 pt-6">
      <header className="flex items-center justify-between">
        <Link href={backHref} className="flex items-center gap-1 text-sm font-semibold text-primary">
          <Icon name="chevron" className="h-4 w-4 rotate-180" />{backLabel}
        </Link>
        <span className="text-xs text-text-2">Atualizado em {LEGAL_UPDATED}</span>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">Versão {version}</span>
        </div>
        <h1 className="text-[26px] font-bold leading-tight">{title}</h1>
        <p className="text-sm text-text-2">{intro}</p>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded-full bg-track px-2.5 py-1 text-xs font-medium text-text-2">{b}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {sections.map((s, i) => (
          <details key={s.title} className="group rounded-2xl bg-card" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.crucial ? "bg-carbs/20 text-carbs" : "bg-track text-text-2"}`}>
                {i + 1}
              </span>
              <span className="flex-1">
                <span className="block font-semibold leading-snug">{s.title}</span>
                {s.crucial && <span className="mt-0.5 block text-xs font-semibold text-carbs">Cláusula importante de saúde</span>}
              </span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-text-2 transition group-open:rotate-90" />
            </summary>
            <div className="flex flex-col gap-3 px-4 pb-4 text-[15px] leading-relaxed text-text-2">
              {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
              {s.bullets && (
                <ul className="flex list-disc flex-col gap-2 pl-5">
                  {s.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
