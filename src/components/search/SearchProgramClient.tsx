"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  GraduationCap,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  WalletCards,
  X
} from "lucide-react";

type Facet = {
  value: string;
  count?: number;
};

type Facets = {
  countries: Facet[];
  studyLevels: Facet[];
  universities: Facet[];
  years: Facet[];
  intakes: Facet[];
  quick: Record<string, number>;
};

type Program = {
  id: string;
  sourceId: number;
  dataSource: string;
  name: string;
  university: {
    sourceId: number;
    name: string;
    country: string | null;
    state: string | null;
    city: string | null;
  };
  studyLevel: string | null;
  durationMonths: number | null;
  campus: string | null;
  currencyCode: string | null;
  intakes: string[];
  tuition: {
    amount: number | null;
    text: string | null;
  };
  applicationFee: {
    amount: number | null;
    text: string | null;
    currency: string | null;
    waived: boolean;
  };
  flags: {
    scholarship: boolean;
    internship: boolean;
    online: boolean;
    stem: boolean;
    englishWaiver: boolean;
    withoutMaths: boolean;
    esl: boolean;
  };
  requirements: Record<string, string | null>;
  entryRequirement: string | null;
  scholarshipDetail: string | null;
  remarks: string | null;
  rankings: {
    usNews: number | null;
    qs: number | null;
    webometricsNational: number | null;
    webometricsWorld: number | null;
  };
  offerings: Array<{
    year: number;
    searchCountry: string | null;
    intakes: string[];
    deadline: string | null;
    tuition: {
      amount: number | null;
      text: string | null;
      currency: string | null;
    };
    applicationFee: {
      amount: number | null;
      text: string | null;
      currency: string | null;
    };
  }>;
};

type SearchResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  programs: Program[];
  facets: Facets;
  error?: string;
};

type FilterState = {
  q: string;
  country: string;
  studyLevel: string;
  university: string;
  year: string;
  intake: string;
  quick: string;
  sort: string;
  maxTuition: string;
  requirements: string[];
};

const quickFilters = [
  { key: "scholarship", label: "Scholarship Available", icon: BadgeDollarSign },
  { key: "fee-waiver", label: "Application Fee Waiver", icon: WalletCards },
  { key: "stem", label: "STEM Programs", icon: Sparkles },
  { key: "online", label: "Online Programs", icon: GraduationCap },
  { key: "internship", label: "Co-op & Internships", icon: ShieldCheck },
  { key: "english-waiver", label: "English Waiver", icon: CheckCircle2 },
  { key: "esl", label: "ESL / ELP Available", icon: Clock }
];

const requirementOptions = [
  { key: "ielts", label: "IELTS" },
  { key: "toefl", label: "TOEFL iBT" },
  { key: "pte", label: "PTE" },
  { key: "det", label: "DET" },
  { key: "gre", label: "GRE" },
  { key: "gmat", label: "GMAT" },
  { key: "without-english", label: "Without English Proficiency" },
  { key: "without-maths", label: "Without Maths" }
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "ranking", label: "Best ranking" },
  { value: "tuition_asc", label: "Tuition: low to high" },
  { value: "tuition_desc", label: "Tuition: high to low" },
  { value: "name", label: "Program name" }
];

const countryAliases: Array<[string, string[]]> = [
  ["United States of America", ["united states", "usa", "u.s.a", "u.s.", "america", "us"]],
  ["United Kingdom", ["uk", "u.k.", "england", "britain", "great britain"]],
  ["United Arab Emirates", ["uae", "u.a.e.", "dubai"]],
  ["South Korea", ["korea"]]
];

