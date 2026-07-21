import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Padma Mineral Water | PMW — Safe Water, Safe Life",
    template: "%s | Padma Mineral Water",
  },
  description:
    "Padma Mineral Water (PMW) — safe water, safe life. Premium purification for homes, businesses, and industries across Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/account"
      signUpFallbackRedirectUrl="/account"
      afterSignOutUrl="/"
    >
      <html lang="en">
        <body className={inter.variable} suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
