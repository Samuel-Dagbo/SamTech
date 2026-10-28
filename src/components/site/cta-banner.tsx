import { ButtonLink } from "@/components/ui/button";
import type { ProfileData } from "@/lib/types";

export function CtaBanner({ profile }: { profile: ProfileData }) {
  return (
    <section className="px-3 pt-8 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-5 rounded-[32px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Call to action
          </span>
          <h3 className="mt-3 max-w-3xl text-3xl leading-tight text-ink sm:text-4xl">
            Need a website or product that feels deliberate and works properly behind the scenes?
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-black/65 sm:text-base">
            I build for businesses, founders, and teams that need clean frontend execution with a
            strong backend foundation.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <ButtonLink href="/contact" size="lg">
            Start a conversation
          </ButtonLink>
          {profile.resumeUrl ? (
            <ButtonLink href={profile.resumeUrl} variant="outline" size="lg" external>
              Download CV
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
