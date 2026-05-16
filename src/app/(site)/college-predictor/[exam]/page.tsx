import { PageHero } from "@/components/ui/PageHero";
import { CollegePredictorForm } from "@/components/predictor/CollegePredictorForm";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { getExamOption, normalizeExamSlug } from "@/lib/exam-catalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { exam: string } }) {
  const slug = normalizeExamSlug(params.exam);
  const fallback = getExamOption(slug);
  const e = await db.exam.findUnique({ where: { slug } });
  return buildMetadata({
    title: `${e?.shortName ?? fallback.shortLabel} College Predictor`,
    description: `Find likely colleges from ${e?.shortName ?? fallback.shortLabel} rank, category and cutoff trends.`,
    path: `/college-predictor/${slug}`,
    keywords: [`${e?.shortName ?? fallback.shortLabel} college predictor`, `${e?.shortName ?? fallback.shortLabel} cutoff`, `${e?.shortName ?? fallback.shortLabel} counselling`]
  });
}

export default async function Page({ params }: { params: { exam: string } }) {
  const slug = normalizeExamSlug(params.exam);
  const fallback = getExamOption(slug);
  const exam = await db.exam.findUnique({ where: { slug } });
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: `/college-predictor/${slug}`,
            name: `${exam?.shortName ?? fallback.shortLabel} College Predictor`,
            description: `Find ${exam?.shortName ?? fallback.shortLabel} colleges based on rank, category and cutoff ranges.`
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "College Predictor", path: "/college-predictor" },
            { name: `${exam?.shortName ?? fallback.shortLabel} College Predictor`, path: `/college-predictor/${slug}` }
          ]),
          softwareApplicationJsonLd({
            path: `/college-predictor/${slug}`,
            name: `${exam?.shortName ?? fallback.shortLabel} College Predictor`,
            description: `Free ${exam?.shortName ?? fallback.shortLabel} college prediction tool for counselling choices.`
          })
        ]}
      />
      <PageHero
        eyebrow={exam?.shortName ?? fallback.shortLabel}
        title={<>{exam?.name ?? fallback.label} <span className="gradient-text">College Predictor</span></>}
        description={`Find ${exam?.shortName ?? fallback.shortLabel} colleges based on your rank, category and previous cutoff ranges.`}
      />
      <section className="container py-12">
        <CollegePredictorForm defaultExam={slug} />
      </section>
    </>
  );
}
