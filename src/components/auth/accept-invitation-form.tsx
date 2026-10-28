"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

export function AcceptInvitationForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to activate the account.");
      }
      router.replace("/workspace");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to activate the account.");
      setBusy(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="invite-password">Choose a password</Label>
        <Input
          id="invite-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          placeholder="At least 12 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p className="text-xs text-black/50">Use at least 12 characters. A passphrase works well.</p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="invite-confirm">Confirm password</Label>
        <Input
          id="invite-confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          placeholder="Repeat the password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
        <FieldError message={error ?? undefined} />
      </div>
      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Activating…" : "Activate my account"}
      </Button>
    </form>
  );
}
