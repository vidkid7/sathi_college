"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export function ContactForm({ source = "contact-form", className }: { source?: string; className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = { ...Object.fromEntries(new FormData(form) as any), source };
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "content-type": "application/json" }
      });
      if (!r.ok) throw new Error();
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("glass-card grid gap-4", className ?? "lg:col-span-2")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input name="name" required className="input" placeholder="Your full name" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="text" inputMode="email" name="email" required className="input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input name="phone" required className="input" placeholder="+91 xxxxx xxxxx" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Exam (optional)</label>
          <input name="exam" className="input" placeholder="JEE / EAMCET / KCET ..." />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Message</label>
        <textarea name="message" rows={4} className="input resize-none" placeholder="How can we help?" />
      </div>
      <button disabled={status === "loading"} className="btn-primary w-fit">
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
      {status === "ok" && <p className="text-sm text-emerald-500">Thanks — we&apos;ll get back to you soon.</p>}
      {status === "error" && <p className="text-sm text-red-500">Something went wrong. Try again.</p>}
    </form>
  );
}
