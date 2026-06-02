"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { BarChart3, BookOpen, Compass, Flame, Heart, Home, ImageIcon, MessageCircle, Plus, Search, Send, Sparkles, TrendingUp, Video } from "lucide-react";
import { motion } from "framer-motion";
import { safeImageSrc } from "@/lib/utils";
import type { SerializedCommunityPost } from "@/lib/community";
import { REAL_IMAGES } from "@/lib/real-images";

type Community = { id: string; slug: string; name: string; description: string; joinUrl: string; image?: string | null };
type ActiveView = "home" | "trending" | "explore" | "all";
type CurrentUser = { id?: string | null; name?: string | null; email?: string | null; role?: string | null } | null;

const composerActions = [
  { label: "Photo", icon: ImageIcon },
  { label: "Video", icon: Video },
  { label: "Poll", icon: BarChart3 }
] as const;

const communityLogoFallbacks: Record<string, string> = {
  jee: "/assets/sathicollege/jee-common.png",
  "ap-eapcet": "/assets/sathicollege/ap-eamcet.png",
  "ts-eamcet": "/assets/sathicollege/ts-eamcet.png",
  eamcet: "/assets/sathicollege/ap-eamcet.png",
  kcet: "/assets/sathicollege/kcet.png",
  keam: "/assets/sathicollege/keam.png",
  tnea: "/assets/sathicollege/tnea.png",
  wbjee: "/assets/sathicollege/wbjee.png",
  mhtcet: "/assets/sathicollege/mht-cet.png"
};

