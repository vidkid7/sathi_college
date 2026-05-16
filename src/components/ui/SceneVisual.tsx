"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReferenceVisual, type ReferenceVisualName } from "@/components/ui/ReferenceVisual";

type SceneFloat = {
  src: string;
  alt: string;
  className: string;
  from: { x: number; y: number; scale: number; rotate: number };
  style: CSSProperties & Record<"--fx" | "--fy" | "--fr" | "--fd", string>;
};

const floatSet: Record<ReferenceVisualName, SceneFloat[]> = {
  campus: [
    float("/assets/generated/float-cap.png", "Floating cap", "right-[8%] top-[4%] w-[23%]", 220, -160, 0.35, 18),
    float("/assets/generated/float-books.png", "Floating books", "left-[7%] bottom-[12%] w-[25%]", -200, 150, 0.38, -14),
    float("/assets/generated/float-chart.png", "Floating chart", "right-[4%] bottom-[18%] w-[17%]", 190, 110, 0.42, 20)
  ],
  dashboard: [
    float("/assets/generated/float-chart.png", "Floating chart", "right-[4%] top-[12%] w-[19%]", 220, -120, 0.35, 22),
    float("/assets/generated/float-cap.png", "Floating cap", "left-[5%] top-[6%] w-[22%]", -230, -150, 0.36, -18),
    float("/assets/generated/float-books.png", "Floating books", "right-[10%] bottom-[6%] w-[24%]", 190, 160, 0.42, 12)
  ],
  scale: [
    float("/assets/generated/float-books.png", "Floating books", "right-[8%] top-[5%] w-[24%]", 220, -150, 0.34, 18),
    float("/assets/generated/float-chart.png", "Floating chart", "left-[6%] bottom-[12%] w-[18%]", -200, 120, 0.4, -20),
    float("/assets/generated/float-cap.png", "Floating cap", "left-[9%] top-[8%] w-[20%]", -210, -150, 0.34, -18)
  ],
  trophy: [
    float("/assets/generated/float-cap.png", "Floating cap", "right-[9%] top-[8%] w-[23%]", 230, -150, 0.35, 22),
    float("/assets/generated/float-books.png", "Floating books", "left-[5%] bottom-[8%] w-[24%]", -220, 160, 0.4, -16),
    float("/assets/generated/float-chart.png", "Floating chart", "right-[3%] bottom-[18%] w-[17%]", 200, 130, 0.42, 18)
  ],
  books: [
    float("/assets/generated/float-cap.png", "Floating cap", "right-[7%] top-[4%] w-[24%]", 240, -160, 0.34, 20),
    float("/assets/generated/float-chart.png", "Floating chart", "left-[5%] top-[20%] w-[18%]", -220, -40, 0.4, -18),
    float("/assets/generated/float-chair.png", "Floating chair", "left-[8%] bottom-[5%] w-[20%]", -220, 150, 0.38, -15)
  ],
  blog: [
    float("/assets/generated/float-books.png", "Floating books", "right-[5%] top-[4%] w-[24%]", 220, -160, 0.35, 18),
    float("/assets/generated/float-chart.png", "Floating chart", "left-[6%] top-[10%] w-[17%]", -210, -120, 0.4, -18),
    float("/assets/generated/float-cap.png", "Floating cap", "right-[12%] bottom-[6%] w-[21%]", 200, 150, 0.36, 16)
  ]
};

function float(src: string, alt: string, className: string, x: number, y: number, scale: number, rotate: number): SceneFloat {
  return {
    src,
    alt,
    className,
    from: { x, y, scale, rotate },
    style: { "--fx": `${Math.sign(x || 1) * 8}px`, "--fy": "-13px", "--fr": `${Math.sign(rotate || 1) * 2}deg`, "--fd": `${6 + Math.abs(rotate % 3)}s` }
  };
}

export function SceneVisual({ name, className, priority = false }: { name: ReferenceVisualName; className?: string; priority?: boolean }) {
  return (
    <div className={cn("relative isolate mx-auto aspect-[4/3] w-full max-w-[520px]", className)}>
      <div className="absolute inset-x-[10%] bottom-[6%] h-[22%] rounded-full bg-blue-400/20 blur-3xl" />
      <ReferenceVisual name={name} priority={priority} className="relative z-10 h-full w-full object-contain drop-shadow-[0_28px_44px_rgba(49,94,170,0.20)]" />
      {floatSet[name].map((asset, index) => (
        <motion.div
          key={`${name}-${asset.src}-${index}`}
          className={cn("pointer-events-none absolute z-20 select-none", asset.className)}
          initial={{ opacity: 0, ...asset.from }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.18 + index * 0.12 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.src} alt={asset.alt} style={asset.style} className="float-layer h-full w-full object-contain drop-shadow-[0_16px_24px_rgba(36,76,140,0.18)]" loading={priority ? "eager" : "lazy"} decoding="async" />
        </motion.div>
      ))}
    </div>
  );
}
