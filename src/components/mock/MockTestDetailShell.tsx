"use client";

import { useState } from "react";
import { CheckCircle2, Clock, FileQuestion, ShieldCheck, Sparkles } from "lucide-react";
import { MockTestRunner } from "@/components/mock/MockTestRunner";
import { mockAsset } from "@/components/mock/mock-assets";
import type { getMockTest } from "@/lib/exam-catalog";

type MockTest = ReturnType<typeof getMockTest>;

const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"];

export function MockTestDetailShell({ test }: { test: MockTest }) {
  const [year, setYear] = useState("2026");
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="grid gap-8">
      <div className="reference-panel overflow-hidden p-5 sm:p-6">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex flex-wrap gap-2">
              {["Real exam pattern", "Free For You", "Instant analysis"].map((item) => (
                <span key={item} className="badge"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> {item}</span>
              ))}
            </div>
            <h2 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">{test.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[rgb(var(--fg-muted))]">
              SathiCollege mock test experience with year selection, full-length test details, timed runner, instant scoring and answer review.
            </p>
            <button type="button" onClick={() => document.getElementById("test-runner")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="btn-primary mt-6">
              Start {test.title.replace(" Mock Test", "")}
            </button>
          </div>
          <div className="soft-card overflow-hidden p-4">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-blue-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mockAsset(test.slug)} alt={test.title} className="h-full w-full object-cover" loading="eager" decoding="async" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {[
          { title: "Duration", value: test.duration, icon: Clock },
          { title: "Total Questions", value: `${test.questions} questions`, icon: FileQuestion },
          { title: "Negative Marking", value: "Yes (-1 wrong, +4 correct)", icon: CheckCircle2 }
        ].map((item) => (
          <div key={item.title} className="soft-card p-5">
            <span className="icon-tile mb-4"><item.icon className="h-5 w-5" /></span>
            <h3 className="font-display text-lg font-extrabold">{item.title}</h3>
            <p className="mt-2 text-sm text-[rgb(var(--fg-muted))]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="reference-panel p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold">{test.title.replace(" Mock Test", "")} Full Length Mock Test</h2>
            <p className="mt-2 text-sm text-[rgb(var(--fg-muted))]">Select year and start a realistic full-length practice session.</p>
          </div>
          <span className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-extrabold text-amber-600"><Sparkles className="mr-1 inline h-4 w-4" /> 50 bonus coins</span>
        </div>
        <h3 className="mb-3 font-display text-lg font-extrabold">Select Year</h3>
        <div className="flex flex-wrap gap-2">
          {years.map((item) => (
            <button key={item} type="button" onClick={() => setYear(item)} className={year === item ? "btn-primary px-4 py-2" : "btn-ghost px-4 py-2"}>
              {test.title.replace(" Mock Test", "")} {item}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => document.getElementById("test-runner")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="btn-primary mt-5">
          Start {test.title.replace(" Mock Test", "")} Full Length Mock Test
        </button>
      </div>

      <div className="soft-card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-extrabold">What You Get</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {[
            "Real exam experience with a strict, mobile-safe test layout.",
            "Detailed performance analysis after submission.",
            "Topic-wise practice and previous-year style question review."
          ].map((item) => (
            <p key={item} className="rounded-lg bg-white/70 p-4 text-sm leading-6 text-[rgb(var(--fg-muted))] dark:bg-[rgb(var(--bg-elev))]/70">{item}</p>
          ))}
        </div>
        <button type="button" onClick={() => setExpanded((value) => !value)} className="subtle-link mt-4">
          {expanded ? "Read less" : "Read more"}
        </button>
        {expanded && (
          <p className="mt-4 text-sm leading-7 text-[rgb(var(--fg-muted))]">
            Use the mock runner to practice under pressure, review each answer, and retake after revising weak topics. The local implementation keeps the interaction lightweight so it stays smooth on mobile.
          </p>
        )}
      </div>

      <div id="test-runner" className="scroll-mt-28">
        <MockTestRunner test={test} />
      </div>
    </div>
  );
}
