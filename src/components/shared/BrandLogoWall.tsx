import { cn } from "@/lib/utils";

export interface BrandLogo {
  name: string;
  wordmark?: string;
  hoverClassName?: string;
}

interface BrandLogoWallProps {
  brands?: BrandLogo[];
  className?: string;
}

const defaultBrands: BrandLogo[] = [
  { name: "Pentair", wordmark: "PENTAIR", hoverClassName: "hover:text-[#0067a0]" },
  { name: "3M", wordmark: "3M", hoverClassName: "hover:text-[#e21d2b]" },
  { name: "Kent", wordmark: "KENT", hoverClassName: "hover:text-[#087cc1]" },
  { name: "Pureit", wordmark: "pureit", hoverClassName: "hover:text-[#1d77ba]" },
  { name: "A. O. Smith", wordmark: "A. O. SMITH", hoverClassName: "hover:text-[#e52b2f]" },
  { name: "Blue Star", wordmark: "BLUE STAR", hoverClassName: "hover:text-[#0077b8]" },
  { name: "Aquaguard", wordmark: "AQUAGUARD", hoverClassName: "hover:text-[#1559a5]" },
  { name: "Livpure", wordmark: "LIVPURE", hoverClassName: "hover:text-[#6f2d91]" },
];

export function BrandLogoWall({ brands = defaultBrands, className }: BrandLogoWallProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_16px_50px_rgba(25,65,130,0.07)] sm:grid-cols-4 lg:grid-cols-8",
        className,
      )}
      aria-label="Brands we work with"
    >
      {brands.map((brand) => (
        <div
          key={brand.name}
          title={brand.name}
          className={cn(
            "group grid min-h-24 place-items-center border-b border-r border-blue-50 px-4 text-center text-base font-black tracking-[-0.04em] text-slate-400 grayscale transition duration-300 hover:bg-blue-50/40 hover:grayscale-0",
            brand.hoverClassName,
          )}
        >
          <span className="transition duration-300 group-hover:scale-105">
            {brand.wordmark ?? brand.name}
          </span>
        </div>
      ))}
    </div>
  );
}
