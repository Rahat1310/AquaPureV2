import { redirect } from "next/navigation";

/** Legacy Auth.js login → Clerk customer sign-in */
export default async function LegacyLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params.callbackUrl
    ? `/sign-in?redirect_url=${encodeURIComponent(params.callbackUrl)}`
    : "/sign-in";
  redirect(redirectUrl);
}
