"use client";

import { motion } from "framer-motion";
import { Users, ArrowUpRight } from "lucide-react";
import { safeImageSrc } from "@/lib/utils";
import { REAL_IMAGES } from "@/lib/real-images";

type Community = { id: string; slug: string; name: string; description: string; joinUrl: string; image?: string | null };

const communityLogos: Record<string, string> = {
  jee: "/assets/sathicollege/jee-common.png",
  eamcet: "/assets/sathicollege/ap-eamcet.png",
  kcet: "/assets/sathicollege/kcet.png",
  tnea: "/assets/sathicollege/tnea.png",
  wbjee: "/assets/sathicollege/wbjee.png",
  private: "/assets/sathicollege/mock/bitsat.jpeg",
  keam: "/assets/sathicollege/keam.png",
  mhtcet: "/assets/sathicollege/mht-cet.png"
};

export function Communities({ items }: { items: Community[] }) {
  if (!items?.length) return null;
  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <span className="badge"><Users className="h-3.5 w-3.5" /> Communities</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Join our <span className="gradient-text">Communities</span>
          </h2>
          <p className="mt-3 text-[rgb(var(--fg-muted))]">
            Free PDFs, exam updates, important alerts and complete counselling guidance — all in one place for engineering aspirants.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (i % 4) * 0.05 }}
            >
              <div className="soft-card flex h-full flex-col p-5">
                <span className="mb-5 grid h-16 w-16 place-items-center rounded-lg bg-white shadow-sm dark:bg-[rgb(var(--bg-elev))]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={safeImageSrc(c.image, communityLogos[c.slug] || REAL_IMAGES.news)} alt={`${c.name} logo`} className="h-12 w-12 rounded-md object-contain" loading="lazy" decoding="async" />
                </span>
                <h3 className="font-display text-lg font-bold leading-snug">{c.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{c.description}</p>
                <a
                  href={c.joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 w-full"
                >
                  Join Community
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
