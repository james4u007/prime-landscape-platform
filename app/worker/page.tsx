import { getProfile } from "@/lib/supabase/server";
import WorkerStops from "@/components/WorkerStops";

export const dynamic = "force-dynamic";

export default async function WorkerToday() {
  const { profile, supabase } = await getProfile();
  const today = new Date().toISOString().slice(0, 10);

  const { data: routes } = await supabase
    .from("pls_routes")
    .select("id, name, route_date")
    .eq("worker_id", profile!.id)
    .eq("route_date", today);

  const routeIds = (routes || []).map((r: any) => r.id);
  let stops: any[] = [];
  if (routeIds.length) {
    const { data } = await supabase
      .from("pls_route_stops")
      .select("id, sequence, service_type, status, worker_notes, pls_properties(address, city, zip, gate_code, service_notes, latitude, longitude)")
      .in("route_id", routeIds)
      .order("sequence");
    stops = data || [];
  }

  return (
    <div>
      <div className="py-4">
        <h1 className="text-xl font-extrabold text-prime-900">Today&apos;s route</h1>
        <p className="text-sm text-prime-700">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} ·
          {" "}{stops.length} stop{stops.length === 1 ? "" : "s"}
        </p>
      </div>
      <WorkerStops initial={stops as any} />
    </div>
  );
}
