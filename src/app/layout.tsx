import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FitneSAAS", template: "%s · FitneSAAS" },
  description: "Acompanhe calorias e macros do dia.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9fe" },
    { media: "(prefers-color-scheme: dark)", color: "#131313" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const pref = jar.get("theme")?.value;
  // "system" ou ausente: sem classe, o CSS segue o celular
  const themeClass = pref === "light" || pref === "dark" ? pref : "";
  return (
    <html lang="pt-BR" className={themeClass}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
