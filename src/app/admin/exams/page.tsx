"use client";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CrudTable } from "@/components/admin/CrudTable";

export default function Page() {
  return (
    <>
      <AdminTopbar title="Exams" />
      <CrudTable
        resource="exams"
        title="Exam"
        fields={[
          { name: "slug", label: "Slug", required: true },
          { name: "name", label: "Name", required: true },
          { name: "shortName", label: "Short Name", required: true },
          { name: "description", label: "Description", type: "textarea", required: true },
          { name: "category", label: "Category" },
          { name: "heroImage", label: "Exam Image URL", type: "url" },
          { name: "active", label: "Active", type: "checkbox", defaultChecked: true }
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "shortName", label: "Short" },
          { key: "heroImage", label: "Image" },
          { key: "category", label: "Category" }
        ]}
      />
    </>
  );
}
