"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Coins, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { mockAsset } from "@/components/mock/mock-assets";
import type { mockTests } from "@/lib/exam-catalog";

type MockItem = (typeof mockTests)[number];

export function MockTestExperience({ tests }: { tests: MockItem[] }) {
  const [active, setActive] = useState(0);
  const featured = tests[active] || tests[0];
  const ordered = useMemo(() => tests.slice(0, 15), [tests]);

  function move(direction: number) {
    setActive((current) => (current + direction + ordered.length) % ordered.length);
  }

  return (
    <div className="grid gap-10">
      <div className="reference-panel overflow-hidden p-5 sm:p-6">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="text-sm font-bold text-[rgb(var(--primary))]">Your AI-Powered Practice Ground</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Start Free Mock Test</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--fg-muted))]">
              Practice smarter with exam-specific mocks, previous-year style questions, instant score feedback and mobile-safe test controls.
            </p>
            <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["10K+", "Students"],
                ["10+", "Exams"],
                ["50K+", "Questions"]
              ].map(([value, label]) => (
                <div key={label} className="soft-card p-4 text-center">
                  <p className="font-display text-2xl font-extrabold text-[rgb(var(--primary))]">{value}</p>
                  <p className="text-xs font-semibold text-[rgb(var(--fg-muted))]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div key={featured.slug} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="soft-card overflow-hidden p-4">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-blue-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mockAsset(featured.slug)} alt={featured.title} className="h-full w-full object-cover" loading="eager" decoding="async" />
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-extrabold">{featured.title.replace(" Mock Test", "")}</p>
                <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">{featured.level}</p>
              </div>
              <span className="rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-600">500 coins</span>
            </div>
            <Link href={`/mock-test/${featured.slug}`} className="btn-primary mt-4 w-full">Start {featured.title.replace(" Mock Test", "")} Test</Link>
          </motion.div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl font-extrabold">Choose Your Exam</h3>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous exam" onClick={() => move(-1)} className="glass grid h-10 w-10 place-items-center rounded-lg"><ArrowLeft className="h-4 w-4" /></button>
              <button type="button" aria-label="Next exam" onClick={() => move(1)} className="glass grid h-10 w-10 place-items-center rounded-lg"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="nice-scroll flex gap-4 overflow-x-auto pb-2">
            {ordered.map((test, index) => (
              <button
                key={test.slug}
                type="button"
                onClick={() => setActive(index)}
                className={[
                  "min-w-[150px] rounded-lg border p-3 text-left transition",
                  active === index ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10" : "border-[rgb(var(--border))] bg-white/70 hover:border-[rgb(var(--primary))]/50 dark:bg-[rgb(var(--bg-elev))]/60"
                ].join(" ")}
              >
                <span className="block h-16 overflow-hidden rounded-lg bg-blue-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mockAsset(test.slug)} alt={test.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </span>
                <span className="mt-2 block truncate text-sm font-extrabold">{test.title.replace(" Mock Test", "")}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-5">
          <h2 className="font-display text-2xl font-extrabold">Available Mock Tests</h2>
          <p className="mt-2 text-sm text-[rgb(var(--fg-muted))]">Start practicing with our comprehensive question banks.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test, index) => (
            <motion.div key={test.slug} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: (index % 6) * 0.04 }}>
              <Link href={`/mock-test/${test.slug}`} className="soft-card group flex h-full flex-col overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden bg-blue-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mockAsset(test.slug)} alt={test.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="badge w-fit"><Sparkles className="h-3 w-3 text-amber-500" /> {test.level}</span>
                  <h3 className="mt-3 font-display text-lg font-bold">{test.title}</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[rgb(var(--fg-muted))]">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {index % 2 ? "7.8K+" : "25K+"}</div>
                    <div className="flex items-center gap-2"><Coins className="h-4 w-4" /> 500 coins</div>
                  </div>
                  <span className="btn-primary mt-5 w-full">Explore <ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
