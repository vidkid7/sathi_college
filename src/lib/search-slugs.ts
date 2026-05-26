export function slugifySearchValue(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function importedEntityPath(basePath: "/colleges" | "/courses", sourceId: number, name: string) {
  return `${basePath}/${sourceId}-${slugifySearchValue(name) || "item"}`;
}

export function sourceIdFromSlug(slug: string) {
  const match = slug.match(/^(\d+)(?:-|$)/);
  if (!match) return null;
  const sourceId = Number.parseInt(match[1], 10);
  return Number.isFinite(sourceId) ? sourceId : null;
}

export function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatSearchMoney(amount: unknown, currency?: string | null, fallback?: string | null) {
  if (amount !== null && amount !== undefined && amount !== "") {
    const numeric = Number(amount);
    if (Number.isFinite(numeric) && numeric > 0) {
      return `${currency || ""} ${new Intl.NumberFormat("en-IN").format(Math.round(numeric))}`.trim();
    }
  }
  return fallback || "Available on request";
}
