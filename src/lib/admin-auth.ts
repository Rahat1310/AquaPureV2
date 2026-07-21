import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import type { AppSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/rbac";

export const ADMIN_COOKIE = "pmw_admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function sessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "";
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET (or NEXTAUTH_SECRET) is required for admin login.");
  }
  return secret;
}

/** Strip accidental wrapping quotes from .env values. */
function cleanEnv(value: string | undefined): string {
  return (value ?? "").trim().replace(/^['"]|['"]$/g, "");
}

export function getAdminCredentials() {
  return {
    email: cleanEnv(process.env.ADMIN_EMAIL).toLowerCase(),
    password: cleanEnv(process.env.ADMIN_PASSWORD),
  };
}

function signPayload(payload: string): string {
  const sig = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${sig}`;
}

function verifyToken(token: string): { email: string; exp: number } | null {
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const [email, expRaw] = payload.split("|");
  const exp = Number(expRaw);
  if (!email || !Number.isFinite(exp) || Date.now() > exp) return null;
  return { email: email.toLowerCase(), exp };
}

/** Ensure a DB user exists for audit-log FKs (safe under parallel page/layout calls). */
async function ensureAdminUser(email: string) {
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Admin",
      role: Role.SUPER_ADMIN,
      isActive: true,
      emailVerified: new Date(),
    },
    update: {
      role: Role.SUPER_ADMIN,
      isActive: true,
      name: "Admin",
    },
  });
}

export async function createAdminSessionCookie(email: string): Promise<string> {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  return signPayload(`${email.toLowerCase()}|${exp}`);
}

export async function setAdminSession(email: string): Promise<void> {
  const token = await createAdminSessionCookie(email);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export function readAdminEmailFromCookie(token: string | undefined): string | null {
  if (!token) return null;
  try {
    return verifyToken(token)?.email ?? null;
  } catch {
    return null;
  }
}

/**
 * Hardcoded env-credential admin session (not Clerk).
 * Used by /admin panel + admin server actions.
 */
export async function getAdminSession(): Promise<AppSession | null> {
  const { email: expectedEmail, password } = getAdminCredentials();
  if (!expectedEmail || !password) return null;

  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  const email = readAdminEmailFromCookie(token);
  if (!email || email !== expectedEmail) return null;

  const user = await ensureAdminUser(email);
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? "Admin",
      role: Role.SUPER_ADMIN,
      image: user.image,
    },
  };
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const creds = getAdminCredentials();
  if (!creds.email || !creds.password) return false;
  return (
    email.trim().toLowerCase() === creds.email && password === creds.password
  );
}
