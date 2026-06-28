import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import AdminShell from "@/components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login?next=/admin");
  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand p-6 text-center">
        <div className="card max-w-md p-8">
          <h1 className="text-lg font-bold text-prime-900">Account not provisioned</h1>
          <p className="mt-2 text-sm text-prime-700">
            Your login exists but hasn&apos;t been assigned a role yet. Ask an administrator to
            add you to the team.
          </p>
        </div>
      </div>
    );
  }
  if (profile.role !== "admin") redirect("/worker");
  return <AdminShell name={profile.full_name || user.email || "Admin"}>{children}</AdminShell>;
}
