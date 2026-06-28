"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Lead = {
  id: string; name: string | null; email: string | null; phone: string | null;
  address: string | null; account_num: string | null; lot_acres: number | null; total_value: number | null;
};

export default function ConvertLead({ lead }: { lead: Lead }) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function convert() {
    setBusy(true); setMsg("");
    try {
      const { data: cust, error: e1 } = await supabase
        .from("pls_customers")
        .insert({ name: lead.name || "New Customer", email: lead.email, phone: lead.phone, customer_type: "residential", status: "active" })
        .select("id").single();
      if (e1 || !cust) throw e1 || new Error("failed");

      await supabase.from("pls_properties").insert({
        customer_id: cust.id, account_num: lead.account_num,
        address: lead.address || "—", lot_acres: lead.lot_acres, total_value: lead.total_value,
      });
      await supabase.from("pls_leads").update({ status: "won" }).eq("id", lead.id);
      router.push(`/admin/customers/${cust.id}`);
    } catch {
      setMsg("Failed");
      setBusy(false);
    }
  }

  if (msg) return <span className="text-xs text-amber-700">{msg}</span>;
  return (
    <button onClick={convert} disabled={busy}
      className="rounded-lg border border-prime-200 px-2.5 py-1 text-xs font-semibold text-prime-700 hover:bg-prime-50 disabled:opacity-40">
      {busy ? "Converting…" : "Convert"}
    </button>
  );
}
