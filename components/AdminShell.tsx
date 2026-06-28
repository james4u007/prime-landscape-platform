"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/bid", label: "Bid a Job", icon: "📐" },
  { href: "/admin/routes", label: "Routes", icon: "🚚" },
  { href: "/admin/billing", label: "Billing", icon: "💵" },
  { href: "/admin/leads", label: "Leads", icon: "✨" },
];

export default function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const supabase = createClient();
  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="flex min-h-screen bg-sand">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-prime-100 bg-white p-4 md:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2 font-extrabold text-prime-700">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-prime-600 text-white">P</span>
          Prime Admin
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((n) => {
            const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? "bg-prime-600 text-white" : "text-prime-800 hover:bg-prime-50"}`}>
                <span>{n.icon}</span> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-prime-100 pt-4 text-sm">
          <div className="px-3 text-prime-700">{name}</div>
          <button onClick={signOut} className="mt-2 w-full rounded-xl px-3 py-2 text-left text-prime-600 hover:bg-prime-50">Sign out</button>
        </div>
      </aside>
      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-prime-100 bg-white px-5 py-3 md:hidden">
          <span className="font-bold text-prime-700">Prime Admin</span>
          <button onClick={signOut} className="text-sm text-prime-600">Sign out</button>
        </div>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
