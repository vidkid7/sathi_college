"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, BookOpen, Compass, Flame, Heart, Home, ImageIcon, MessageCircle, Plus, Search, Send, Sparkles, TrendingUp, Video } from "lucide-react";
import { motion } from "framer-motion";
import { safeImageSrc } from "@/lib/utils";

type Community = { id: string; slug: string; name: string; description: string; joinUrl: string; image?: string | null };
type ActiveView = "home" | "trending" | "explore" | "all";

const tags = ["JEE", "AP EAPCET", "TS EAMCET", "KCET", "KEAM", "TNEA", "WBJEE"];

const fallbackCommunities: Community[] = [
  { id: "jee", slug: "jee", name: "JEE Community", description: "JEE Main and Advanced doubts, PYQs, college choice and counselling updates.", joinUrl: "https://api.whatsapp.com/send/?phone=919281014900" },
  { id: "ap-eapcet", slug: "ap-eapcet", name: "AP EAPCET Community", description: "AP EAPCET alerts, ranks, branch discussion and college suggestions.", joinUrl: "https://api.whatsapp.com/send/?phone=919281014900" },
  { id: "ts-eamcet", slug: "ts-eamcet", name: "TS EAMCET Community", description: "TS EAMCET preparation, cutoff questions, web-option guidance and results.", joinUrl: "https://api.whatsapp.com/send/?phone=919281014900" },
  { id: "kcet", slug: "kcet", name: "KCET Community", description: "KCET college comparison, round-wise cutoff support and branch planning.", joinUrl: "https://api.whatsapp.com/send/?phone=919281014900" }
];

const mockPostBodies = [
  "Sns college of engineering, Kathir college of engineering, Arjune college of engineering and Easwar college of engineering. Which one should I keep higher?",
  "I did not open a book properly for EAPCET and the exam is close. Need a realistic topic plan for the next few weeks.",
  "Check out EAMCET related details in the community. This helped me understand counselling and branch priorities.",
  "Need to prepare for JEE Exam. What should I revise first if I am starting late?",
  "Can someone explain how to verify placement stats on college websites before choosing a private college?",
  "Hostel, mess and campus-life reviews are confusing. How do you identify genuine student feedback?"
];

const trendingTitles = [
  "JEE Mains: most common mistakes and how to avoid them",
  "Are college website placement stats trustable?",
  "Is paying 8 LPA per year for a private college worth it?",
  "Hostel mess and campus hygiene: what should students verify?",
  "Scholarship documents students usually miss",
  "Safety for girls: campus security questions to ask"
];

const composerActions = [
  { label: "Photo", icon: ImageIcon },
  { label: "Video", icon: Video },
  { label: "Poll", icon: BarChart3 }
] as const;

const communityLogoFallbacks: Record<string, string> = {
  jee: "/assets/collegedost/jee-common.png",
  "ap-eapcet": "/assets/collegedost/ap-eamcet.png",
  "ts-eamcet": "/assets/collegedost/ts-eamcet.png",
  eamcet: "/assets/collegedost/ap-eamcet.png",
  kcet: "/assets/collegedost/kcet.png",
  keam: "/assets/collegedost/keam.png",
  tnea: "/assets/collegedost/tnea.png",
  wbjee: "/assets/collegedost/wbjee.png",
  mhtcet: "/assets/collegedost/mht-cet.png"
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S";
}

