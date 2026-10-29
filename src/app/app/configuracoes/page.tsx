import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIET_LABELS } from "@/lib/nutrition";
import { parseTheme, THEME_LABELS, type ThemePref } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { Notice } from "@/components/ui";
import { signOut } from "@/app/auth/actions";
import { deleteAccount, setTheme, uploadAvatar } from "./actions";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("profiles")
    .select("plan, diet, avatar_path")
    .eq("user_id", user.id)
    .maybeSingle();

  const plan = (row?.plan ?? "free") as "free" | "pro" | "max";
  const diet = (row?.diet ?? "equilibrada") as keyof typeof DIET_LABELS;
  const name = (user.user_metadata?.name as string | undefined) ?? "Usuário";
  const initials = name.split(" ").slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase();

  // Foto: URL temporária (1 hora) de um bucket privado
  let avatarUrl: string | null = null;
  if (row?.avatar_path) {
    const { data } = await supabase.storage.from("avatars").createSignedUrl(row.avatar_path, 3600);
    avatarUrl = data?.signedUrl ?? null;
  }

  const jar = await cookies();
  const theme: ThemePref = parseTheme(jar.get("theme")?.value);
  const planLabel = plan === "free" ? "Plano Free" : plan === "pro" ? "Plano Pro Ativo" : "Plano Max Ativo";
  const memberLabel = plan === "free" ? null : plan === "pro" ? "PRO Member" : "MAX Member";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold">Configurações</h1>
        <Link href="/app" aria-label="Voltar para Hoje" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="calendar" className="h-5 w-5" />
        </Link>
      </header>

      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}
      {sp.msg && <Notice tone="ok">{sp.msg}</Notice>}

      {/* Perfil com foto */}
      <section className="flex items-center gap-4 rounded-2xl bg-card p-4">
        <div className="relative h-16 w-16 shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Foto de perfil" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-track text-lg font-bold text-text-2">{initials}</div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="check" className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-sm text-text-2">{user.email}</p>
          {memberLabel && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
              <Icon name="flame" className="h-3 w-3" />{memberLabel}
            </span>
          )}
        </div>
      </section>

      <form action={uploadAvatar} className="flex flex-col gap-2 rounded-2xl bg-card p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Alterar foto</span>
          <input
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            required
            className="text-sm text-text-2 file:mr-3 file:rounded-lg file:border-0 file:bg-track file:px-3 file:py-2 file:font-semibold file:text-text"
          />
        </label>
        <p className="text-xs text-text-2">JPG, PNG ou WEBP, até 2 MB. Só você consegue ver sua foto.</p>
        <button type="submit" className="mt-1 h-11 rounded-xl bg-primary font-semibold text-on-primary">Salvar foto</button>
      </form>

      <Group title="Assinatura">
        <Row icon="award" label={planLabel} value={plan === "free" ? "Grátis" : "Ativo"} valueTone="primary" />
        <RowLink href="/app/planos" icon="card" label="Gerenciar assinatura" />
      </Group>

      <Group title="Perfil e metas">
        <RowLink href="/app/perfil" icon="user" label="Dados corporais e metas" />
        <RowLink href="/app/perfil" icon="calc" label="Recalcular macros" />
      </Group>

      <Group title="Plano de dieta">
        <RowLink href="/app/perfil" icon="utensils" label="Estratégia nutricional" value={DIET_LABELS[diet]} />
      </Group>

      <Group title="Aparência">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <Icon name="moon" className="h-5 w-5 text-text-2" />
            <span>Modo de exibição</span>
          </div>
          <form action={setTheme} className="grid grid-cols-3 gap-1 rounded-xl bg-track/70 p-1 text-sm font-semibold">
            {(["system", "light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="submit"
                name="theme"
                value={t}
                className={`rounded-lg py-2 ${theme === t ? "bg-card text-text shadow-sm" : "text-text-2"}`}
              >
                {THEME_LABELS[t]}
              </button>
            ))}
          </form>
          <p className="text-xs text-text-2">Em &quot;Sistema&quot;, o app segue o modo claro ou escuro do seu celular.</p>
        </div>
      </Group>

      <Group title="Privacidade">
        <RowLink href="/app/exportar" icon="download" label="Exportar meus dados" />
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 text-destructive">
            <Icon name="trash" className="h-5 w-5" />
            <span className="flex-1 font-medium">Excluir conta</span>
            <Icon name="chevron" className="h-4 w-4 transition group-open:rotate-90" />
          </summary>
          <form action={deleteAccount} className="flex flex-col gap-2 px-4 pb-4">
            <p className="text-sm text-text-2">Apaga sua conta, seu perfil, sua foto e todo o histórico. Não pode ser desfeito.</p>
            <input name="confirm" placeholder="Digite EXCLUIR" className="h-11 rounded-xl border border-track bg-background px-3" />
            <button type="submit" className="h-11 rounded-xl bg-destructive/15 font-semibold text-destructive">Excluir minha conta</button>
          </form>
        </details>
      </Group>

      <Group title="Sobre">
        <Row icon="info" label="Versão do app" value="1.0.0 (web)" />
        <RowLink href="/termos" icon="doc" label="Termos de uso" />
        <RowLink href="/privacidade" icon="shield" label="Política de privacidade" />
      </Group>

      <form action={signOut}>
        <button type="submit" className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-card font-semibold">
          <Icon name="logout" className="h-5 w-5" />Sair da conta
        </button>
      </form>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-text-2">{title}</h2>
      <div className="divide-y divide-track overflow-hidden rounded-2xl bg-card">{children}</div>
    </section>
  );
}

function Row({ icon, label, value, valueTone }: { icon: string; label: string; value?: string; valueTone?: "primary" }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon name={icon} className="h-5 w-5 text-text-2" />
      <span className="flex-1">{label}</span>
      {value && <span className={valueTone === "primary" ? "font-medium text-primary" : "text-text-2"}>{value}</span>}
    </div>
  );
}

function RowLink({ href, icon, label, value }: { href: string; icon: string; label: string; value?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5">
      <Icon name={icon} className="h-5 w-5 text-text-2" />
      <span className="flex-1">{label}</span>
      {value && <span className="max-w-[45%] truncate text-sm text-text-2">{value}</span>}
      <Icon name="chevron" className="h-4 w-4 text-text-2" />
    </Link>
  );
}
