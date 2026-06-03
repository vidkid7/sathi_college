import Link from "next/link";
import { ArrowRight, BadgeCheck, GraduationCap, Search, Sparkles } from "lucide-react";

const brandLinks = [
  {
    title: "Course Finder",
    description: "Search courses, programs, tuition, intakes and eligibility from the SathiCollege database.",
    href: "/search-program",
    icon: Search
  },
  {
    title: "University Finder",
    description: "Compare universities and colleges across global study destinations.",
    href: "/colleges",
    icon: GraduationCap
  },
  {
    title: "Scholarship Search",
    description: "Find programs with scholarship and fee-support indicators where data is available.",
    href: "/search-program?quick=scholarship",
    icon: Sparkles
  }
];

export function BrandAuthority() {
  return (
    <section className="py-10 sm:py-12" aria-labelledby="sathicollege-official-heading">
      <div className="container">
        <div className="liquid-surface overflow-hidden p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <span className="badge mb-4">
                <BadgeCheck className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                Official SathiCollege Website
              </span>
              <h2 id="sathicollege-official-heading" className="font-display text-2xl font-extrabold sm:text-3xl">
                SathiCollege, also searched as Sathi College, is the official course and university finder at sathicollege.com.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[rgb(var(--fg-muted))] sm:text-base">
                Students use SathiCollege for global course search, university comparison, scholarships, tuition, intakes,
                eligibility, admission planning, predictors and study resources. The official website is
                <strong className="text-[rgb(var(--fg))]"> sathicollege.com</strong>.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {brandLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="soft-card group flex h-full flex-col p-4">
                    <span className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-base font-bold">{item.title}</span>
                    <span className="mt-2 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{item.description}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[rgb(var(--primary))] transition group-hover:gap-3">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
