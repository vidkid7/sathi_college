import { redirect } from "next/navigation";

export default function AdminLoginRedirect({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  redirect(`/admin/access${query ? `?${query}` : ""}`);
}
