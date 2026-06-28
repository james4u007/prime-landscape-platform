"use client";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/quote", label: "Instant Quote" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-prime-100 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-prime-700">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-prime-600 text-white">P</span>
          <span className="text-lg">Prime Landscape</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-prime-800 hover:text-prime-600">
              {l.label}
            </Link>
          ))}
          <Link href="/quote" className="btn-primary">Get My Price</Link>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-prime-800" />
            <span className="block h-0.5 w-6 bg-prime-800" />
            <span className="block h-0.5 w-6 bg-prime-800" />
          </div>
        </button>
      </div>
      {open && (
        <div className="border-t border-prime-100 bg-white md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-2 py-2 text-prime-800 hover:bg-prime-50" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href="/quote" className="btn-primary mt-2" onClick={() => setOpen(false)}>Get My Price</Link>
          </div>
        </div>
      )}
    </header>
  );
}
