import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import ChargeButton from "@/components/ChargeButton";

export const dynamic = "force-dynamic";
const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const vpm: Record<string, number> = { weekly: 4.3, biweekly: 2.15, monthly: 1, seasonal: 0.33, one_time: 1 };

async function generateInvoices() {
  "use server";
  const supabase = createClient();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data: customers } = await supabase
    .from("pls_customers")
    .select("id, status, pls_properties(id, pls_service_plans(price_per_visit, frequency, active))")
    .eq("status", "active");

  for (const c of customers || []) {
    const { data: existing } = await supabase
      .from("pls_invoices").select("id").eq("customer_id", c.id).eq("period_start", start).maybeSingle();
    if (existing) continue;

    let amount = 0;
    const items: any[] = [];
    for (const p of (c as any).pls_properties || []) {
      for (const plan of (p.pls_service_plans || []).filter((s: any) => s.active)) {
        const monthly = Number(plan.price_per_visit) * (vpm[plan.frequency] ?? 1);
        amount += monthly;
        items.push({ property_id: p.id, service_type: plan.frequency + " service", description: `${plan.frequency} @ ${money(plan.price_per_visit)}/visit`, qty: vpm[plan.frequency] ?? 1, amount: monthly });
      }
    }
    if (amount <= 0) continue;
    const { data: inv } = await supabase
      .from("pls_invoices")
      .insert({ customer_id: c.id, period_start: start, period_end: end, amount: Math.round(amount * 100) / 100, status: "draft" })
      .select("id").single();
    if (inv && items.length) {
      await supabase.from("pls_invoice_items").insert(items.map((it) => ({ ...it, invoice_id: inv.id })));
    }
  }
  revalidatePath("/admin/billing");
}

export default async function BillingPage() {
  const supabase = createClient();
  const { data: invoices } = await supabase
    .from("pls_invoices")
    .select("*, pls_customers(name, stripe_customer_id, default_payment_method)")
    .order("created_at", { ascending: false })
    .limit(100);

  const list = invoices || [];
  const outstanding = list.filter((i: any) => ["draft", "sent", "overdue"].includes(i.status)).reduce((s: number, i: any) => s + Number(i.amount), 0);
  const paid = list.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.amount), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-prime-900">Billing</h1>
        <div className="flex gap-2">
          <a href="/api/admin/invoices-csv" className="btn-ghost">⬇ Export for QuickBooks (CSV)</a>
          <form action={generateInvoices}>
            <button className="btn-primary">Generate This Month&apos;s Invoices</button>
          </form>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><div className="text-sm text-prime-600">Outstanding</div><div className="mt-1 text-2xl font-extrabold text-prime-800">{money(outstanding)}</div></div>
        <div className="card p-5"><div className="text-sm text-prime-600">Collected</div><div className="mt-1 text-2xl font-extrabold text-prime-800">{money(paid)}</div></div>
        <div className="card p-5"><div className="text-sm text-prime-600">Invoices</div><div className="mt-1 text-2xl font-extrabold text-prime-800">{list.length}</div></div>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-prime-50 text-left text-prime-700">
            <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">QB</th><th className="px-4 py-3">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-prime-50">
            {list.map((i: any) => (
              <tr key={i.id} className="hover:bg-prime-50/50">
                <td className="px-4 py-3 font-semibold text-prime-800">{i.pls_customers?.name || "—"}</td>
                <td className="px-4 py-3 text-prime-700">{i.period_start} → {i.period_end}</td>
                <td className="px-4 py-3 font-semibold text-prime-800">{money(i.amount)}</td>
                <td className="px-4 py-3 capitalize text-prime-700">{i.status}</td>
                <td className="px-4 py-3 text-prime-600">{i.qb_exported ? "✓" : "—"}</td>
                <td className="px-4 py-3">{i.status !== "paid" && <ChargeButton invoiceId={i.id} hasCard={!!(i.pls_customers?.stripe_customer_id && i.pls_customers?.default_payment_method)} />}</td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-prime-500">No invoices yet. Generate this month&apos;s to begin.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-prime-500">
        The CSV export matches QuickBooks&apos; invoice import format (Customer, Date, Item, Amount, Memo). A direct two-way QuickBooks Online sync can be added next.
      </p>
    </div>
  );
}
