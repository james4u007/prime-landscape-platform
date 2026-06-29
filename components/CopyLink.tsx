"use client";
import { useState } from "react";

export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }
  return (
    <div className="flex items-center gap-2">
      <input readOnly value={url} className="input !py-2 flex-1 text-xs text-prime-600" onFocus={(e) => e.currentTarget.select()} />
      <button onClick={copy} className="btn-ghost shrink-0 !py-2">{copied ? "Copied ✓" : "Copy"}</button>
    </div>
  );
}
