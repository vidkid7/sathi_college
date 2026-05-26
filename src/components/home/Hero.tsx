"use client";

import type { ElementType, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Building2, FileText, ShieldCheck, TrendingUp, Users, WalletCards } from "lucide-react";
import dynamic from "next/dynamic";
const Hero3DScene = dynamic(() => import("@/components/home/Hero3DScene").then(mod => mod.Hero3DScene), { ssr: false });
import { examOptions, normalizeExamSlug } from "@/lib/exam-catalog";

export type HeroProps = {
  eyebrow: string;
  titleLine1: string;
  titleHighlight: string;
  titleLine2: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: { value: string; label: string }[];
};

const avatars = ["A", "R", "P", "N"];

export function Hero(p: HeroProps) {
  const [rankExam, setRankExam] = useState(normalizeExamSlug());
  const [rankScore, setRankScore] = useState("");
  const [rankResult, setRankResult] = useState<number | null>(null);
  const [rankLoading, setRankLoading] = useState(false);
  const [collegeExam, setCollegeExam] = useState(normalizeExamSlug());
  const [collegeRank, setCollegeRank] = useState("");
  const [collegeResult, setCollegeResult] = useState<string | null>(null);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const isExternal = (h: string) => /^https?:\/\//.test(h);
  const displayLine1 = p.titleLine1.toLowerCase() === "join" ? "Your Engineering" : p.titleLine1;
  const displayHighlight = p.titleHighlight.toLowerCase().includes("sathi") ? "Simplified" : p.titleHighlight;
  const displayDescription = p.description.toLowerCase().includes("up-to-date information")
    ? "Predict your rank, discover the right colleges, prepare smart and stay ahead with SathiCollege."
    : p.description;
  const slides = useMemo(() => [
    {
      key: "journey",
      eyebrow: p.eyebrow || "India's #1 community for engineering aspirants",
      title: <>{displayLine1}<br />Journey, <span className="relative inline-block text-[rgb(var(--primary))] after:absolute after:-bottom-1 after:left-0 after:h-1.5 after:w-full after:rounded-full after:bg-[rgb(var(--primary))]">{displayHighlight}</span>.</>,
      description: displayDescription,
      primary: p.primaryCta,
      secondary: p.secondaryCta,
      visual: "story" as const
    },
    {
      key: "rank",
      eyebrow: "Predict Your Rank",
      title: <>Predict Your Rank<br />in <span className="gradient-text">Seconds</span></>,
      description: "Entered your exam marks? Instantly estimate your expected rank using predictor trends and exam-specific score bands.",
      primary: { label: "Predict Rank Now", href: "/rank-predictor" },
      secondary: { label: "Explore Exams", href: "/exams" },
      visual: "hero" as const
    },
    {
      key: "college",
      eyebrow: "Find Eligible Colleges",
      title: <>Find the Colleges<br />You Can <span className="gradient-text">Get</span></>,
      description: "Enter your rank and category to discover colleges you are likely to get in counselling, based on previous-year cutoff data.",
      primary: { label: "Check Eligible Colleges", href: "/college-predictor" },
      secondary: { label: "Compare Colleges", href: "/college-comparison" },
      visual: "scale" as const
    },
    {
      key: "mock",
      eyebrow: "Test Your Exam Preparation",
      title: <>Start Free<br /><span className="gradient-text">Mock Tests</span></>,
      description: "Attempt full-length mock tests designed on real JEE, EAMCET, KCET and private entrance exam patterns.",
      primary: { label: "Start Free Mock Test", href: "/mock-test" },
      secondary: { label: "Read Guides", href: "/blog" },
      visual: "trophy" as const
    },
    {
      key: "community",
      eyebrow: "SathiCollege Communities",
      title: <>Learn, Practice,<br /><span className="gradient-text">Connect</span></>,
      description: "Get free PDFs, exam updates, counselling alerts and peer discussions in exam-specific aspirant communities.",
      primary: { label: "Join Communities", href: "/community" },
      secondary: { label: "Contact Counsellor", href: "/contact" },
      visual: "blog" as const
    }
  ], [displayDescription, displayHighlight, displayLine1, p.eyebrow, p.primaryCta, p.secondaryCta]);
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];

  useEffect(() => {
    const delay = activeSlide === 0 ? 14500 : 9000;
    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [activeSlide, slides.length]);

  async function predictRank(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rankScore) return;
    setRankLoading(true);
    try {
      const response = await fetch("/api/predictor/rank", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exam: normalizeExamSlug(rankExam), marks: Number(rankScore), category: "General" })
      });
      const data = await response.json();
      setRankResult(data.predicted ?? null);
    } finally {
      setRankLoading(false);
    }
  }

  async function predictColleges(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!collegeRank) return;
    setCollegeLoading(true);
    try {
      const response = await fetch("/api/predictor/college", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exam: normalizeExamSlug(collegeExam), rank: Number(collegeRank), category: "General" })
      });
      const data = await response.json();
      const count = Array.isArray(data.results) ? data.results.length : 0;
      setCollegeResult(count > 0 ? `${count} college matches` : "No matches yet");
    } finally {
      setCollegeLoading(false);
    }
  }

  return (
    <section className="page-visual-bg relative overflow-hidden border-b border-white/60 dark:border-white/10 md:min-h-[100svh]">
      <Hero3DScene activeSlide={activeSlide} className="pointer-events-auto" />

      <div className="container relative z-10 flex flex-col justify-start pb-4 pt-3 sm:pb-7 sm:pt-6 md:min-h-[calc(100svh-4rem)] md:justify-center lg:py-10 pointer-events-none">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,0.96fr)_minmax(250px,0.72fr)] md:gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.86fr)] lg:gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(440px,1fr)]">
          <div className="relative z-10 order-1 mx-auto max-w-xl pt-1 text-center md:mx-0 md:max-w-none md:pt-3 md:text-left pointer-events-auto rounded-3xl bg-white/40 p-6 shadow-2xl backdrop-blur-md dark:bg-black/40 sm:p-8">
            <motion.span key={`badge-${slide.key}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="badge mb-3 bg-white/70 shadow-sm backdrop-blur-md dark:bg-black/50 md:mb-5">
              <ShieldCheck className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              {slide.eyebrow}
            </motion.span>

            <motion.h1
              key={`title-${slide.key}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mx-auto max-w-[12ch] font-display text-[2.2rem] font-extrabold leading-[1.02] text-balance drop-shadow-sm sm:max-w-none sm:text-[3rem] md:mx-0 md:text-[2.65rem] lg:text-[3.45rem] xl:text-[4.35rem]"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              key={`desc-${slide.key}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-2 max-w-[36ch] text-[0.82rem] leading-5 text-[rgb(var(--fg-muted))] sm:mt-4 sm:max-w-xl sm:text-base md:mx-0 md:text-lg md:leading-7"
            >
              {slide.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-3 md:justify-start"
            >
              <div className="flex -space-x-2">
                {avatars.map((avatar) => (
                  <span key={avatar} className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-violet-100 text-[0.68rem] font-bold text-[rgb(var(--primary))] shadow-sm dark:border-[rgb(var(--bg))] sm:h-8 sm:w-8 sm:text-xs">
                    {avatar}
                  </span>
                ))}
              </div>
              <span className="text-xs font-medium text-[rgb(var(--fg-muted))] sm:text-sm">50K+ students signed up this month</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3 md:mt-7 md:justify-start"
            >
              <SmartLink
                href={slide.primary.href}
                external={isExternal(slide.primary.href)}
                className="btn-primary px-4 py-2.5 shadow-lg shadow-blue-500/25 sm:px-6 sm:py-3"
              >
                {slide.primary.label}
                <ArrowRight className="h-4 w-4" />
              </SmartLink>
              <SmartLink
                href={slide.secondary.href}
                external={isExternal(slide.secondary.href)}
                className="btn-ghost bg-white/50 px-4 py-2.5 backdrop-blur-md hover:bg-white/80 dark:bg-black/30 dark:hover:bg-black/50 sm:px-6 sm:py-3"
              >
                {slide.secondary.label}
              </SmartLink>
            </motion.div>

            <div className="mt-3 flex items-center justify-center gap-2 sm:mt-6 md:mt-7 md:justify-start" aria-label="Home carousel slides">
              {slides.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show ${item.eyebrow}`}
                  className={[
                    "h-2.5 rounded-full transition-all",
                    activeSlide === index ? "w-9 bg-[rgb(var(--primary))]" : "w-2.5 bg-[rgb(var(--fg-muted))]/40 hover:bg-[rgb(var(--primary))]/70"
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          {/* We keep the second column empty so the 3D scene on the right is fully visible, or we let the grid layout stand but without content on the right. */}
          <div className="pointer-events-none order-2 hidden md:block"></div>
        </div>
      </div>

      <div className="container relative z-10 pb-10 lg:pb-16">
        <div className="grid gap-4 md:grid-cols-2 xl:max-w-[760px]">
          <PredictorMiniCard
            title="Rank Predictor"
            description="Predict your probable rank based on your exam score."
            icon={TrendingUp}
            accent="from-violet-500 to-purple-600"
            result={rankResult ? `Rank ${rankResult.toLocaleString("en-IN")}` : null}
            loading={rankLoading}
            onSubmit={predictRank}
            buttonLabel="Predict Rank"
          >
            <select aria-label="Rank predictor exam" className="input" value={rankExam} onChange={(e) => setRankExam(e.target.value)}>
              {examOptions.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
            <input aria-label="Score or percentile" className="input" inputMode="decimal" value={rankScore} onChange={(e) => setRankScore(e.target.value)} placeholder="Enter your percentile or score" />
          </PredictorMiniCard>
          <PredictorMiniCard
            title="College Predictor"
            description="Find colleges you can get based on your rank or percentile."
            icon={Building2}
            accent="from-blue-500 to-sky-600"
            result={collegeResult}
            loading={collegeLoading}
            onSubmit={predictColleges}
            buttonLabel="Predict Colleges"
          >
            <select aria-label="College predictor exam" className="input" value={collegeExam} onChange={(e) => setCollegeExam(e.target.value)}>
              {examOptions.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
            <input aria-label="Rank" className="input" inputMode="numeric" value={collegeRank} onChange={(e) => setCollegeRank(e.target.value)} placeholder="Enter your rank" />
          </PredictorMiniCard>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="liquid-surface metric-divider mt-7 grid gap-0 p-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {p.stats.map((s, index) => {
            const Icon = [Users, Building2, FileText, WalletCards][index % 4];
            return (
              <div key={s.label} className="flex items-center gap-4 p-5">
                <span className="icon-tile">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-2xl font-extrabold text-[rgb(var(--fg))]">{s.value}</p>
                  <p className="text-xs text-[rgb(var(--fg-muted))]">{s.label}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function SmartLink({
  href,
  external,
  className,
  children
}: {
  href: string;
  external: boolean;
  className: string;
  children: ReactNode;
}) {
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  }
  return <Link href={href} className={className}>{children}</Link>;
}

function PredictorMiniCard({
  title,
  description,
  icon: Icon,
  accent,
  children,
  result,
  loading,
  buttonLabel,
  onSubmit
}: {
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
  children: ReactNode;
  result: string | null;
  loading: boolean;
  buttonLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="liquid-surface p-5 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${accent} text-white shadow-lg`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[rgb(var(--fg-muted))]">{description}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">{children}</div>
      <button className="btn-primary mt-3 w-full" disabled={loading}>
        {loading ? "Checking..." : buttonLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
      {result && <p className="mt-3 rounded-lg bg-[rgb(var(--primary))]/10 px-3 py-2 text-center text-sm font-semibold text-[rgb(var(--primary))]">{result}</p>}
    </form>
  );
}
