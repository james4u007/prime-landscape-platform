import { createClient } from "@/lib/supabase/server";
import PropertyPhotos from "@/components/PropertyPhotos";

export const dynamic = "force-dynamic";

const money = (n: number | null) => (n != null ? `$${Number(n).toLocaleString("en-US")}` : "—");
const cap = (s: string) => (s === "biweekly" ? "Bi-Weekly" : s.charAt(0).toUpperCase() + s.slice(1));

export default async function PortalPage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data } = await supabase.rpc("pls_portal", { p_token: params.token });

  if (!data) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand p-6 text-center">
        <div className="card max-w-md p-8">
          <h1 className="text-lg font-bold text-prime-900">Link not found</h1>
          <p className="mt-2 text-sm text-prime-700">This portal link is invalid or expired. Please contact us for a new one.</p>
        </div>
      </div>
    );
  }

  const c = (data as any).customer;
  const properties = (data as any).properties || [];
  const invoices = (data as any).invoices || [];
  const outstanding = invoices.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + Number(i.amount), 0);

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-prime-100 bg-prime-700 px-5 py-4 text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20">P</span>
            Prime Landscape
          </div>
          <a href="tel:+18172658000" className="text-sm font-semibold">📞 (817) 265-8000</a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <h1 className="text-2xl font-extrabold text-prime-900">Welcome back, {(c.name || "").split(" ")[0] || "neighbor"} 👋</h1>
            <p className="text-sm text-prime-700">Account status: <span className="font-semibold capitalize">{c.status}</span></p>
          </div>
          <div className="card px-4 py-3 text-sm">
            {c.card_last4 ? (
              <span className="text-prime-800">💳 {cap(c.card_brand || "card")} ending {c.card_last4} on file</span>
            ) : (
              <span className="text-prime-600">No card on file</span>
            )}
          </div>
        </div>

        {outstanding > 0 && (
          <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 border-amber-200 bg-amber-50 p-5">
            <div>
              <div className="font-bold text-amber-900">Balance due: {money(outstanding)}</div>
              <div className="text-sm text-amber-800">Pay securely online in seconds.</div>
            </div>
            <button className="btn-primary" disabled title="Online payments activate once Stripe is connected">Pay Now</button>
          </div>
        )}

        <h2 className="mt-2 text-lg font-bold text-prime-900">Your properties</h2>
        <div className="mt-3 grid gap-5 md:grid-cols-2">
          {properties.map((p: any, idx: number) => {
            const addr = `${p.address}, ${p.city || "Fort Worth"}, TX ${p.zip || ""}`;
            return (
              <div key={idx} className="card overflow-hidden">
                <PropertyPhotos address={addr} lat={p.latitude} lng={p.longitude} />
                <div className="p-5">
                  <h3 className="font-bold text-prime-900">{p.address}</h3>
                  <p className="text-sm text-prime-700">{p.city}, TX {p.zip}</p>
                  <div className="mt-3">
                    <p className="label">Your plan</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {(p.plans || []).map((s: any, i: number) => (
                        <li key={i} className="flex justify-between">
                          <span className="capitalize text-prime-800">{s.service_type} · {cap(s.frequency)}</span>
                          <span className="font-semibold text-prime-700">{money(s.price_per_visit)}/visit</span>
                        </li>
                      ))}
                      {!(p.plans || []).length && <li className="text-prime-500">No active plan</li>}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
          {!properties.length && <div className="card p-8 text-center text-prime-500">No properties on file yet.</div>}
        </div>

        <h2 className="mt-8 text-lg font-bold text-prime-900">Billing history</h2>
        <div className="card mt-3 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-prime-50 text-left text-prime-700">
              <tr><th className="px-4 py-2">Period</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-prime-50">
              {invoices.map((i: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-prime-700">{i.period_start} → {i.period_end}</td>
                  <td className="px-4 py-2 font-semibold text-prime-800">{money(i.amount)}</td>
                  <td className="px-4 py-2 capitalize text-prime-700">{i.status}</td>
                </tr>
              ))}
              {!invoices.length && <tr><td colSpan={3} className="px-4 py-6 text-center text-prime-500">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <p className="mt-8 pb-10 text-center text-xs text-prime-500">Questions? Call us at (817) 265-8000 — we&apos;re happy to help.</p>
      </main>
    </div>
  );
}
