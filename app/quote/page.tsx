"use client";

import { useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/client";
import { computeQuote, DEFAULT_PRICING } from "@/lib/pricing";
import { aerialUrl, streetViewUrl } from "@/lib/google";
import type { Parcel, PricingConfig, QuoteResult } from "@/lib/types";

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function QuotePage() {
  const supabase = createClient();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Parcel[]>([]);
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [error, setError] = useState("");
  const [freq, setFreq] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", phone: "" });

  function buildQuote(p: Parcel, cfg: PricingConfig) {
    const addr = `${p.situs_address}, ${p.situs_city || "Fort Worth"}, TX ${p.situs_zip || ""}`;
    const photo = {
      aerialUrl: aerialUrl({ address: addr, lat: p.latitude, lng: p.longitude }),
      streetUrl: streetViewUrl({ address: addr, lat: p.latitude, lng: p.longitude }),
    };
    return computeQuote(p, cfg, photo);
  }

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setQuote(null);
    setLeadDone(false);
    try {
      const [{ data: rows, error: rpcErr }, { data: cfgRow }] = await Promise.all([
        supabase.rpc("pls_search_parcels", { q, max_results: 8 }),
        supabase.from("pls_pricing_config").select("config").eq("id", 1).maybeSingle(),
      ]);
      if (rpcErr) throw rpcErr;
      const cfg = (cfgRow?.config as PricingConfig) || DEFAULT_PRICING;
      setConfig(cfg);
      const list = (rows || []) as Parcel[];
      if (!list.length) {
        setError("We couldn't find that address in Tarrant County records. Check the spelling or try the contact form for a manual quote.");
        setMatches([]);
        return;
      }
      setMatches(list);
      setQuote(buildQuote(list[0], cfg));
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function pick(p: Parcel) {
    setQuote(buildQuote(p, config));
    setLeadDone(false);
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!quote) return;
    const p = quote.parcel;
    await supabase.from("pls_leads").insert({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: `${p.situs_address}, ${p.situs_city || ""} ${p.situs_zip || ""}`.trim(),
      account_num: p.account_num,
      lot_acres: quote.acres,
      total_value: p.total_value,
      quoted_weekly: quote.mowing.weekly.pricePerVisit,
      quoted_biweekly: quote.mowing.biweekly.pricePerVisit,
      quoted_monthly: quote.mowing.monthly.pricePerVisit,
      requested_services: { frequency: freq },
      source: "instant_quote",
    });
    setLeadDone(true);
    setLeadOpen(false);
  }

  const active = quote ? quote.mowing[freq] : null;

  return (
    <>
      <SiteNav />
      <section className="bg-prime-950 py-14 text-white">
        <div className="container-x">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Your instant lawn care price</h1>
          <p className="mt-2 max-w-xl text-prime-100">
            Enter your Tarrant County address. We&apos;ll pull your exact lot size and show real pricing.
          </p>
          <form onSubmit={search} className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              className="input flex-1 text-prime-950"
              placeholder="e.g. 3934 Bryce Ave, Fort Worth"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn-primary" disabled={loading}>
              {loading ? "Searching…" : "Get My Price"}
            </button>
          </form>
        </div>
      </section>

      <section className="container-x py-12">
        {error && (
          <div className="card mb-6 border-amber-200 bg-amber-50 p-4 text-amber-800">{error}</div>
        )}

        {matches.length > 1 && quote && (
          <div className="mb-6">
            <p className="label mb-2">Is this your property? Pick the exact match:</p>
            <div className="flex flex-wrap gap-2">
              {matches.map((m) => {
                const sel = m.account_num === quote.parcel.account_num;
                return (
                  <button
                    key={m.account_num}
                    onClick={() => pick(m)}
                    className={`rounded-full border px-4 py-2 text-sm ${sel ? "border-prime-600 bg-prime-600 text-white" : "border-prime-200 bg-white text-prime-800 hover:bg-prime-50"}`}
                  >
                    {m.situs_address}, {m.situs_city}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {quote && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card overflow-hidden">
              <img
                src={quote.photo.aerialUrl}
                alt="Aerial view of property"
                className="h-64 w-full object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-bold text-prime-900">{quote.parcel.situs_address}</h2>
                <p className="text-prime-700">
                  {quote.parcel.situs_city}, TX {quote.parcel.situs_zip}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Lot size" value={`${quote.acres.toFixed(2)} acres`} />
                  <Stat label="Est. turf area" value={`${quote.turfSqftEst.toLocaleString()} sq ft`} />
                  <Stat label="Year built" value={quote.parcel.year_built ? String(quote.parcel.year_built) : "—"} />
                  <Stat label="County records" value="Tarrant CAD" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              {quote.isCommercialBid ? (
                <div>
                  <h2 className="text-xl font-bold text-prime-900">This one needs a custom bid</h2>
                  <p className="mt-2 text-prime-700">
                    Your property is large or commercially classified, so we&apos;ll put together a
                    tailored quote. It takes about a day.
                  </p>
                  <button className="btn-primary mt-5" onClick={() => setLeadOpen(true)}>
                    Request My Custom Bid
                  </button>
                </div>
              ) : (
                <>
                  <p className="label">Mowing &amp; maintenance</p>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {(["weekly", "biweekly", "monthly"] as const).map((f) => {
                      const fp = quote.mowing[f];
                      const sel = f === freq;
                      const label = f === "biweekly" ? "Bi-Weekly" : f[0].toUpperCase() + f.slice(1);
                      return (
                        <button
                          key={f}
                          onClick={() => setFreq(f)}
                          className={`rounded-2xl border p-4 text-center transition ${sel ? "border-prime-600 ring-2 ring-prime-200" : "border-prime-100 hover:border-prime-300"}`}
                        >
                          <div className="text-xs text-prime-600">{label}</div>
                          <div className="mt-1 text-2xl font-extrabold text-prime-700">{money(fp.pricePerVisit)}</div>
                          <div className="text-[11px] text-prime-500">per visit</div>
                        </button>
                      );
                    })}
                  </div>
                  {active && (
                    <div className="mt-4 rounded-xl bg-prime-50 p-4 text-sm text-prime-800">
                      Estimated <b>{money(active.estMonthly)}/month</b> at {active.visitsPerMonth} visits/mo during peak season.
                    </div>
                  )}

                  <p className="label mt-6">Add-on services</p>
                  <ul className="mt-3 divide-y divide-prime-50 text-sm">
                    {quote.addOns.map((a) => (
                      <li key={a.key} className="flex items-center justify-between py-2">
                        <span className="text-prime-800">{a.label}</span>
                        <span className="font-semibold text-prime-700">
                          {a.bid ? "Free estimate" : `from ${money(a.price!)}`}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button className="btn-primary mt-6 w-full" onClick={() => setLeadOpen(true)}>
                    Start Service at This Price
                  </button>
                </>
              )}
              {leadDone && (
                <p className="mt-4 rounded-xl bg-prime-100 p-3 text-center text-sm font-semibold text-prime-800">
                  Thanks! Our team will reach out shortly to get you scheduled. 🌿
                </p>
              )}
            </div>
          </div>
        )}

        {!quote && !error && (
          <div className="card grid place-items-center p-16 text-center text-prime-500">
            <p>Try an address like <b>3934 Bryce Ave, Fort Worth</b> to see it in action.</p>
          </div>
        )}
      </section>

      {leadOpen && quote && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setLeadOpen(false)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-prime-900">Get started</h3>
            <p className="mt-1 text-sm text-prime-700">
              {quote.parcel.situs_address} — {freq === "biweekly" ? "Bi-Weekly" : freq[0].toUpperCase() + freq.slice(1)}
              {!quote.isCommercialBid && active ? ` at ${money(active.pricePerVisit)}/visit` : ""}
            </p>
            <form onSubmit={submitLead} className="mt-4 space-y-3">
              <input required className="input" placeholder="Full name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
              <input required type="email" className="input" placeholder="Email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
              <input required className="input" placeholder="Phone" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
              <button className="btn-primary w-full">Request Service</button>
              <p className="text-center text-xs text-prime-500">No payment now. We&apos;ll confirm scheduling first.</p>
            </form>
          </div>
        </div>
      )}

      <SiteFooter />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-prime-100 p-3">
      <div className="text-xs text-prime-500">{label}</div>
      <div className="font-semibold text-prime-900">{value}</div>
    </div>
  );
}
