import { Suspense } from "react";
import { SearchProgramClient } from "@/components/search/SearchProgramClient";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Search Programs",
  description: "Search overseas programs, universities, intakes, tuition, scholarships and eligibility filters from the local CourseFinder dataset.",
  path: "/search-program",
  keywords: ["course finder", "search programs", "study abroad courses", "university search", "college finder"]
});

export const dynamic = "force-dynamic";

export default function SearchProgramPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    country?: string;
    studyLevel?: string;
    university?: string;
    year?: string;
    intake?: string;
    quick?: string;
  };
}) {
  return (
    <Suspense fallback={<div className="container py-16 text-sm text-[rgb(var(--fg-muted))]">Loading program search...</div>}>
      <SearchProgramClient
        initialFilters={{
          q: searchParams?.q || "",
          country: searchParams?.country || "",
          studyLevel: searchParams?.studyLevel || "",
          university: searchParams?.university || "",
          year: searchParams?.year || "2026",
          intake: searchParams?.intake || "",
          quick: searchParams?.quick || ""
        }}
      />
    </Suspense>
  );
}
