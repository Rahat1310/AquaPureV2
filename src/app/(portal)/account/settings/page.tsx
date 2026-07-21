import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileSettingsForm } from "@/features/portal/components/ProfileSettingsForm";
import { getProfileByUser } from "@/features/portal/queries";

export const metadata: Metadata = {
  title: "Settings — Padma Mineral Water",
  description: "Update your Padma Mineral Water profile and account security.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?redirect_url=/account/settings");

  const profile = await getProfileByUser(session.user.id);
  if (!profile) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your profile and account security.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-blue-100/80 bg-white/85 backdrop-blur">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Name and phone used for orders and service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSettingsForm
              name={profile.name ?? ""}
              email={profile.email ?? ""}
              phone={profile.phone}
            />
          </CardContent>
        </Card>

        <Card className="border-blue-100/80 bg-white/85 backdrop-blur">
          <CardHeader>
            <CardTitle>Account security</CardTitle>
            <CardDescription>
              Password and email are managed by Clerk.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-slate-600">
              Manage password in your account security settings
            </p>
            <UserButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
