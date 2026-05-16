import { PageHero } from "@/components/ui/PageHero";
import { MockTestDetailShell } from "@/components/mock/MockTestDetailShell";
import { getMockTest } from "@/lib/exam-catalog";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const test = getMockTest(params.slug);
  return buildMetadata({
    title: test.title,
    description: `Practice ${test.title} with instant scoring and answer review.`,
    path: `/mock-test/${test.slug}`,
    keywords: [test.title, "mock test", "engineering entrance practice"]
  });
}

export default function MockTestStart({ params }: { params: { slug: string } }) {
  const test = getMockTest(params.slug);
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: `/mock-test/${test.slug}`,
            name: test.title,
            description: `Practice ${test.title} with instant scoring, answer review and retake state.`
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Mock Tests", path: "/mock-test" },
            { name: test.title, path: `/mock-test/${test.slug}` }
          ]),
          softwareApplicationJsonLd({
            path: `/mock-test/${test.slug}`,
            name: test.title,
            description: `Free ${test.title} web mock test with answer review.`
          })
        ]}
      />
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
