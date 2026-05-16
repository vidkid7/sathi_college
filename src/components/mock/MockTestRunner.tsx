"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FileQuestion, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { getMockTest } from "@/lib/exam-catalog";

type MockTest = ReturnType<typeof getMockTest>;

const questionBank = [
  {
    q: "If a student's accuracy improves from 60% to 75% on a 100-question paper, how many more correct answers does that represent?",
    options: ["10", "15", "20", "25"],
    answer: 1,
    topic: "Aptitude"
  },
  {
    q: "Which action is most useful immediately after a mock test?",
    options: ["Skip analysis", "Review only correct questions", "Identify weak topics and revise", "Attempt the same paper without review"],
    answer: 2,
    topic: "Strategy"
  },
  {
    q: "A rank predictor should be treated as what kind of output?",
    options: ["Final allotment result", "Trend-based estimate", "Official counselling notice", "Guaranteed seat list"],
    answer: 1,
    topic: "Counselling"
  },
  {
    q: "What is the safest way to compare colleges?",
    options: ["Only social media comments", "Only one year's cutoff", "Fees, placements, branch fit, location and accreditation together", "Logo and campus photos"],
    answer: 2,
    topic: "College selection"
  },
  {
    q: "Which metric is most relevant for choosing branches during counselling?",
    options: ["Personal interest and career fit", "Alphabetical order", "Only hostel rating", "Random preference order"],
    answer: 0,
    topic: "Branch planning"
  }
];

export function MockTestRunner({ test }: { test: MockTest }) {
  const questions = useMemo(() => questionBank, []);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const current = questions[index];
  const answered = Object.keys(answers).length;
  const score = questions.reduce((total, q, i) => total + (answers[i] === q.answer ? 1 : 0), 0);
  const progress = Math.round((answered / questions.length) * 100);

  function reset() {
    setAnswers({});
    setIndex(0);
    setSubmitted(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <GlassCard hover={false} className="min-h-[420px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[rgb(var(--primary))]">{current.topic}</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Question {index + 1}</h2>
          </div>
          <span className="badge">
            <Clock className="h-3.5 w-3.5" />
            {test.duration}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <p className="text-lg font-semibold leading-relaxed">{current.q}</p>
            <div className="mt-6 grid gap-3">
              {current.options.map((option, optionIndex) => {
                const selected = answers[index] === optionIndex;
                const correct = submitted && current.answer === optionIndex;
                const wrong = submitted && selected && !correct;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [index]: optionIndex }))}
                    className={[
                      "flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                      selected ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10" : "border-[rgb(var(--border))] bg-[rgb(var(--bg-elev))]/40 hover:border-[rgb(var(--primary))]/50",
                      correct ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "",
                      wrong ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-300" : ""
                    ].join(" ")}
                  >
                    <span>{option}</span>
                    {(selected || correct) && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="btn-ghost"
            disabled={index === 0}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          {index < questions.length - 1 ? (
            <button type="button" className="btn-primary" onClick={() => setIndex((value) => value + 1)}>
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={() => setSubmitted(true)}>
              Submit Test
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </GlassCard>

      <div className="space-y-5">
        <GlassCard hover={false}>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <FileQuestion className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">{test.title}</h3>
              <p className="text-xs text-[rgb(var(--fg-muted))]">{test.level}</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-[rgb(var(--fg-muted))]">
              <span>Answered</span>
              <span>{answered}/{questions.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--bg-elev))]">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </GlassCard>

        {submitted && (
          <GlassCard hover={false} className="text-center">
            <p className="text-sm text-[rgb(var(--fg-muted))]">Your score</p>
            <p className="mt-2 font-display text-5xl font-extrabold gradient-text">{score}/{questions.length}</p>
            <p className="mt-3 text-sm text-[rgb(var(--fg-muted))]">
              Review the highlighted answers and retake after revising weak topics.
            </p>
            <button type="button" className="btn-ghost mt-5 w-full" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Retake Test
            </button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
