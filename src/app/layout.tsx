import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { NavigationLoader } from "@/components/shared/NavigationLoader";

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
  icons: {
    icon: [
      { url: "/favicon.png?v=3", type: "image/png", sizes: "48x48" },
      { url: "/icon-32.png?v=3", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico?v=3", sizes: "any" },
    ],
    shortcut: "/favicon.png?v=3",
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
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
          <NavigationLoader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
