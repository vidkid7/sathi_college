"use client";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CrudTable } from "@/components/admin/CrudTable";
import { useEffect, useState } from "react";

export default function Page() {
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/communities")
      .then((response) => response.json())
      .then((data) => setCommunities(data.items || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <AdminTopbar title="Community Posts" />
      <CrudTable
        resource="communityPosts"
        title="Community Post"
        fields={[
          { name: "slug", label: "Slug", required: true },
          { name: "title", label: "Title", required: true },
          { name: "body", label: "Body", type: "textarea", required: true },
          { name: "tag", label: "Tag" },
          {
            name: "mediaType",
            label: "Media Type",
            type: "select",
            options: ["", "Photo", "Video", "Poll"]
          },
          {
            name: "communityId",
            label: "Community",
            type: "select",
            options: ["", ...communities.map((community) => `${community.id}:${community.name}`)]
          },
          { name: "imageUrl", label: "Image URL", type: "url" },
          { name: "published", label: "Published", type: "checkbox", defaultChecked: true }
        ]}
        columns={[
          { key: "title", label: "Title" },
          { key: "tag", label: "Tag" },
          { key: "published", label: "Published" },
          { key: "createdAt", label: "Created" }
        ]}
      />
    </>
  );
}
