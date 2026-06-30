"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/client";
import { computeQuote, DEFAULT_PRICING } from "@/lib/pricing";
import { aerialUrl } from "@/lib/google";
import type { Parcel, PricingConfig, QuoteResult } from "@/lib/types";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function QuotePage() {
  const supabase = createClient();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Parcel[]>([]);
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [showAlternates, setShowAlternates] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [freq, setFreq] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [leadOpen, setLeadOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [done, setDone] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  function build(p: Parcel, cfg: PricingConfig) {
    const addr = `${p.situs_address}, ${p.situs_city || "Fort Worth"}, TX ${p.situs_zip || ""}`;
    return computeQuote(p, cfg, { aerialUrl: aerialUrl({ address: addr, lat: p.latitude, lng: p.longitude }), streetUrl: "" });
  }

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setNotFound(false); setQuote(null); setShowAlternates(false); setDone("");
    try {
      const [{ data: rows, error }, { data: cfgRow }] = await Promise.all([
        supabase.rpc("pls_search_parcels", { q, max_results: 8 }),
        supabase.from("pls_pricing_config").select("config").eq("id", 1).maybeSingle(),
      ]);
      if (error) throw error;
      const cfg = (cfgRow?.config as PricingConfig) || DEFAULT_PRICING;
      setConfig(cfg);
      const list = (rows || []) as Parcel[];
      if (!list.length) { setNotFound(true); setMatches([]); return; }
      setMatches(list);
      setQuote(build(list[0], cfg));
    } catch {
      setNotFound(true);
    } finally { setLoading(false); }
  }

  function pick(p: Parcel) { setQuote(build(p, config)); setShowAlternates(false); }

  function startBooking() {
    if (!quote) return;
    sessionStorage.setItem("pls_booking", JSON.stringify({
      parcel: { ...quote.parcel, aerialUrl: quote.photo.aerialUrl },
      acres: quote.acres, turfSqftEst: quote.turfSqftEst, freq, mowing: quote.mowing,
    }));
    router.push("/book");
  }

  async function submitLead(e: React.FormEvent, source: string) {
    e.preventDefault();
    const p = quote?.parcel;
    await supabase.from("pls_leads").insert({
      name: form.name, email: form.email || null, phone: form.phone,
      address: p ? `${p.situs_address}, ${p.situs_city || ""} ${p.situs_zip || ""}`.trim() : q,
      account_num: p?.account_num || null,
      lot_acres: quote?.acres || null, total_value: p?.total_value || null,
      quoted_weekly: quote?.mowing.weekly.estMonthly || null,
      requested_services: { frequency: freq, note: source },
      source,
    });
    setLeadOpen(false); setCallbackOpen(false);
    setDone(source === "callback" ? "Thanks! We'll call you shortly to confirm details and get you scheduled." : "Thanks! Our team will reach out shortly to get you started. 🌿");
  }

  const plans = quote
    ? ([
        ["weekly", "Weekly", "Most popular", quote.mowing.weekly],
        ["biweekly", "Bi-Weekly", "", quote.mowing.biweekly],
        ["monthly", "Monthly", "", quote.mowing.monthly],
      ] as const)
    : [];

  return (
    <>
      <SiteNav />
      <section className="bg-prime-950 py-14 text-white">
        <div className="container-x">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Your instant lawn care price</h1>
          <p className="mt-2 max-w-xl text-prime-100">Enter your Tarrant County address — we&apos;ll pull your exact lot size and show what you&apos;d pay per month.</p>
          <form onSubmit={search} className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input className="input flex-1 text-prime-950" placeholder="e.g. 3934 Bryce Ave, Fort Worth" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn-primary" disabled={loading}>{loading ? "Searching…" : "Get My Price"}</button>
          </form>
        </div>
      </section>

      <section className="container-x py-12">
        {done && (
          <div className="card mx-auto max-w-xl p-8 text-center">
            <div className="text-4xl">🌿</div>
            <p className="mt-3 text-lg font-semibold text-prime-900">{done}</p>
          </div>
        )}

        {!done && quote && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="card overflow-hidden">
                <img src={quote.photo.aerialUrl} alt="Aerial view" className="h-64 w-full object-cover" />
                <div className="p-6">
                  <h2 className="text-xl font-bold text-prime-900">{quote.parcel.situs_address}</h2>
                  <p className="text-prime-700">{quote.parcel.situs_city}, TX {quote.parcel.situs_zip}</p>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <Stat label="Lot size" value={`${quote.acres.toFixed(2)} ac`} />
                    <Stat label="Turf area" value={`${quote.turfSqftEst.toLocaleString()} sf`} />
                    <Stat label="Records" value="Tarrant CAD" />
                  </div>
                </div>
              </div>
              {!showAlternates ? (
                <button onClick={() => setShowAlternates(true)} className="mt-3 text-sm font-semibold text-prime-600 hover:underline">
                  Not your property?
                </button>
              ) : (
                <div className="mt-3 card p-4">
                  <p className="label mb-2">Pick the right one:</p>
                  <div className="flex flex-col gap-2">
                    {matches.filter((m) => m.account_num !== quote.parcel.account_num).map((m) => (
                      <button key={m.account_num} onClick={() => pick(m)} className="rounded-lg border border-prime-200 px-3 py-2 text-left text-sm text-prime-800 hover:bg-prime-50">
                        {m.situs_address}, {m.situs_city} {m.situs_zip}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setCallbackOpen(true); }} className="mt-3 text-sm font-semibold text-prime-600 hover:underline">
                    Still not listed — have us call you
                  </button>
                </div>
              )}
            </div>

            <div className="card p-6">
              {quote.isCommercialBid ? (
                <div>
                  <h2 className="text-xl font-bold text-prime-900">This one needs a custom bid</h2>
                  <p className="mt-2 text-prime-700">Your property is large or commercially classified, so we&apos;ll tailor a quote — usually within a day.</p>
                  <button className="btn-primary mt-5" onClick={() => setLeadOpen(true)}>Request My Custom Bid</button>
                </div>
              ) : (
                <>
                  <p className="label">Choose your plan</p>
                  <div className="mt-3 space-y-3">
                    {plans.map(([key, label, badge, fp]) => {
                      const sel = key === freq;
                      return (
                        <button key={key} onClick={() => setFreq(key)}
                          className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${sel ? "border-prime-600 ring-2 ring-prime-200" : "border-prime-100 hover:border-prime-300"}`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-prime-900">{label}</span>
                              {badge && <span className="rounded-full bg-prime-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-prime-700">{badge}</span>}
                            </div>
                            <div className="text-xs text-prime-600">{key === "weekly" ? "Every week" : key === "biweekly" ? "Every 2 weeks" : "Once a month"} · {money(fp.pricePerVisit)} per cut</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-extrabold text-prime-700">{money(fp.estMonthly)}</div>
                            <div className="text-[11px] text-prime-500">per month</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs text-prime-500">Peak-season estimate. Winter months bill less as growth slows.</p>
                  <button className="btn-primary mt-5 w-full" onClick={startBooking}>Start Service →</button>
                </>
              )}
            </div>
          </div>
        )}

        {!done && notFound && (
          <div className="card mx-auto max-w-xl p-8 text-center">
            <div className="text-4xl">📍</div>
            <h2 className="mt-3 text-xl font-bold text-prime-900">We couldn&apos;t pull that address automatically</h2>
            <p className="mt-2 text-prime-700">No problem — leave your number and we&apos;ll give you a quick call with a price.</p>
            <button className="btn-primary mt-5" onClick={() => setCallbackOpen(true)}>Have Us Call You</button>
          </div>
        )}

        {!done && !quote && !notFound && (
          <div className="card grid place-items-center p-16 text-center text-prime-500">
            <p>Try an address like <b>3934 Bryce Ave, Fort Worth</b> to see it in action.</p>
          </div>
        )}
      </section>

      {(leadOpen || callbackOpen) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => { setLeadOpen(false); setCallbackOpen(false); }}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-prime-900">{callbackOpen ? "Have us call you" : "Start service"}</h3>
            <p className="mt-1 text-sm text-prime-700">{callbackOpen ? "We'll call with a price and answer any questions." : quote ? quote.parcel.situs_address : ""}</p>
            <form onSubmit={(e) => submitLead(e, callbackOpen ? "callback" : "instant_quote")} className="mt-4 space-y-3">
              <input required className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {!callbackOpen && <input type="email" className="input" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}
              <button className="btn-primary w-full">{callbackOpen ? "Request My Call" : "Request Service"}</button>
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
