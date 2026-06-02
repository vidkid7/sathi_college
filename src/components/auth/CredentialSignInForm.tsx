"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { getProviders, getSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, LogIn, ShieldCheck, UserRound } from "lucide-react";

type Props = {
  mode: "user" | "admin" | "signup";
  title: string;
  subtitle: string;
  defaultCallback: string;
};

export function CredentialSignInForm({ mode, title, subtitle, defaultCallback }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const Icon = mode === "admin" ? ShieldCheck : UserRound;

  useEffect(() => {
    if (mode === "admin") return;
    let mounted = true;
    getProviders()
      .then((providers) => {
        if (mounted) setGoogleEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        if (mounted) setGoogleEnabled(false);
      });
    return () => {
      mounted = false;
    };
  }, [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup") {
      const register = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const registerData = await register.json().catch(() => ({}));
      if (!register.ok) {
        setLoading(false);
        setError(registerData.error || "Could not create account");
        return;
      }
    }

    const res = await signIn("credentials", { email, password, redirect: false });
    if (!res?.ok) {
      setLoading(false);
      setError(mode === "signup" ? "Account created, but sign in failed. Try signing in again." : "Invalid email or password");
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
          <img src="/assets/brand/sathi-logo-glass.png" alt="SathiCollege logo" className="h-11 w-11 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
          <div>
            <h1 className="font-display text-xl font-bold">{title}</h1>
            <p className="text-xs text-[rgb(var(--fg-muted))]">{subtitle}</p>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={onSubmit}>
          {mode !== "admin" && (
            <>
              <button
                type="button"
                disabled={!googleEnabled}
                onClick={() => googleEnabled && signIn("google", { callbackUrl: params.get("callbackUrl") || defaultCallback })}
                className="btn-ghost w-full bg-white/90 py-3 dark:bg-white/10"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white font-display text-sm font-extrabold text-[#4285f4] shadow-sm">G</span>
                {googleEnabled ? "Continue with Google" : "Google sign-in needs setup"}
              </button>
              {!googleEnabled && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google login.
                </p>
              )}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-[rgb(var(--fg-muted))]">
                <span className="h-px bg-[rgb(var(--border))]" />
                <span>or use email</span>
                <span className="h-px bg-[rgb(var(--border))]" />
              </div>
            </>
          )}
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input className="input" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </div>
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
            {loading ? (mode === "signup" ? "Creating..." : "Signing in...") : (mode === "signup" ? "Create account" : "Sign in")}
          </button>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-[rgb(var(--fg-muted))]">
            <Icon className="h-3 w-3" /> {mode === "admin" ? "Staff access is role checked and session limited" : mode === "signup" ? "Create a student account" : "Student sign in"}
          </p>
          {mode === "user" && (
            <Link href="/signup" className="text-center text-sm font-semibold text-[rgb(var(--primary))]">Create a student account</Link>
          )}
          {mode === "signup" && (
            <Link href="/login" className="text-center text-sm font-semibold text-[rgb(var(--primary))]">Already have an account? Sign in</Link>
          )}
        </form>
      </GlassCard>
    </main>
  );
}
