import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";

const pages: Record<string, { title: string; description: string; icon: any; bullets: string[] }> = {
  home: {
    title: "Scholarship Guidance",
    description: "A focused scholarship assistance surface for eligible students who need help preparing applications and documents.",
    icon: GraduationCap,
    bullets: ["Eligibility discovery", "Document checklist", "Application deadline tracking", "Counsellor callback"]
  },
  apply: {
    title: "Apply for Scholarship Guidance",
    description: "Share your details and our counselling team will help you understand available scholarship pathways.",
    icon: Sparkles,
    bullets: ["Student profile review", "Exam and board details", "Financial-aid readiness", "Application next steps"]
  },
  "privacy-policy": {
    title: "Scholarship Privacy Policy",
    description: "How scholarship enquiry data is handled for counselling and application support.",
    icon: ShieldCheck,
    bullets: ["Data used only for requested guidance", "No sale of personal information", "Opt out by contacting support"]
  },
  "cookie-policy": {
    title: "Scholarship Cookie Policy",
    description: "Cookie and analytics notes for improving the scholarship guidance experience.",
    icon: FileText,
    bullets: ["Essential cookies for forms", "Analytics for page quality", "Browser controls for cookie preferences"]
  },
  partners: {
    title: "Scholarship Partners",
    description: "Partner-ready page for universities, mentors and scholarship support organizations.",
    icon: CheckCircle2,
    bullets: ["Verified partner profiles", "Transparent student support", "Lead routing with admin visibility"]
  },
  testimonials: {
    title: "Scholarship Testimonials",
    description: "Student outcomes and counselling stories can be managed as content from the admin panel.",
    icon: Sparkles,
    bullets: ["Application confidence", "Better document readiness", "Clear counselling steps"]
  },
  about: {
    title: "About Scholarship Guidance",
    description: "A practical support channel for students comparing admissions, fees and financial-aid options.",
    icon: GraduationCap,
    bullets: ["Student-first counselling", "Exam-aware guidance", "Transparent follow-up"]
  },
  "terms-of-service": {
    title: "Scholarship Terms of Service",
    description: "Terms that govern the scholarship guidance and application-support experience.",
    icon: FileText,
    bullets: ["Guidance is informational", "Final decisions belong to institutions", "Applicants must provide accurate data"]
  }
};

function pageKey(slug?: string[]) {
  return slug?.join("/") || "home";
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
  const page = pages[pageKey(params.slug)] || pages.home;
  return buildMetadata({ title: page.title, description: page.description });
}

export default function ScholarshipPage({ params }: { params: { slug?: string[] } }) {
  const key = pageKey(params.slug);
  const page = pages[key] || pages.home;
  const Icon = page.icon;
  const isApply = key === "apply" || key === "home";

  return (
    <>
      <PageHero
        eyebrow="Scholarship"
        title={<>{page.title.split(" ").slice(0, -1).join(" ")} <span className="gradient-text">{page.title.split(" ").slice(-1)}</span></>}
        description={page.description}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/scholarship/apply" className="btn-primary">
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn-ghost">Talk to Counsellor</Link>
        </div>
      </PageHero>

      <section className="container grid gap-6 py-12 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1" hover={false}>
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
            <Icon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold">What this page covers</h2>
          <div className="mt-5 grid gap-3">
            {page.bullets.map((bullet) => (
              <p key={bullet} className="flex items-start gap-2 text-sm text-[rgb(var(--fg-muted))]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {bullet}
              </p>
            ))}
          </div>
        </GlassCard>

        {isApply ? (
          <ContactForm source="scholarship" />
        ) : (
          <GlassCard className="prose prose-lg max-w-none dark:prose-invert lg:col-span-2" hover={false}>
            <p>{page.description}</p>
            <p>
              This page is prepared as an original, admin-editable scholarship support surface. Replace or expand this copy from
              the admin content workflow when you have final legal, partner or testimonial material.
            </p>
          </GlassCard>
        )}
      </section>
    </>
  );
}
