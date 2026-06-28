import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: invoices } = await supabase
    .from("pls_invoices")
    .select("created_at, period_start, period_end, amount, status, pls_customers(name)")
    .order("created_at", { ascending: false });

  const rows = [["Customer", "InvoiceDate", "DueDate", "Item", "Amount", "Memo", "Status"]];
  for (const i of invoices || []) {
    const name = (i as any).pls_customers?.name || "Customer";
    rows.push([
      name,
      i.period_start || "",
      i.period_end || "",
      "Landscape Maintenance",
      Number(i.amount).toFixed(2),
      `Service ${i.period_start} to ${i.period_end}`,
      i.status,
    ]);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="prime-invoices-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
