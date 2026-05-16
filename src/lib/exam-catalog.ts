export type ExamOption = {
  value: string;
  label: string;
  shortLabel: string;
  maxScore: number;
  category: string;
};

export const examOptions: ExamOption[] = [
  { value: "jee-main", label: "JEE Main", shortLabel: "JEE Main", maxScore: 300, category: "National" },
  { value: "jee-advanced", label: "JEE Advanced", shortLabel: "JEE Adv", maxScore: 360, category: "National" },
  { value: "ap-eamcet", label: "AP EAMCET", shortLabel: "AP EAMCET", maxScore: 160, category: "State" },
  { value: "ts-eamcet", label: "TS EAMCET", shortLabel: "TS EAMCET", maxScore: 160, category: "State" },
  { value: "kcet", label: "KCET", shortLabel: "KCET", maxScore: 180, category: "State" },
  { value: "mht-cet", label: "MHT CET", shortLabel: "MHT CET", maxScore: 200, category: "State" },
  { value: "keam", label: "KEAM", shortLabel: "KEAM", maxScore: 480, category: "State" },
  { value: "tnea", label: "TNEA", shortLabel: "TNEA", maxScore: 200, category: "Counselling" },
  { value: "wbjee", label: "WBJEE", shortLabel: "WBJEE", maxScore: 200, category: "State" }
];

const explicitAliases: Record<string, string> = {
  "jee-main-rank-predictor": "jee-main",
  "jee-main-percentile-predictor": "jee-main",
  "jee-mains": "jee-main",
  "jee-mains-2026": "jee-main",
  "jee-mains-and-advance-college-predictor": "jee-main",
  "jee-advance-rank-predictor": "jee-advanced",
  "jee-advanced": "jee-advanced",
  "ap-eamcet-rank-predictor": "ap-eamcet",
  "ap-eamcet-college-predictor": "ap-eamcet",
  "ap-eapcet-college-predictor": "ap-eamcet",
  "ts-eamcet-rank-predictor": "ts-eamcet",
  "ts-eamcet": "ts-eamcet",
  "kcet-rank-predictor": "kcet",
  "kcet-college-predictor": "kcet",
  "mht-cet-percentile-predictor": "mht-cet",
  "mht-cet-college-predictor": "mht-cet",
  "mhtcet": "mht-cet",
  "keam-rank-predictor": "keam",
  "keam-college-predictor": "keam",
  "tnea-rank-predictor": "tnea",
  "tnea-college-predictor": "tnea",
  "wb-jee-rank-predictor": "wbjee",
  "wbjee-college-predictor": "wbjee"
};

export function normalizeExamSlug(input?: string | null) {
  const slug = (input || "jee-main").toLowerCase().trim().replace(/_/g, "-");
  if (explicitAliases[slug]) return explicitAliases[slug];
  if (examOptions.some((exam) => exam.value === slug)) return slug;

  const stripped = slug
    .replace(/-rank-predictor$/, "")
    .replace(/-percentile-predictor$/, "")
    .replace(/-college-predictor$/, "")
    .replace(/^wb-jee$/, "wbjee")
    .replace(/^jee-mains$/, "jee-main")
    .replace(/^jee-advance$/, "jee-advanced")
    .replace(/^mhtcet$/, "mht-cet");

  return examOptions.some((exam) => exam.value === stripped) ? stripped : slug;
}

export function getExamOption(input?: string | null) {
  const normalized = normalizeExamSlug(input);
  return examOptions.find((exam) => exam.value === normalized) || examOptions[0];
}

export const mockTests = [
  { slug: "jee-mains-2026", exam: "jee-main", title: "JEE Main 2026 Mock Test", duration: "180 min", questions: 75, level: "Full pattern" },
  { slug: "jee-mains", exam: "jee-main", title: "JEE Main Mock Test", duration: "180 min", questions: 75, level: "Chapter mixed" },
  { slug: "jee-advanced", exam: "jee-advanced", title: "JEE Advanced Mock Test", duration: "180 min", questions: 54, level: "Two-paper style" },
  { slug: "ap-eamcet", exam: "ap-eamcet", title: "AP EAMCET Mock Test", duration: "180 min", questions: 160, level: "State pattern" },
  { slug: "ts-eamcet", exam: "ts-eamcet", title: "TS EAMCET Mock Test", duration: "180 min", questions: 160, level: "State pattern" },
  { slug: "kcet", exam: "kcet", title: "KCET Mock Test", duration: "180 min", questions: 180, level: "State pattern" },
  { slug: "mhtcet", exam: "mht-cet", title: "MHT CET Mock Test", duration: "180 min", questions: 150, level: "PCM pattern" },
  { slug: "bitsat", exam: "jee-main", title: "BITSAT Mock Test", duration: "180 min", questions: 130, level: "Speed drill" },
  { slug: "viteee", exam: "jee-main", title: "VITEEE Mock Test", duration: "150 min", questions: 125, level: "Private entrance" },
  { slug: "lpunest", exam: "jee-main", title: "LPUNEST Mock Test", duration: "150 min", questions: 90, level: "Private entrance" },
  { slug: "srmjee", exam: "jee-main", title: "SRMJEEE Mock Test", duration: "150 min", questions: 125, level: "Private entrance" },
  { slug: "kleee", exam: "jee-main", title: "KLEEE Mock Test", duration: "180 min", questions: 160, level: "Private entrance" },
  { slug: "wbjee", exam: "wbjee", title: "WBJEE Mock Test", duration: "120 min", questions: 75, level: "State pattern" },
  { slug: "cuet", exam: "jee-main", title: "CUET B.Tech Mock Test", duration: "120 min", questions: 80, level: "Concept drill" },
  { slug: "gat", exam: "jee-main", title: "GAT Mock Test", duration: "120 min", questions: 100, level: "University pattern" },
  { slug: "nat", exam: "jee-main", title: "NAT Mock Test", duration: "120 min", questions: 100, level: "Practice set" },
  { slug: "cbse", exam: "jee-main", title: "CBSE Class 12 Practice Test", duration: "90 min", questions: 50, level: "Board bridge" }
];

export function getMockTest(slug?: string | null) {
  const normalized = (slug || "jee-mains-2026").toLowerCase();
  return mockTests.find((test) => test.slug === normalized) || {
    slug: normalized,
    exam: normalizeExamSlug(normalized),
    title: titleFromSlug(normalized),
    duration: "120 min",
    questions: 60,
    level: "Practice set"
  };
}

export function titleFromSlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bJee\b/g, "JEE")
    .replace(/\bAp\b/g, "AP")
    .replace(/\bTs\b/g, "TS")
    .replace(/\bMht\b/g, "MHT");
}
