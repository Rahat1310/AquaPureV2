import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AddressManager } from "@/features/portal/components/AddressManager";
import { getAddressesByUser } from "@/features/portal/queries";

export const metadata: Metadata = {
  title: "Addresses — AquaPure",
  description: "Manage your saved delivery addresses.",
};

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?redirect_url=/account/addresses");

  const addresses = await getAddressesByUser(session.user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Addresses
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Saved delivery locations for checkout.
        </p>
      </header>
      <AddressManager
        addresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          recipientName: a.recipientName,
          phone: a.phone,
          line1: a.line1,
          line2: a.line2,
          city: a.city,
          district: a.district,
          postCode: a.postCode,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}
