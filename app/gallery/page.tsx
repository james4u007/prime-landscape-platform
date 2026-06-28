import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

// Real Prime Landscape photos pulled from the existing website.
const photos = [
  "https://nebula.wsimg.com/7dfdbca07cf8f9e9882a167b6cd324dd",
  "https://nebula.wsimg.com/63140a2c7a778bbfd73e41ad42065304",
  "https://nebula.wsimg.com/72b15aed368f9aec8d07e258f6ee3a64",
  "https://nebula.wsimg.com/2fedec1f469c6f8741749bdd16c925c6",
  "https://nebula.wsimg.com/f0da52251d48c1a20617ee6be8fc0aef",
  "https://nebula.wsimg.com/498555f9e2dc1b17b975dd31633d6553",
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
          {photos.map((src, i) => (
            <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-prime-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Prime Landscape project ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-prime-500">
          Want more shots featured? We can add as many project photos as you like.
        </p>
      </section>
      <SiteFooter />
    </>
  );
}
