"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PricingConfig } from "@/lib/types";

export default function PricingEditor({ initial }: { initial: PricingConfig }) {
  const supabase = createClient();
  const [cfg, setCfg] = useState<PricingConfig>(structuredClone(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function setTierPrice(i: number, v: number) {
    const c = structuredClone(cfg);
    c.mowing.tiers[i].price = v;
    setCfg(c); setSaved(false);
  }
  function setMult(key: string, v: number) {
    const c = structuredClone(cfg);
    c.mowing.frequency_multipliers[key] = v;
    setCfg(c); setSaved(false);
  }
  function setServicePrice(key: string, v: number) {
    const c = structuredClone(cfg);
    c.services[key].base = v;
    setCfg(c); setSaved(false);
  }

  async function save() {
    setSaving(true);
    await supabase.from("pls_pricing_config").update({ config: cfg, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false); setSaved(true);
  }

  const tierLabel = (i: number) => {
    const lo = i === 0 ? 0 : cfg.mowing.tiers[i - 1].max_acres;
    return `${lo.toFixed(2)} – ${cfg.mowing.tiers[i].max_acres.toFixed(2)} acres`;
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-prime-900">Pricing</h1>
          <p className="mt-1 text-prime-700">Change a number, hit Save. Quotes update instantly across the site.</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}</button>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-bold text-prime-900">Mowing price by lot size</h2>
        <p className="text-sm text-prime-600">Base price per visit for a weekly customer.</p>
        <div className="mt-4 space-y-2">
          {cfg.mowing.tiers.map((t, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="text-sm text-prime-800">{tierLabel(i)}</span>
              <div className="flex items-center gap-1">
                <span className="text-prime-500">$</span>
                <input type="number" className="input !w-24 !py-2" value={t.price}
                  onChange={(e) => setTierPrice(i, Number(e.target.value))} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-5 p-6">
        <h2 className="font-bold text-prime-900">Frequency adjustment</h2>
        <p className="text-sm text-prime-600">Multiplier on the per-visit price. 1.00 = same as weekly. Higher = pricier per cut (taller grass).</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {(["weekly", "biweekly", "monthly"] as const).map((f) => (
            <div key={f}>
              <label className="label capitalize">{f === "biweekly" ? "bi-weekly" : f}</label>
              <input type="number" step="0.05" className="input mt-1 !py-2" value={cfg.mowing.frequency_multipliers[f] ?? 1}
                onChange={(e) => setMult(f, Number(e.target.value))} />
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-5 p-6">
        <h2 className="font-bold text-prime-900">Add-on service prices</h2>
        <p className="text-sm text-prime-600">Starting prices shown on quotes. Set to 0 to show &ldquo;free estimate.&rdquo;</p>
        <div className="mt-4 space-y-2">
          {Object.entries(cfg.services).filter(([, s]) => !s.bid).map(([key, s]) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-prime-800">{s.label}</span>
              <div className="flex items-center gap-1">
                <span className="text-prime-500">$</span>
                <input type="number" className="input !w-24 !py-2" value={s.base}
                  onChange={(e) => setServicePrice(key, Number(e.target.value))} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}</button>
      </div>
    </div>
  );
}
