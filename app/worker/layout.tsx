import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import WorkerHeader from "@/components/WorkerHeader";

export const dynamic = "force-dynamic";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login?next=/worker");
  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand p-6 text-center">
        <div className="card max-w-md p-8">
          <h1 className="text-lg font-bold text-prime-900">Not set up yet</h1>
          <p className="mt-2 text-sm text-prime-700">Ask your manager to finish adding you to the crew.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-sand">
      <WorkerHeader name={profile.full_name || user.email || "Crew"} />
      <main className="mx-auto max-w-2xl p-4">{children}</main>
    </div>
  );
}
