import { PageHero } from "@/components/ui/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calculator, GraduationCap } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { safeImageSrc } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";
import { examImageFor, realImageOr } from "@/lib/real-images";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const e = await db.exam.findUnique({ where: { slug: params.slug } });
  if (!e) return buildMetadata({ title: "Exam" });
  return buildMetadata({
    title: e.name,
    description: e.description,
    path: `/exams/${e.slug}`,
    image: e.heroImage,
    keywords: [e.name, e.shortName, `${e.shortName} rank predictor`, `${e.shortName} college predictor`, `${e.shortName} counselling`]
  });
}

export default async function ExamDetail({ params }: { params: { slug: string } }) {
  const exam = await db.exam.findUnique({ where: { slug: params.slug } });
  if (!exam) notFound();
  const examImage = safeImageSrc(realImageOr(exam.heroImage, examImageFor({ name: exam.name, category: exam.category })), "");
  const examSections = [
    {
      id: "eligibility",
      title: "Eligibility",
      body: `${exam.shortName} eligibility depends on the official exam authority, academic background, qualifying marks and category rules. Use this page as a planning hub and verify final rules from the official notice.`
    },
    {
      id: "syllabus",
      title: "Syllabus",
      body: `${exam.shortName} preparation should start with the current syllabus, high-weightage topics and previous trend analysis before moving into mocks.`
    },
    {
      id: "exam-pattern",
      title: "Exam Pattern",
      body: `Check the latest ${exam.shortName} paper pattern, marking scheme, duration and subject split before building a test strategy.`
    },
    {
      id: "preparation",
      title: "How to Prepare",
      body: `Build a weekly ${exam.shortName} plan with concept revision, timed practice, error logs, mock analysis and counselling-ready college shortlists.`
    },
    {
      id: "previous-year-question-paper",
      title: "Previous Year Question Paper",
      body: `Use previous ${exam.shortName} question papers to understand question style, repeated concepts, speed requirements and realistic score targets.`
    }
  ];
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: `/exams/${exam.slug}`,
            name: exam.name,
            description: exam.description,
            type: "EducationalOccupationalProgram"
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Exams", path: "/exams" },
            { name: exam.name, path: `/exams/${exam.slug}` }
          ]),
          softwareApplicationJsonLd({
            path: `/rank-predictor/${exam.slug}`,
            name: `${exam.shortName} Rank Predictor`,
            description: `Estimate ${exam.shortName} rank from marks, category and score range.`
          }),
          softwareApplicationJsonLd({
            path: `/college-predictor/${exam.slug}`,
            name: `${exam.shortName} College Predictor`,
            description: `Find likely engineering colleges from ${exam.shortName} rank and cutoff trends.`
          })
        ]}
      />
      <PageHero eyebrow={exam.shortName} title={<>{exam.name}</>} description={exam.description} />
      <section className="container grid gap-6 py-12 md:grid-cols-2">
        {examImage && (
          <GlassCard hover={false} className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={examImage} alt={`${exam.name} logo`} className="mx-auto h-36 w-full max-w-md rounded-lg bg-white/80 object-contain p-6 dark:bg-white/90" loading="eager" decoding="async" />
          </GlassCard>
        )}
        <Link href={`/rank-predictor/${exam.slug}`} className="block">
          <GlassCard className="h-full">
            <ReferenceVisual name="dashboard" className="mb-4 h-36 w-full rounded-lg bg-gradient-to-br from-blue-50 to-sky-100 object-contain p-3 dark:from-slate-900 dark:to-blue-950" />
            <div className="flex items-center gap-3">
              <span className="icon-tile"><Calculator className="h-5 w-5" /></span>
              <h3 className="font-display text-lg font-bold">{exam.shortName} Rank Predictor</h3>
            </div>
            <p className="mt-3 text-sm text-[rgb(var(--fg-muted))]">Predict your rank instantly based on marks and category.</p>
          </GlassCard>
        </Link>
        <Link href={`/college-predictor/${exam.slug}`} className="block">
          <GlassCard className="h-full">
            <ReferenceVisual name="campus" className="mb-4 h-36 w-full rounded-lg bg-gradient-to-br from-blue-50 to-sky-100 object-contain p-3 dark:from-slate-900 dark:to-blue-950" />
            <div className="flex items-center gap-3">
              <span className="icon-tile"><GraduationCap className="h-5 w-5" /></span>
              <h3 className="font-display text-lg font-bold">{exam.shortName} College Predictor</h3>
            </div>
            <p className="mt-3 text-sm text-[rgb(var(--fg-muted))]">Find colleges you can get based on rank and category.</p>
          </GlassCard>
        </Link>
        <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
          {examSections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <GlassCard hover={false} className="h-full">
                <h2 className="font-display text-xl font-bold">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[rgb(var(--fg-muted))]">{section.body}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
