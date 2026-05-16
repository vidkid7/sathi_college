"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { examOptions, normalizeExamSlug } from "@/lib/exam-catalog";

export function RankPredictorForm({ defaultExam }: { defaultExam?: string }) {
  const [exam, setExam] = useState(normalizeExamSlug(defaultExam));
  const [marks, setMarks] = useState<string>("");
  const [category, setCategory] = useState("General");
  const [predicted, setPredicted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/predictor/rank", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exam: normalizeExamSlug(exam), marks: Number(marks), category })
      });
      const d = await r.json();
      setPredicted(d.predicted);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={onSubmit} className="lg:col-span-2">
        <GlassCard className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rank-exam" className="mb-1 block text-sm font-medium">Exam</label>
              <select id="rank-exam" className="input" value={exam} onChange={(e) => setExam(e.target.value)}>
                {examOptions.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="rank-marks" className="mb-1 block text-sm font-medium">Marks / Score</label>
              <input id="rank-marks" type="text" inputMode="decimal" required className="input" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 220" />
            </div>
            <div>
              <label htmlFor="rank-category" className="mb-1 block text-sm font-medium">Category</label>
              <select id="rank-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {["General", "OBC", "EWS", "SC", "ST"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button disabled={loading} className="btn-primary w-fit">
            <TrendingUp className="h-4 w-4" />
            {loading ? "Predicting..." : "Predict Rank"}
          </button>
        </GlassCard>
      </form>

      <AnimatePresence>
        {predicted !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard className="text-center">
              <p className="text-sm text-[rgb(var(--fg-muted))]">Predicted Rank</p>
              <p className="mt-2 font-display text-5xl font-extrabold gradient-text">
                {predicted.toLocaleString("en-IN")}
              </p>
              <p className="mt-3 text-xs text-[rgb(var(--fg-muted))]">
                Estimate based on previous-year trends. Use with the College Predictor for next steps.
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
