import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

// Drop real project photos into /public/gallery (e.g. project-1.jpg ... project-6.jpg)
// and they'll automatically replace the branded tiles below.
const tiles = [
  { label: "Landscape Design & Installation", icon: "🏡", file: "/gallery/project-1.jpg" },
  { label: "Lawn Maintenance", icon: "🌿", file: "/gallery/project-2.jpg" },
  { label: "Irrigation & Sprinklers", icon: "💧", file: "/gallery/project-3.jpg" },
  { label: "Retaining Walls & Hardscapes", icon: "🧱", file: "/gallery/project-4.jpg" },
  { label: "Water Features", icon: "⛲", file: "/gallery/project-5.jpg" },
  { label: "Commercial Grounds", icon: "🏢", file: "/gallery/project-6.jpg" },
];

export default function GalleryPage() {
  return (
    <>
      <SiteNav />
      <section className="bg-prime-950 py-16 text-white">
        <div className="container-x">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Our work</h1>
          <p className="mt-3 max-w-2xl text-prime-100">
            Three decades of transformations across the DFW Metroplex.
          </p>
        </div>
      </section>
      <section className="container-x py-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t, i) => (
            <div
              key={i}
              className="group relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-prime-700 to-prime-950 text-center text-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.file}
                alt={t.label}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => ((e.currentTarget.style.display = "none"))}
              />
              <div className="relative z-0 px-4">
                <div className="text-4xl">{t.icon}</div>
                <div className="mt-3 text-sm font-semibold text-prime-100">{t.label}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-prime-500">
          Send us your favorite project photos and we&apos;ll feature them here.
        </p>
        <div className="mt-4 text-center">
          <Link href="/quote" className="btn-primary">Get an Instant Quote</Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
