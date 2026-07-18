import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type WhatsAppContext =
  | "product-inquiry"
  | "commercial-quote"
  | "service-request";

interface WhatsAppFloatingButtonProps {
  context?: WhatsAppContext;
  productName?: string;
  phoneNumber?: string;
  className?: string;
}

const contextMessages: Record<WhatsAppContext, string> = {
  "product-inquiry":
    "Hello AquaPure, I would like to know more about your water purifier products.",
  "commercial-quote":
    "Hello AquaPure, I would like a commercial water purification quote for my business.",
  "service-request":
    "Hello AquaPure, I need help with installation, maintenance, or a service request.",
};

export function WhatsAppFloatingButton({
  context = "product-inquiry",
  productName,
  phoneNumber = "8801700000000",
  className,
}: WhatsAppFloatingButtonProps) {
  const productSuffix =
    context === "product-inquiry" && productName ? ` I am interested in ${productName}.` : "";
  const message = `${contextMessages[context]}${productSuffix}`;
  const href = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with AquaPure on WhatsApp"
      className={cn(
        "group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_12px_34px_rgba(20,120,67,0.36)] transition duration-300 hover:-translate-y-1 hover:bg-[#1fbd5b] sm:bottom-7 sm:right-7",
        className,
      )}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/20 [animation-duration:2.4s]" />
      <MessageCircle className="size-6 fill-white/10" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 group-hover:max-w-32 group-hover:pr-1 group-hover:opacity-100">
        Chat with us
      </span>
    </a>
  );
}
