import type { NextConfig } from "next";

/**
 * Content-Security-Policy
 * Permissive enough for:
 * - Clerk auth widgets / redirects
 * - Google Maps embed (footer iframe)
 * - Cloudinary product images
 * - WhatsApp / Messenger deep links & future chat widgets
 * Tighten further once production domains are fully known.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js + Clerk often need inline/eval in practice; Clerk scripts from their CDNs
  [
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://clerk.padmamineralwater.com",
    "https://challenges.cloudflare.com",
    "https://connect.facebook.net",
    "https://*.facebook.net",
  ].join(" "),
  // Tailwind / Clerk injected styles
  "style-src 'self' 'unsafe-inline'",
  [
    "img-src 'self' data: blob:",
    "https://res.cloudinary.com",
    "https://img.clerk.com",
    "https://*.clerk.com",
    "https://*.google.com",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://*.googleusercontent.com",
    "https://*.facebook.com",
    "https://*.fbcdn.net",
  ].join(" "),
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://api.clerk.com",
    "https://clerk.padmamineralwater.com",
    "https://*.upstash.io",
    "https://res.cloudinary.com",
    "https://wa.me",
    "https://api.whatsapp.com",
    "https://*.facebook.com",
    "https://*.facebook.net",
    "https://www.messenger.com",
    "wss://*.clerk.accounts.dev",
    "wss://*.clerk.com",
  ].join(" "),
  // Maps embed + Clerk modals + Messenger widgets
  [
    "frame-src 'self'",
    "https://www.google.com",
    "https://maps.google.com",
    "https://*.google.com",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://challenges.cloudflare.com",
    "https://www.facebook.com",
    "https://www.messenger.com",
  ].join(" "),
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.clerk.accounts.dev https://*.clerk.com",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
      "accelerometer=()",
      "gyroscope=()",
      "magnetometer=()",
      "midi=()",
      "picture-in-picture=()",
    ].join(", "),
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