export function CommunityFeed({ communities, activeView = "home" }: { communities: Community[]; activeView?: ActiveView }) {
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [commenting, setCommenting] = useState<string | null>(null);
  const [composerMode, setComposerMode] = useState<"Photo" | "Video" | "Poll" | null>(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const source = communities.length ? communities : fallbackCommunities;

  const posts = useMemo(() => {
    return Array.from({ length: Math.max(source.length, 6) }, (_, index) => {
      const community = source[index % source.length];
      const tag = tags[index % tags.length];
      const title = index === 0 ? "Coimbatore engineering college" : index === 1 ? "Help me out with EAPCET prep" : index === 2 ? "Struggling with EAMCET counselling" : trendingTitles[index % trendingTitles.length];
      return {
        id: `${community.slug}-${index}`,
        slug: slugify(title),
        author: ["thanuvardanya7", "shriya568", "akanksha-solleti299", "yogeswar-naidu306", "mayank_b", "anita_rao"][index % 6],
        initial: initials(community.name),
        time: index === 0 ? "4d ago" : `${25 + index * 8}d ago`,
        title,
        tag,
        body: mockPostBodies[index % mockPostBodies.length],
        comments: index % 4,
        likes: 1 + (index % 5),
        views: 18 + index * 9,
        joinUrl: community.joinUrl
      };
    });
  }, [source]);

  const searched = posts.filter((post) => `${post.title} ${post.tag} ${post.body} ${post.author}`.toLowerCase().includes(query.toLowerCase()));
  const visiblePosts = activeView === "trending"
    ? [...searched].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
    : activeView === "explore"
      ? searched.filter((post) => ["JEE", "AP EAPCET", "TS EAMCET", "KCET"].includes(post.tag))
      : searched;
  const trending = [...posts].sort((a, b) => (b.likes + b.comments + b.views) - (a.likes + a.comments + a.views)).slice(0, 8);

  const navItems = [
    { href: "/community", label: "Home Page", key: "home", icon: Home },
    { href: "/community/trending", label: "Trending", key: "trending", icon: TrendingUp },
    { href: "/community/explore", label: "Explore", key: "explore", icon: Compass },
    { href: "/community/all", label: "All", key: "all", icon: BookOpen }
  ] as const;

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:py-10">
      <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="order-2 grid min-w-0 gap-4 xl:order-1 xl:sticky xl:top-24 xl:h-fit">
          <div className="reference-panel hidden p-4 xl:block">
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/brand/sathi-logo.png" alt="SathiCollege community logo" className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
              <div>
                <p className="text-sm font-extrabold">Community</p>
                <p className="text-xs text-[rgb(var(--fg-muted))]">Student platform</p>
              </div>
            </div>
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.key;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${active ? "bg-[rgb(var(--primary))] text-white shadow-lg shadow-blue-500/20" : "text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--primary))]/10 hover:text-[rgb(var(--fg))]"}`}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="soft-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-extrabold">Entrance Exams</h2>
                <p className="text-xs text-[rgb(var(--fg-muted))]">Follow the exam rooms you need.</p>
              </div>
              <button type="button" onClick={() => setShowExamForm((value) => !value)} className="grid h-9 w-9 place-items-center rounded-lg bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]" aria-label="Add entrance exam">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {showExamForm && (
              <div className="mt-4 rounded-lg border border-[rgb(var(--border))] bg-white/70 p-3 dark:bg-[rgb(var(--bg-elev))]/60">
                <p className="text-xs font-bold">Add Entrance Exam</p>
                <div className="mt-2 flex gap-2">
                  <input className="input h-10 px-3 py-2" placeholder="Exam name" />
                  <button type="button" onClick={() => setShowExamForm(false)} className="btn-primary h-10 px-3 py-2 text-xs">Add</button>
                </div>
              </div>
            )}
            <div className="mt-4 grid gap-2">
              {source.slice(0, 7).map((community) => (
                <a key={community.id} href={community.joinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[rgb(var(--primary))]/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={safeImageSrc(community.image, communityLogoFallbacks[community.slug] || "/assets/generated/visual-blog.png")} alt={`${community.name} logo`} className="h-9 w-9 rounded-lg bg-white object-contain p-1 shadow-sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{community.name}</span>
                    <span className="block truncate text-xs text-[rgb(var(--fg-muted))]">Join discussion</span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <Link href="/mock-test?utm_source=Community&utm_medium=Website-Sidebar&utm_campaign=Mock-Test" className="soft-card group overflow-hidden p-0">
            <div className="relative h-32 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/collegedost/mock/jee-mains.png" alt="JEE mock test practice" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[rgb(var(--primary))]">All PYQs included</span>
            </div>
            <div className="p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[rgb(var(--primary))]">Practice JEE Mock Test</p>
              <p className="mt-1 text-sm font-bold">Attempt Now</p>
            </div>
          </Link>
        </aside>

        <main className="order-1 min-w-0 xl:order-2">
          <div className="reference-panel mb-4 p-4 sm:p-5">
            <nav className="nice-scroll mb-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.key;
                return (
                  <Link key={item.href} href={item.href} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${active ? "bg-[rgb(var(--primary))] text-white shadow-lg shadow-blue-500/20" : "bg-white/78 text-[rgb(var(--fg-muted))] ring-1 ring-[rgb(var(--border))] hover:text-[rgb(var(--fg))] dark:bg-[rgb(var(--bg-elev))]/70"}`}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-bold text-[rgb(var(--primary))]"><Sparkles className="h-4 w-4" /> Posts For You</p>
                <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Ask, compare and decide with other aspirants</h1>
              </div>
              <Link href="/login" className="btn-ghost w-fit px-4 py-2">Sign In</Link>
            </div>
            <label className="mt-5 flex min-h-12 items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-white/80 px-4 shadow-sm dark:bg-[rgb(var(--bg-elev))]/70">
              <Search className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts, topics, users..." className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>

          <div className="soft-card mb-4 p-4">
            <p className="font-display text-lg font-extrabold">What's on your mind there?</p>
            <textarea className="input mt-3 min-h-24 resize-none" placeholder="Ask a counselling question, share your cutoff confusion, or start a poll..." />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {composerActions.map(({ label, icon: Icon }) => (
                <button key={label} type="button" onClick={() => setComposerMode(label)} className={composerMode === label ? "btn-primary justify-center py-2" : "btn-ghost justify-center py-2"}>
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            {composerMode && <p className="mt-3 rounded-lg bg-[rgb(var(--primary))]/10 px-3 py-2 text-xs font-semibold text-[rgb(var(--primary))]">{composerMode} mode selected. Sign in to publish community posts.</p>}
          </div>

          <div className="grid gap-4">
            {visiblePosts.map((post, index) => (
              <motion.article key={post.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: (index % 6) * 0.04 }} className="soft-card p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 font-extrabold text-[rgb(var(--primary))] shadow-inner">{post.initial}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--fg-muted))]">
                      <span className="font-bold text-[rgb(var(--fg))]">{post.author}</span>
                      <span aria-hidden>•</span>
                      <span>{post.time}</span>
                    </div>
                    <Link href={`/community/post/${post.slug}`} className="mt-2 block font-display text-xl font-extrabold leading-tight hover:text-[rgb(var(--primary))]">{post.title}</Link>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setQuery(post.tag)} className="badge">{post.tag}</button>
                      {index % 2 === 0 && <span className="badge">#engineering</span>}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[rgb(var(--fg-muted))]">{post.body}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={() => setLiked((current) => ({ ...current, [post.id]: !current[post.id] }))} className={liked[post.id] ? "btn-primary px-4 py-2" : "btn-ghost px-4 py-2"}>
                        <Heart className="h-4 w-4" />
                        {post.likes + (liked[post.id] ? 1 : 0)}
                      </button>
                      <button type="button" onClick={() => setCommenting((current) => current === post.id ? null : post.id)} className="btn-ghost px-4 py-2">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </button>
                      <a href={post.joinUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-4 py-2">
                        <Send className="h-4 w-4" />
                        Join group
                      </a>
                    </div>
                    {commenting === post.id && (
                      <div className="mt-4 flex gap-2 rounded-lg border border-[rgb(var(--border))] bg-white/70 p-3 dark:bg-[rgb(var(--bg-elev))]/60">
                        <input className="input h-10 px-3 py-2" placeholder="Write a comment..." />
                        <button type="button" onClick={() => setCommenting(null)} className="btn-primary h-10 px-3 py-2 text-xs">Send</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </main>

        <aside className="order-3 grid min-w-0 gap-4 xl:sticky xl:top-24 xl:h-fit">
          <div className="reference-panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="font-display text-xl font-extrabold">Trending Now</h2>
            </div>
            <div className="grid gap-3">
              {trending.map((post, index) => (
                <Link key={post.id} href={`/community/post/${post.slug}`} className="group grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-lg p-2 transition hover:bg-[rgb(var(--primary))]/10">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[rgb(var(--primary))]/10 text-sm font-extrabold text-[rgb(var(--primary))]">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-[rgb(var(--fg-muted))]">{post.author}</span>
                    <span className="line-clamp-2 text-sm font-extrabold leading-5 group-hover:text-[rgb(var(--primary))]">{post.title}</span>
                    <span className="mt-1 block text-xs text-[rgb(var(--fg-muted))]">{post.likes} likes • {post.comments} replies • {post.time}</span>
                  </span>
                </Link>
              ))}
            </div>
            <Link href="/community/trending" className="subtle-link mt-4">View all trending posts</Link>
          </div>

          <div className="soft-card p-5">
            <h2 className="font-display text-lg font-extrabold">Popular Tags</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button key={tag} type="button" onClick={() => setQuery(tag)} className="badge">{tag}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
