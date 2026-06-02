import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Build a WhatsApp link. Prefer {@link whatsappLinkFromSettings} from `lib/settings`
 * when settings are available; this fallback is only for client components that
 * cannot await server-side settings.
 */
export function whatsappLink(
  phone = process.env.NEXT_PUBLIC_WHATSAPP || "919281014900",
  text = "Hi, I want to know more about sathicollege"
) {
  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(text)}`;
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function safeImageSrc(value: unknown, fallback = "/assets/generated/visual-blog.png") {
  if (typeof value !== "string") return fallback;
  const src = value.trim();
  if (!src) return fallback;
  if (src === "/assets/brand/sathi-logo-glass.png") return "/assets/brand/sathi-logo-glass-160.webp";
  if (src === "/assets/brand/sathi-logo.png") return "/assets/brand/sathi-logo-160.webp";
  if (src.startsWith("/") && !src.startsWith("//") && !src.includes("\\")) return src;
  try {
    const url = new URL(src);
    if (url.protocol === "https:" || url.protocol === "http:") return src;
  } catch {
    return fallback;
  }
  return fallback;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
