import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { mockTests } from "@/lib/exam-catalog";
import { MockTestExperience } from "@/components/mock/MockTestExperience";

export const metadata = buildMetadata({
  title: "Mock Tests",
  description: "Free full-length mock tests for JEE, EAMCET and other engineering exams."
});

export default function MockTestPage() {
  return (
    <>
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
