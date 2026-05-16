import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { mockTests } from "@/lib/exam-catalog";
import { MockTestExperience } from "@/components/mock/MockTestExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Mock Tests",
  description: "Free full-length mock tests for JEE, EAMCET and other engineering entrance exams with instant scoring and answer review.",
  path: "/mock-test",
  keywords: ["free engineering mock test", "JEE mock test", "EAMCET mock test", "entrance exam practice test"]
});

export default function MockTestPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/mock-test",
            name: "Engineering entrance mock tests",
            description: "Practice engineering entrance exams with free mock tests, instant scoring and answer review."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Mock Tests", path: "/mock-test" }
          ]),
          itemListJsonLd({
            path: "/mock-test",
            name: "SathiCollege mock tests",
            items: mockTests.map((test) => ({
              name: test.title,
              path: `/mock-test/${test.slug}`,
              description: `Practice ${test.title} with instant scoring and solutions.`
            }))
          }),
          softwareApplicationJsonLd({
            path: "/mock-test",
            name: "SathiCollege Mock Test Platform",
            description: "Free web-based mock test platform for engineering entrance exam practice."
          })
        ]}
      />
      <PageHero
        eyebrow="Practice"
        title={<>Mock <span className="gradient-text">Tests</span></>}
        description="Test your exam preparation with full-length mock tests. Get instant scores with detailed solutions."
      />
      <section className="container py-12">
        <MockTestExperience tests={mockTests} />
      </section>
    </>
  );
}
