"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/assets/generated/hero/sathi-guidance-hub.webp";

export function GeneratedHeroVisual({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  function setParallax(x: number, y: number) {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.setProperty("--hero-px", x.toFixed(3));
    frame.style.setProperty("--hero-py", y.toFixed(3));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(max-width: 768px), (prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => setParallax(x, y));
  }

  function handlePointerLeave() {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => setParallax(0, 0));
  }

  return (
    <div
      ref={frameRef}
      className={cn("generated-hero-visual", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
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
