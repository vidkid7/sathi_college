"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type FloatingStyle = CSSProperties & Record<"--fx" | "--fy" | "--fr" | "--fd", string>;
type EntryMotion = { x: number; y: number; scale: number; rotate: number };

const floatingAssets = [
  {
    src: "/assets/generated/float-chair.png",
    alt: "Floating study chair",
    className: "left-[14%] top-[2%] w-[19%] sm:w-[18%]",
    style: { "--fx": "8px", "--fy": "-15px", "--fr": "2deg", "--fd": "6.8s" },
    from: { x: -260, y: -180, scale: 0.35, rotate: -22 },
    delay: 0.3
  },
  {
    src: "/assets/generated/float-cap.png",
    alt: "Floating graduation cap",
    className: "right-[20%] top-[2%] w-[26%] sm:w-[24%]",
    style: { "--fx": "-10px", "--fy": "-18px", "--fr": "-3deg", "--fd": "7.6s" },
    from: { x: 320, y: -220, scale: 0.3, rotate: 24 },
    delay: 0.45
  },
  {
    src: "/assets/generated/float-chart.png",
    alt: "Floating admission chart",
    className: "right-[7%] top-[28%] w-[17%] sm:w-[16%]",
    style: { "--fx": "8px", "--fy": "-12px", "--fr": "4deg", "--fd": "6.2s" },
    from: { x: 260, y: 120, scale: 0.4, rotate: 28 },
    delay: 0.6
  },
  {
    src: "/assets/generated/float-books.png",
    alt: "Floating books",
    className: "bottom-[10%] left-[15%] w-[25%] sm:w-[23%]",
    style: { "--fx": "-7px", "--fy": "-13px", "--fr": "-2deg", "--fd": "8.2s" },
    from: { x: -240, y: 190, scale: 0.36, rotate: -18 },
    delay: 0.72
  }
] satisfies Array<{
  src: string;
  alt: string;
  className: string;
  style: FloatingStyle;
  from: EntryMotion;
  delay: number;
}>;

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div className={cn("relative isolate mx-auto aspect-[4/3] w-full max-w-[720px]", className)}>
      <div className="absolute inset-x-[8%] bottom-[7%] h-[18%] rounded-full bg-blue-400/20 blur-3xl" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/generated/hero-campus-base-transparent.png"
        alt="3D college campus platform"
        loading="eager"
        decoding="async"
        className="relative z-10 h-full w-full object-contain drop-shadow-[0_32px_44px_rgba(58,113,193,0.22)]"
      />
      {floatingAssets.map((asset, index) => (
        <motion.div
          key={asset.src}
          className={cn(
            "pointer-events-none absolute z-20 select-none",
            asset.className
          )}
          initial={{ opacity: 0, x: asset.from.x, y: asset.from.y, scale: asset.from.scale, rotate: asset.from.rotate }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 72,
            damping: 17,
            mass: 0.85,
            delay: asset.delay
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.src}
            alt={asset.alt}
            loading="eager"
            decoding="async"
            style={asset.style as CSSProperties}
            className={cn(
              "float-layer h-full w-full object-contain drop-shadow-[0_18px_26px_rgba(36,76,140,0.22)]",
              index % 2 === 0 ? "float-delay-a" : "float-delay-b"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}
