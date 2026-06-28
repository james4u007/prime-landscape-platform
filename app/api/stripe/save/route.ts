import { NextRequest, NextResponse } from "next/server";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!stripeConfigured) return NextResponse.json({ ok: false, configured: false });
  const { customerId, setupIntentId } = await req.json();
  try {
    const si = await stripe.setupIntents.retrieve(setupIntentId, { expand: ["payment_method"] });
    const pm = si.payment_method as any;
    const card = pm?.card;

    if (pm?.id && si.customer) {
      await stripe.customers.update(si.customer as string, {
        invoice_settings: { default_payment_method: pm.id },
      });
    }

    if (customerId) {
      const supabase = createClient();
      await supabase.rpc("pls_set_stripe", {
        p_customer_id: customerId,
        p_stripe_customer: (si.customer as string) || null,
        p_pm: pm?.id || null,
        p_brand: card?.brand || pm?.type || "card",
        p_last4: card?.last4 || null,
        p_status: "active",
      });
    }
    return NextResponse.json({ ok: true, brand: card?.brand || "card", last4: card?.last4 || null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
