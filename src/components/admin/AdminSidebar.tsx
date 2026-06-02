"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, BookOpen, BriefcaseBusiness, ClipboardCheck, Users, FileText, Settings, MessageSquare, LogOut, FolderTree, Search, Target } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/colleges", label: "Colleges", icon: Building2 },
  { href: "/admin/exams", label: "Exams", icon: BookOpen },
  { href: "/admin/courses", label: "Courses", icon: ClipboardCheck },
  { href: "/admin/search-programs", label: "Search Programs", icon: Search },
  { href: "/admin/predictor-data", label: "Predictor Data", icon: Target },
  { href: "/admin/careers", label: "Careers", icon: BriefcaseBusiness },
  { href: "/admin/communities", label: "Communities", icon: Users },
  { href: "/admin/community-posts", label: "Community Posts", icon: MessageSquare },
  { href: "/admin/categories", label: "Blog Categories", icon: FolderTree },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/settings", label: "Site Settings", icon: Settings }
];

export function AdminSidebar() {
  const path = usePathname();
  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 flex-col border-r border-[rgb(var(--border))] p-4 lg:flex">
      <Link href="/admin" className="mb-6 flex items-center gap-2 px-2 pt-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/brand/sathi-logo-glass.png" alt="SathiCollege admin logo" className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
        <span className="font-display text-lg font-bold">Admin</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {items.map((it) => {
          const active = path === it.href || (it.href !== "/admin" && path?.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                  : "text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-elev))] hover:text-[rgb(var(--fg))]"
              )}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={() => signOut({ callbackUrl: "/admin/access" })} className="btn-ghost mt-4 w-full">
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </aside>
  );
}
