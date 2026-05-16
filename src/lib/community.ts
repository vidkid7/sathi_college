import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

type CommunityPostWithRelations = Awaited<ReturnType<typeof db.communityPost.findMany>>[number] & {
  author: { id: string; name: string | null; email: string };
  community: { id: string; slug: string; name: string; joinUrl: string } | null;
  comments: Array<{
    id: string;
    body: string;
    createdAt: Date;
    author: { id: string; name: string | null; email: string };
  }>;
  likes: Array<{ userId: string }>;
  _count: { comments: number; likes: number };
};

export type SerializedCommunityPost = ReturnType<typeof serializeCommunityPost>;

export function postSelectForUser(userId?: string) {
  return {
    author: { select: { id: true, name: true, email: true } },
    community: { select: { id: true, slug: true, name: true, joinUrl: true } },
    comments: {
      orderBy: { createdAt: "asc" as const },
      take: 6,
      select: {
        id: true,
        body: true,
        createdAt: true,
        author: { select: { id: true, name: true, email: true } }
      }
    },
    likes: userId ? { where: { userId }, select: { userId: true } } : { take: 0, select: { userId: true } },
    _count: { select: { comments: true, likes: true } }
  };
}

export function serializeCommunityPost(post: CommunityPostWithRelations) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    body: post.body,
    tag: post.tag,
    mediaType: post.mediaType,
    imageUrl: post.imageUrl,
    published: post.published,
    views: post.views,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    likedByMe: post.likes.length > 0,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    author: {
      id: post.author.id,
      name: post.author.name,
      email: post.author.email
    },
    community: post.community,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author
    }))
  };
}

export async function listCommunityPosts(userId?: string) {
  const posts = await db.communityPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: postSelectForUser(userId)
  });
  return posts.map((post) => serializeCommunityPost(post as CommunityPostWithRelations));
}

export async function makeUniqueCommunitySlug(title: string) {
  const base = slugify(title).slice(0, 80) || "community-post";
  let candidate = base;
  let suffix = 2;
  while (await db.communityPost.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
