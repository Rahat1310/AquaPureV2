import { auth } from "@/auth";
import { CartProvider } from "@/features/cart/CartContext";
import { getCartQty } from "@/features/cart/queries";
import { getCartSummary } from "@/features/cart/queries";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { RouteProgressBar } from "@/components/shared/RouteProgressBar";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";

export default async function StorefrontLayout({
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
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <WhatsAppFloatingButton context="product-inquiry" />
    </CartProvider>
  );
}
