import { CartBadge } from "@/features/cart/CartBadge";
import { CartProvider } from "@/features/cart/CartContext";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { RouteProgressBar } from "@/components/shared/RouteProgressBar";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";

/**
 * Static-friendly storefront shell.
 * Cart/auth are hydrated client-side via CartBadge → /api/cart/summary
 * so product/catalog pages can use ISR (`revalidate = 600`).
 */
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <CartBadge />
      <RouteProgressBar />
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <WhatsAppFloatingButton context="product-inquiry" />
    </CartProvider>
  );
}
