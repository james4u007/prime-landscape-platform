import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

// NOTE: Swap these for Prime's real gallery photos. Drop images into /public/gallery
// and list their filenames here, or we can import them straight from the existing site.
const photos = Array.from({ length: 9 }).map((_, i) => `/gallery/photo-${i + 1}.jpg`);

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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map((src, i) => (
            <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-prime-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Project ${i + 1}`}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-prime-400">
                <span className="text-sm">Photo {i + 1}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-prime-500">
          Add your real project photos to <code>/public/gallery</code> to populate this page.
        </p>
      </section>
      <SiteFooter />
    </>
  );
}
