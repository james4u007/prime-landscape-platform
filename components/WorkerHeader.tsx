"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WorkerHeader({ name }: { name: string }) {
  const router = useRouter();
  const supabase = createClient();
  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-prime-100 bg-prime-700 px-5 py-3 text-white">
      <div className="flex items-center gap-2 font-extrabold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20">P</span>
        My Route
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline">{name}</span>
        <button onClick={signOut} className="rounded-lg bg-white/15 px-3 py-1.5 hover:bg-white/25">Sign out</button>
      </div>
    </header>
  );
}
