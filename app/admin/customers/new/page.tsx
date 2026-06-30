"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewCustomerPage() {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", customer_type: "residential", email: "", phone: "", billing_address: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const { data, error } = await supabase.from("pls_customers").insert({ ...form, status: "active" }).select("id").single();
    if (error || !data) { setError(error?.message || "Could not create customer."); setBusy(false); return; }
    router.push(`/admin/customers/${data.id}`);
  }

  return (
    <div className="max-w-xl">
      <Link href="/admin/customers" className="text-sm text-prime-600 hover:underline">← Customers</Link>
      <h1 className="mt-2 text-2xl font-extrabold text-prime-900">New customer</h1>
      <p className="mt-1 text-prime-700">Create the account, then add their property and plan.</p>

      <form onSubmit={create} className="card mt-6 space-y-4 p-6">
        <div><label className="label">Name</label><input required className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div>
          <label className="label">Type</label>
          <select className="input mt-1" value={form.customer_type} onChange={(e) => setForm({ ...form, customer_type: e.target.value })}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Email</label><input type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div><label className="label">Billing address</label><input className="input mt-1" value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} /></div>
        <div><label className="label">Notes</label><textarea className="input mt-1" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        {error && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Create customer"}</button>
      </form>
    </div>
  );
}
