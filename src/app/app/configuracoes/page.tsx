import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIET_LABELS } from "@/lib/nutrition";
import { parseTheme, type ThemePref } from "@/lib/theme";
import { ConfigView } from "@/components/config-view";
import { Icon } from "@/components/icons";
import { signOut } from "@/app/auth/actions";
import { deleteAccount, setTheme, uploadAvatar } from "./actions";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase.from("profiles").select("plan, diet, avatar_path").eq("user_id", user.id).maybeSingle();
  const plan = (row?.plan ?? "free") as "free" | "pro" | "max";
  const diet = (row?.diet ?? "equilibrada") as keyof typeof DIET_LABELS;
  const name = (user.user_metadata?.name as string | undefined) ?? "Usuário";
  const initials = name.split(" ").slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase();

  let avatarUrl: string | null = null;
  if (row?.avatar_path) {
    const { data } = await supabase.storage.from("avatars").createSignedUrl(row.avatar_path, 3600);
    avatarUrl = data?.signedUrl ?? null;
  }

  const jar = await cookies();
  const theme: ThemePref = parseTheme(jar.get("theme")?.value);

  return (
    <ConfigView
      name={name}
      email={user.email ?? ""}
      initials={initials}
      avatarUrl={avatarUrl}
      planLabel={plan === "free" ? "Plano Free" : plan === "pro" ? "Plano Pro" : "Plano Max"}
      memberLabel={plan === "free" ? null : plan === "pro" ? "PRO Member" : "MAX Member"}
      dietLabel={DIET_LABELS[diet]}
      theme={theme}
      erro={sp.erro}
      msg={sp.msg}
      themeForm={
        <form action={setTheme} className="grid grid-cols-3 gap-1 rounded-xl bg-track p-1 text-[15px] font-medium">
          {(["system", "light", "dark"] as const).map((t) => (
            <button key={t} type="submit" name="theme" value={t} className={`rounded-lg py-2 ${theme === t ? "bg-card text-text shadow-sm" : "text-text-2"}`}>
              {t === "system" ? "Sistema" : t === "light" ? "Claro" : "Escuro"}
            </button>
          ))}
        </form>
      }
      avatarForm={
        <form action={uploadAvatar} className="flex flex-col gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-semibold">Alterar foto</span>
            <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" required className="text-[14px] text-text-2 file:mr-3 file:rounded-lg file:border-0 file:bg-track file:px-3 file:py-2 file:font-semibold file:text-text" />
          </label>
          <p className="text-[12px] text-text-2">JPG, PNG ou WEBP, até 2 MB. Só você consegue ver sua foto.</p>
          <button type="submit" className="h-11 rounded-xl bg-primary font-semibold text-on-primary">Salvar foto</button>
        </form>
      }
      deleteForm={
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 text-destructive">
            <Icon name="trash" className="h-5 w-5" />
            <span className="flex-1 text-[17px] font-medium">Excluir conta</span>
            <Icon name="chevron" className="h-4 w-4 transition group-open:rotate-90" />
          </summary>
          <form action={deleteAccount} className="flex flex-col gap-2 px-4 pb-4">
            <p className="text-[14px] text-text-2">Apaga sua conta, seu perfil, sua foto e todo o histórico. Não pode ser desfeito.</p>
            <input name="confirm" placeholder="Digite EXCLUIR" className="h-11 rounded-xl border border-track bg-background px-3" />
            <button type="submit" className="h-11 rounded-xl bg-destructive/15 font-semibold text-destructive">Excluir minha conta</button>
          </form>
        </details>
      }
      signOutForm={
        <form action={signOut}>
          <button type="submit" className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-card text-[17px] font-semibold">
            <Icon name="logout" className="h-5 w-5" />Sair da conta
          </button>
        </form>
      }
    />
  );
}
