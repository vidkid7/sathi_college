import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-display text-6xl font-extrabold gradient-text">404</p>
        <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-[rgb(var(--fg-muted))]">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Back home</Link>
      </div>
    </div>
  );
}
