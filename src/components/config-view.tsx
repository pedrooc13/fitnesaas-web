import Link from "next/link";
import { Icon } from "@/components/icons";
import { Notice } from "@/components/ui";
import { TopBar, Pill } from "@/components/screen-parts";
import type { ThemePref } from "@/lib/theme";

export interface ConfigProps {
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  planLabel: string;
  memberLabel: string | null;
  dietLabel: string;
  theme: ThemePref;
  erro?: string;
  msg?: string;
  themeForm: React.ReactNode;
  avatarForm: React.ReactNode;
  deleteForm: React.ReactNode;
  signOutForm: React.ReactNode;
}

const THEME_LABEL: Record<ThemePref, string> = { system: "Sistema", light: "Claro", dark: "Escuro" };

export function ConfigView(p: ConfigProps) {
  return (
    <div className="flex flex-col gap-4">
      <TopBar title="Configurações" />
      {p.erro && <Notice tone="error">{p.erro}</Notice>}
      {p.msg && <Notice tone="ok">{p.msg}</Notice>}

      <section className="flex items-center gap-4 rounded-2xl bg-card p-4">
        <div className="relative h-16 w-16 shrink-0">
          {p.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatarUrl} alt="Foto de perfil" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-track text-[17px] font-bold text-text-2">{p.initials}</div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="check" className="h-3 w-3" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-medium">{p.name}</p>
          <p className="truncate text-[15px] text-text-2">{p.email}</p>
          {p.memberLabel && <span className="mt-1.5 inline-block"><Pill>{p.memberLabel}</Pill></span>}
        </div>
      </section>

      <div className="flex flex-col gap-2 rounded-2xl bg-card p-4">{p.avatarForm}</div>

      <Group title="Assinatura">
        <Row icon="award" label={p.planLabel} value="Ativo" tone="primary" />
        <RowLink href="/app/planos" icon="card" label="Gerenciar assinatura" />
      </Group>
      <Group title="Perfil e metas">
        <RowLink href="/app/perfil" icon="user" label="Dados corporais e metas" />
        <RowLink href="/app/perfil" icon="calc" label="Recalcular macros" />
      </Group>
      <Group title="Plano de dieta">
        <RowLink href="/app/perfil" icon="utensils" label="Estratégia nutricional" value={p.dietLabel} />
      </Group>
      <Group title="Aparência">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3"><Icon name="moon" className="h-5 w-5 text-text-2" /><span className="text-[17px]">Modo de exibição</span></div>
          {p.themeForm}
          <p className="text-[12px] text-text-2">Atual: {THEME_LABEL[p.theme]}. Em Sistema, segue o modo do seu celular.</p>
        </div>
      </Group>
      <Group title="Privacidade">
        <RowLink href="/app/exportar" icon="download" label="Exportar meus dados" />
        {p.deleteForm}
      </Group>
      <Group title="Sobre">
        <Row icon="info" label="Versão do app" value="1.0.0" />
        <RowLink href="/termos" icon="doc" label="Termos de uso" />
        <RowLink href="/privacidade" icon="shield" label="Política de privacidade" />
      </Group>
      {p.signOutForm}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-text-2">{title}</h2>
      <div className="divide-y divide-track overflow-hidden rounded-2xl bg-card">{children}</div>
    </section>
  );
}

function Row({ icon, label, value, tone }: { icon: string; label: string; value?: string; tone?: "primary" }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon name={icon} className="h-5 w-5 text-text-2" />
      <span className="flex-1 text-[17px]">{label}</span>
      {value && <span className={tone === "primary" ? "text-[15px] font-medium text-primary" : "text-[15px] text-text-2"}>{value}</span>}
    </div>
  );
}

function RowLink({ href, icon, label, value }: { href: string; icon: string; label: string; value?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5">
      <Icon name={icon} className="h-5 w-5 text-text-2" />
      <span className="flex-1 text-[17px]">{label}</span>
      {value && <span className="max-w-[45%] truncate text-[15px] text-text-2">{value}</span>}
      <Icon name="chevron" className="h-4 w-4 text-text-2" />
    </Link>
  );
}
