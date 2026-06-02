"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, ChevronDown, IndianRupee, MapPin, Plus, Star } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatINR, safeImageSrc } from "@/lib/utils";
import { realImageOr, universityCampusImage } from "@/lib/real-images";

type College = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  type: string;
  rating: number;
  fees: number;
  description: string;
  heroImage?: string | null;
};

const categoryRows = [
  {
    title: "Admission Process",
    rows: [
      { label: "College type", get: (college: College) => college.type },
      { label: "Location", get: (college: College) => `${college.city}, ${college.state}` },
      { label: "Rating", get: (college: College) => `${college.rating.toFixed(1)} / 5` }
    ]
  },
  {
    title: "Placements",
    rows: [
      { label: "Student rating signal", get: (college: College) => `${college.rating.toFixed(1)} placement-fit score` },
      { label: "Fee investment", get: (college: College) => formatINR(college.fees) }
    ]
  },
  {
    title: "Courses & Specializations",
    rows: [
      { label: "Popular pathway", get: (college: College) => college.description || "Engineering and technology programs" },
      { label: "College segment", get: (college: College) => college.type }
    ]
  },
  {
    title: "Infrastructure & Facilities",
    rows: [
      { label: "Campus city", get: (college: College) => college.city },
      { label: "State access", get: (college: College) => college.state }
    ]
  },
  {
    title: "Scholarships",
    rows: [
      { label: "Annual fee baseline", get: (college: College) => formatINR(college.fees) },
      { label: "Best for", get: (college: College) => college.rating >= 4.5 ? "High-performing aspirants" : "Balanced counselling shortlist" }
    ]
  }
];

