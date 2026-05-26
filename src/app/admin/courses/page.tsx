"use client";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CrudTable } from "@/components/admin/CrudTable";

export default function Page() {
  return (
    <>
      <AdminTopbar title="Courses" />
      <CrudTable
        resource="courses"
        title="Course"
        fields={[
          { name: "slug", label: "Slug", required: true },
          { name: "name", label: "Name", required: true },
          { name: "category", label: "Category", required: true },
          { name: "level", label: "Level", type: "select", options: ["UG", "PG", "Diploma", "Certification"] },
          { name: "duration", label: "Duration" },
          { name: "description", label: "Description", type: "textarea", required: true },
          { name: "image", label: "Image URL", type: "url" },
          { name: "featured", label: "Featured", type: "checkbox" },
          { name: "active", label: "Active", type: "checkbox", defaultChecked: true }
        ]}
        columns={[
          { key: "image", label: "Image" },
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "level", label: "Level" },
          { key: "active", label: "Active" }
        ]}
      />
    </>
  );
}
