import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = createClient();
  const { data: customers } = await supabase
    .from("pls_customers")
    .select("id, name, customer_type, status, phone, email, pls_properties(count)")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-prime-900">Customers</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-prime-600">{customers?.length || 0} total</span>
          <Link href="/admin/customers/new" className="btn-primary !py-2">+ New customer</Link>
        </div>
      </div>

      <div className="card mt-5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-prime-50 text-left text-prime-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Properties</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-prime-50">
            {(customers || []).map((c: any) => (
              <tr key={c.id} className="hover:bg-prime-50/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${c.id}`} className="font-semibold text-prime-700 hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-prime-700">{c.customer_type}</td>
                <td className="px-4 py-3 text-prime-700">{c.pls_properties?.[0]?.count ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.status === "active" ? "bg-prime-100 text-prime-700" : "bg-amber-100 text-amber-700"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-prime-600">{c.phone || c.email || "—"}</td>
              </tr>
            ))}
            {!customers?.length && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-prime-500">No customers yet. Convert a lead or add one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
