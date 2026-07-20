import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin | AquaPure",
    template: "%s | AquaPure Admin",
  },
};

/** Passthrough — login and panel each own their chrome. */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
