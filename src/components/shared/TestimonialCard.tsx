import { BadgeCheck, Quote, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role?: string;
  location?: string;
  rating?: number;
  initials?: string;
  verified?: boolean;
  className?: string;
}

export function TestimonialCard({
  quote,
  name,
  role,
  location,
  rating = 5,
  initials,
  verified = true,
  className,
}: TestimonialCardProps) {
  const avatarInitials =
    initials ??
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(25,65,130,0.14)]",
        className,
      )}
    >
      <Quote
        aria-hidden
        className="pointer-events-none absolute right-5 top-5 size-8 fill-blue-50 text-blue-100"
      />
      <div className="relative z-10 mb-5 flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              "size-4",
              index < rating
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-100 text-slate-200",
            )}
          />
        ))}
      </div>
      <blockquote className="relative z-10 flex-1 pr-10 text-[15px] leading-7 text-slate-600">
        “{quote}”
      </blockquote>
      <div className="relative z-10 mt-6 flex items-center gap-3 border-t border-blue-50 pt-5">
        <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-sky-400 text-sm font-extrabold text-white">
          {avatarInitials}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <strong className="truncate text-sm font-bold text-slate-900">{name}</strong>
            {verified && <BadgeCheck className="size-4 fill-primary text-white" />}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {[role, location].filter(Boolean).join(" · ")}
          </span>
        </span>
      </div>
    </Card>
  );
}
