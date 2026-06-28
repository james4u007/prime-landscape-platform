import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const services = [
  { title: "Lawn Maintenance", desc: "Mowing, edging, trimming, fertilization, weed & pest control, seasonal color.", icon: "🌿" },
  { title: "Irrigation & Sprinklers", desc: "System checks, adjustments, repairs, design and full installation.", icon: "💧" },
  { title: "Design & Installation", desc: "Sod, trees, shrubs, flower beds, lighting, retaining walls, patios, walkways, xeriscapes.", icon: "🏡" },
  { title: "Water Features", desc: "Ponds, fountains, streams — design, installation, service and repairs.", icon: "⛲" },
  { title: "Pools", desc: "Design, installation and ongoing service.", icon: "🏊" },
  { title: "Commercial Grounds", desc: "Full-service maintenance for HOAs, retail, office and industrial properties.", icon: "🏢" },
];

export default function Home() {
  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden bg-prime-950 text-white">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(60% 60% at 70% 20%, #3d8838 0%, transparent 60%), radial-gradient(50% 50% at 10% 90%, #245523 0%, transparent 60%)" }} />
        <div className="container-x relative grid gap-10 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex rounded-full bg-prime-600/30 px-3 py-1 text-xs font-semibold text-prime-100 ring-1 ring-prime-400/40">
              Serving Tarrant County since 1990
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Know your lawn care price in <span className="text-prime-300">10 seconds.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-prime-100">
              Type in your address. We pull your exact lot size from county records and
              show you a real price for weekly, bi-weekly, or monthly service — with a
              live photo of your property.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quote" className="btn-primary text-base">Get My Instant Price</Link>
              <Link href="/services" className="btn-ghost border-prime-400/40 text-white hover:bg-white/10">Explore Services</Link>
            </div>
            <div className="mt-8 flex gap-8 text-sm text-prime-200">
              <div><div className="text-2xl font-bold text-white">1,800+</div>properties served</div>
              <div><div className="text-2xl font-bold text-white">35 yrs</div>in the DFW Metroplex</div>
              <div><div className="text-2xl font-bold text-white">100+</div>team members</div>
            </div>
          </div>
          <div className="relative">
            <div className="card overflow-hidden bg-white/5 p-2 ring-1 ring-white/10">
              <div className="rounded-xl bg-white p-5 text-prime-950">
                <p className="label">Instant Quote Preview</p>
                <p className="mt-1 text-sm text-prime-700">3934 Bryce Ave, Fort Worth</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["Weekly","$194"],["Bi-Weekly","$108"],["Monthly","$60"]].map(([k,v]) => (
                    <div key={k} className="rounded-xl border border-prime-100 p-3">
                      <div className="text-xs text-prime-600">{k}</div>
                      <div className="text-xl font-bold text-prime-700">{v}</div>
                      <div className="text-[10px] text-prime-500">per month</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-prime-50 p-3 text-xs text-prime-700">
                  Lot size: <b>0.14 acres</b> · pulled from Tarrant County records
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold text-prime-900">Everything your property needs</h2>
          <p className="mt-3 text-prime-700">
            From weekly mowing to complete landscape transformations, one team handles it all —
            backed by the Texas Excellence in Landscaping Award.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="card p-6 transition hover:shadow-md">
              <div className="text-3xl">{s.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-prime-900">{s.title}</h3>
              <p className="mt-2 text-sm text-prime-700">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand py-20">
        <div className="container-x">
          <h2 className="text-center text-3xl font-extrabold text-prime-900">Pricing in three steps</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              ["1", "Enter your address", "We match it to official Tarrant County parcel records."],
              ["2", "We measure your lot", "Lot size and turf area are calculated automatically — no guesswork."],
              ["3", "See your price", "Real weekly, bi-weekly, and monthly pricing, instantly."],
            ].map(([n, t, d]) => (
              <div key={n} className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-prime-600 text-lg font-bold text-white">{n}</div>
                <h3 className="mt-4 font-bold text-prime-900">{t}</h3>
                <p className="mt-2 text-sm text-prime-700">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/quote" className="btn-primary text-base">Try It Now</Link>
          </div>
        </div>
      </section>

      <section className="container-x pb-8 pt-4">
        <div className="rounded-3xl bg-prime-50 p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="text-2xl tracking-widest text-prime-500">★★★★★</div>
            <p className="mt-2 text-sm font-semibold text-prime-700">Rated 4.8/5 by DFW homeowners · 1,800+ properties served</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["Easiest quote I've ever gotten — typed my address and had a real price in seconds.", "Connie R., Fort Worth"],
              ["Their crew is reliable and the online booking made it painless. Highly recommend.", "Beth H., Arlington"],
              ["Great communication, even when weather pushed us a day. Lawn looks perfect.", "Marcus T., Keller"],
            ].map(([quote, name]) => (
              <div key={name} className="card p-6">
                <div className="text-prime-500">★★★★★</div>
                <p className="mt-3 text-sm text-prime-800">&ldquo;{quote}&rdquo;</p>
                <p className="mt-3 text-xs font-semibold text-prime-600">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
