import { PageHero } from "@/components/ui/PageHero";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy Policy" };

export default async function Page() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Privacy Policy" description={`How ${s.siteName} collects, uses and protects your data.`} />
      <section className="container prose prose-lg dark:prose-invert max-w-3xl py-12">
        <p>This Privacy Policy explains how {s.siteName} collects, uses, and discloses information about you when you use our services.</p>
        <h2>Information we collect</h2>
        <p>We collect information you provide such as name, email, phone number and exam preferences when you sign up or contact us.</p>
        <h2>How we use information</h2>
        <p>We use the information to provide career guidance, deliver counselling updates, run our predictors, and improve our services.</p>
        <h2>Sharing</h2>
        <p>We do not sell your personal information. We may share with trusted partners only to deliver the services you request.</p>
        <h2>Contact</h2>
        <p>If you have questions about this policy, contact us at <a href={`mailto:${s.email}`}>{s.email}</a>.</p>
      </section>
    </>
  );
}
