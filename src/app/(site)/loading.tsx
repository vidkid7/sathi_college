export default function Loading() {
  return (
    <div className="container py-24">
      <div className="mx-auto max-w-md animate-pulse space-y-3">
        <div className="h-6 w-1/2 rounded bg-[rgb(var(--bg-elev))]" />
        <div className="h-4 w-full rounded bg-[rgb(var(--bg-elev))]" />
        <div className="h-4 w-2/3 rounded bg-[rgb(var(--bg-elev))]" />
      </div>
    </div>
  );
}
