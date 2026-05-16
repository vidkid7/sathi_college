import Link from "next/link";
import { MessageCircle, Send, ThumbsUp } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const title = titleFromSlug(params.slug);
  return buildMetadata({
    title,
    description: `${title} discussion on SathiCollege community.`
  });
}

export default function CommunityPostPage({ params }: { params: { slug: string } }) {
  const title = titleFromSlug(params.slug);
  return (
    <section className="container py-12">
      <div className="mx-auto grid max-w-3xl gap-5">
        <Link href="/community" className="subtle-link">Back to community</Link>
        <article className="reference-panel p-5 sm:p-7">
          <div className="flex items-center gap-3 text-sm text-[rgb(var(--fg-muted))]">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 font-extrabold text-[rgb(var(--primary))]">S</span>
            <div>
              <p className="font-bold text-[rgb(var(--fg))]">sathicollege member</p>
              <p>Community post • updated recently</p>
            </div>
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">{title}</h1>
          <p className="mt-4 leading-7 text-[rgb(var(--fg-muted))]">
            This community discussion is part of the SathiCollege student feed. Use the community page to filter by exam, follow trending topics, join exam rooms, and continue the conversation with other aspirants.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-ghost px-4 py-2"><ThumbsUp className="h-4 w-4" /> 1</button>
            <button className="btn-ghost px-4 py-2"><MessageCircle className="h-4 w-4" /> 0</button>
            <Link href="/community" className="btn-primary px-4 py-2"><Send className="h-4 w-4" /> Join discussion</Link>
          </div>
        </article>
      </div>
    </section>
  );
}
