import { CollegeComparison } from "@/components/site/CollegeComparison";
import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { titleFromSlug } from "@/lib/exam-catalog";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return buildMetadata({
    title: `${titleFromSlug(params.slug)} Comparison`,
    description: "Compare this college with other engineering options by fees, rating, location and admission fit."
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
