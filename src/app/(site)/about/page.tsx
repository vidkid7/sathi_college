import { PageHero } from "@/components/ui/PageHero";
import { getSettings } from "@/lib/settings";

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
          <li>Rank predictors for JEE, EAMCET, KCET, MHT-CET, KEAM, TNEA, WBJEE</li>
          <li>College predictors based on previous year cutoff data</li>
          <li>Free mock tests with detailed solutions</li>
          <li>Exam-specific WhatsApp communities for peer learning</li>
          <li>Mentorship from current students and alumni of top colleges</li>
        </ul>
      </section>
    </>
  );
}
