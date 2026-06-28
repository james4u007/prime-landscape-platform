import { NextRequest, NextResponse } from "next/server";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { customerId, email, name } = await req.json();

  if (!stripeConfigured) {
    return NextResponse.json({ configured: false });
  }
  try {
    const customer = await stripe.customers.create({
      email: email || undefined,
      name: name || undefined,
      metadata: { pls_customer_id: customerId || "" },
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: "off_session",
      automatic_payment_methods: { enabled: true },
    });

    if (customerId) {
      const supabase = createClient();
      await supabase.rpc("pls_set_stripe", {
        p_customer_id: customerId,
        p_stripe_customer: customer.id,
        p_status: "pending",
      });
    }

    return NextResponse.json({
      configured: true,
      clientSecret: setupIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    });
  } catch (e: any) {
    return NextResponse.json({ configured: true, error: e.message }, { status: 400 });
  }
}
