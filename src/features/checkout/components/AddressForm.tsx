"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { addressSchema, type AddressInput } from "@/features/checkout/schema";

interface AddressFormProps {
  defaultValues?: Partial<AddressInput>;
  onSubmit: (data: AddressInput) => void;
  formId?: string;
}

export function AddressForm({ defaultValues, onSubmit, formId = "address-form" }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Recipient name */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="recipientName">
          Recipient Name *
        </label>
        <Input
          id="recipientName"
          placeholder="Full name"
          {...register("recipientName")}
        />
        {errors.recipientName && (
          <p className="mt-1 text-xs text-rose-600">{errors.recipientName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="checkout-phone">
          Phone Number *
        </label>
        <Input
          id="checkout-phone"
          placeholder="e.g. 01700000000"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Line 1 */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="line1">
          Street Address *
        </label>
        <Input
          id="line1"
          placeholder="House / Flat / Road"
          {...register("line1")}
        />
        {errors.line1 && (
          <p className="mt-1 text-xs text-rose-600">{errors.line1.message}</p>
        )}
      </div>

      {/* Line 2 */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="line2">
          Area / Block (optional)
        </label>
        <Input
          id="line2"
          placeholder="Apartment, suite, etc."
          {...register("line2")}
        />
      </div>

      {/* City + District */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="city">
            City *
          </label>
          <Input id="city" placeholder="Dhaka" {...register("city")} />
          {errors.city && (
            <p className="mt-1 text-xs text-rose-600">{errors.city.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="district">
            District *
          </label>
          <Input id="district" placeholder="Dhaka" {...register("district")} />
          {errors.district && (
            <p className="mt-1 text-xs text-rose-600">{errors.district.message}</p>
          )}
        </div>
      </div>

      {/* Post code */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="postCode">
          Post Code (optional)
        </label>
        <Input id="postCode" placeholder="1200" {...register("postCode")} />
      </div>
    </form>
  );
}
