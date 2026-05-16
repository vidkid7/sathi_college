"use client";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CrudTable } from "@/components/admin/CrudTable";

export default function Page() {
  return (
    <>
      <AdminTopbar title="Colleges" />
      <CrudTable
        resource="colleges"
        title="College"
        fields={[
          { name: "slug", label: "Slug", required: true },
          { name: "name", label: "Name", required: true },
          { name: "city", label: "City", required: true },
          { name: "state", label: "State", required: true },
          { name: "type", label: "Type", type: "select", options: ["Government", "Private", "Deemed"] },
          { name: "rating", label: "Rating", type: "number" },
          { name: "fees", label: "Annual Fees (INR)", type: "number" },
          { name: "description", label: "Description", type: "textarea", required: true },
          { name: "heroImage", label: "Hero Image URL", type: "url" },
          { name: "featured", label: "Featured", type: "checkbox" }
        ]}
        columns={[
          { key: "heroImage", label: "Image" },
          { key: "name", label: "Name" },
          { key: "city", label: "City" },
          { key: "type", label: "Type" },
          { key: "rating", label: "Rating" },
          { key: "fees", label: "Fees" }
        ]}
      />
    </>
  );
}
