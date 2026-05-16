"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";

const points = [
  "Mentorship by seniors in college and industry experts",
  "Exclusive events and webinars by our team",
  "Live Q&A sessions with experienced mentors",
  "Latest updates related to counselling"
];

export function About({ title, body, whatsappHref }: { title: string; body: string; whatsappHref: string }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            <span className="gradient-text">{title}</span>
          </h2>
          <p className="mt-4 whitespace-pre-line text-base leading-7 text-[rgb(var(--fg-muted))]">{body}</p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {points.map((p) => (
              <li key={p} className="soft-card flex items-start gap-3 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                <span className="text-sm leading-6">{p}</span>
              </li>
            ))}
          </ul>

          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary mt-7">
            <MessageCircle className="h-4 w-4" />
            Join WhatsApp Community
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="reference-panel relative overflow-hidden p-6"
        >
          <ReferenceVisual name="dashboard" className="absolute -right-16 -top-12 h-56 w-56 opacity-45" />
          <div className="relative grid grid-cols-2 gap-4">
            {[
              { v: "1,50,000+", l: "Active Members" },
              { v: "3,000+", l: "Colleges Tracked" },
              { v: "10+", l: "Entrance Exams" },
              { v: "24/7", l: "Mentor Support" }
            ].map((s) => (
              <div key={s.l} className="soft-card p-5 text-center">
                <p className="font-display text-2xl font-bold gradient-text">{s.v}</p>
                <p className="mt-1 text-xs text-[rgb(var(--fg-muted))]">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="soft-card relative mt-5 p-5">
            <p className="text-sm leading-6">
              &quot;The mentors helped me pick the right branch. I joined NIT and couldn&apos;t be happier!&quot;
            </p>
            <p className="mt-3 text-xs text-[rgb(var(--fg-muted))]">A 2025 batch student</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
