import { PageHero } from "@/components/ui/PageHero";
import { MockTestDetailShell } from "@/components/mock/MockTestDetailShell";
import { getMockTest } from "@/lib/exam-catalog";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const test = getMockTest(params.slug);
  return buildMetadata({
    title: test.title,
    description: `Practice ${test.title} with instant scoring and answer review.`
  });
}

export default function MockTestStart({ params }: { params: { slug: string } }) {
  const test = getMockTest(params.slug);
  return (
    <>
      <PageHero
        eyebrow="Mock Test"
        title={<>{test.title} <span className="gradient-text">Runner</span></>}
        description="Attempt a responsive test flow with progress, instant scoring, answer review and retake state."
      />
      <section className="container py-12">
        <MockTestDetailShell test={test} />
      </section>
    </>
  );
}
