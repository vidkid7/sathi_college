import { db } from "@/lib/db";
import { isSafeUrl } from "@/lib/security";
import { z } from "zod";

export type ResourceKey = "colleges" | "exams" | "courses" | "careers" | "communities" | "communityPosts" | "posts" | "categories";

const slugSchema = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Use only letters, numbers and hyphens.");
const text = (max = 255) => z.string().trim().min(1).max(max);
const longText = (max = 12000) => z.string().trim().min(1).max(max);

function optionalSafeUrl({ allowRelative = false }: { allowRelative?: boolean } = {}) {
  return z.preprocess(
    (value) => value === "" || value === undefined ? null : typeof value === "string" ? value.trim() : value,
    z.string()
      .max(2048)
      .refine((value) => isSafeUrl(value, { allowRelative }), "Use a valid http(s) URL or approved local asset path.")
      .nullable()
      .optional()
  );
}

const safeExternalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => isSafeUrl(value), "Use a valid http(s) URL.");

const optionalTextId = z.preprocess(
  (value) => value === "" || value === undefined ? null : value,
  z.string().nullable().optional()
);

const collegeSchema = z.object({
  slug: slugSchema,
  name: text(180),
  city: text(120),
  state: text(120),
  type: text(80).default("Government"),
  rating: z.coerce.number().min(0).max(5).default(0),
  fees: z.coerce.number().int().min(0).default(0),
  description: longText(8000),
  heroImage: optionalSafeUrl({ allowRelative: true }),
  featured: z.coerce.boolean().default(false)
});

const examSchema = z.object({
  slug: slugSchema,
  name: text(180),
  shortName: text(80),
  description: longText(8000),
  category: text(100).default("Engineering"),
  heroImage: optionalSafeUrl({ allowRelative: true }),
  active: z.coerce.boolean().default(true)
});

const courseSchema = z.object({
  slug: slugSchema,
  name: text(180),
  category: text(100).default("Engineering"),
  level: text(80).default("UG"),
  duration: z.preprocess(
    (value) => value === "" || value === undefined ? null : value,
    z.string().trim().max(80).nullable().optional()
  ),
  description: longText(8000),
  image: optionalSafeUrl({ allowRelative: true }),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true)
});

const careerSchema = z.object({
  slug: slugSchema,
  name: text(180),
  sector: text(120).default("General"),
  description: longText(8000),
  image: optionalSafeUrl({ allowRelative: true }),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true)
});

const communitySchema = z.object({
  slug: slugSchema,
  name: text(180),
  description: longText(8000),
  joinUrl: safeExternalUrl,
  image: optionalSafeUrl({ allowRelative: true }),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true)
});

const communityPostSchema = z.object({
  slug: slugSchema,
  title: text(220),
  body: longText(5000),
  tag: optionalTextId,
  mediaType: z.preprocess(
    (value) => value === "" || value === undefined ? null : value,
    z.enum(["Photo", "Video", "Poll"]).nullable().optional()
  ),
  communityId: optionalTextId,
  imageUrl: optionalSafeUrl({ allowRelative: true }),
  published: z.coerce.boolean().default(true)
});

const postSchema = z.object({
  slug: slugSchema,
  title: text(220),
  excerpt: longText(1200),
  content: longText(50000),
  coverImage: optionalSafeUrl({ allowRelative: true }),
  categoryId: optionalTextId,
  tags: optionalTextId,
  published: z.coerce.boolean().default(false)
});

const categorySchema = z.object({
  slug: slugSchema,
  name: text(120),
  description: z.string().trim().max(2000).nullable().optional()
});

export const resources = {
  colleges: { model: db.college, schema: collegeSchema, orderBy: { name: "asc" as const } },
  exams: { model: db.exam, schema: examSchema, orderBy: { name: "asc" as const } },
  courses: { model: db.course, schema: courseSchema, orderBy: [{ featured: "desc" as const }, { name: "asc" as const }] },
  careers: { model: db.career, schema: careerSchema, orderBy: [{ featured: "desc" as const }, { name: "asc" as const }] },
  communities: { model: db.community, schema: communitySchema, orderBy: { order: "asc" as const } },
  communityPosts: { model: db.communityPost, schema: communityPostSchema, orderBy: { createdAt: "desc" as const } },
  posts: { model: db.post, schema: postSchema, orderBy: { createdAt: "desc" as const } },
  categories: { model: db.category, schema: categorySchema, orderBy: { name: "asc" as const } }
} as const;

export function getResource(key: string) {
  if (!(key in resources)) return null;
  return (resources as any)[key];
}
