"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, BriefcaseBusiness, Building2, ClipboardCheck, FileText, FolderTree, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, Users, X } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/colleges", label: "Colleges", icon: Building2 },
  { href: "/admin/exams", label: "Exams", icon: BookOpen },
  { href: "/admin/courses", label: "Courses", icon: ClipboardCheck },
  { href: "/admin/careers", label: "Careers", icon: BriefcaseBusiness },
  { href: "/admin/communities", label: "Communities", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/blog", label: "Posts", icon: FileText },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export function AdminTopbar({ title }: { title: string }) {
  const { data } = useSession();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="text-xs text-[rgb(var(--fg-muted))]">Welcome back, {data?.user?.name || data?.user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen((value) => !value)} className="glass grid h-10 w-10 place-items-center rounded-lg lg:hidden" aria-label="Toggle admin menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="glass-strong mt-4 grid gap-1 rounded-lg p-3 lg:hidden">
          {adminLinks.map((item) => {
            const active = path === item.href || (item.href !== "/admin" && path?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  active ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]" : "text-[rgb(var(--fg-muted))]"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button onClick={() => signOut({ callbackUrl: "/admin/access" })} className="btn-ghost mt-2 w-full">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      )}
    </div>
  );
}
