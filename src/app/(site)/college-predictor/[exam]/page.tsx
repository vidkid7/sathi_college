import { PageHero } from "@/components/ui/PageHero";
import { CollegePredictorForm } from "@/components/predictor/CollegePredictorForm";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { getExamOption, normalizeExamSlug } from "@/lib/exam-catalog";

export async function generateMetadata({ params }: { params: { exam: string } }) {
  const slug = normalizeExamSlug(params.exam);
  const fallback = getExamOption(slug);
  const e = await db.exam.findUnique({ where: { slug } });
  return buildMetadata({
    title: `${e?.shortName ?? fallback.shortLabel} College Predictor`,
    description: `Find likely colleges from ${e?.shortName ?? fallback.shortLabel} rank, category and cutoff trends.`
  });
}

export default async function Page({ params }: { params: { exam: string } }) {
  const slug = normalizeExamSlug(params.exam);
  const fallback = getExamOption(slug);
  const exam = await db.exam.findUnique({ where: { slug } });
  return (
    <>
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
