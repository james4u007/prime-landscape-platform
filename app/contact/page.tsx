"use client";

import { useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", interest: "Lawn Maintenance", message: "" });
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("pls_leads").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      requested_services: { interest: form.interest, message: form.message },
      source: "contact_form",
    });
    setDone(true);
  }

  return (
    <>
      <SiteNav />
      <section className="bg-prime-950 py-16 text-white">
        <div className="container-x">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Contact us</h1>
          <p className="mt-3 max-w-xl text-prime-100">Tell us about your property. We respond within one business day.</p>
        </div>
      </section>
      <section className="container-x grid gap-10 py-14 md:grid-cols-2">
        <div className="card p-7">
          {done ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="text-4xl">🌿</div>
                <h2 className="mt-3 text-xl font-bold text-prime-900">Message received</h2>
                <p className="mt-2 text-prime-700">Thanks — we&apos;ll be in touch shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div><label className="label">Name</label><input required className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Email</label><input required type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><label className="label">Phone</label><input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div><label className="label">Property address</label><input className="input mt-1" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div>
                <label className="label">I&apos;m interested in</label>
                <select className="input mt-1" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}>
                  <option>Lawn Maintenance</option>
                  <option>Irrigation / Sprinklers</option>
                  <option>Landscape Design & Installation</option>
                  <option>Water Features</option>
                  <option>Pools</option>
                  <option>Commercial Grounds</option>
                  <option>Other</option>
                </select>
              </div>
              <div><label className="label">Message</label><textarea className="input mt-1" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
              <button className="btn-primary w-full">Send Message</button>
            </form>
          )}
        </div>
        <div className="space-y-6">
          <div className="card p-7">
            <h3 className="font-bold text-prime-900">Prime Landscape Services</h3>
            <p className="mt-2 text-sm text-prime-700">Centrally located in Arlington, TX on a 1.6-acre facility. Serving the DFW Metroplex since 1990.</p>
          </div>
          <div className="card p-7">
            <h3 className="font-bold text-prime-900">Prefer instant pricing?</h3>
            <p className="mt-2 text-sm text-prime-700">Most lawn maintenance can be priced online in seconds.</p>
            <a href="/quote" className="btn-primary mt-4">Get My Instant Price</a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
