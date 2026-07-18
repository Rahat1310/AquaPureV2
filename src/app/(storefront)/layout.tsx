import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <WhatsAppFloatingButton context="product-inquiry" />
    </>
  );
}
