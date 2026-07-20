"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/features/portal/actions";

interface ProfileSettingsFormProps {
  name: string;
  email: string;
  phone: string | null;
}

export function ProfileSettingsForm({
  name,
  email,
  phone,
}: ProfileSettingsFormProps) {
  const [formName, setFormName] = useState(name);
  const [formPhone, setFormPhone] = useState(phone ?? "");
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfile({
        name: formName,
        phone: formPhone,
      });
      if (!result.ok) {
        setMessage({ type: "err", text: result.error });
        return;
      }
      setMessage({ type: "ok", text: "Profile updated." });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="profile-name"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          Full Name
        </label>
        <Input
          id="profile-name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          required
          minLength={2}
        />
      </div>
      <div>
        <label
          htmlFor="profile-email"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          Email
        </label>
        <Input id="profile-email" value={email} disabled readOnly />
        <p className="mt-1 text-xs text-slate-400">Email cannot be changed here.</p>
      </div>
      <div>
        <label
          htmlFor="profile-phone"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          Phone
        </label>
        <Input
          id="profile-phone"
          value={formPhone}
          onChange={(e) => setFormPhone(e.target.value)}
          placeholder="01700000000"
        />
      </div>
      {message && (
        <p
          className={
            message.type === "ok"
              ? "text-sm font-medium text-emerald-700"
              : "text-sm font-medium text-rose-600"
          }
        >
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Profile"}
      </Button>
    </form>
  );
}
