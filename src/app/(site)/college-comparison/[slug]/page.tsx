import { CollegeComparison } from "@/components/site/CollegeComparison";
import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { titleFromSlug } from "@/lib/exam-catalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return buildMetadata({
    title: `${titleFromSlug(params.slug)} Comparison`,
    description: "Compare this college with other engineering options by fees, rating, location and admission fit.",
    path: `/college-comparison/${params.slug}`
  });
}

export const dynamic = "force-dynamic";

export default async function CollegeComparisonDetailPage({ params }: { params: { slug: string } }) {
  let colleges: any[] = [];
  try {
    colleges = await db.college.findMany({ orderBy: [{ featured: "desc" }, { rating: "desc" }] });
  } catch {}
  const active = colleges.find((college) => college.slug === params.slug);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: `/college-comparison/${params.slug}`,
            name: `${active?.name ?? titleFromSlug(params.slug)} comparison`,
            description: "Compare this engineering college with alternatives by fees, location, type, rating and counselling fit."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "College Comparison", path: "/college-comparison" },
            { name: active?.name ?? titleFromSlug(params.slug), path: `/college-comparison/${params.slug}` }
          ]),
          softwareApplicationJsonLd({
            path: `/college-comparison/${params.slug}`,
            name: `${active?.name ?? titleFromSlug(params.slug)} comparison tool`,
            description: "Side-by-side college comparison for engineering counselling choices."
          })
        ]}
      />
      <PageHero
        eyebrow="College comparison"
        title={<>{active?.name ?? titleFromSlug(params.slug)} <span className="gradient-text">vs alternatives</span></>}
        description="Use this side-by-side view to compare counselling options before submitting preferences."
      />
      <section className="container py-12">
        <CollegeComparison colleges={colleges} defaultSlug={params.slug} />
      </section>
    </>
  );
}
