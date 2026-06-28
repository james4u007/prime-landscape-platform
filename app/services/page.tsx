import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const groups = [
  {
    title: "Lawn & Grounds Maintenance",
    items: ["Mowing, edging & trimming", "Fertilization & weed control", "Organic lawn applications", "Insect & pest control", "Mulch installation", "Seasonal color", "Shrub & tree trimming", "Leaf removal & seasonal cleanup", "Core aeration"],
  },
  {
    title: "Irrigation & Sprinkler Systems",
    items: ["System checks & adjustments", "Repairs", "Design & installation", "Smart controller upgrades", "Backflow testing"],
  },
  {
    title: "Landscape Design & Installation",
    items: ["Sod", "Trees & shrubs", "Flower beds", "Landscape lighting", "Retaining walls", "Patios & walkways", "Xeriscapes"],
  },
  {
    title: "Water Features & Pools",
    items: ["Ponds, fountains & streams", "Water feature service & repair", "Pool design", "Pool installation", "Pool service"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <SiteNav />
      <section className="bg-prime-950 py-16 text-white">
        <div className="container-x">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Full-service landscaping</h1>
          <p className="mt-3 max-w-2xl text-prime-100">
            One award-winning team for everything outside — residential and commercial.
            Most recurring services are priced instantly online; larger projects get a free on-site estimate.
          </p>
          <Link href="/quote" className="btn-primary mt-6">Get Instant Pricing</Link>
        </div>
      </section>
      <section className="container-x grid gap-6 py-16 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.title} className="card p-7">
            <h2 className="text-xl font-bold text-prime-900">{g.title}</h2>
            <ul className="mt-4 grid gap-2 text-sm text-prime-700">
              {g.items.map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-prime-500">✓</span> {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <SiteFooter />
    </>
  );
}
