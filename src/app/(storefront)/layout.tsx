import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { RouteProgressBar } from "@/components/shared/RouteProgressBar";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RouteProgressBar />
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <WhatsAppFloatingButton context="product-inquiry" />
    </>
  );
}
