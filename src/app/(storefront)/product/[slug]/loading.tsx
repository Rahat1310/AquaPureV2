/**
 * Product detail page loading skeleton — matches the two-column layout:
 * gallery (left) | purchase panel (right), then tabs below.
 */
function SkeletonBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className ?? ""}`} style={style} />;
}

export default function ProductDetailLoading() {
  return (
    <div className="section-shell py-10 lg:py-14">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonBlock className="h-4 w-12 rounded-full" />
        <SkeletonBlock className="h-3 w-3 rounded-full" />
        <SkeletonBlock className="h-4 w-24 rounded-full" />
        <SkeletonBlock className="h-3 w-3 rounded-full" />
        <SkeletonBlock className="h-4 w-32 rounded-full" />
      </div>

      {/* Two-col layout */}
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery skeleton */}
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="aspect-square w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        </div>

        {/* Purchase panel skeleton */}
        <div className="flex flex-col gap-4">
          {/* Badge */}
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          {/* Title */}
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-3/4" />
          {/* Stars */}
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-5 w-28 rounded-full" />
            <SkeletonBlock className="h-5 w-32 rounded-full" />
          </div>
          {/* Spec badges */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
          {/* Price */}
          <SkeletonBlock className="h-10 w-36" />
          {/* Variants */}
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-12 w-28 rounded-xl" />
            ))}
          </div>
          {/* Qty + buttons */}
          <div className="flex gap-3">
            <SkeletonBlock className="h-12 w-32 rounded-xl" />
            <SkeletonBlock className="h-12 flex-1 rounded-xl" />
            <SkeletonBlock className="h-12 flex-1 rounded-xl" />
          </div>
          {/* Delivery info panel */}
          <SkeletonBlock className="mt-3 h-24 w-full rounded-2xl" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-14">
        <div className="flex gap-2 border-b border-blue-100 pb-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10 w-28 rounded-t-xl" />
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-5 w-full rounded-lg" style={{ width: `${100 - i * 8}%` }} />
          ))}
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="mt-16">
        <SkeletonBlock className="h-8 w-48 rounded-xl" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
              <SkeletonBlock className="aspect-[1.08] w-full rounded-none" />
              <div className="flex flex-col gap-3 p-5">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-7 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
