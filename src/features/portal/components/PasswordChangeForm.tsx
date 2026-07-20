"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/features/portal/actions";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (!result.ok) {
        setMessage({ type: "err", text: result.error });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "ok", text: "Password changed successfully." });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="current-password"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          Current Password
        </label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label
          htmlFor="new-password"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          New Password
        </label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <div>
        <label
          htmlFor="confirm-password"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          Confirm New Password
        </label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
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
        {pending ? "Updating…" : "Change Password"}
      </Button>
    </form>
  );
}
