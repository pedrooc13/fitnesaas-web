import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Recebe o link dos emails (confirmação e redefinição de senha) e cria a sessão. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next") ?? "/app";
  // Só aceita caminhos internos: evita redirecionar para outro site (open redirect)
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }
  return NextResponse.redirect(new URL("/login?erro=link-invalido", origin));
}
