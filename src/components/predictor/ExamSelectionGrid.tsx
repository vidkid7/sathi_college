import Link from "next/link";

const examLogos: Record<string, string> = {
  "jee-main": "/assets/collegedost/jee-common.png",
  "jee-advanced": "/assets/collegedost/jee-common.png",
  "ap-eamcet": "/assets/collegedost/ap-eamcet.png",
  "ts-eamcet": "/assets/collegedost/ts-eamcet.png",
  kcet: "/assets/collegedost/kcet.png",
  "mht-cet": "/assets/collegedost/mht-cet.png",
  keam: "/assets/collegedost/keam.png",
  tnea: "/assets/collegedost/tnea.png",
  wbjee: "/assets/collegedost/wbjee.png"
};

export const collegePredictorCards = [
  { exam: "jee-main", label: "JEE Mains Advance", href: "/college-predictor/jee-mains-and-advance-college-predictor" },
  { exam: "ap-eamcet", label: "AP EAMCET", href: "/college-predictor/ap-eamcet-college-predictor" },
  { exam: "ts-eamcet", label: "TS EAMCET", href: "/college-predictor/ts-eamcet" },
  { exam: "kcet", label: "KCET", href: "/college-predictor/kcet-college-predictor" },
  { exam: "mht-cet", label: "MHT CET", href: "/college-predictor/mht-cet-college-predictor" },
  { exam: "keam", label: "KEAM", href: "/college-predictor/keam-college-predictor" },
  { exam: "tnea", label: "TNEA", href: "/college-predictor/tnea-college-predictor" },
  { exam: "wbjee", label: "WBJEE", href: "/college-predictor/wbjee-college-predictor" }
];

export const rankPredictorCards = [
  { exam: "ap-eamcet", label: "AP EAMCET", href: "/rank-predictor/ap-eamcet-rank-predictor" },
  { exam: "ts-eamcet", label: "TS EAMCET", href: "/rank-predictor/ts-eamcet-rank-predictor" },
  { exam: "kcet", label: "KCET", href: "/rank-predictor/kcet-rank-predictor" },
  { exam: "mht-cet", label: "MHT CET", href: "/rank-predictor/mht-cet-percentile-predictor" },
  { exam: "tnea", label: "TNEA", href: "/rank-predictor/tnea-rank-predictor" },
  { exam: "jee-main", label: "JEE Mains Rank", href: "/rank-predictor/jee-main-rank-predictor" },
  { exam: "jee-advanced", label: "JEE Advanced Rank", href: "/rank-predictor/jee-advance-rank-predictor" },
  { exam: "jee-main", label: "JEE Mains Percentile", href: "/rank-predictor/jee-main-percentile-predictor" },
  { exam: "wbjee", label: "WBJEE Rank", href: "/rank-predictor/wb-jee-rank-predictor" },
  { exam: "keam", label: "KEAM Rank", href: "/rank-predictor/keam-rank-predictor" }
];

export function ExamSelectionGrid({ mode }: { mode: "college" | "rank" }) {
  const items = mode === "college" ? collegePredictorCards : rankPredictorCards;

  return (
    <div className="reference-panel p-5 sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[rgb(var(--primary))]">Select Exam</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold">
            {mode === "college" ? "Choose your college predictor" : "Choose your rank predictor"}
          </h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className="soft-card group flex min-h-28 items-center gap-4 p-4 hover:-translate-y-1 hover:border-[rgb(var(--primary))]/45"
          >
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={examLogos[item.exam]} alt={`${item.label} logo`} className="h-12 w-12 object-contain transition group-hover:scale-105" loading="lazy" decoding="async" />
            </span>
            <span className="font-display text-base font-extrabold leading-tight text-[rgb(var(--fg))]">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
