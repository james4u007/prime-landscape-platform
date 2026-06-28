import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RoutesPage() {
  const supabase = createClient();
  const { data: routes } = await supabase
    .from("pls_routes")
    .select("*, pls_profiles(full_name), pls_route_stops(id, sequence, service_type, status, pls_properties(address, city))")
    .order("route_date", { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-prime-900">Routes</h1>
      <p className="mt-1 text-prime-700">Daily crew routes. Workers see only their own assigned route — never billing.</p>

      <div className="mt-6 space-y-5">
        {(routes || []).map((r: any) => {
          const stops = (r.pls_route_stops || []).sort((a: any, b: any) => a.sequence - b.sequence);
          const done = stops.filter((s: any) => s.status === "done").length;
          return (
            <div key={r.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-prime-900">{r.name || "Route"} · {r.route_date}</h3>
                  <p className="text-sm text-prime-700">Crew: {r.pls_profiles?.full_name || "Unassigned"}</p>
                </div>
                <span className="rounded-full bg-prime-100 px-3 py-1 text-xs font-semibold text-prime-700">
                  {done}/{stops.length} done
                </span>
              </div>
              <ol className="mt-3 divide-y divide-prime-50 text-sm">
                {stops.map((s: any) => (
                  <li key={s.id} className="flex items-center justify-between py-2">
                    <span className="text-prime-800">{s.sequence}. {s.pls_properties?.address}, {s.pls_properties?.city}</span>
                    <span className="text-prime-600 capitalize">{s.service_type} · {s.status}</span>
                  </li>
                ))}
                {!stops.length && <li className="py-3 text-prime-500">No stops on this route.</li>}
              </ol>
            </div>
          );
        })}
        {!routes?.length && <div className="card p-10 text-center text-prime-500">No routes yet.</div>}
      </div>
    </div>
  );
}
