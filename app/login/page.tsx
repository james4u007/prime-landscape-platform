"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let dest = params.get("next") || "/admin";
    if (user) {
      const { data: profile } = await supabase
        .from("pls_profiles")
        .select("role")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (profile?.role === "worker") dest = "/worker";
    }
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-prime-950 px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-extrabold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-prime-600">P</span>
          Prime Landscape
        </Link>
        <form onSubmit={signIn} className="card space-y-4 p-7">
          <h1 className="text-xl font-bold text-prime-900">Team Login</h1>
          {error && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">{error}</p>}
          <div><label className="label">Email</label><input required type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label">Password</label><input required type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</button>
          <p className="text-center text-xs text-prime-500">Admins manage billing & routes. Crews see only their daily route.</p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
