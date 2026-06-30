"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { aerialUrl } from "@/lib/google";
import type { Parcel } from "@/lib/types";

export default function AddProperty({ customerId }: { customerId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [match, setMatch] = useState<Parcel | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const { data } = await supabase.rpc("pls_search_parcels", { q, max_results: 1 });
    const list = (data || []) as Parcel[];
    setMatch(list[0] || null);
    if (!list.length) setMsg("No match found.");
    setBusy(false);
  }

  async function add() {
    if (!match) return;
    setBusy(true);
    const lot = match.land_sqft || (match.land_acres || 0) * 43560;
    const stories = match.number_of_stories && match.number_of_stories > 0 ? match.number_of_stories : 1;
    const turf = match.living_area ? Math.max(0, Math.round(lot - match.living_area / stories)) : null;
    await supabase.from("pls_properties").insert({
      customer_id: customerId, account_num: match.account_num,
      address: match.situs_address, city: match.situs_city, zip: match.situs_zip,
      latitude: match.latitude && match.latitude !== 0 ? match.latitude : null,
      longitude: match.longitude && match.longitude !== 0 ? match.longitude : null,
      lot_acres: match.land_acres, lot_sqft: match.land_sqft, turf_sqft_est: turf, total_value: match.total_value,
    });
    setOpen(false); setMatch(null); setQ("");
    router.refresh();
    setBusy(false);
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-ghost">+ Add a property</button>;
  }

  return (
    <div className="card p-5">
      <form onSubmit={search} className="flex gap-2">
        <input className="input flex-1" placeholder="Property address in Tarrant County" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary" disabled={busy}>{busy ? "…" : "Find"}</button>
      </form>
      {msg && <p className="mt-2 text-sm text-amber-700">{msg}</p>}
      {match && (
        <div className="mt-4 flex gap-4">
          <img src={aerialUrl({ address: `${match.situs_address}, ${match.situs_city}, TX ${match.situs_zip}`, lat: match.latitude, lng: match.longitude, size: "200x140" })} alt="aerial" className="h-24 w-36 rounded-lg object-cover" />
          <div className="flex-1 text-sm">
            <div className="font-bold text-prime-900">{match.situs_address}</div>
            <div className="text-prime-700">{match.situs_city}, TX {match.situs_zip}</div>
            <div className="mt-1 text-prime-600">{match.land_acres?.toFixed(2)} ac · value ${Number(match.total_value || 0).toLocaleString()}</div>
            <button onClick={add} disabled={busy} className="btn-primary mt-2">{busy ? "Adding…" : "Add this property"}</button>
          </div>
        </div>
      )}
      <button onClick={() => { setOpen(false); setMatch(null); }} className="mt-3 text-xs text-prime-500 hover:underline">Cancel</button>
    </div>
  );
}