export function CollegeComparison({ colleges, defaultSlug }: { colleges: College[]; defaultSlug?: string }) {
  const first = colleges.find((college) => college.slug === defaultSlug)?.id || colleges[0]?.id || "";
  const second = colleges.find((college) => college.id !== first)?.id || colleges[1]?.id || "";
  const [selectedIds, setSelectedIds] = useState<string[]>([first, second, "", ""]);
  const [message, setMessage] = useState("");

  const selected = useMemo(
    () => selectedIds.map((id) => colleges.find((college) => college.id === id)).filter(Boolean) as College[],
    [colleges, selectedIds]
  );

  const popularPairs = useMemo(() => {
    const pairs: Array<[College, College]> = [];
    for (let i = 0; i < Math.min(colleges.length - 1, 6); i += 2) {
      pairs.push([colleges[i], colleges[i + 1]]);
    }
    return pairs;
  }, [colleges]);

  if (!colleges.length) {
    return (
      <GlassCard>
        <p className="text-sm text-[rgb(var(--fg-muted))]">Add colleges from the admin panel to enable comparison.</p>
      </GlassCard>
    );
  }

  function updateSlot(index: number, value: string) {
    if (value && selectedIds.some((id, slot) => slot !== index && id === value)) {
      setMessage("Nice try, but that college is already on the list. Pick a different one to compare.");
      return;
    }
    setSelectedIds((current) => current.map((id, slot) => (slot === index ? value : id)));
    setMessage("");
  }

  function addSimilar(index: number) {
    const base = colleges.find((college) => college.id === selectedIds[index]) || selected[0];
    const occupied = new Set(selectedIds.filter(Boolean));
    const candidate =
      colleges.find((college) => base && !occupied.has(college.id) && college.state === base.state && college.type === base.type) ||
      colleges.find((college) => !occupied.has(college.id));
    const emptyIndex = selectedIds.findIndex((id) => !id);

    if (!candidate || emptyIndex < 0) {
      setMessage("All comparison slots are filled. Remove one college before adding another.");
      return;
    }
    updateSlot(emptyIndex, candidate.id);
  }

  function usePopularPair(left: College, right: College) {
    setSelectedIds([left.id, right.id, "", ""]);
    setMessage("");
  }

  return (
    <div className="grid gap-6">
      <GlassCard hover={false}>
        <div className="mb-5">
          <h2 className="font-display text-2xl font-extrabold">Not sure which college is better?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[rgb(var(--fg-muted))]">
            Add colleges side by side, expand the comparison sections, and decide from admission fit, placements, fees, courses and campus signals.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((slot) => {
            const college = colleges.find((item) => item.id === selectedIds[slot]);
            return (
              <div key={slot} className="soft-card p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-[rgb(var(--primary))]">
                    {college?.heroImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={safeImageSrc(realImageOr(college.heroImage, universityCampusImage()))} alt="" className="h-full w-full rounded-lg bg-white object-contain p-1" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[rgb(var(--fg-muted))]">Slot {slot + 1}</p>
                    <p className="font-display text-base font-extrabold">{college ? college.name : "Add College"}</p>
                  </div>
                </div>
                <select value={selectedIds[slot]} onChange={(event) => updateSlot(slot, event.target.value)} className="input">
                  <option value="">Add College</option>
                  {colleges.map((collegeOption) => (
                    <option key={collegeOption.id} value={collegeOption.id}>
                      {collegeOption.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => addSimilar(slot)} className="btn-ghost mt-3 w-full justify-center py-2 text-xs">
                  <Plus className="h-4 w-4" />
                  Add Similar College
                </button>
              </div>
            );
          })}
        </div>
        {message && <p className="mt-4 rounded-lg bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-300">{message}</p>}
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-2">
        {selected.slice(0, 4).map((college, index) => (
          <GlassCard key={college.id} className="flex h-full flex-col" hover={false}>
            <span className="badge w-fit">College {index + 1}</span>
            <h2 className="mt-4 font-display text-2xl font-bold">{college.name}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-[rgb(var(--fg-muted))]">{college.description || "Choose an option above to compare details."}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[rgb(var(--fg-muted))]">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {college.city}, {college.state}</span>
              <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {college.rating.toFixed(1)}</span>
              <span className="inline-flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {formatINR(college.fees)}</span>
            </div>
            <Link href={`/colleges/${college.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--primary))]">
              View full profile <ArrowUpRight className="h-4 w-4" />
            </Link>
          </GlassCard>
        ))}
      </div>

      <GlassCard hover={false} className="p-0">
        {categoryRows.map((category, index) => (
          <details key={category.title} open={index === 0} className="group border-b border-[rgb(var(--border))] last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-display text-lg font-extrabold [&::-webkit-details-marker]:hidden">
              {category.title}
              <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
            </summary>
            <div className="overflow-x-auto nice-scroll px-5 pb-5">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="w-56 px-3 py-3 text-left">Factor</th>
                    {selected.map((college) => (
                      <th key={college.id} className="px-3 py-3 text-left">{college.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {category.rows.map((row) => (
                    <tr key={row.label} className="border-b border-[rgb(var(--border))]/70 last:border-b-0">
                      <td className="px-3 py-4 font-semibold">{row.label}</td>
                      {selected.map((college) => (
                        <td key={`${row.label}-${college.id}`} className="max-w-xs px-3 py-4 text-[rgb(var(--fg-muted))]">{row.get(college)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </GlassCard>

      {popularPairs.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-2xl font-extrabold">Popular comparisons</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {popularPairs.map(([left, right]) => (
              <button key={`${left.id}-${right.id}`} type="button" onClick={() => usePopularPair(left, right)} className="soft-card p-4 text-left transition hover:-translate-y-1 hover:border-[rgb(var(--primary))]/40">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <CollegeMini college={left} />
                  <span className="rounded-full bg-[rgb(var(--primary))]/10 px-2 py-1 text-xs font-extrabold text-[rgb(var(--primary))]">VS</span>
                  <CollegeMini college={right} />
                </div>
                <p className="mt-4 text-sm font-bold text-[rgb(var(--primary))]">Compare</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CollegeMini({ college }: { college: College }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-display text-sm font-extrabold">{college.name}</p>
      <p className="mt-1 truncate text-xs text-[rgb(var(--fg-muted))]">{college.city}, {college.state}</p>
    </div>
  );
}
