import type { ComponentProps } from "react";

const fieldClasses =
  "w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink outline-none ring-0 transition placeholder:text-black/35 focus:border-forest focus-visible:outline-2 focus-visible:outline-forest/60 disabled:opacity-60";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${fieldClasses} h-12 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${fieldClasses} min-h-32 py-3 ${className}`} {...props} />;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-clay-strong">{message}</p>;
}

export function Label({ className = "", ...props }: ComponentProps<"label">) {
  return (
    <label className={`block text-xs font-semibold uppercase tracking-[0.16em] text-ink/70 ${className}`} {...props} />
  );
}
