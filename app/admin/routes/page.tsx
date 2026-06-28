import { createClient } from "@/lib/supabase/server";
import RoutesManager from "@/components/RoutesManager";

export const dynamic = "force-dynamic";

export default async function RoutesPage() {
  const supabase = createClient();

  const { data: routesRaw } = await supabase
    .from("pls_routes")
    .select("id, name, route_date, worker_id, pls_profiles(full_name), pls_route_stops(id, sequence, service_type, status, pls_properties(id, address, city, zip, latitude, longitude))")
    .order("route_date", { ascending: false })
    .limit(40);

  const { data: workers } = await supabase
    .from("pls_profiles").select("id, full_name").eq("role", "worker").eq("active", true).order("full_name");

  const { data: propsRaw } = await supabase
    .from("pls_properties")
    .select("id, address, city, zip, latitude, longitude, pls_service_plans(frequency, active, service_type)");

  const routes = (routesRaw || []).map((r: any) => ({
    id: r.id, name: r.name, route_date: r.route_date, worker_id: r.worker_id,
    worker: r.pls_profiles?.full_name || null,
    stops: (r.pls_route_stops || []).map((s: any) => ({
      id: s.id, sequence: s.sequence, service_type: s.service_type, status: s.status,
      property: s.pls_properties,
    })).filter((s: any) => s.property),
  }));

  const properties = (propsRaw || []).map((p: any) => ({
    id: p.id, address: p.address, city: p.city, zip: p.zip, latitude: p.latitude, longitude: p.longitude,
    plans: p.pls_service_plans || [],
  }));

  return <RoutesManager initialRoutes={routes as any} workers={(workers as any) || []} properties={properties as any} />;
}
