import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsSection } from "@/components/landing/stats";
import { LatestReports } from "@/components/landing/latest-reports";
import { Categories } from "@/components/landing/categories";
import { CtaSection } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { getPublishedReports, getCategories, getStats } from "@/lib/data";
import { JsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [reports, categories, stats] = await Promise.all([
    getPublishedReports({ limit: 8 }),
    getCategories(),
    getStats(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Temuin",
    url: siteUrl,
    description: "Barang hilang? Temuin aja. Platform AI Lost & Found untuk Indonesia.",
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/reports?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Temuin",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
  };

  return (
    <>
      <JsonLd data={webSiteLd} />
      <JsonLd data={orgLd} />
      <Hero />
      <HowItWorks />
      <StatsSection stats={stats} />
      <LatestReports reports={reports} />
      <CtaSection />
      <Categories categories={categories} />
      <Faq />
    </>
  );
}
