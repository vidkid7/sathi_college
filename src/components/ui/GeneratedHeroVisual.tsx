"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/assets/generated/hero/sathi-guidance-hub.webp";

export function GeneratedHeroVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn("generated-hero-visual", className)}
      role="img"
      aria-label="Generated 3D SathiCollege guidance hub with search dashboards, rank predictor, courses, scholarships and AI assistant"
    >
      <div className="generated-hero-visual__glow" aria-hidden="true" />
      <Image
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        width={1180}
        height={886}
        priority
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 48vw, 760px"
        className="generated-hero-visual__image"
      />
      <div className="generated-hero-visual__tag generated-hero-visual__tag--left" aria-hidden="true">
        AI-ready counselling
      </div>
      <div className="generated-hero-visual__tag generated-hero-visual__tag--right" aria-hidden="true">
        Programs, rank, careers
      </div>
    </div>
  );
}
