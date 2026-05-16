"use client";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CrudTable } from "@/components/admin/CrudTable";
import { useEffect, useState } from "react";

export default function Page() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.items || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <AdminTopbar title="Blog Posts" />
      <CrudTable
        resource="posts"
        title="Post"
        fields={[
          { name: "slug", label: "Slug", required: true },
          { name: "title", label: "Title", required: true },
          { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
          { name: "content", label: "Content (Markdown)", type: "textarea", required: true },
          { name: "coverImage", label: "Cover Image URL", type: "url" },
          {
            name: "categoryId",
            label: "Category",
            type: "select",
            options: ["", ...categories.map((c) => `${c.id}:${c.name}`)]
          },
          { name: "tags", label: "Tags (comma-separated)" },
          { name: "published", label: "Published", type: "checkbox" }
        ]}
        columns={[
          { key: "coverImage", label: "Image" },
          { key: "title", label: "Title" },
          { key: "slug", label: "Slug" },
          { key: "published", label: "Published" }
        ]}
      />
      <p className="mt-3 text-xs text-[rgb(var(--fg-muted))]">
        Tip: For Category, pick the option formatted <code>id:Name</code>. The id before the colon is what gets saved.
      </p>
    </>
  );
}
