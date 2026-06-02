import { PageHero } from "@/components/ui/PageHero";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About SathiCollege",
  description: "Learn how SathiCollege helps students search global programs, compare universities, review scholarships, use predictors and plan admissions.",
  path: "/about"
});

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={<>About <span className="gradient-text">{s.siteName}</span></>}
        description={s.description}
      />
      <section className="container py-12 prose prose-lg dark:prose-invert max-w-3xl">
        <h2>{s.about.title}</h2>
        <p style={{ whiteSpace: "pre-line" }}>{s.about.body}</p>
        <h2>What we offer</h2>
        <ul>
          <li>Global program and university search with tuition, intake and scholarship filters</li>
          <li>Rank and college predictors based on available admission and cutoff data</li>
          <li>Free mock tests and exam preparation resources where data is available</li>
          <li>Student communities for peer learning and admissions planning</li>
          <li>Guidance across course shortlisting, career pathways and university comparisons</li>
        </ul>
      </section>
    </>
  );
}
