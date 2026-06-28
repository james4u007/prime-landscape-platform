"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createClient } from "@/lib/supabase/client";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const freqLabel = (f: string) => (f === "biweekly" ? "Bi-Weekly" : f.charAt(0).toUpperCase() + f.slice(1));

type Booking = {
  parcel: any;
  acres: number;
  turfSqftEst: number;
  freq: "weekly" | "biweekly" | "monthly";
  mowing: any;
};

export default function BookingFlow() {
  const supabase = createClient();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [step, setStep] = useState<"contact" | "payment" | "done" | "pending">("contact");
  const [form, setForm] = useState({ name: "", email: "", phone: "", start: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [savedCard, setSavedCard] = useState<{ brand?: string; last4?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pls_booking");
      if (raw) setBooking(JSON.parse(raw));
    } catch {}
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setForm((f) => ({ ...f, start: d.toISOString().slice(0, 10) }));
  }, []);

  const plan = useMemo(() => (booking ? booking.mowing[booking.freq] : null), [booking]);

  if (!booking) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-bold text-prime-900">Let&apos;s start with your address</h1>
        <p className="mt-2 text-prime-700">Get your instant price first, then book in under a minute.</p>
        <Link href="/quote" className="btn-primary mt-5">Get My Price</Link>
      </div>
    );
  }

  const p = booking.parcel;
  const addr = `${p.situs_address}, ${p.situs_city || "Fort Worth"}, TX ${p.situs_zip || ""}`;

  async function startPayment(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data, error: rpcErr } = await supabase.rpc("pls_create_booking", {
        p: {
          name: form.name, email: form.email, phone: form.phone,
          account_num: p.account_num, address: p.situs_address, city: p.situs_city, zip: p.situs_zip,
          lat: p.latitude ? String(p.latitude) : "", lng: p.longitude ? String(p.longitude) : "",
          lot_acres: String(booking!.acres), lot_sqft: p.land_sqft ? String(p.land_sqft) : "",
          turf_sqft: String(booking!.turfSqftEst), total_value: p.total_value ? String(p.total_value) : "",
          service_type: "mowing", frequency: booking!.freq, price_per_visit: String(plan!.pricePerVisit),
          start_date: form.start,
        },
      });
      if (rpcErr) throw rpcErr;
      const cId = (data as any)?.customer_id as string;
      setCustomerId(cId);

      const res = await fetch("/api/stripe/setup-intent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: cId, email: form.email, name: form.name }),
      });
      const j = await res.json();
      if (j.configured && j.clientSecret) {
        setClientSecret(j.clientSecret);
        setStripePromise(loadStripe(j.publishableKey));
        setStep("payment");
      } else {
        setStep("pending");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="card overflow-hidden">
        {p.aerialUrl && <img src={p.aerialUrl} alt="Aerial" className="h-56 w-full object-cover" />}
        <div className="p-6">
          <h2 className="text-lg font-bold text-prime-900">{p.situs_address}</h2>
          <p className="text-sm text-prime-700">{p.situs_city}, TX {p.situs_zip}</p>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-prime-50 p-4">
            <div>
              <div className="font-semibold text-prime-900">{freqLabel(booking.freq)} mowing</div>
              <div className="text-xs text-prime-600">{plan.visitsPerMonth} visits/mo · {money(plan.pricePerVisit)}/cut</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-prime-700">{money(plan.estMonthly)}</div>
              <div className="text-[11px] text-prime-500">per month</div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-prime-100 p-4">
            <div className="flex items-center gap-2 font-semibold text-prime-800">🛡️ Inspect First, Pay Later</div>
            <p className="mt-1 text-sm text-prime-700">We won&apos;t charge your card until after your first service — so you can inspect the work and be 100% happy first.</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        {step === "contact" && (
          <form onSubmit={startPayment} className="space-y-4">
            <h2 className="text-lg font-bold text-prime-900">Almost done — let&apos;s get you scheduled</h2>
            <div><label className="label">Full name</label><input required className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Email</label><input required type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Phone</label><input required className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div><label className="label">Preferred start date</label><input type="date" className="input mt-1" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
            {error && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">{error}</p>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? "Setting up…" : "Continue to secure payment"}</button>
            <p className="text-center text-xs text-prime-500">🔒 Secure checkout. No charge today.</p>
          </form>
        )}

        {step === "payment" && stripePromise && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#2c6b29" } } }}>
            <PaymentStep
              customerId={customerId}
              onDone={(card) => { setSavedCard(card); setStep("done"); }}
            />
          </Elements>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="text-4xl">🌿</div>
            <h2 className="mt-3 text-xl font-bold text-prime-900">You&apos;re all set, {form.name.split(" ")[0]}!</h2>
            <p className="mt-2 text-prime-700">
              Your {freqLabel(booking.freq).toLowerCase()} service starts around {form.start}.
              {savedCard?.last4 ? ` Card ending ${savedCard.last4} is on file — nothing charged until after your first mow.` : ""}
            </p>
            <Link href="/" className="btn-primary mt-5">Back to Home</Link>
          </div>
        )}

        {step === "pending" && (
          <div className="text-center">
            <div className="text-4xl">✅</div>
            <h2 className="mt-3 text-xl font-bold text-prime-900">Request received!</h2>
            <p className="mt-2 text-prime-700">We&apos;ve got your {freqLabel(booking.freq).toLowerCase()} plan for {p.situs_address}. Our team will call you shortly to confirm and set up billing.</p>
            <Link href="/" className="btn-primary mt-5">Back to Home</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentStep({ customerId, onDone }: { customerId: string; onDone: (card: { brand?: string; last4?: string }) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");
    const { error: confirmErr, setupIntent } = await stripe.confirmSetup({ elements, redirect: "if_required" });
    if (confirmErr) {
      setError(confirmErr.message || "Card could not be saved.");
      setBusy(false);
      return;
    }
    try {
      const res = await fetch("/api/stripe/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, setupIntentId: setupIntent?.id }),
      });
      const j = await res.json();
      onDone({ brand: j.brand, last4: j.last4 });
    } catch {
      onDone({});
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-lg font-bold text-prime-900">Add a card to lock in your spot</h2>
      <p className="text-sm text-prime-700">Apple Pay, Google Pay, or any card. You won&apos;t be charged until after your first mow.</p>
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">{error}</p>}
      <button className="btn-primary w-full" disabled={busy || !stripe}>{busy ? "Saving…" : "Confirm & Book"}</button>
      <p className="text-center text-xs text-prime-500">🔒 Encrypted by Stripe. No charge today.</p>
    </form>
  );
}