function normalizeCountryFilter(value?: string) {
  const clean = (value || "").trim();
  const normalized = clean.toLowerCase().replace(/[^a-z0-9.]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  for (const [country, aliases] of countryAliases) {
    if (country.toLowerCase() === normalized || aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return country;
    }
  }
  return clean;
}

const defaultFacets: Facets = {
  countries: [],
  studyLevels: [],
  universities: [],
  years: [],
  intakes: [],
  quick: {}
};

export function SearchProgramClient({
  initialFilters
}: {
  initialFilters: Partial<FilterState>;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    q: initialFilters.q || "",
    country: normalizeCountryFilter(initialFilters.country),
    studyLevel: initialFilters.studyLevel || "",
    university: initialFilters.university || "",
    year: initialFilters.year || "2026",
    intake: initialFilters.intake || "",
    quick: initialFilters.quick || "",
    sort: "featured",
    maxTuition: "",
    requirements: []
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [, startTransition] = useTransition();

  const params = useMemo(() => buildParams(filters, page), [filters, page]);
  const facets = data?.facets || defaultFacets;

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search/programs?${params.toString()}`, {
          signal: controller.signal
        });
        const payload = (await response.json()) as SearchResponse;
        if (!response.ok) throw new Error(payload.error || "Program search failed");
        setData(payload);
        startTransition(() => {
          router.replace(`/search-program?${params.toString()}`, { scroll: false });
        });
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Program search failed");
          setData(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, filters.q ? 300 : 0);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [params, filters.q, router, startTransition]);

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function clearAll() {
    setFilters({
      q: "",
      country: "",
      studyLevel: "",
      university: "",
      year: "2026",
      intake: "",
      quick: "",
      sort: "featured",
      maxTuition: "",
      requirements: []
    });
    setPage(1);
  }

  function toggleRequirement(key: string) {
    setFilters((current) => ({
      ...current,
      requirements: current.requirements.includes(key)
        ? current.requirements.filter((item) => item !== key)
        : [...current.requirements, key]
    }));
    setPage(1);
  }

  const total = data?.total || 0;
  const pageCount = data?.totalPages || 1;
  const resultStart = total ? (page - 1) * (data?.pageSize || 12) + 1 : 0;
  const resultEnd = Math.min(page * (data?.pageSize || 12), total);

  return (
    <main className="page-visual-bg relative min-h-screen">
      <section className="relative overflow-hidden border-b border-white/60 dark:border-white/10">
        <div className="container py-7 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[rgb(var(--primary))]">Course finder</p>
              <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Search Programs
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[rgb(var(--fg-muted))]">
                Search programs and universities by course, country, intake, tuition, scholarship, rankings and eligibility requirements.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <StatPill label="Programs" value={formatCompact(total || 100102)} />
              <StatPill label="Countries" value={formatCompact(facets.countries.length || 47)} />
              <StatPill label="Years" value={formatCompact(facets.years.length || 4)} />
            </div>
          </div>

          <div className="liquid-panel mt-6 p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_170px_190px_140px_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--fg-muted))]" />
                <input
                  value={filters.q}
                  onChange={(event) => updateFilter("q", event.target.value)}
                  placeholder="Search Program / University"
                  className="input h-12 pl-10"
                />
              </label>
              <SelectBox
                label="Year"
                value={filters.year}
                onChange={(value) => updateFilter("year", value)}
                options={facets.years.length ? facets.years : [{ value: "2026" }, { value: "2027" }, { value: "2028" }, { value: "2029" }]}
              />
              <SelectBox
                label="Country"
                value={filters.country}
                onChange={(value) => updateFilter("country", value)}
                options={facets.countries}
                placeholder="All countries"
              />
              <SelectBox
                label="Intake"
                value={filters.intake}
                onChange={(value) => updateFilter("intake", value)}
                options={facets.intakes}
                placeholder="All intakes"
              />
              <button type="button" onClick={() => setPage(1)} className="btn-primary h-12 px-6">
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setAdvancedOpen((value) => !value)} className="btn-ghost px-3 py-2 text-sm">
                <SlidersHorizontal className="h-4 w-4" />
                Advanced Search
              </button>
              <button type="button" onClick={clearAll} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-[rgb(var(--fg-muted))] transition hover:bg-[rgb(var(--bg-elev))] hover:text-[rgb(var(--fg))]">
                <RotateCcw className="h-4 w-4" />
                Clear all
              </button>
              <ActiveFilterSummary filters={filters} onClear={(key) => updateFilter(key as keyof FilterState, "" as never)} />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-6 sm:py-8">
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-extrabold">
            <Sparkles className="h-4 w-4 text-[rgb(var(--primary))]" />
            Quick Filters
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 nice-scroll sm:flex-wrap sm:overflow-visible sm:pb-0">
            {quickFilters.map((item) => {
              const Icon = item.icon;
              const active = filters.quick === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => updateFilter("quick", active ? "" : item.key)}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                    active
                      ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))] text-white shadow-lg shadow-blue-500/20"
                      : "border-white/70 bg-white/56 text-[rgb(var(--fg))] shadow-sm backdrop-blur-xl hover:border-[rgb(var(--primary))]/50 hover:bg-white/78 dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {facets.quick[item.key] ? <span className={active ? "text-white/85" : "text-[rgb(var(--fg-muted))]"}>({formatCompact(facets.quick[item.key])})</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        {advancedOpen && (
          <div className="liquid-surface mb-5 p-4 lg:hidden">
            <FilterPanel
              facets={facets}
              filters={filters}
              updateFilter={updateFilter}
              toggleRequirement={toggleRequirement}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="liquid-surface sticky top-24 p-4">
              <FilterPanel
                facets={facets}
                filters={filters}
                updateFilter={updateFilter}
                toggleRequirement={toggleRequirement}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="liquid-surface mb-4 flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-extrabold">
                  {loading ? "Searching programs..." : `${formatNumber(total)} Programs found`}
                </p>
                <p className="mt-1 text-xs text-[rgb(var(--fg-muted))]">
                  {total ? `Showing ${formatNumber(resultStart)}-${formatNumber(resultEnd)} of ${formatNumber(total)}` : "Search by program or choose one advanced filter."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="whitespace-nowrap text-xs font-bold text-[rgb(var(--fg-muted))]">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(event) => updateFilter("sort", event.target.value)}
                  className="input h-10 min-w-[170px] text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            ) : null}

            {loading && !data ? (
              <div className="liquid-surface grid min-h-[360px] place-items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
              </div>
            ) : data?.programs.length ? (
              <div className="grid gap-4">
                {data.programs.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            ) : !loading ? (
              <EmptyState />
            ) : null}

            <div className="liquid-surface mt-6 flex flex-col items-center justify-between gap-3 p-3 sm:flex-row">
              <p className="text-xs font-semibold text-[rgb(var(--fg-muted))]">
                Page {formatNumber(page)} of {formatNumber(pageCount)}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="btn-ghost h-10 px-3 disabled:pointer-events-none disabled:opacity-45"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pageCount || loading}
                  onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                  className="btn-primary h-10 px-3 disabled:pointer-events-none disabled:opacity-45"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FilterPanel({
  facets,
  filters,
  updateFilter,
  toggleRequirement
}: {
  facets: Facets;
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  toggleRequirement: (key: string) => void;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-extrabold">
          <Filter className="h-4 w-4 text-[rgb(var(--primary))]" />
          Filter
        </h2>
      </div>
      <SelectBox
        label="Program Level"
        value={filters.studyLevel}
        onChange={(value) => updateFilter("studyLevel", value)}
        options={facets.studyLevels}
        placeholder="All levels"
      />
      <SelectBox
        label="University"
        value={filters.university}
        onChange={(value) => updateFilter("university", value)}
        options={facets.universities}
        placeholder="All universities"
      />
      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-[rgb(var(--fg-muted))]">Max Tuition Fee</span>
        <input
          value={filters.maxTuition}
          onChange={(event) => updateFilter("maxTuition", event.target.value)}
          type="number"
          min="0"
          placeholder="100000"
          className="input h-11"
        />
      </label>
      <div>
        <p className="mb-2 text-xs font-bold text-[rgb(var(--fg-muted))]">Requirements</p>
        <div className="grid gap-2">
          {requirementOptions.map((option) => (
            <label key={option.key} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-[rgb(var(--bg-elev))]">
              <input
                type="checkbox"
                checked={filters.requirements.includes(option.key)}
                onChange={() => toggleRequirement(option.key)}
                className="mt-0.5 h-4 w-4 rounded border-[rgb(var(--border))]"
              />
              <span className="leading-5">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgramCard({ program }: { program: Program }) {
  const flags = [
    program.flags.scholarship ? "Scholarship Available" : null,
    program.applicationFee.waived ? "No Application Fee" : null,
    program.flags.stem ? "STEM" : null,
    program.flags.online ? "Online" : null,
    program.flags.internship ? "Co-op / Internship" : null,
    program.flags.englishWaiver ? "English Waiver" : null
  ].filter(Boolean);
  const ranking = [
    program.rankings.usNews ? `${program.rankings.usNews} in US News Ranking` : null,
    program.rankings.qs ? `${program.rankings.qs} in QS World Ranking` : null,
    program.rankings.webometricsNational ? `${program.rankings.webometricsNational} in Webometrics National` : null,
    program.rankings.webometricsWorld ? `${program.rankings.webometricsWorld} in Webometrics World` : null
  ].filter(Boolean);
  const requirements = Object.entries(program.requirements).filter(([, value]) => value);

  return (
    <article className="liquid-surface p-4 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {program.studyLevel ? <span className="badge">{program.studyLevel}</span> : null}
            {flags.slice(0, 4).map((flag) => (
              <span key={flag} className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {flag}
              </span>
            ))}
          </div>
          <h3 className="mt-3 font-display text-xl font-extrabold leading-snug">
            {program.name}
          </h3>
          <div className="mt-3 grid gap-2 text-sm text-[rgb(var(--fg-muted))] sm:grid-cols-2">
            <span className="flex min-w-0 items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
              <span className="truncate font-semibold text-[rgb(var(--fg))]">{program.university.name}</span>
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
              {[program.university.city, program.university.state, program.university.country].filter(Boolean).join(", ") || program.campus || "Location available on request"}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
              Intakes: {program.intakes.length ? program.intakes.join(", ") : "Check offerings"}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
              Duration: {program.durationMonths ? `${program.durationMonths} Month(s)` : "Varies"}
            </span>
          </div>

          {requirements.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {requirements.slice(0, 6).map(([key, value]) => (
                <span key={key} className="rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-bold text-[rgb(var(--primary))]">
                  {key.toUpperCase()}: {value}
                </span>
              ))}
            </div>
          ) : null}

          {ranking.length ? (
            <div className="mt-4 grid gap-1 text-xs text-[rgb(var(--fg-muted))] sm:grid-cols-2">
              {ranking.slice(0, 4).map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          {program.offerings.length ? (
            <div className="mt-4 grid gap-2">
              {program.offerings.map((offering, index) => (
                <div key={`${program.sourceId}-${index}`} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]/65 px-3 py-2 text-xs dark:bg-white/5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">{offering.year} {offering.searchCountry ? `for ${offering.searchCountry}` : ""}</span>
                    <span className="text-[rgb(var(--fg-muted))]">{offering.deadline || "Deadline varies"}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[rgb(var(--fg-muted))]">
                    <span>Intakes: {offering.intakes.length ? offering.intakes.join(", ") : "Open"}</span>
                    <span>Tuition: {formatMoney(offering.tuition.amount, offering.tuition.currency, offering.tuition.text)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-white/60 bg-white/42 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-wide text-[rgb(var(--fg-muted))]">Yearly Tuition Fee</p>
          <p className="mt-2 font-display text-2xl font-extrabold">
            {formatMoney(program.tuition.amount, program.currencyCode, program.tuition.text)}
          </p>
          <a href={`/search-program?q=${encodeURIComponent(program.name)}${program.studyLevel ? `&studyLevel=${encodeURIComponent(program.studyLevel)}` : ""}`} className="btn-primary mt-4 w-full justify-center">
            <GraduationCap className="h-4 w-4" />
            View Similar Programs
          </a>
          <div className="mt-4 grid gap-2 text-sm">
            <span className="flex items-center justify-between gap-2">
              <span className="text-[rgb(var(--fg-muted))]">Application Fee</span>
              <span className="font-bold">{program.applicationFee.waived ? "No Application Fee" : formatMoney(program.applicationFee.amount, program.applicationFee.currency, program.applicationFee.text)}</span>
            </span>
            <span className="flex items-center justify-between gap-2">
              <span className="text-[rgb(var(--fg-muted))]">Data Source</span>
              <span className="font-bold">{program.dataSource}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function SelectBox({
  label,
  value,
  onChange,
  options,
  placeholder = "Select"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Facet[];
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-[rgb(var(--fg-muted))]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="input h-11 text-sm">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value}{typeof option.count === "number" ? ` (${formatCompact(option.count)})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActiveFilterSummary({
  filters,
  onClear
}: {
  filters: FilterState;
  onClear: (key: keyof FilterState) => void;
}) {
  const active = [
    filters.country ? ["country", filters.country] : null,
    filters.studyLevel ? ["studyLevel", filters.studyLevel] : null,
    filters.university ? ["university", filters.university] : null,
    filters.intake ? ["intake", filters.intake] : null,
    filters.quick ? ["quick", filters.quick.replace(/-/g, " ")] : null,
    filters.maxTuition ? ["maxTuition", `max ${filters.maxTuition}`] : null
  ].filter(Boolean) as Array<[keyof FilterState, string]>;

  if (!active.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {active.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onClear(key)}
          className="inline-flex items-center gap-1 rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs font-bold capitalize text-[rgb(var(--primary))]"
        >
          {label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="liquid-surface grid min-h-[320px] place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
          <Search className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-xl font-extrabold">No matching programs</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[rgb(var(--fg-muted))]">
          Try another program name, remove a requirement filter, or search by university.
        </p>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="liquid-surface px-4 py-3">
      <p className="font-display text-xl font-extrabold">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[rgb(var(--fg-muted))]">{label}</p>
    </div>
  );
}

function buildParams(filters: FilterState, page: number) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", "12");
  for (const [key, value] of Object.entries(filters)) {
    if (key === "requirements") continue;
    if (typeof value === "string" && value.trim()) {
      params.set(key, key === "country" ? normalizeCountryFilter(value) : value.trim());
    }
  }
  for (const requirement of filters.requirements) {
    params.append("requirement", requirement);
  }
  return params;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatMoney(amount: number | null, currency: string | null, fallback?: string | null) {
  if (amount && currency) return `${currency} ${formatNumber(Math.round(amount))}`;
  if (fallback) return fallback;
  return "Available on request";
}
