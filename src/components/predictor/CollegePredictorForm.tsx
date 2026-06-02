"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star } from "lucide-react";
import { examOptions, normalizeExamSlug } from "@/lib/exam-catalog";
import { safeImageSrc } from "@/lib/utils";
import { realImageOr, universityCampusImage } from "@/lib/real-images";

type Result = { id: string; name: string; city: string; state: string; type: string; rating: number; heroImage?: string | null };

export function CollegePredictorForm({ defaultExam }: { defaultExam?: string }) {
  const [exam, setExam] = useState(normalizeExamSlug(defaultExam));
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("General");
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/predictor/college", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exam: normalizeExamSlug(exam), rank: Number(rank), category })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "College prediction failed");
      setResults(d.results || []);
    } catch (err: any) {
      setError(err?.message || "College prediction failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <GlassCard className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <label htmlFor="college-exam" className="mb-1 block text-sm font-medium">Exam</label>
            <select id="college-exam" className="input" value={exam} onChange={(e) => setExam(e.target.value)}>
              {examOptions.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="college-rank" className="mb-1 block text-sm font-medium">Your Rank</label>
            <input id="college-rank" type="text" inputMode="numeric" required className="input" value={rank} onChange={(e) => setRank(e.target.value)} placeholder="e.g. 12345" />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="college-category" className="mb-1 block text-sm font-medium">Category</label>
            <select id="college-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {["General", "OBC", "EWS", "SC", "ST"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button disabled={loading} className="btn-primary w-full">
              <Search className="h-4 w-4" />
              {loading ? "Searching..." : "Find Colleges"}
            </button>
          </div>
        </GlassCard>
      </form>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-700 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {results.length === 0 && <p className="text-[rgb(var(--fg-muted))]">No matching colleges in our database yet.</p>}
            {results.map((c) => (
              <GlassCard key={c.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={safeImageSrc(realImageOr(c.heroImage, universityCampusImage()))} alt={`${c.name} logo`} className="mb-4 h-24 w-full rounded-lg bg-white/80 object-contain p-3 dark:bg-white/90" loading="lazy" decoding="async" />
                <h3 className="font-display text-lg font-bold">{c.name}</h3>
                <p className="text-xs text-[rgb(var(--fg-muted))]">{c.city}, {c.state} • {c.type}</p>
                <div className="mt-3 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {c.rating.toFixed(1)}
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
