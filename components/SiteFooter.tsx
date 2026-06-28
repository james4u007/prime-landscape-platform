import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-prime-100 bg-prime-950 text-prime-100">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-prime-600">P</span>
            Prime Landscape
          </div>
          <p className="mt-3 text-sm text-prime-200">
            Serving the DFW Metroplex since 1990. One of the ten largest landscape
            contractors in Tarrant County.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Services</h4>
          <ul className="mt-3 space-y-2 text-sm text-prime-200">
            <li>Lawn Maintenance</li>
            <li>Irrigation & Sprinklers</li>
            <li>Design & Installation</li>
            <li>Water Features & Pools</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-prime-200">
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/quote" className="hover:text-white">Instant Quote</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/login" className="hover:text-white">Team Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Get Started</h4>
          <p className="mt-3 text-sm text-prime-200">Tarrant County, TX</p>
          <Link href="/quote" className="btn-primary mt-4">Get My Price</Link>
        </div>
      </div>
      <div className="border-t border-prime-900/60 py-5 text-center text-xs text-prime-300">
        © {new Date().getFullYear()} Prime Landscape Services. All rights reserved.
      </div>
    </footer>
  );
}
