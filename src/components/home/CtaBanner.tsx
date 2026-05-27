"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";

export function CtaBanner({ whatsappHref }: { whatsappHref: string }) {
  return (
    <section className="container pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative overflow-hidden rounded-lg border border-blue-300/30 bg-gradient-to-r from-[#0f6fea] via-[#1d7cf5] to-[#377ffd] p-7 text-white shadow-2xl shadow-blue-500/20 sm:p-9"
      >
        <div className="relative z-10 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Not sure where you stand?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">
              Take a mock test, analyze your performance, and get a practical admission roadmap.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Link href="/mock-test" className="btn-ghost bg-white/88 px-5 py-3 text-sm font-bold text-[rgb(var(--primary))] shadow-lg">
              Take Mock Test
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn border-white/45 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/10 backdrop-blur-xl hover:bg-white/16">
              Talk to Counselor <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <ReferenceVisual name="trophy" className="absolute -bottom-16 right-8 hidden h-44 w-44 opacity-80 md:block" />
      </motion.div>
    </section>
  );
}
