import type { ComponentProps, ReactNode } from "react";

const toneClasses = {
  neutral: "border-black/10 bg-white/70 text-ink",
  clay: "border-clay/20 bg-clay/10 text-clay-strong",
  forest: "border-forest/15 bg-forest/10 text-forest",
} as const;

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel backdrop-blur ${className}`}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}`}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
      {copy ? <p className="mt-4 text-sm leading-8 text-black/65 sm:text-base">{copy}</p> : null}
    </div>
  );
}
