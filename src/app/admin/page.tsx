import { db } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, Building2, BookOpen, FileText, MessageSquare, TrendingUp, Users } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ReferenceVisual } from "@/components/ui/ReferenceVisual";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/access");

  const [colleges, exams, communities, posts, leads, predictions] = await Promise.all([
    db.college.count(),
    db.exam.count(),
    db.community.count(),
    db.post.count(),
    db.lead.count(),
    db.rankPrediction.count()
  ]);

  const stats = [
    { l: "Colleges", v: colleges, icon: Building2, href: "/admin/colleges", color: "from-blue-500 to-cyan-500" },
    { l: "Exams", v: exams, icon: BookOpen, href: "/admin/exams", color: "from-violet-500 to-purple-500" },
    { l: "Communities", v: communities, icon: Users, href: "/admin/communities", color: "from-emerald-500 to-teal-500" },
    { l: "Blog Posts", v: posts, icon: FileText, href: "/admin/blog", color: "from-amber-500 to-orange-500" },
    { l: "Leads", v: leads, icon: MessageSquare, href: "/admin/leads", color: "from-pink-500 to-rose-500" },
    { l: "Rank Predictions", v: predictions, icon: TrendingUp, href: "/admin", color: "from-indigo-500 to-blue-500" }
  ];

  return (
    <>
      <AdminTopbar title="Dashboard" />
      <section className="reference-panel mb-6 overflow-hidden p-6">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">For Counselors & Institutes</p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Powerful Dashboard for Better Guidance
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[rgb(var(--fg-muted))]">
              Manage students, track performance, publish content, and follow admissions activity from one responsive admin workspace.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Total students", value: leads, tone: "text-blue-600 bg-blue-500/10" },
                { label: "Active articles", value: posts, tone: "text-violet-600 bg-violet-500/10" },
                { label: "Counselling signals", value: predictions, tone: "text-emerald-600 bg-emerald-500/10" }
              ].map((item) => (
                <div key={item.label} className="soft-card p-4">
                  <p className="font-display text-2xl font-extrabold">{item.value.toLocaleString("en-IN")}</p>
                  <p className="mt-1 text-xs text-[rgb(var(--fg-muted))]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <ReferenceVisual name="dashboard" className="mx-auto h-72 w-full object-contain" />
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.l} href={s.href}>
            <GlassCard>
              <div className="flex items-center gap-4">
                <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow`}>
                  <s.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs text-[rgb(var(--fg-muted))]">{s.l}</p>
                  <p className="font-display text-2xl font-bold">{s.v}</p>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <GlassCard hover={false}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Performance Overview</h2>
              <p className="text-xs text-[rgb(var(--fg-muted))]">Admissions and content activity snapshot</p>
            </div>
            <Activity className="h-5 w-5 text-[rgb(var(--primary))]" />
          </div>
          <div className="flex h-40 items-end gap-3">
            {[42, 64, 48, 76, 58, 88, 72].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-[rgb(var(--primary))] to-blue-300" style={{ height: `${height}%` }} />
                <span className="text-[10px] text-[rgb(var(--fg-muted))]">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <h2 className="font-display text-xl font-bold">Top Actions</h2>
          <div className="mt-4 grid gap-3">
            {[
              { label: "Review new leads", href: "/admin/leads", value: leads },
              { label: "Update college data", href: "/admin/colleges", value: colleges },
              { label: "Publish latest articles", href: "/admin/blog", value: posts }
            ].map((item) => (
              <Link key={item.href} href={item.href} className="soft-card flex items-center justify-between p-3 text-sm font-semibold">
                <span>{item.label}</span>
                <span className="rounded-lg bg-[rgb(var(--primary))]/10 px-2.5 py-1 text-xs text-[rgb(var(--primary))]">{item.value}</span>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
