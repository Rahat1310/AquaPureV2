"use client";

import { useState, useTransition } from "react";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "@/features/portal/actions";

export type PortalAddress = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  district: string;
  postCode: string | null;
  isDefault: boolean;
};

type FormState = {
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  district: string;
  postCode: string;
  isDefault: boolean;
};

const emptyForm = (): FormState => ({
  label: "Home",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  district: "",
  postCode: "",
  isDefault: false,
});

function toForm(address: PortalAddress): FormState {
  return {
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    district: address.district,
    postCode: address.postCode ?? "",
    isDefault: address.isDefault,
  };
}

interface AddressManagerProps {
  addresses: PortalAddress[];
}

export function AddressManager({ addresses }: AddressManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setShowForm(true);
  }

  function openEdit(address: PortalAddress) {
    setEditingId(address.id);
    setForm(toForm(address));
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = editingId
        ? await updateAddress(editingId, form)
        : await createAddress(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      closeForm();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteAddress(id);
      if (!result.ok) setError(result.error);
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultAddress(id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Manage delivery addresses for faster checkout.
        </p>
        {!showForm && (
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="size-4" /> Add Address
          </Button>
        )}
      </div>

      {error && !showForm && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      {showForm && (
        <Card className="border-blue-100/80 bg-white/90 backdrop-blur">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-base">
              {editingId ? "Edit Address" : "New Address"}
            </CardTitle>
            <Button type="button" variant="ghost" size="icon" onClick={closeForm}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Label" htmlFor="addr-label">
                  <Input
                    id="addr-label"
                    value={form.label}
                    onChange={(e) => updateField("label", e.target.value)}
                    placeholder="Home"
                    required
                  />
                </Field>
                <Field label="Recipient Name" htmlFor="addr-name">
                  <Input
                    id="addr-name"
                    value={form.recipientName}
                    onChange={(e) => updateField("recipientName", e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </Field>
                <Field label="Phone" htmlFor="addr-phone">
                  <Input
                    id="addr-phone"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="01700000000"
                    required
                  />
                </Field>
                <Field label="Post Code" htmlFor="addr-post">
                  <Input
                    id="addr-post"
                    value={form.postCode}
                    onChange={(e) => updateField("postCode", e.target.value)}
                    placeholder="Optional"
                  />
                </Field>
              </div>
              <Field label="Street Address" htmlFor="addr-line1">
                <Input
                  id="addr-line1"
                  value={form.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  placeholder="House / Flat / Road"
                  required
                />
              </Field>
              <Field label="Area / Block (optional)" htmlFor="addr-line2">
                <Input
                  id="addr-line2"
                  value={form.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                  placeholder="Apartment, suite, etc."
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" htmlFor="addr-city">
                  <Input
                    id="addr-city"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    required
                  />
                </Field>
                <Field label="District" htmlFor="addr-district">
                  <Input
                    id="addr-district"
                    value={form.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    required
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => updateField("isDefault", e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary/20"
                />
                Set as default address
              </label>
              {error && (
                <p className="text-sm font-medium text-rose-600">{error}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={pending}>
                  {pending
                    ? "Saving…"
                    : editingId
                      ? "Save Changes"
                      : "Add Address"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-blue-200 bg-white/60 py-16 text-center backdrop-blur">
          <div className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
            <MapPin className="size-7" />
          </div>
          <p className="font-bold text-slate-900">No saved addresses</p>
          <p className="text-sm text-slate-500">
            Add one to speed up your next checkout.
          </p>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="size-4" /> Add Address
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id}>
              <Card className="h-full border-blue-100/80 bg-white/85 backdrop-blur">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                        <MapPin className="size-4" />
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{address.label}</p>
                        <p className="text-sm text-slate-500">
                          {address.recipientName}
                        </p>
                      </div>
                    </div>
                    {address.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <div className="text-sm leading-relaxed text-slate-600">
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.district}
                      {address.postCode ? ` — ${address.postCode}` : ""}
                    </p>
                    <p className="mt-1 font-medium text-slate-700">
                      {address.phone}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {!address.isDefault && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Star className="size-3.5" /> Default
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => openEdit(address)}
                    >
                      <Pencil className="size-3.5" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
