import { CtaBanner } from "@/components/site/cta-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getPublicContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getPublicContent();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      {children}
      <CtaBanner profile={profile} />
      <SiteFooter profile={profile} />
    </div>
  );
}
