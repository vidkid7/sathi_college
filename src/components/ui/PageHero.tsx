import { ReactNode } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { type ReferenceVisualName } from "@/components/ui/ReferenceVisual";
import { SceneVisual } from "@/components/ui/SceneVisual";

export function PageHero({ eyebrow, title, description, children }: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  const visual = inferVisual(eyebrow, description);
  return (
    <section className="page-visual-bg relative overflow-hidden border-b border-[rgb(var(--border))]/70">
      <div className="container grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.25fr)_360px]">
        <div>
          {eyebrow && (
            <p className="badge mb-4">
              <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] text-balance sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-[rgb(var(--fg-muted))]">{description}</p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
        <div className="reference-panel relative hidden min-h-[260px] overflow-hidden p-5 lg:block">
          <SceneVisual name={visual} priority className="h-60" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-[rgb(var(--border))]/70 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur dark:bg-[rgb(var(--bg-elev))]/80">
            <span className="font-semibold">Explore smart guidance</span>
            <ArrowRight className="h-4 w-4 text-[rgb(var(--primary))]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function inferVisual(eyebrow?: string, description?: string): ReferenceVisualName {
  const text = `${eyebrow || ""} ${description || ""}`.toLowerCase();
  if (text.includes("blog") || text.includes("updates") || text.includes("articles")) return "blog";
  if (text.includes("exam") || text.includes("mock") || text.includes("test")) return "books";
  if (text.includes("compare") || text.includes("cutoff")) return "scale";
  if (text.includes("predict") || text.includes("chatbot") || text.includes("rank")) return "dashboard";
  if (text.includes("scholar")) return "trophy";
  return "campus";
}
