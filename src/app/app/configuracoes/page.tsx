import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Button, Card, Notice } from "@/components/ui";
import { deleteAccount } from "./actions";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase.from("profiles").select("plan").eq("user_id", user.id).maybeSingle();
  const name = (user.user_metadata?.name as string | undefined) ?? "Usuário";
  const initials = name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-semibold">Configurações</h1>
      {sp.erro && <Notice tone="error">{sp.erro}</Notice>}

      <Card className="flex items-center gap-3">
        <div className="flex h-13 w-13 items-center justify-center rounded-full bg-primary text-lg font-bold text-on-primary">{initials}</div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-sm text-text-2">{user.email}</p>
        </div>
      </Card>

      <Card className="flex flex-col gap-2 text-[15px]">
        <div className="flex justify-between"><span>Plano atual</span><b>{(row?.plan ?? "free").toUpperCase()}</b></div>
        <a href="/app/perfil" className="flex justify-between border-t border-track pt-2 font-semibold text-primary">Editar perfil e metas</a>
      </Card>

      <Card>
        <form action={signOut}>
          <Button type="submit" variant="secondary">Sair da conta</Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">Excluir conta</h2>
        <p className="text-sm text-text-2">Apaga sua conta, seu perfil e todo o histórico de refeições. Não pode ser desfeito.</p>
        <form action={deleteAccount} className="flex flex-col gap-2">
          <input name="confirm" placeholder='Digite EXCLUIR' className="h-11 rounded-xl border border-track bg-background px-3" />
          <Button type="submit" variant="destructive">Excluir minha conta</Button>
        </form>
      </Card>

      <nav className="flex justify-center gap-4 text-xs text-text-2">
        <a href="/termos">Termos de uso</a>
        <a href="/privacidade">Política de privacidade</a>
      </nav>
    </div>
  );
}
