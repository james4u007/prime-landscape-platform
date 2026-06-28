"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChargeButton({ invoiceId, hasCard }: { invoiceId: string; hasCard: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function charge() {
    if (!hasCard) { setMsg("No card"); return; }
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/stripe/charge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const j = await res.json();
      if (j.ok) { setMsg("Paid ✓"); router.refresh(); }
      else setMsg(j.error || "Failed");
    } catch { setMsg("Failed"); }
    finally { setBusy(false); }
  }

  if (msg) return <span className="text-xs font-semibold text-prime-600">{msg}</span>;
  return (
    <button
      onClick={charge}
      disabled={busy || !hasCard}
      className="rounded-lg border border-prime-200 px-2.5 py-1 text-xs font-semibold text-prime-700 hover:bg-prime-50 disabled:opacity-40"
      title={hasCard ? "Charge the card on file" : "No card on file"}
    >
      {busy ? "Charging…" : "Charge card"}
    </button>
  );
}
