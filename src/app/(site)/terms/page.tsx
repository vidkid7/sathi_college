import { PageHero } from "@/components/ui/PageHero";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms that govern SathiCollege admission guidance, predictors, content, communities and student support.",
  path: "/terms-of-service",
  noIndex: true
});

export default async function Page() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Terms of Service" description={`The rules that govern your use of ${s.siteName}.`} />
      <section className="container prose prose-lg dark:prose-invert max-w-3xl py-12">
        <p>By accessing or using {s.siteName}, you agree to be bound by these terms.</p>
        <h2>Use of services</h2>
        <p>Our predictors and guidance tools are informational. Final admissions are governed by the respective counselling authorities.</p>
        <h2>Intellectual property</h2>
        <p>All content on this site is owned by or licensed to {s.siteName}. Do not reproduce without permission.</p>
        <h2>Limitation of liability</h2>
        <p>We provide the service &quot;as-is&quot; without warranties. We are not liable for decisions taken based on tool outputs.</p>
      </section>
    </>
  );
}
