"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { geocode, orderByNearest, totalRouteKm, mapsRouteUrl, DEPOT } from "@/lib/route";

type Prop = { id: string; address: string; city: string | null; zip: string | null; latitude: number | null; longitude: number | null; plans?: { frequency: string; active: boolean; service_type: string }[] };
type Stop = { id: string; sequence: number; service_type: string | null; status: string; property: Prop };
type Route = { id: string; name: string | null; route_date: string; worker: string | null; worker_id: string | null; stops: Stop[] };
type Worker = { id: string; full_name: string | null };

export default function RoutesManager({ initialRoutes, workers, properties }: { initialRoutes: Route[]; workers: Worker[]; properties: Prop[] }) {
  const supabase = createClient();
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [busy, setBusy] = useState<string>("");
  const [workerId, setWorkerId] = useState<string>(workers[0]?.id || "");
  const [drag, setDrag] = useState<{ routeId: string; index: number } | null>(null);

  async function moveStop(route: Route, from: number, to: number) {
    if (from === to) return;
    const stops = [...route.stops].sort((a, b) => a.sequence - b.sequence);
    const [m] = stops.splice(from, 1);
    stops.splice(to, 0, m);
    const reseq = stops.map((s, i) => ({ ...s, sequence: i + 1 }));
    setRoutes((rs) => rs.map((r) => (r.id === route.id ? { ...r, stops: reseq } : r)));
    for (let i = 0; i < reseq.length; i++) {
      await supabase.from("pls_route_stops").update({ sequence: i + 1 }).eq("id", reseq[i].id);
    }
  }

  async function ensureCoords(p: Prop): Promise<{ lat: number; lng: number } | null> {
    if (p.latitude && p.longitude) return { lat: p.latitude, lng: p.longitude };
    const g = await geocode(`${p.address}, ${p.city || "Fort Worth"}, TX ${p.zip || ""}`);
    if (g) {
      p.latitude = g.lat; p.longitude = g.lng;
      await supabase.from("pls_properties").update({ latitude: g.lat, longitude: g.lng }).eq("id", p.id);
      return g;
    }
    return null;
  }

  async function optimize(route: Route) {
    setBusy(route.id);
    try {
      const withPts: { stop: Stop; lat: number; lng: number }[] = [];
      const noPts: Stop[] = [];
      for (const s of route.stops) {
        const c = await ensureCoords(s.property);
        if (c) withPts.push({ stop: s, lat: c.lat, lng: c.lng });
        else noPts.push(s);
      }
      const ordered = orderByNearest(withPts, DEPOT);
      const finalStops = [...ordered.map((o) => o.stop), ...noPts];
      for (let i = 0; i < finalStops.length; i++) {
        await supabase.from("pls_route_stops").update({ sequence: i + 1 }).eq("id", finalStops[i].id);
      }
      const updated = { ...route, stops: finalStops.map((s, i) => ({ ...s, sequence: i + 1 })) };
      setRoutes((rs) => rs.map((r) => (r.id === route.id ? updated : r)));
    } finally { setBusy(""); }
  }

  async function buildToday() {
    if (!workerId) return;
    setBusy("build");
    try {
      const active = properties.filter((p) => (p.plans || []).some((pl) => pl.active));
      if (!active.length) { setBusy(""); return; }
      const pts: { p: Prop; lat: number; lng: number }[] = [];
      const noPts: Prop[] = [];
      for (const p of active) {
        const c = await ensureCoords(p);
        if (c) pts.push({ p, lat: c.lat, lng: c.lng });
        else noPts.push(p);
      }
      const ordered = orderByNearest(pts, DEPOT);
      const orderedProps = [...ordered.map((o) => o.p), ...noPts];
      const today = new Date().toISOString().slice(0, 10);
      const workerName = workers.find((w) => w.id === workerId)?.full_name || "Crew";
      const { data: route } = await supabase
        .from("pls_routes")
        .insert({ route_date: today, worker_id: workerId, name: `Optimized · ${workerName}` })
        .select("id").single();
      if (!route) { setBusy(""); return; }
      const stopsPayload = orderedProps.map((p, i) => {
        const plan = (p.plans || []).find((pl) => pl.active);
        return { route_id: route.id, property_id: p.id, sequence: i + 1, service_type: plan?.service_type || "mowing", status: "pending" };
      });
      await supabase.from("pls_route_stops").insert(stopsPayload);
      const newRoute: Route = {
        id: route.id, name: `Optimized · ${workerName}`, route_date: today, worker: workerName, worker_id: workerId,
        stops: orderedProps.map((p, i) => ({ id: `tmp-${i}`, sequence: i + 1, service_type: "mowing", status: "pending", property: p })),
      };
      setRoutes((rs) => [newRoute, ...rs]);
    } finally { setBusy(""); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-prime-900">Routes</h1>
          <p className="mt-1 text-prime-700">Auto-built and ordered by driving efficiency. Crews see only their own route.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input !py-2 !w-auto" value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
            {workers.length === 0 && <option value="">No crew yet</option>}
            {workers.map((w) => <option key={w.id} value={w.id}>{w.full_name || "Crew"}</option>)}
          </select>
          <button className="btn-primary" onClick={buildToday} disabled={busy !== "" || !workerId}>
            {busy === "build" ? "Optimizing…" : "Auto-build today's route"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {routes.map((r) => {
          const stops = [...r.stops].sort((a, b) => a.sequence - b.sequence);
          const pts = stops.filter((s) => s.property.latitude && s.property.longitude).map((s) => ({ lat: s.property.latitude!, lng: s.property.longitude! }));
          const km = totalRouteKm(pts, DEPOT);
          const miles = (km * 0.621371).toFixed(1);
          const done = stops.filter((s) => s.status === "done").length;
          return (
            <div key={r.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-prime-900">{r.name || "Route"} · {r.route_date}</h3>
                  <p className="text-sm text-prime-700">Crew: {r.worker || "Unassigned"} · {stops.length} stops · ~{miles} mi drive · {done}/{stops.length} done</p>
                </div>
                <div className="flex gap-2">
                  <a href={mapsRouteUrl(stops.map((s) => ({ lat: s.property.latitude, lng: s.property.longitude, address: `${s.property.address}, ${s.property.city || ""}` })))}
                    target="_blank" rel="noreferrer" className="btn-ghost">Open in Maps</a>
                  <button className="btn-primary" onClick={() => optimize(r)} disabled={busy !== ""}>
                    {busy === r.id ? "Optimizing…" : "Optimize order"}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-prime-500">Drag stops to reorder, or hit Optimize.</p>
              <ol className="mt-1 divide-y divide-prime-50 text-sm">
                {stops.map((s, idx) => (
                  <li key={s.id} draggable
                    onDragStart={() => setDrag({ routeId: r.id, index: idx })}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (drag && drag.routeId === r.id) moveStop(r, drag.index, idx); setDrag(null); }}
                    className="flex cursor-move items-center justify-between py-2 hover:bg-prime-50">
                    <span className="text-prime-800"><span className="mr-1 text-prime-400">⠿</span>{s.sequence}. {s.property.address}, {s.property.city}</span>
                    <span className="capitalize text-prime-600">{s.service_type} · {s.status}</span>
                  </li>
                ))}
                {!stops.length && <li className="py-3 text-prime-500">No stops.</li>}
              </ol>
            </div>
          );
        })}
        {!routes.length && <div className="card p-10 text-center text-prime-500">No routes yet. Pick a crew member and auto-build today&apos;s route.</div>}
      </div>
    </div>
  );
}
