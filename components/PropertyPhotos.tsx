"use client";
import { useState } from "react";
import { aerialUrl, streetViewUrl } from "@/lib/google";

export default function PropertyPhotos({
  address,
  lat,
  lng,
  size = "640x360",
}: {
  address: string;
  lat?: number | null;
  lng?: number | null;
  size?: string;
}) {
  const [view, setView] = useState<"aerial" | "street">("aerial");
  const src =
    view === "aerial"
      ? aerialUrl({ address, lat, lng, size })
      : streetViewUrl({ address, lat, lng, size });
  return (
    <div className="overflow-hidden rounded-2xl border border-prime-100">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${view} view`} className="h-56 w-full bg-prime-50 object-cover" />
        <div className="absolute right-3 top-3 flex overflow-hidden rounded-lg bg-white/90 text-xs font-semibold shadow">
          <button
            onClick={() => setView("aerial")}
            className={`px-3 py-1.5 ${view === "aerial" ? "bg-prime-600 text-white" : "text-prime-700"}`}
          >
            Aerial
          </button>
          <button
            onClick={() => setView("street")}
            className={`px-3 py-1.5 ${view === "street" ? "bg-prime-600 text-white" : "text-prime-700"}`}
          >
            Street
          </button>
        </div>
      </div>
    </div>
  );
}
