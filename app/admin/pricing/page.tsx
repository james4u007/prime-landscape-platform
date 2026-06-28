import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PRICING } from "@/lib/pricing";
import PricingEditor from "@/components/PricingEditor";
import type { PricingConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const supabase = createClient();
  const { data } = await supabase.from("pls_pricing_config").select("config").eq("id", 1).maybeSingle();
  const cfg = (data?.config as PricingConfig) || DEFAULT_PRICING;
  return <PricingEditor initial={cfg} />;
}
