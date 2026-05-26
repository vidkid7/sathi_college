"use client";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CrudTable } from "@/components/admin/CrudTable";

export default function Page() {
  return (
    <>
      <AdminTopbar title="Careers" />
      <CrudTable
        resource="careers"
        title="Career"
        fields={[
          { name: "slug", label: "Slug", required: true },
          { name: "name", label: "Name", required: true },
          { name: "sector", label: "Sector", required: true },
          { name: "description", label: "Description", type: "textarea", required: true },
          { name: "image", label: "Image URL", type: "url" },
          { name: "featured", label: "Featured", type: "checkbox" },
          { name: "active", label: "Active", type: "checkbox", defaultChecked: true }
        ]}
        columns={[
          { key: "image", label: "Image" },
          { key: "name", label: "Name" },
          { key: "sector", label: "Sector" },
          { key: "featured", label: "Featured" },
          { key: "active", label: "Active" }
        ]}
      />
    </>
  );
}
