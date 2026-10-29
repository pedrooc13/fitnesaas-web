import type { ReactNode } from "react";
import { TabBar } from "@/components/tab-bar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">{children}</main>
      <TabBar />
    </div>
  );
}
