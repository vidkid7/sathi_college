"use client";

import { cn } from "@/lib/utils";

const storyAssets = {
  campus: "/assets/generated/story/ai/story-ai-campus.webp",
  angry: "/assets/generated/story/ai/story-ai-angry.webp",
  panel: "/assets/generated/story/ai/story-ai-panel.webp",
  chill: "/assets/generated/story/ai/story-ai-chill.webp"
};

export function StoryHeroAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn("story-scene relative isolate mx-auto aspect-[4/3] w-full max-w-[980px]", className)}
      role="img"
      aria-label="Animated admission story showing an angry student landing at a university, discovering SathiCollege, and becoming calm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={storyAssets.campus}
        alt=""
        loading="eager"
        decoding="async"
        className="story-scene__layer story-scene__campus"
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={storyAssets.angry}
        alt=""
        loading="eager"
        decoding="async"
        className="story-scene__layer story-scene__angry"
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={storyAssets.panel}
        alt=""
        loading="eager"
        decoding="async"
        className="story-scene__layer story-scene__panel"
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={storyAssets.chill}
        alt=""
        loading="eager"
        decoding="async"
        className="story-scene__layer story-scene__chill"
        aria-hidden="true"
      />
    </div>
  );
}
