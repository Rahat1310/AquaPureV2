import Link from "next/link";

import { cn } from "@/lib/utils";

export interface BlogCardProps {
  title: string;
  category: string;
  readTime: string;
  href?: string;
  className?: string;
}

export function BlogCard({
  title,
  category,
  readTime,
  href = "/blog",
  className,
}: BlogCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-[0_18px_55px_rgba(25,65,130,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(25,65,130,0.14)]",
        className,
      )}
    >
      <Link href={href} className="relative block aspect-[1.9] overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100">
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-primary shadow-sm backdrop-blur">
          {category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <Link href={href}>
          <h3 className="line-clamp-2 text-base font-bold leading-6 tracking-tight text-slate-900 transition group-hover:text-primary">
            {title}
          </h3>
        </Link>
        <span className="mt-auto pt-4 text-xs font-medium text-slate-500">{readTime}</span>
      </div>
    </article>
  );
}
