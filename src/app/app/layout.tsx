import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";
import { TabBar } from "@/components/tab-bar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Sem o aceite da versão atual dos termos, ninguém usa o app
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const meta = user.user_metadata ?? {};
  if (meta.terms_version !== TERMS_VERSION || meta.privacy_version !== PRIVACY_VERSION) {
    redirect("/aceitar-termos");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">{children}</main>
      <TabBar />
    </div>
  );
}
