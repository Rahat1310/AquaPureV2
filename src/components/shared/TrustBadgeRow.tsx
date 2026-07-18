import {
  BadgeCheck,
  Clock3,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface TrustBadgeItem {
  title: string;
  detail: string;
  icon?: LucideIcon;
}

interface TrustBadgeRowProps {
  items?: TrustBadgeItem[];
  className?: string;
}

const defaultBadges: TrustBadgeItem[] = [
  { title: "Certified Quality", detail: "Trusted filtration", icon: BadgeCheck },
  { title: "Free Installation", detail: "Expert setup", icon: Wrench },
  { title: "Fast Delivery", detail: "Across Bangladesh", icon: Truck },
  { title: "Genuine Warranty", detail: "Direct support", icon: ShieldCheck },
  { title: "24/7 Assistance", detail: "We are always here", icon: Clock3 },
];

export function TrustBadgeRow({ items = defaultBadges, className }: TrustBadgeRowProps) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-px overflow-hidden rounded-2xl border border-blue-100 bg-blue-100 shadow-[0_14px_45px_rgba(25,65,130,0.07)] sm:grid-cols-2 lg:grid-cols-5",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon ?? ShieldCheck;

        return (
          <div
            key={item.title}
            className="flex w-full items-center gap-3 bg-white px-5 py-5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <strong className="block text-sm font-bold text-slate-900">{item.title}</strong>
              <span className="text-[11px] font-medium text-slate-500">{item.detail}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
