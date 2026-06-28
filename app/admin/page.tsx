import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function count(table: string, filters?: Record<string, string>) {
  const supabase = createClient();
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filters) for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { count } = await q;
  return count || 0;
}

export default async function AdminDashboard() {
  const supabase = createClient();
  const [customers, properties, activePlans, newLeads, openBids] = await Promise.all([
    count("pls_customers"),
    count("pls_properties"),
    count("pls_service_plans", { active: "true" }),
    count("pls_leads", { status: "new" }),
    count("pls_bids", { status: "open" }),
  ]);

  const { data: plans } = await supabase
    .from("pls_service_plans")
    .select("price_per_visit, frequency, active")
    .eq("active", true);
  const vpm: Record<string, number> = { weekly: 4.3, biweekly: 2.15, monthly: 1 };
  const mrr = (plans || []).reduce(
    (s, p: any) => s + Number(p.price_per_visit || 0) * (vpm[p.frequency] || 1),
    0
  );

  const cards = [
    { label: "Customers", value: customers, href: "/admin/customers" },
    { label: "Properties", value: properties, href: "/admin/customers" },
    { label: "Active service plans", value: activePlans, href: "/admin/customers" },
    { label: "Est. monthly recurring", value: `$${Math.round(mrr).toLocaleString()}`, href: "/admin/billing" },
    { label: "New leads", value: newLeads, href: "/admin/leads", highlight: newLeads > 0 },
    { label: "Open bids", value: openBids, href: "/admin/bid" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-prime-900">Good to see you 👋</h1>
      <p className="mt-1 text-prime-700">Here&apos;s how Prime Landscape is doing today.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className={`card p-5 transition hover:shadow-md ${c.highlight ? "ring-2 ring-prime-300" : ""}`}>
            <div className="text-sm text-prime-600">{c.label}</div>
            <div className="mt-1 text-3xl font-extrabold text-prime-800">{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/bid" className="card flex items-center gap-4 p-6 hover:shadow-md">
          <span className="text-3xl">📐</span>
          <div>
            <div className="font-bold text-prime-900">Bid a new job</div>
            <div className="text-sm text-prime-700">Type any address → market value, lot size, photos & price.</div>
          </div>
        </Link>
        <Link href="/admin/customers" className="card flex items-center gap-4 p-6 hover:shadow-md">
          <span className="text-3xl">👥</span>
          <div>
            <div className="font-bold text-prime-900">Manage customers</div>
            <div className="text-sm text-prime-700">Properties, service plans, photos & billing.</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
