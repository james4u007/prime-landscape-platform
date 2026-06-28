"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { aerialUrl } from "@/lib/google";
import { mapsRouteUrl } from "@/lib/route";

type Stop = {
  id: string;
  sequence: number;
  service_type: string | null;
  status: string;
  worker_notes: string | null;
  pls_properties: { address: string; city: string | null; zip: string | null; gate_code: string | null; service_notes: string | null; latitude: number | null; longitude: number | null } | null;
};

export default function WorkerStops({ initial }: { initial: Stop[] }) {
  const supabase = createClient();
  const [stops, setStops] = useState(initial);

  async function setStatus(id: string, status: string) {
    setStops((s) => s.map((x) => (x.id === id ? { ...x, status } : x)));
    await supabase
      .from("pls_route_stops")
      .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
      .eq("id", id);
  }

  if (!stops.length) return <div className="card p-10 text-center text-prime-500">No stops assigned for today. Enjoy the day! 🌿</div>;

  return (
    <div className="space-y-4">
      <a
        href={mapsRouteUrl(stops.map((s) => ({ lat: s.pls_properties?.latitude, lng: s.pls_properties?.longitude, address: `${s.pls_properties?.address || ""}, ${s.pls_properties?.city || ""}` })))}
        target="_blank"
        rel="noreferrer"
        className="btn-primary w-full"
      >
        🧭 Navigate full route ({stops.length} stops)
      </a>
      {stops.map((s) => {
        const pr = s.pls_properties;
        const addr = pr ? `${pr.address}, ${pr.city || ""}, TX ${pr.zip || ""}` : "";
        const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
        return (
          <div key={s.id} className={`card overflow-hidden ${s.status === "done" ? "opacity-60" : ""}`}>
            {pr && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={aerialUrl({ address: addr, lat: pr.latitude, lng: pr.longitude, size: "640x240", zoom: 20 })} alt="aerial" className="h-40 w-full object-cover" />
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-prime-500">STOP {s.sequence}</div>
                  <h3 className="text-lg font-bold text-prime-900">{pr?.address}</h3>
                  <p className="text-sm text-prime-700">{pr?.city}, TX {pr?.zip}</p>
                  <p className="mt-1 text-sm font-medium capitalize text-prime-700">{s.service_type}</p>
                </div>
                <a href={mapHref} target="_blank" rel="noreferrer" className="btn-ghost shrink-0">Navigate</a>
              </div>
              {pr?.gate_code && <p className="mt-2 text-sm text-prime-700">🔑 Gate code: <b>{pr.gate_code}</b></p>}
              {pr?.service_notes && <p className="mt-1 text-sm text-prime-700">📝 {pr.service_notes}</p>}
              <div className="mt-4 flex gap-2">
                {s.status !== "done" ? (
                  <>
                    <button onClick={() => setStatus(s.id, "done")} className="btn-primary flex-1">Mark Done</button>
                    <button onClick={() => setStatus(s.id, "skipped")} className="btn-ghost">Skip</button>
                  </>
                ) : (
                  <button onClick={() => setStatus(s.id, "pending")} className="btn-ghost flex-1">✓ Done — Undo</button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
