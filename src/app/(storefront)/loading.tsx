/**
 * Homepage loading skeleton — matches the actual section layout:
 * hero → featured products → featured accessories
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

export default function HomePageLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="water-grid relative overflow-x-clip border-b border-blue-100">
        <div className="section-shell grid min-h-[600px] items-center gap-12 py-16 lg:grid-cols-[2fr_3fr] lg:py-20">
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
          <SkeletonBlock className="aspect-[4/3] w-full rounded-[32px]" />
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

      {/* Featured accessories */}
      <section className="py-16 md:py-24">
        <div className="section-shell">
          <div className="mb-9 flex flex-col gap-3">
            <SkeletonBlock className="h-5 w-28 rounded-full" />
            <SkeletonBlock className="h-8 w-56" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={`acc-${i}`} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
