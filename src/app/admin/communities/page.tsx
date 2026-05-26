"use client";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CrudTable } from "@/components/admin/CrudTable";

export default function Page() {
  return (
    <>
      <AdminTopbar title="Communities" />
      <CrudTable
        resource="communities"
        title="Community"
        fields={[
          { name: "slug", label: "Slug", required: true },
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", type: "textarea", required: true },
          { name: "joinUrl", label: "Join URL", type: "url", required: true },
          { name: "image", label: "Image URL", type: "url" },
          { name: "order", label: "Order", type: "number" },
          { name: "active", label: "Active", type: "checkbox", defaultChecked: true }
        ]}
        columns={[
          { key: "image", label: "Image" },
          { key: "name", label: "Name" },
          { key: "joinUrl", label: "Link" },
          { key: "order", label: "Order" }
        ]}
      />
    </>
  );
}
