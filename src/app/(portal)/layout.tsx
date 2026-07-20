import { auth } from "@/auth";
import { CartProvider } from "@/features/cart/CartContext";
import { getCartQty, getCartSummary } from "@/features/cart/queries";
import { PortalNav } from "@/features/portal/components/PortalNav";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { RouteProgressBar } from "@/components/shared/RouteProgressBar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const [initialQty, initialCartSummary] = await Promise.all([
    getCartQty(userId),
    getCartSummary(userId),
  ]);

  return (
    <CartProvider initialQty={initialQty}>
      <RouteProgressBar />
      <Header initialCartSummary={initialCartSummary} />
      <div className="relative min-h-[60vh] overflow-hidden bg-gradient-to-b from-[#eef5ff] via-white to-[#f7fbff]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-sky-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-40 size-80 rounded-full bg-blue-200/30 blur-3xl"
        />
        <div className="section-shell relative py-8 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
            <PortalNav />
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </CartProvider>
  );
}
