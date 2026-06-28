import { NextRequest, NextResponse } from "next/server";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Admin-only: charge a customer's saved card for an invoice (recurring billing).
export async function POST(req: NextRequest) {
  if (!stripeConfigured) return NextResponse.json({ ok: false, configured: false }, { status: 400 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { invoiceId } = await req.json();
  const { data: inv } = await supabase
    .from("pls_invoices")
    .select("id, amount, status, customer_id, pls_customers(stripe_customer_id, default_payment_method)")
    .eq("id", invoiceId)
    .maybeSingle();

  if (!inv) return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
  const cust = (inv as any).pls_customers;
  if (!cust?.stripe_customer_id || !cust?.default_payment_method) {
    return NextResponse.json({ ok: false, error: "No card on file" }, { status: 400 });
  }

  try {
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(Number(inv.amount) * 100),
      currency: "usd",
      customer: cust.stripe_customer_id,
      payment_method: cust.default_payment_method,
      off_session: true,
      confirm: true,
      description: `Prime Landscape invoice ${inv.id}`,
    });
    if (pi.status === "succeeded") {
      await supabase.from("pls_invoices").update({ status: "paid" }).eq("id", inv.id);
    }
    return NextResponse.json({ ok: pi.status === "succeeded", status: pi.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
