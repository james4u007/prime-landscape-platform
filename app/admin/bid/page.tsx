"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeQuote, DEFAULT_PRICING } from "@/lib/pricing";
import PropertyPhotos from "@/components/PropertyPhotos";
import type { Parcel, PricingConfig, QuoteResult } from "@/lib/types";

const money = (n: number | null | undefined) => (n != null ? `$${Number(n).toLocaleString("en-US")}` : "—");

export default function BidPage() {
  const supabase = createClient();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Parcel[]>([]);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [cfg, setCfg] = useState<PricingConfig>(DEFAULT_PRICING);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setError(""); setSaved(false); setQuote(null);
    try {
      const [{ data: rows, error: e1 }, { data: cfgRow }] = await Promise.all([
        supabase.rpc("pls_search_parcels", { q, max_results: 10 }),
        supabase.from("pls_pricing_config").select("config").eq("id", 1).maybeSingle(),
      ]);
      if (e1) throw e1;
      const config = (cfgRow?.config as PricingConfig) || DEFAULT_PRICING;
      setCfg(config);
      const list = (rows || []) as Parcel[];
      if (!list.length) { setError("No match in Tarrant County records."); setMatches([]); return; }
      setMatches(list);
      setQuote(computeQuote(list[0], config, { aerialUrl: "", streetUrl: "" }));
    } catch (err: any) {
      setError(err.message || "Search failed.");
    } finally { setLoading(false); }
  }

  function pick(p: Parcel) {
    setQuote(computeQuote(p, cfg, { aerialUrl: "", streetUrl: "" }));
    setSaved(false);
  }

  async function saveBid() {
    if (!quote) return;
    const p = quote.parcel;
    await supabase.from("pls_bids").insert({
      address: `${p.situs_address}, ${p.situs_city || ""} ${p.situs_zip || ""}`.trim(),
      account_num: p.account_num,
      lot_acres: quote.acres,
      lot_sqft: p.land_sqft,
      total_value: p.total_value,
      est_monthly: quote.mowing.weekly.estMonthly,
      services: { weekly: quote.mowing.weekly, biweekly: quote.mowing.biweekly, monthly: quote.mowing.monthly, addOns: quote.addOns },
      status: "open",
    });
    setSaved(true);
  }

  const p = quote?.parcel;
  const addr = p ? `${p.situs_address}, ${p.situs_city || "Fort Worth"}, TX ${p.situs_zip || ""}` : "";

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-prime-900">Bid a Job</h1>
      <p className="mt-1 text-prime-700">Enter any Tarrant County address to pull market value, lot size, photos, and a price.</p>

      <form onSubmit={search} className="mt-5 flex max-w-2xl gap-3">
        <input className="input flex-1" placeholder="e.g. 1201 Ballinger St, Fort Worth" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary" disabled={loading}>{loading ? "Searching…" : "Look Up"}</button>
      </form>

      {error && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-amber-800">{error}</p>}

      {matches.length > 1 && quote && (
        <div className="mt-5 flex flex-wrap gap-2">
          {matches.map((m) => {
            const sel = m.account_num === quote.parcel.account_num;
            return (
              <button key={m.account_num} onClick={() => pick(m)}
                className={`rounded-full border px-3 py-1.5 text-sm ${sel ? "border-prime-600 bg-prime-600 text-white" : "border-prime-200 bg-white text-prime-800 hover:bg-prime-50"}`}>
                {m.situs_address}
              </button>
            );
          })}
        </div>
      )}

      {quote && p && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card overflow-hidden">
            <PropertyPhotos address={addr} lat={p.latitude} lng={p.longitude} />
            <div className="p-5">
              <h2 className="font-bold text-prime-900">{p.situs_address}</h2>
              <p className="text-sm text-prime-700">{p.situs_city}, TX {p.situs_zip}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Field label="Total market value" value={money(p.total_value)} big />
                <Field label="Lot size" value={`${quote.acres.toFixed(2)} acres`} big />
                <Field label="Land value" value={money(p.appraised_value)} />
                <Field label="Living area" value={p.living_area ? `${p.living_area.toLocaleString()} sf` : "—"} />
                <Field label="Year built" value={p.year_built ? String(p.year_built) : "—"} />
                <Field label="Owner" value={p.owner_name || "—"} />
                <Field label="Class" value={`${p.property_class || "—"}`} />
                <Field label="Est. turf" value={`${quote.turfSqftEst.toLocaleString()} sf`} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <p className="label">Suggested pricing</p>
            {quote.isCommercialBid && (
              <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">Large/commercial — verify on-site before committing.</p>
            )}
            <div className="mt-3 grid grid-cols-3 gap-3">
              {(["weekly","biweekly","monthly"] as const).map((f) => (
                <div key={f} className="rounded-2xl border border-prime-100 p-4 text-center">
                  <div className="text-xs capitalize text-prime-600">{f === "biweekly" ? "bi-weekly" : f}</div>
                  <div className="mt-1 text-2xl font-extrabold text-prime-700">{money(quote.mowing[f].estMonthly)}</div>
                  <div className="text-[11px] text-prime-500">/mo · {money(quote.mowing[f].pricePerVisit)}/cut</div>
                </div>
              ))}
            </div>
            <p className="label mt-5">Add-ons</p>
            <ul className="mt-2 divide-y divide-prime-50 text-sm">
              {quote.addOns.map((a) => (
                <li key={a.key} className="flex justify-between py-1.5">
                  <span className="text-prime-800">{a.label}</span>
                  <span className="font-semibold text-prime-700">{a.bid ? "bid" : `from ${money(a.price!)}`}</span>
                </li>
              ))}
            </ul>
            <button onClick={saveBid} className="btn-primary mt-5 w-full">{saved ? "Saved ✓" : "Save Bid"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="rounded-lg border border-prime-100 p-2">
      <div className="text-[11px] text-prime-500">{label}</div>
      <div className={`font-semibold text-prime-900 ${big ? "text-lg" : ""}`}>{value}</div>
    </div>
  );
}
