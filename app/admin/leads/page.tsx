import { createClient } from "@/lib/supabase/server";
import ConvertLead from "@/components/ConvertLead";

export const dynamic = "force-dynamic";
const money = (n: number | null) => (n ? `$${Number(n).toLocaleString()}` : "—");

export default async function LeadsPage() {
  const supabase = createClient();
  const { data: leads } = await supabase
    .from("pls_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-prime-900">Leads</h1>
      <p className="mt-1 text-prime-700">Every instant quote and contact-form submission lands here.</p>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-prime-50 text-left text-prime-700">
            <tr>
              <th className="px-4 py-3">Date</th><th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th><th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Quoted (wk)</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-prime-50">
            {(leads || []).map((l: any) => (
              <tr key={l.id} className="hover:bg-prime-50/50">
                <td className="px-4 py-3 text-prime-600">{new Date(l.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-semibold text-prime-800">{l.name || "—"}</td>
                <td className="px-4 py-3 text-prime-700">{l.phone || l.email || "—"}</td>
                <td className="px-4 py-3 text-prime-700">{l.address || "—"}</td>
                <td className="px-4 py-3 text-prime-700">{money(l.quoted_weekly)}</td>
                <td className="px-4 py-3 text-prime-600">{(l.source || "").replace("_", " ")}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-prime-100 px-2 py-0.5 text-xs font-semibold text-prime-700">{l.status}</span></td>
                <td className="px-4 py-3">{l.status !== "won" && <ConvertLead lead={l} />}</td>
              </tr>
            ))}
            {!leads?.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-prime-500">No leads yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