function initials(name?: string | null, email?: string | null) {
  const value = name || email || "SathiCollege";
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S";
}

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CommunityFeed({
  communities,
  posts,
  currentUser,
  activeView = "home"
}: {
  communities: Community[];
  posts: SerializedCommunityPost[];
  currentUser?: CurrentUser;
  activeView?: ActiveView;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(posts);
  const [commenting, setCommenting] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [composerMode, setComposerMode] = useState<"Photo" | "Video" | "Poll" | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [communityId, setCommunityId] = useState(communities[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const navItems = [
    { href: "/community", label: "Home Page", key: "home", icon: Home },
    { href: "/community/trending", label: "Trending", key: "trending", icon: TrendingUp },
    { href: "/community/explore", label: "Explore", key: "explore", icon: Compass },
    { href: "/community/all", label: "All", key: "all", icon: BookOpen }
  ] as const;

  const tags = useMemo(() => {
    const fromPosts = items.map((post) => post.tag).filter(Boolean) as string[];
    const fromCommunities = communities.map((community) => community.name.replace(/\s+Community$/i, ""));
    return Array.from(new Set([...fromPosts, ...fromCommunities])).slice(0, 10);
  }, [communities, items]);

  const searched = items.filter((post) => `${post.title} ${post.tag ?? ""} ${post.body} ${post.author.name ?? ""} ${post.author.email}`.toLowerCase().includes(query.toLowerCase()));
  const visiblePosts = activeView === "trending"
    ? [...searched].sort((a, b) => (b.likesCount + b.commentsCount + b.views) - (a.likesCount + a.commentsCount + a.views))
    : activeView === "explore"
      ? searched.filter((post) => post.community || post.tag)
      : searched;
  const trending = [...items].sort((a, b) => (b.likesCount + b.commentsCount + b.views) - (a.likesCount + a.commentsCount + a.views)).slice(0, 8);

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser?.id) {
      router.push("/login?callbackUrl=/community");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          communityId: communityId || null,
          tag: communities.find((community) => community.id === communityId)?.name ?? null,
          mediaType: composerMode
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not publish post");
      setItems((current) => [data.item, ...current]);
      setTitle("");
      setBody("");
      setComposerMode(null);
      setMessage("Post published.");
    } catch (error: any) {
      setMessage(error?.message || "Could not publish post");
    } finally {
      setSaving(false);
    }
  }

  async function toggleLike(postId: string) {
    if (!currentUser?.id) {
      router.push("/login?callbackUrl=/community");
      return;
    }
    const response = await fetch(`/api/community/posts/${postId}/like`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "Could not like post");
      return;
    }
    setMessage(null);
    setItems((current) => current.map((post) => post.id === postId ? { ...post, likedByMe: data.liked, likesCount: data.likesCount } : post));
  }

  async function sendComment(postId: string) {
    if (!currentUser?.id) {
      router.push("/login?callbackUrl=/community");
      return;
    }
    const response = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: commentBody })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "Could not comment");
      return;
    }
    setMessage(null);
    setItems((current) => current.map((post) => post.id === postId ? { ...post, comments: [...post.comments, data.item], commentsCount: post.commentsCount + 1 } : post));
    setCommentBody("");
    setCommenting(null);
  }

  return (
    <section className="relative z-0 mx-auto w-full max-w-[1380px] overflow-x-hidden px-4 py-8 sm:py-10">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] 2xl:grid-cols-[280px_minmax(0,720px)_300px] 2xl:justify-center">
        <aside className="order-3 grid min-w-0 gap-4 md:grid-cols-2 lg:col-span-2 2xl:order-1 2xl:col-span-1 2xl:grid-cols-1 2xl:sticky 2xl:top-24 2xl:h-fit">
          <div className="reference-panel hidden p-4 2xl:block">
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/brand/sathi-logo-glass.png" alt="SathiCollege community logo" className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-blue-500/20" />
              <div>
                <p className="text-sm font-extrabold">Community</p>
                <p className="text-xs text-[rgb(var(--fg-muted))]">{currentUser?.email ? "Signed in" : "Student platform"}</p>
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

          <div className="soft-card min-w-0 overflow-hidden p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-extrabold">Entrance Exams</h2>
                <p className="text-xs text-[rgb(var(--fg-muted))]">Managed from Admin → Communities.</p>
              </div>
              {currentUser?.role === "ADMIN" || currentUser?.role === "EDITOR" ? (
                <Link href="/admin/communities" className="grid h-9 w-9 place-items-center rounded-lg bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]" aria-label="Manage entrance exams">
                  <Plus className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            <div className="mt-4 grid min-w-0 gap-2 overflow-hidden">
              {communities.length === 0 && <p className="text-sm text-[rgb(var(--fg-muted))]">No communities have been published yet.</p>}
              {communities.slice(0, 8).map((community) => (
                <a key={community.id} href={community.joinUrl} target="_blank" rel="noopener noreferrer" className="flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-lg px-2 py-2 transition hover:bg-[rgb(var(--primary))]/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={safeImageSrc(community.image, communityLogoFallbacks[community.slug] || REAL_IMAGES.news)} alt={`${community.name} logo`} className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-1 shadow-sm" />
                  <span className="min-w-0 flex-1 overflow-hidden">
                    <span className="block max-w-full truncate text-sm font-bold">{community.name}</span>
                    <span className="block max-w-full truncate text-xs text-[rgb(var(--fg-muted))]">Join discussion</span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <Link href="/mock-test?utm_source=Community&utm_medium=Website-Sidebar&utm_campaign=Mock-Test" className="soft-card group overflow-hidden p-0">
            <div className="relative h-32 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/sathicollege/mock/jee-mains.png" alt="JEE mock test practice" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[rgb(var(--primary))]">All PYQs included</span>
            </div>
            <div className="p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[rgb(var(--primary))]">Practice JEE Mock Test</p>
              <p className="mt-1 text-sm font-bold">Attempt Now</p>
            </div>
          </Link>
        </aside>

        <main className="order-1 min-w-0 2xl:order-2">
          <div className="reference-panel mb-4 p-4 sm:p-5">
            <nav className="nice-scroll mb-4 flex max-w-full min-w-0 gap-2 overflow-x-auto pb-1 2xl:hidden">
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
              {currentUser?.id ? (
                <span className="badge w-fit">{currentUser.name || currentUser.email}</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Link href="/login?callbackUrl=/community" className="btn-ghost w-fit px-4 py-2">Sign In</Link>
                  <Link href="/signup" className="btn-primary w-fit px-4 py-2">Sign Up</Link>
                </div>
              )}
            </div>
            <label className="mt-5 flex min-h-12 items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-white/80 px-4 shadow-sm dark:bg-[rgb(var(--bg-elev))]/70">
              <Search className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts, topics, users..." className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>

          <form onSubmit={createPost} className="soft-card mb-4 p-4">
            <p className="font-display text-lg font-extrabold">{currentUser?.id ? "What's on your mind?" : "Sign in to publish community posts"}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_210px]">
              <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} disabled={!currentUser?.id} placeholder="Post title" required />
              <select className="input" value={communityId} onChange={(event) => setCommunityId(event.target.value)} disabled={!currentUser?.id || communities.length === 0}>
                <option value="">General community</option>
                {communities.map((community) => <option key={community.id} value={community.id}>{community.name}</option>)}
              </select>
            </div>
            <textarea className="input mt-3 min-h-24 resize-none" value={body} onChange={(event) => setBody(event.target.value)} disabled={!currentUser?.id} placeholder="Ask a counselling question, share your cutoff confusion, or start a poll..." required />
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              {composerActions.map(({ label, icon: Icon }) => (
                <button key={label} type="button" disabled={!currentUser?.id} onClick={() => setComposerMode(label)} className={composerMode === label ? "btn-primary w-full justify-center px-3 py-2 text-xs sm:text-sm" : "btn-ghost w-full justify-center px-3 py-2 text-xs sm:text-sm"}>
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {message && <p className="rounded-lg bg-[rgb(var(--primary))]/10 px-3 py-2 text-xs font-semibold text-[rgb(var(--primary))]">{message}</p>}
              {currentUser?.id ? (
                <button disabled={saving} className="btn-primary ml-auto px-4 py-2">{saving ? "Publishing..." : "Publish post"}</button>
              ) : (
                <Link href="/login?callbackUrl=/community" className="btn-primary ml-auto px-4 py-2">Sign in to post</Link>
              )}
            </div>
          </form>

          <div className="grid gap-4">
            {visiblePosts.length === 0 && (
              <div className="soft-card p-6 text-center">
                <p className="font-display text-xl font-extrabold">No community posts yet</p>
                <p className="mt-2 text-sm text-[rgb(var(--fg-muted))]">Create the first discussion after signing in, or add posts from the admin panel.</p>
              </div>
            )}
            {visiblePosts.map((post, index) => (
              <motion.article key={post.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: (index % 6) * 0.04 }} className="soft-card p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 font-extrabold text-[rgb(var(--primary))] shadow-inner">{initials(post.author.name, post.author.email)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--fg-muted))]">
                      <span className="font-bold text-[rgb(var(--fg))]">{post.author.name || post.author.email}</span>
                      <span aria-hidden>•</span>
                      <span>{timeAgo(post.createdAt)}</span>
                    </div>
                    <Link href={`/community/post/${post.slug}`} className="mt-2 block font-display text-xl font-extrabold leading-tight hover:text-[rgb(var(--primary))]">{post.title}</Link>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.tag && <button type="button" onClick={() => setQuery(post.tag || "")} className="badge">{post.tag}</button>}
                      {post.community && <a href={post.community.joinUrl} target="_blank" rel="noopener noreferrer" className="badge">Join room</a>}
                      {post.mediaType && <span className="badge">{post.mediaType}</span>}
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[rgb(var(--fg-muted))]">{post.body}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={() => toggleLike(post.id)} className={post.likedByMe ? "btn-primary px-4 py-2" : "btn-ghost px-4 py-2"}>
                        <Heart className="h-4 w-4" />
                        {post.likesCount}
                      </button>
                      <button type="button" onClick={() => setCommenting((current) => current === post.id ? null : post.id)} className="btn-ghost px-4 py-2">
                        <MessageCircle className="h-4 w-4" />
                        {post.commentsCount}
                      </button>
                      {post.community && (
                        <a href={post.community.joinUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-4 py-2">
                          <Send className="h-4 w-4" />
                          Join group
                        </a>
                      )}
                    </div>
                    {post.comments.length > 0 && (
                      <div className="mt-4 grid gap-2 rounded-lg border border-[rgb(var(--border))] bg-white/60 p-3 dark:bg-[rgb(var(--bg-elev))]/50">
                        {post.comments.map((comment) => (
                          <p key={comment.id} className="text-sm text-[rgb(var(--fg-muted))]">
                            <span className="font-bold text-[rgb(var(--fg))]">{comment.author.name || comment.author.email}: </span>
                            {comment.body}
                          </p>
                        ))}
                      </div>
                    )}
                    {commenting === post.id && (
                      <div className="mt-4 flex gap-2 rounded-lg border border-[rgb(var(--border))] bg-white/70 p-3 dark:bg-[rgb(var(--bg-elev))]/60">
                        <input className="input h-10 px-3 py-2" value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder={currentUser?.id ? "Write a comment..." : "Sign in to comment"} />
                        <button type="button" onClick={() => sendComment(post.id)} className="btn-primary h-10 px-3 py-2 text-xs">Send</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </main>

        <aside className="order-2 grid min-w-0 gap-4 lg:sticky lg:top-24 lg:h-fit 2xl:order-3">
          <div className="reference-panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="font-display text-xl font-extrabold">Trending Now</h2>
            </div>
            <div className="grid gap-3">
              {trending.length === 0 && <p className="text-sm text-[rgb(var(--fg-muted))]">No trending posts yet.</p>}
              {trending.map((post, index) => (
                <Link key={post.id} href={`/community/post/${post.slug}`} className="group grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-lg p-2 transition hover:bg-[rgb(var(--primary))]/10">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[rgb(var(--primary))]/10 text-sm font-extrabold text-[rgb(var(--primary))]">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-[rgb(var(--fg-muted))]">{post.author.name || post.author.email}</span>
                    <span className="line-clamp-2 text-sm font-extrabold leading-5 group-hover:text-[rgb(var(--primary))]">{post.title}</span>
                    <span className="mt-1 block text-xs text-[rgb(var(--fg-muted))]">{post.likesCount} likes • {post.commentsCount} replies • {timeAgo(post.createdAt)}</span>
                  </span>
                </Link>
              ))}
            </div>
            <Link href="/community/trending" className="subtle-link mt-4">View all trending posts</Link>
          </div>

          <div className="soft-card p-5">
            <h2 className="font-display text-lg font-extrabold">Popular Tags</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.length === 0 && <p className="text-sm text-[rgb(var(--fg-muted))]">Tags appear after posts are created.</p>}
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
