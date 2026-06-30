"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PRICING, round5 } from "@/lib/pricing";

const SERVICES = ["mowing", "fertilization", "irrigation", "aeration", "mulch", "cleanup", "shrub_trim"];
const FREQS = ["weekly", "biweekly", "monthly", "seasonal", "one_time"];

function suggestMow(acres: number, freq: string) {
  const t = DEFAULT_PRICING.mowing.tiers.find((x) => acres <= x.max_acres);
  const base = t ? t.price : DEFAULT_PRICING.mowing.tiers[DEFAULT_PRICING.mowing.tiers.length - 1].price;
  return round5(base * (DEFAULT_PRICING.mowing.frequency_multipliers[freq] ?? 1));
}

export default function AddPlan({ propertyId, lotAcres }: { propertyId: string; lotAcres: number | null }) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [service, setService] = useState("mowing");
  const [freq, setFreq] = useState("weekly");
  const [price, setPrice] = useState<number>(suggestMow(lotAcres || 0.2, "weekly"));
  const [busy, setBusy] = useState(false);

  function onServiceFreq(s: string, f: string) {
    setService(s); setFreq(f);
    if (s === "mowing") setPrice(suggestMow(lotAcres || 0.2, f));
  }

  async function add() {
    setBusy(true);
    await supabase.from("pls_service_plans").insert({
      property_id: propertyId, service_type: service, frequency: freq, price_per_visit: price, active: true,
    });
    setOpen(false); setBusy(false);
    router.refresh();
  }

  if (!open) return <button onClick={() => setOpen(true)} className="mt-2 text-xs font-semibold text-prime-600 hover:underline">+ Add a plan</button>;

  return (
    <div className="mt-3 rounded-xl border border-prime-100 p-3">
      <div className="grid grid-cols-3 gap-2">
        <select className="input !py-2 text-sm" value={service} onChange={(e) => onServiceFreq(e.target.value, freq)}>
          {SERVICES.map((s) => <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>)}
        </select>
        <select className="input !py-2 text-sm" value={freq} onChange={(e) => onServiceFreq(service, e.target.value)}>
          {FREQS.map((f) => <option key={f} value={f}>{f.replace("_", " ")}</option>)}
        </select>
        <div className="flex items-center gap-1">
          <span className="text-prime-500">$</span>
          <input type="number" className="input !py-2 text-sm" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={add} disabled={busy} className="btn-primary !py-1.5 text-xs">{busy ? "Adding…" : "Save plan"}</button>
        <button onClick={() => setOpen(false)} className="text-xs text-prime-500 hover:underline">Cancel</button>
      </div>
    </div>
  );
}
