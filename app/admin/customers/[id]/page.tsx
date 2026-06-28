import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PropertyPhotos from "@/components/PropertyPhotos";

export const dynamic = "force-dynamic";

const money = (n: number | null | undefined) => (n ? `$${Number(n).toLocaleString("en-US")}` : "—");

export default async function CustomerDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: customer } = await supabase
    .from("pls_customers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!customer) notFound();

  const { data: properties } = await supabase
    .from("pls_properties")
    .select("*, pls_service_plans(*)")
    .eq("customer_id", params.id);

  const { data: invoices } = await supabase
    .from("pls_invoices")
    .select("*")
    .eq("customer_id", params.id)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-prime-600 hover:underline">← Customers</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-prime-900">{customer.name}</h1>
        <span className="rounded-full bg-prime-100 px-3 py-1 text-xs font-semibold capitalize text-prime-700">
          {customer.customer_type} · {customer.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-prime-700">
        {customer.email || "no email"} · {customer.phone || "no phone"}
      </p>

      <h2 className="mt-8 text-lg font-bold text-prime-900">Properties</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {(properties || []).map((p: any) => {
          const addr = `${p.address}, ${p.city || "Fort Worth"}, TX ${p.zip || ""}`;
          return (
            <div key={p.id} className="card overflow-hidden">
              <PropertyPhotos address={addr} lat={p.latitude} lng={p.longitude} />
              <div className="p-5">
                <h3 className="font-bold text-prime-900">{p.address}</h3>
                <p className="text-sm text-prime-700">{p.city}, TX {p.zip}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <Field label="Market value" value={money(p.total_value)} />
                  <Field label="Lot size" value={p.lot_acres ? `${Number(p.lot_acres).toFixed(2)} ac` : "—"} />
                  <Field label="Turf est." value={p.turf_sqft_est ? `${Number(p.turf_sqft_est).toLocaleString()} sf` : "—"} />
                </div>
                {p.gate_code && <p className="mt-3 text-xs text-prime-600">Gate code: <b>{p.gate_code}</b></p>}
                {p.service_notes && <p className="mt-1 text-xs text-prime-600">Notes: {p.service_notes}</p>}

                <div className="mt-4">
                  <p className="label">Service plans</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {(p.pls_service_plans || []).filter((s: any) => s.active).map((s: any) => (
                      <li key={s.id} className="flex justify-between">
                        <span className="capitalize text-prime-800">{s.service_type} · {s.frequency}</span>
                        <span className="font-semibold text-prime-700">{money(s.price_per_visit)}/visit</span>
                      </li>
                    ))}
                    {!(p.pls_service_plans || []).some((s: any) => s.active) && (
                      <li className="text-prime-500">No active plans</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
        {!properties?.length && (
          <div className="card p-8 text-center text-prime-500">No properties on file for this customer.</div>
        )}
      </div>

      <h2 className="mt-10 text-lg font-bold text-prime-900">Recent invoices</h2>
      <div className="card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-prime-50 text-left text-prime-700">
            <tr><th className="px-4 py-2">Period</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-prime-50">
            {(invoices || []).map((i: any) => (
              <tr key={i.id}>
                <td className="px-4 py-2 text-prime-700">{i.period_start} → {i.period_end}</td>
                <td className="px-4 py-2 font-semibold text-prime-800">{money(i.amount)}</td>
                <td className="px-4 py-2 capitalize text-prime-700">{i.status}</td>
              </tr>
            ))}
            {!invoices?.length && <tr><td colSpan={3} className="px-4 py-6 text-center text-prime-500">No invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-prime-100 p-2">
      <div className="text-[11px] text-prime-500">{label}</div>
      <div className="font-semibold text-prime-900">{value}</div>
    </div>
  );
}
