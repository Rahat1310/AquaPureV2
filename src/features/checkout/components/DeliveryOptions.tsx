"use client";

import { Clock, Truck, Wrench, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DeliveryOption, InstallationOption } from "@/features/checkout/types";

interface DeliveryOptionsProps {
  deliveryOption: DeliveryOption;
  installationOption: InstallationOption;
  onDeliveryChange: (option: DeliveryOption) => void;
  onInstallationChange: (option: InstallationOption) => void;
}

const DELIVERY_OPTIONS: {
  value: DeliveryOption;
  label: string;
  detail: string;
  price: string;
  icon: React.ElementType;
}[] = [
  {
    value: "STANDARD",
    label: "Standard Delivery",
    detail: "3–5 business days",
    price: "Free",
    icon: Truck,
  },
  {
    value: "EXPRESS",
    label: "Express Delivery",
    detail: "1–2 business days",
    price: "BDT 299",
    icon: Zap,
  },
];

const INSTALLATION_OPTIONS: {
  value: InstallationOption;
  label: string;
  detail: string;
  icon: React.ElementType;
}[] = [
  {
    value: "SELF",
    label: "Self Installation",
    detail: "Manual provided",
    icon: Wrench,
  },
  {
    value: "SCHEDULED",
    label: "Professional Installation",
    detail: "Technician will call to schedule",
    icon: Clock,
  },
];

export function DeliveryOptions({
  deliveryOption,
  installationOption,
  onDeliveryChange,
  onInstallationChange,
}: DeliveryOptionsProps) {
  return (
    <div className="space-y-6">
      {/* Delivery Speed */}
      <div>
        <p className="mb-3 text-sm font-bold text-slate-900">Delivery Speed</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {DELIVERY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = deliveryOption === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                id={`delivery-${opt.value.toLowerCase()}`}
                onClick={() => onDeliveryChange(opt.value)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                  selected
                    ? "border-primary bg-secondary/50 shadow-[0_0_0_4px_rgba(27,79,209,0.08)]"
                    : "border-border bg-white hover:border-primary/30",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl",
                    selected ? "bg-primary text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-900">
                    {opt.label}
                  </span>
                  <span className="text-xs text-slate-500">{opt.detail}</span>
                  <span
                    className={cn(
                      "mt-1 block text-sm font-extrabold",
                      opt.price === "Free" ? "text-emerald-600" : "text-slate-700",
                    )}
                  >
                    {opt.price}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Installation */}
      <div>
        <p className="mb-3 text-sm font-bold text-slate-900">Installation</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {INSTALLATION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = installationOption === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                id={`installation-${opt.value.toLowerCase()}`}
                onClick={() => onInstallationChange(opt.value)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                  selected
                    ? "border-primary bg-secondary/50 shadow-[0_0_0_4px_rgba(27,79,209,0.08)]"
                    : "border-border bg-white hover:border-primary/30",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl",
                    selected ? "bg-primary text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-900">
                    {opt.label}
                  </span>
                  <span className="text-xs text-slate-500">{opt.detail}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
