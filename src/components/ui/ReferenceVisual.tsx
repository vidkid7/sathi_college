import { cn } from "@/lib/utils";

export type ReferenceVisualName = "campus" | "dashboard" | "scale" | "trophy" | "books" | "blog";

const visuals: Record<ReferenceVisualName, { src: string; alt: string }> = {
  campus: { src: "/assets/generated/hero-campus-base-transparent.png", alt: "Isometric college campus" },
  dashboard: { src: "/assets/generated/visual-dashboard.png", alt: "Guidance dashboard preview" },
  scale: { src: "/assets/generated/visual-scale.png", alt: "College comparison scale" },
  trophy: { src: "/assets/generated/visual-trophy.png", alt: "Achievement trophy" },
  books: { src: "/assets/generated/float-books.png", alt: "Study books and notes" },
  blog: { src: "/assets/generated/visual-blog.png", alt: "Study desk with exam notes" }
};

export function ReferenceVisual({
  name,
  className,
  priority = false
}: {
  name: ReferenceVisualName;
  className?: string;
  priority?: boolean;
}) {
  const asset = visuals[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.src}
      alt={asset.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("pointer-events-none select-none", className)}
    />
  );
}
