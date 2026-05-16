import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimitRequest, rateLimitedJson, withSecurityHeaders } from "@/lib/security";

const commentSchema = z.object({
  body: z.string().trim().min(2).max(1200)
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return withSecurityHeaders(NextResponse.json({ error: "Sign in to comment." }, { status: 401 }), req);
  }

  const limited = rateLimitRequest(req, `community-comment:${session.user.id}`, { limit: 20, windowMs: 60_000, blockMs: 5 * 60_000 });
  if (!limited.ok) return withSecurityHeaders(rateLimitedJson(limited), req);

  try {
    const data = commentSchema.parse(await req.json());
    const post = await db.communityPost.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!post) return withSecurityHeaders(NextResponse.json({ error: "Post not found" }, { status: 404 }), req);
    const comment = await db.communityComment.create({
      data: {
        body: data.body,
        postId: params.id,
        authorId: session.user.id
      },
      select: {
        id: true,
        body: true,
        createdAt: true,
        author: { select: { id: true, name: true, email: true } }
      }
    });
    return withSecurityHeaders(NextResponse.json({
      item: {
        ...comment,
        createdAt: comment.createdAt.toISOString()
      }
    }), req);
  } catch (error: any) {
    return withSecurityHeaders(NextResponse.json({ error: error?.message || "Invalid comment" }, { status: 400 }), req);
  }
}
