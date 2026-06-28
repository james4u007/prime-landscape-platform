import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import BookingFlow from "@/components/BookingFlow";

export const dynamic = "force-dynamic";

export default function BookPage() {
  return (
    <>
      <SiteNav />
      <section className="bg-prime-950 py-10 text-white">
        <div className="container-x">
          <h1 className="text-2xl font-extrabold sm:text-3xl">Book your service</h1>
          <p className="mt-1 text-prime-100">Two quick steps. No charge until after your first mow.</p>
        </div>
      </section>
      <section className="container-x py-10">
        <BookingFlow />
      </section>
      <SiteFooter />
    </>
  );
}
