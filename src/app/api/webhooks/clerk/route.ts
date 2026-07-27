import { headers } from "next/headers";

import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/rbac";

export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserPayload {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  image_url: string | null;
  primary_email_address_id: string | null;
  email_addresses: ClerkEmailAddress[];
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserPayload;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function primaryEmail(payload: ClerkUserPayload): string | null {
  const match = payload.email_addresses.find(
    (e) => e.id === payload.primary_email_address_id,
  );
  return match?.email_address ?? payload.email_addresses[0]?.email_address ?? null;
}

async function upsertUserFromClerkPayload(payload: ClerkUserPayload) {
  const email = primaryEmail(payload);
  const name =
    [payload.first_name, payload.last_name].filter(Boolean).join(" ") ||
    payload.username ||
    email;
  const image = payload.image_url || null;

  const existingByClerk = await prisma.user.findUnique({
    where: { clerkId: payload.id },
  });

  if (existingByClerk) {
    return prisma.user.update({
      where: { id: existingByClerk.id },
      data: {
        email: email ?? existingByClerk.email,
        name,
        image,
        emailVerified: email ? new Date() : existingByClerk.emailVerified,
      },
    });
  }

  if (email) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          clerkId: payload.id,
          name: name ?? existingByEmail.name,
          image: image ?? existingByEmail.image,
          emailVerified: new Date(),
        },
      });
    }
  }

  const created = await prisma.user.create({
    data: {
      clerkId: payload.id,
      email,
      name,
      image,
      role: Role.CUSTOMER,
      emailVerified: email ? new Date() : null,
      isActive: true,
    },
  });

  // Merge any guest cart accumulated before sign-up
  try {
    const { mergeGuestCart } = await import("@/features/cart/actions");
    await mergeGuestCart(created.id);
  } catch {
    // ignore cart merge failures — non-critical
  }

  return created;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  // Read the raw body for signature verification
  const rawBody = await req.text();
  if (rawBody.length > 65_000) {
    console.warn("[clerk-webhook] Payload too large");
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Collect Svix headers
  const headerStore = await headers();
  const svixId = headerStore.get("svix-id") ?? "";
  const svixTimestamp = headerStore.get("svix-timestamp") ?? "";
  const svixSignature = headerStore.get("svix-signature") ?? "";

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.warn("[clerk-webhook] Missing svix headers");
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Verify signature
  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.warn("[clerk-webhook] Signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Only handle user events
  if (event.type !== "user.created" && event.type !== "user.updated") {
    return NextResponse.json({ received: true });
  }

  try {
    await upsertUserFromClerkPayload(event.data);
    console.info(`[clerk-webhook] Synced user ${event.data.id} (${event.type})`);
  } catch (err) {
    console.error("[clerk-webhook] Failed to upsert user", err);
    // Return 500 so Clerk retries
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
