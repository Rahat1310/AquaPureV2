/**
 * Homepage loading skeleton — matches the actual section layout:
 * hero → trust badges → category grid → product card grid
 */
function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ""}`} />;
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      {/* image */}
      <SkeletonBlock className="aspect-[1.08] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-6">
        {/* stars */}
        <SkeletonBlock className="h-4 w-24" />
        {/* title */}
        <SkeletonBlock className="h-5 w-full" />
        <SkeletonBlock className="h-5 w-3/4" />
        {/* badges */}
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
        {/* price */}
        <SkeletonBlock className="mt-2 h-7 w-28" />
        {/* buttons */}
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <SkeletonBlock className="h-10 rounded-xl" />
          <SkeletonBlock className="h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <SkeletonBlock className="size-12 rounded-2xl" />
      <SkeletonBlock className="h-6 w-32" />
      <SkeletonBlock className="h-4 w-20" />
      <SkeletonBlock className="h-5 w-16" />
    </div>
  );
}

export default function HomePageLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="water-grid relative overflow-x-clip border-b border-blue-100">
        <div className="section-shell grid min-h-[600px] items-center gap-12 py-16 lg:grid-cols-[1.04fr_.96fr] lg:py-20">
          <div className="flex flex-col gap-5">
            <SkeletonBlock className="h-8 w-72 rounded-full" />
            <SkeletonBlock className="h-14 w-full max-w-xl" />
            <SkeletonBlock className="h-14 w-4/5 max-w-lg" />
            <SkeletonBlock className="h-6 w-full max-w-md" />
            <SkeletonBlock className="h-6 w-3/4 max-w-sm" />
            <div className="flex gap-3">
              <SkeletonBlock className="h-12 w-44 rounded-xl" />
              <SkeletonBlock className="h-12 w-44 rounded-xl" />
            </div>
          </div>
          <SkeletonBlock className="aspect-square w-full max-w-[480px] rounded-[32px]" />
        </div>
      </section>

      {/* Trust badge row */}
      <section className="py-6">
        <div className="section-shell grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </section>

      {/* Categories section */}
      <section className="py-16 md:py-24">
        <div className="section-shell">
          <div className="mb-10 flex flex-col items-center gap-3">
            <SkeletonBlock className="h-5 w-28 rounded-full" />
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="h-5 w-96" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="border-y border-blue-100 bg-[#f7faff] py-16 md:py-24">
        <div className="section-shell">
          <div className="mb-9 flex flex-col gap-3">
            <SkeletonBlock className="h-5 w-28 rounded-full" />
            <SkeletonBlock className="h-8 w-48" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
