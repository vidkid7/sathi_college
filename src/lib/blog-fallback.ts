import { titleFromSlug } from "./exam-catalog";

export function articleTitleFromSlug(slug: string) {
  return titleFromSlug(slug)
    .replace(/\bCet\b/g, "CET")
    .replace(/\bEamcet\b/g, "EAMCET")
    .replace(/\bWbjee\b/g, "WBJEE")
    .replace(/\bKcet\b/g, "KCET")
    .replace(/\bKeam\b/g, "KEAM")
    .replace(/\bTnea\b/g, "TNEA")
    .replace(/\bSrmjeee\b/g, "SRMJEEE")
    .replace(/\bLpunest\b/g, "LPUNEST")
    .replace(/\bCuet\b/g, "CUET");
}

export function categoryLabelFromSlug(slug?: string) {
  if (!slug) return "Exam updates";
  return articleTitleFromSlug(slug);
}

export function fallbackArticle(category: string | undefined, slug: string) {
  const title = articleTitleFromSlug(slug);
  const categoryLabel = categoryLabelFromSlug(category);
  return {
    title,
    excerpt: `${title} overview, key dates, counselling context and next-step guidance for engineering aspirants.`,
    categoryLabel,
    content: [
      `${title} is part of the ${categoryLabel} guidance library.`,
      "Use this page as an original SEO landing article shell for exam news, counselling updates, eligibility notes, cutoffs, results, fees, placements or college overviews. Add the final article body from the admin panel when editorial content is ready.",
      "Recommended structure: important dates, eligibility, exam or college overview, expected cutoffs, counselling process, required documents, common mistakes and frequently asked questions.",
      "Students should verify final dates and admission decisions through official counselling authorities before submitting applications or locking choices."
    ].join("\n\n")
  };
}
