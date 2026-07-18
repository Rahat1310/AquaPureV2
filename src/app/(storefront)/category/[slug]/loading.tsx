/**
 * Category page loading skeleton — matches the two-column layout:
 * breadcrumb + heading on top, sidebar filters on left, product grid on right.
 */
function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ""}`} />;
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <SkeletonBlock className="aspect-[1.08] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-6">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-5 w-full" />
        <SkeletonBlock className="h-5 w-3/4" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonBlock className="mt-2 h-7 w-28" />
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <SkeletonBlock className="h-10 rounded-xl" />
          <SkeletonBlock className="h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function CategoryPageLoading() {
  return (
    <div className="section-shell py-10 lg:py-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-4 w-12 rounded-full" />
        <SkeletonBlock className="h-3 w-3 rounded-full" />
        <SkeletonBlock className="h-4 w-24 rounded-full" />
      </div>

      {/* Heading */}
      <div className="mt-4 flex flex-col gap-3">
        <SkeletonBlock className="h-10 w-64 rounded-xl" />
        <SkeletonBlock className="h-5 w-full max-w-lg" />
      </div>

      {/* Main layout: sidebar + grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar filters skeleton */}
        <div className="hidden flex-col gap-4 lg:flex">
          <SkeletonBlock className="h-6 w-24" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
          <SkeletonBlock className="mt-4 h-6 w-20" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
          <SkeletonBlock className="mt-4 h-6 w-16" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product grid skeleton */}
        <div>
          {/* Toolbar */}
          <div className="mb-6 flex items-center justify-between">
            <SkeletonBlock className="h-5 w-32 rounded-full" />
            <div className="flex gap-3">
              <SkeletonBlock className="h-9 w-36 rounded-xl" />
              <SkeletonBlock className="h-9 w-24 rounded-xl" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
