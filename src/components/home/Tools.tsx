"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReferenceVisual, type ReferenceVisualName } from "@/components/ui/ReferenceVisual";
import { formatCompactCount } from "@/lib/search-slugs";

export type HomeToolStats = {
  supportedPredictorExams: number;
  rankPredictions: number;
  colleges: number;
  cutoffs: number;
  mockTests: number;
  mockQuestions: number;
  communities: number;
  communityPosts: number;
  guides: number;
  guideCategories: number;
};

type ToolCard = {
  title: string;
  description: string;
  metric: string;
  cta: string;
  href: string;
  visual: ReferenceVisualName;
};

function numberText(value: number) {
  return formatCompactCount(Math.max(0, value || 0));
}

function buildTools(stats: HomeToolStats): ToolCard[] {
  return [
    {
      title: "Rank Predictor",
      description: `${numberText(stats.supportedPredictorExams)} supported exams with score-band estimates from predictor rules.`,
      metric: stats.rankPredictions > 0 ? `${numberText(stats.rankPredictions)} predictions generated` : "Ready for supported exams",
      cta: "Predict Now",
      href: "/rank-predictor",
      visual: "dashboard" as ReferenceVisualName
    },
    {
      title: "College Predictor",
      description: stats.cutoffs > 0
        ? `${numberText(stats.cutoffs)} cutoff rows matched against ${numberText(stats.colleges)} college records.`
        : `${numberText(stats.colleges)} college records available for rank-based matching.`,
      metric: stats.cutoffs > 0 ? "Cutoff-backed matching" : "College database matching",
      cta: "Find Colleges",
      href: "/college-predictor",
      visual: "campus" as ReferenceVisualName
    },
    {
      title: "Mock Tests",
      description: `${numberText(stats.mockTests)} practice sets with ${numberText(stats.mockQuestions)} catalogued questions.`,
      metric: "Instant scoring enabled",
      cta: "Start Test",
      href: "/mock-test",
      visual: "trophy" as ReferenceVisualName
    },
    {
      title: "Compare Colleges",
      description: `${numberText(stats.colleges)} colleges available for fees, rating, location and type comparison.`,
      metric: "Side-by-side comparison",
      cta: "Compare Now",
      href: "/college-comparison",
      visual: "scale" as ReferenceVisualName
    },
    {
      title: "Communities",
      description: `${numberText(stats.communities)} active communities with ${numberText(stats.communityPosts)} published discussions.`,
      metric: stats.communities > 0 ? "Community data live" : "Add communities in admin",
      cta: "Join Now",
      href: "/community",
      visual: "blog" as ReferenceVisualName
    },
    {
      title: "Study Material",
      description: `${numberText(stats.guides)} published guides across ${numberText(stats.guideCategories)} content categories.`,
      metric: stats.guides > 0 ? "Guide library live" : "Publish guides in admin",
      cta: "Read Guides",
      href: "/blog",
      visual: "books" as ReferenceVisualName
    }
  ];
}

export function Tools({ stats }: { stats: HomeToolStats }) {
  const tools = buildTools(stats);

  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Everything you need, all in one place
          </h2>
          <p className="mt-3 text-[rgb(var(--fg-muted))]">
            Data-backed tools and resources powered by the current SathiCollege database
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {tools.map((t, i) => (
            <motion.div
              key={t.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={t.href} className="soft-card group flex h-full flex-col p-5">
                <div className="mb-5 h-24 overflow-hidden rounded-lg bg-blue-50/70 p-2 dark:bg-slate-900/70">
                  <ReferenceVisual name={t.visual} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
                </div>
                <h3 className="font-display text-base font-bold">{t.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{t.description}</p>
                <span className="mt-4 inline-flex w-fit rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-extrabold text-[rgb(var(--primary))]">
                  {t.metric}
                </span>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--primary))] transition group-hover:gap-3">
                  {t.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
