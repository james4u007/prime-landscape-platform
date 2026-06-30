import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const vpm: Record<string, number> = { weekly: 4.3, biweekly: 2.15, monthly: 1, seasonal: 0.33, one_time: 0 };
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default async function AdminDashboard() {
  const supabase = createClient();

  const [{ data: plans }, { data: customers }, { data: leads }, { data: bids }] = await Promise.all([
    supabase.from("pls_service_plans").select("price_per_visit, frequency, active").eq("active", true),
    supabase.from("pls_customers").select("status"),
    supabase.from("pls_leads").select("status"),
    supabase.from("pls_bids").select("status"),
  ]);

  const mrrByFreq: Record<string, number> = {};
  let mrr = 0;
  for (const p of plans || []) {
    const m = Number(p.price_per_visit || 0) * (vpm[p.frequency] ?? 1);
    mrr += m;
    mrrByFreq[p.frequency] = (mrrByFreq[p.frequency] || 0) + m;
  }
  const statusMix: Record<string, number> = {};
  for (const c of customers || []) statusMix[c.status] = (statusMix[c.status] || 0) + 1;
  const leadMix: Record<string, number> = {};
  for (const l of leads || []) leadMix[l.status] = (leadMix[l.status] || 0) + 1;

  const newLeads = leadMix["new"] || 0;
  const openBids = (bids || []).filter((b: any) => b.status === "open").length;

  const cards = [
    { label: "Customers", value: customers?.length || 0, href: "/admin/customers" },
    { label: "Active plans", value: (plans || []).length, href: "/admin/customers" },
    { label: "Monthly recurring", value: money(mrr), href: "/admin/billing", accent: true },
    { label: "Annual run-rate", value: money(mrr * 12), href: "/admin/billing" },
    { label: "New leads", value: newLeads, href: "/admin/leads", highlight: newLeads > 0 },
    { label: "Open bids", value: openBids, href: "/admin/bid" },
  ];

  const freqMax = Math.max(1, ...Object.values(mrrByFreq));

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-prime-900">Good to see you 👋</h1>
      <p className="mt-1 text-prime-700">Here&apos;s how Prime Landscape is doing today.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className={`card p-5 transition hover:shadow-md ${c.highlight ? "ring-2 ring-prime-300" : ""} ${c.accent ? "bg-prime-600 text-white" : ""}`}>
            <div className={`text-sm ${c.accent ? "text-prime-100" : "text-prime-600"}`}>{c.label}</div>
            <div className={`mt-1 text-3xl font-extrabold ${c.accent ? "text-white" : "text-prime-800"}`}>{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-bold text-prime-900">Recurring revenue by frequency</h2>
          <div className="mt-4 space-y-3">
            {["weekly", "biweekly", "monthly", "seasonal"].filter((f) => mrrByFreq[f]).map((f) => (
              <div key={f}>
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-prime-700">{f === "biweekly" ? "bi-weekly" : f}</span>
                  <span className="font-semibold text-prime-800">{money(mrrByFreq[f])}/mo</span>
                </div>
                <div className="mt-1 h-2.5 w-full rounded-full bg-prime-50">
                  <div className="h-2.5 rounded-full bg-prime-600" style={{ width: `${(mrrByFreq[f] / freqMax) * 100}%` }} />
                </div>
              </div>
            ))}
            {!Object.keys(mrrByFreq).length && <p className="text-sm text-prime-500">No active plans yet.</p>}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-prime-900">Pipeline</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="label mb-2">Customers</p>
              {Object.entries(statusMix).map(([s, n]) => (
                <div key={s} className="flex justify-between py-1"><span className="capitalize text-prime-700">{s}</span><span className="font-semibold text-prime-800">{n}</span></div>
              ))}
              {!Object.keys(statusMix).length && <p className="text-prime-500">None yet.</p>}
            </div>
            <div>
              <p className="label mb-2">Leads</p>
              {Object.entries(leadMix).map(([s, n]) => (
                <div key={s} className="flex justify-between py-1"><span className="capitalize text-prime-700">{s}</span><span className="font-semibold text-prime-800">{n}</span></div>
              ))}
              {!Object.keys(leadMix).length && <p className="text-prime-500">None yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/admin/customers/new" className="card flex items-center gap-4 p-6 hover:shadow-md">
          <span className="text-3xl">➕</span>
          <div><div className="font-bold text-prime-900">Add a customer</div><div className="text-sm text-prime-700">Onboard an account in a minute.</div></div>
        </Link>
        <Link href="/admin/bid" className="card flex items-center gap-4 p-6 hover:shadow-md">
          <span className="text-3xl">📐</span>
          <div><div className="font-bold text-prime-900">Bid a job</div><div className="text-sm text-prime-700">Address → value, lot size, price.</div></div>
        </Link>
        <Link href="/admin/routes" className="card flex items-center gap-4 p-6 hover:shadow-md">
          <span className="text-3xl">🚚</span>
          <div><div className="font-bold text-prime-900">Plan routes</div><div className="text-sm text-prime-700">Auto-optimize the day&apos;s stops.</div></div>
        </Link>
      </div>
    </div>
  );
}
