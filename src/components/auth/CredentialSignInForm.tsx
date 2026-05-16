"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { getSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Lock, LogIn, ShieldCheck, UserRound } from "lucide-react";

type Props = {
  mode: "user" | "admin";
  title: string;
  subtitle: string;
  defaultCallback: string;
};

export function CredentialSignInForm({ mode, title, subtitle, defaultCallback }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const Icon = mode === "admin" ? ShieldCheck : UserRound;
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });
    if (!res?.ok) {
      setLoading(false);
      setError("Invalid email or password");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;
    if (mode === "admin" && role !== "ADMIN" && role !== "EDITOR") {
      await signOut({ redirect: false });
      setLoading(false);
      setError("This portal is only for authorized staff.");
      return;
    }

    const callback = params.get("callbackUrl");
    if (mode === "user" && (role === "ADMIN" || role === "EDITOR")) {
      router.replace("/admin");
      router.refresh();
      return;
    }

    router.replace(callback || defaultCallback);
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10 page-visual-bg" />
      <GlassCard className="w-full max-w-md">
        <div className="mb-5 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/brand/sathi-logo.png" alt="SathiCollege logo" className="h-11 w-11 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
          <div>
            <h1 className="font-display text-xl font-bold">{title}</h1>
            <p className="text-xs text-[rgb(var(--fg-muted))]">{subtitle}</p>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={onSubmit}>
          {mode === "user" && googleEnabled && (
            <>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: params.get("callbackUrl") || defaultCallback })}
                className="btn-ghost w-full bg-white/90 py-3 dark:bg-white/10"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white font-display text-sm font-extrabold text-[#4285f4] shadow-sm">G</span>
                Continue with Google
              </button>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-[rgb(var(--fg-muted))]">
                <span className="h-px bg-[rgb(var(--border))]" />
                <span>or use email</span>
                <span className="h-px bg-[rgb(var(--border))]" />
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={mode === "admin" ? "staff@example.com" : "you@example.com"} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input className="input" type="password" autoComplete={mode === "admin" ? "current-password" : "current-password"} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
          <button disabled={loading} className="btn-primary mt-2">
            {loading ? <Lock className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-[rgb(var(--fg-muted))]">
            <Icon className="h-3 w-3" /> {mode === "admin" ? "Staff access is role checked and session limited" : "Student sign in"}
          </p>
        </form>
      </GlassCard>
    </main>
  );
}
