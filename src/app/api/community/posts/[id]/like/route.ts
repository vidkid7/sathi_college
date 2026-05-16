import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { withSecurityHeaders } from "@/lib/security";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return withSecurityHeaders(NextResponse.json({ error: "Sign in to like posts." }, { status: 401 }), req);
  }

  const post = await db.communityPost.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!post) return withSecurityHeaders(NextResponse.json({ error: "Post not found" }, { status: 404 }), req);

  const where = { postId_userId: { postId: params.id, userId: session.user.id } };
  const existing = await db.communityLike.findUnique({ where });
  let liked = false;
  if (existing) {
    await db.communityLike.delete({ where });
    liked = false;
  } else {
    try {
      await db.communityLike.create({ data: { postId: params.id, userId: session.user.id } });
      liked = true;
    } catch {
      liked = Boolean(await db.communityLike.findUnique({ where }));
    }
  }

  const likesCount = await db.communityLike.count({ where: { postId: params.id } });
  return withSecurityHeaders(NextResponse.json({ liked, likesCount }), req);
}
