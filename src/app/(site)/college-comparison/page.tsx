import { CollegeComparison } from "@/components/site/CollegeComparison";
import { PageHero } from "@/components/ui/PageHero";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";
import { BarChart3, GitCompareArrows, GraduationCap } from "lucide-react";

export const metadata = buildMetadata({
  title: "College Comparison",
  description: "Compare engineering colleges by fees, rating, location, type and admission fit."
});

export const dynamic = "force-dynamic";

export default async function CollegeComparisonPage() {
  let colleges: any[] = [];
  try {
    colleges = await db.college.findMany({ orderBy: [{ featured: "desc" }, { rating: "desc" }] });
  } catch {}

  return (
    <>
      <PageHero
        eyebrow="Compare"
        title={<>College <span className="gradient-text">Comparison</span></>}
        description="Compare colleges side by side before locking your counselling preference order."
      />
      <section className="container py-12">
        <div className="reference-panel mb-6 grid items-center gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h2 className="font-display text-2xl font-extrabold">Compare & Decide Better</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgb(var(--fg-muted))]">
              Compare colleges side by side on fees, rating, location, type, and fit before finalising your counselling list.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { title: "College Comparison", detail: "Side-by-side factors", icon: GitCompareArrows, tone: "text-emerald-600 bg-emerald-500/10" },
                { title: "Branch Predictor", detail: "Rank-based choices", icon: GraduationCap, tone: "text-rose-600 bg-rose-500/10" },
                { title: "Cutoff Trends", detail: "Past-year movement", icon: BarChart3, tone: "text-blue-600 bg-blue-500/10" }
              ].map((item) => (
                <div key={item.title} className="soft-card p-4">
                  <span className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${item.tone}`}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs text-[rgb(var(--fg-muted))]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <ReferenceVisual name="scale" className="mx-auto h-64 w-full object-contain" />
        </div>
        <CollegeComparison colleges={colleges} />
      </section>
    </>
  );
}
