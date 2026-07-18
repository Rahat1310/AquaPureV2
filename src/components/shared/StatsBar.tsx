import { Award, Building2, Droplets, Users, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StatItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface StatsBarProps {
  items?: StatItem[];
  className?: string;
}

const defaultStats: StatItem[] = [
  { value: "12K+", label: "Happy families", icon: Users },
  { value: "850+", label: "Business installations", icon: Building2 },
  { value: "99.9%", label: "Purification confidence", icon: Droplets },
  { value: "15+", label: "Years of water expertise", icon: Award },
];

export function StatsBar({ items = defaultStats, className }: StatsBarProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[#123a9b] px-5 py-7 text-white shadow-[0_20px_50px_rgba(18,58,155,0.2)] sm:px-8",
        className,
      )}
      role="group"
      aria-label="AquaPure at a glance"
    >
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-4">
        {items.map((item) => {
          const Icon = item.icon ?? Droplets;

          return (
            <div
              key={`${item.label}-${item.value}`}
              className="flex min-w-0 items-center justify-center gap-3 rounded-xl bg-white/5 px-4 py-3"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-sky-300">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 text-left">
                <strong className="block text-2xl font-extrabold tracking-tight">{item.value}</strong>
                <span className="text-xs font-medium text-blue-100">{item.label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
