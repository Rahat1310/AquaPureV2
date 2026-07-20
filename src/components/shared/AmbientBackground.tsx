/**
 * AmbientBackground — purely CSS-animated radial gradient blobs.
 *
 * Performance contract:
 *  • Animates ONLY `transform` (translate + scale) — GPU composited, zero layout cost.
 *  • `pointer-events-none` — never blocks interaction.
 *  • `aria-hidden` — invisible to screen readers.
 *  • Absolutely positioned so it never affects document flow (no CLS).
 *  • `overflow: hidden` is handled by the parent (the hero/section has `overflow-x-clip`).
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Primary blob — top-left, large soft blue */}
      <div
        className="ambient-blob-a absolute -left-32 -top-24 size-[520px] rounded-full opacity-55"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.38) 0%, rgba(27,79,209,0.18) 45%, transparent 72%)",
        }}
      />

      {/* Secondary blob — top-right, mid-blue */}
      <div
        className="ambient-blob-b absolute -right-24 -top-16 size-[440px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(27,79,209,0.28) 0%, rgba(56,189,248,0.14) 50%, transparent 72%)",
        }}
      />

      {/* Accent blob — bottom-center, sky tint */}
      <div
        className="ambient-blob-c absolute -bottom-20 left-1/2 size-[360px] -translate-x-1/2 rounded-full opacity-45"
        style={{
          background:
            "radial-gradient(circle, rgba(125,211,252,0.32) 0%, transparent 65%)",
        }}
      />

      {/* Extra mid-left glow for depth */}
      <div
        className="absolute left-[20%] top-[40%] size-[280px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(147,197,253,0.35) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
