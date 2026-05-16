import { PageHero } from "@/components/ui/PageHero";
import { RankPredictorForm } from "@/components/predictor/RankPredictorForm";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { getExamOption, normalizeExamSlug } from "@/lib/exam-catalog";

export async function generateMetadata({ params }: { params: { exam: string } }) {
  const slug = normalizeExamSlug(params.exam);
  const fallback = getExamOption(slug);
  const e = await db.exam.findUnique({ where: { slug } });
  return buildMetadata({
    title: `${e?.shortName ?? fallback.shortLabel} Rank Predictor`,
    description: `Estimate ${e?.shortName ?? fallback.shortLabel} rank from marks, percentile and category.`
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
        title={<>{exam?.name ?? fallback.label} <span className="gradient-text">Rank Predictor</span></>}
        description={`Predict your ${exam?.shortName ?? fallback.shortLabel} rank instantly using score, percentile-style bands and reservation category.`}
      />
      <section className="container py-12">
        <RankPredictorForm defaultExam={slug} />
      </section>
    </>
  );
}
