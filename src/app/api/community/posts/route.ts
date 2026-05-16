import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { listCommunityPosts, makeUniqueCommunitySlug, postSelectForUser, serializeCommunityPost } from "@/lib/community";
import { rateLimitRequest, rateLimitedJson, withSecurityHeaders } from "@/lib/security";

const postSchema = z.object({
  title: z.string().trim().min(4).max(220),
  body: z.string().trim().min(8).max(5000),
  communityId: z.string().trim().min(1).optional().nullable(),
  tag: z.string().trim().max(80).optional().nullable(),
  mediaType: z.enum(["Photo", "Video", "Poll"]).optional().nullable()
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const items = await listCommunityPosts(session?.user?.id);
  return withSecurityHeaders(NextResponse.json({ items }), req);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return withSecurityHeaders(NextResponse.json({ error: "Sign in to publish community posts." }, { status: 401 }), req);
  }

  const limited = rateLimitRequest(req, `community-post:${session.user.id}`, { limit: 12, windowMs: 60_000, blockMs: 5 * 60_000 });
  if (!limited.ok) return withSecurityHeaders(rateLimitedJson(limited), req);

  try {
    const data = postSchema.parse(await req.json());
    const slug = await makeUniqueCommunitySlug(data.title);
    const created = await db.communityPost.create({
      data: {
        title: data.title,
        slug,
        body: data.body,
        tag: data.tag || null,
        mediaType: data.mediaType || null,
        communityId: data.communityId || null,
        authorId: session.user.id
      },
      include: postSelectForUser(session.user.id)
    });
    return withSecurityHeaders(NextResponse.json({ item: serializeCommunityPost(created as any) }), req);
  } catch (error: any) {
    return withSecurityHeaders(NextResponse.json({ error: error?.message || "Invalid community post" }, { status: 400 }), req);
  }
}
