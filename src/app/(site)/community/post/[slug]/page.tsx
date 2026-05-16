import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Send, ThumbsUp } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";

function initials(name?: string | null, email?: string | null) {
  const value = name || email || "SathiCollege";
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S";
}

async function getPost(slug: string) {
  return db.communityPost.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, email: true } },
      community: { select: { name: true, joinUrl: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, email: true } } }
      },
      _count: { select: { likes: true, comments: true } }
    }
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug).catch(() => null);
  return buildMetadata({
    title: post?.title || "Community Post",
    description: post?.body.slice(0, 150) || "SathiCollege community discussion."
  });
}

export const dynamic = "force-dynamic";

export default async function CommunityPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug).catch(() => null);
  if (!post || !post.published) notFound();

  return (
    <section className="container py-12">
      <div className="mx-auto grid max-w-3xl gap-5">
        <Link href="/community" className="subtle-link">Back to community</Link>
        <article className="reference-panel p-5 sm:p-7">
          <div className="flex items-center gap-3 text-sm text-[rgb(var(--fg-muted))]">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 font-extrabold text-[rgb(var(--primary))]">{initials(post.author.name, post.author.email)}</span>
            <div>
              <p className="font-bold text-[rgb(var(--fg))]">{post.author.name || post.author.email}</p>
              <p>{post.community?.name || "Community post"} • {post.createdAt.toLocaleDateString("en-IN")}</p>
            </div>
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">{post.title}</h1>
          <p className="mt-4 whitespace-pre-line leading-7 text-[rgb(var(--fg-muted))]">{post.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-ghost px-4 py-2"><ThumbsUp className="h-4 w-4" /> {post._count.likes}</button>
            <button className="btn-ghost px-4 py-2"><MessageCircle className="h-4 w-4" /> {post._count.comments}</button>
            {post.community ? (
              <a href={post.community.joinUrl} target="_blank" rel="noopener noreferrer" className="btn-primary px-4 py-2"><Send className="h-4 w-4" /> Join group</a>
            ) : (
              <Link href="/community" className="btn-primary px-4 py-2"><Send className="h-4 w-4" /> Join discussion</Link>
            )}
          </div>
        </article>

        <div className="soft-card p-5">
          <h2 className="font-display text-xl font-extrabold">Comments</h2>
          <div className="mt-4 grid gap-3">
            {post.comments.length === 0 && <p className="text-sm text-[rgb(var(--fg-muted))]">No comments yet. Sign in on the community page to reply.</p>}
            {post.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-[rgb(var(--border))] bg-white/70 p-3 dark:bg-[rgb(var(--bg-elev))]/70">
                <p className="text-sm font-bold">{comment.author.name || comment.author.email}</p>
                <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">{comment.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
