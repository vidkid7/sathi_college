"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReferenceVisual, type ReferenceVisualName } from "@/components/ui/ReferenceVisual";

const tools = [
  {
    title: "Rank Predictor",
    description: "AI-powered rank prediction with detailed analysis",
    cta: "Predict Now",
    href: "/rank-predictor",
    visual: "dashboard" as ReferenceVisualName
  },
  {
    title: "College Predictor",
    description: "Discover best colleges based on your rank and preferences",
    cta: "Find Colleges",
    href: "/college-predictor",
    visual: "campus" as ReferenceVisualName
  },
  {
    title: "Mock Tests",
    description: "Practice with real exam pattern mock tests",
    cta: "Start Test",
    href: "/mock-test",
    visual: "trophy" as ReferenceVisualName
  },
  {
    title: "Compare Colleges",
    description: "Compare colleges on fees, placement, cutoff and more",
    cta: "Compare Now",
    href: "/college-comparison",
    visual: "scale" as ReferenceVisualName
  },
  {
    title: "Communities",
    description: "Connect with peers and seniors for guidance",
    cta: "Join Now",
    href: "/community",
    visual: "blog" as ReferenceVisualName
  },
  {
    title: "Study Material",
    description: "Access notes, previous year papers and more",
    cta: "Read Guides",
    href: "/blog",
    visual: "books" as ReferenceVisualName
  }
];

export function Tools() {
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
            Powerful tools and resources designed for engineering aspirants
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
