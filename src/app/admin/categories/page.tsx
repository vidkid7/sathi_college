"use client";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CrudTable } from "@/components/admin/CrudTable";

export default function Page() {
  return (
    <>
      <AdminTopbar title="Blog Categories" />
      <CrudTable
        resource="categories"
        title="Category"
        fields={[
          { name: "slug", label: "Slug", required: true },
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", type: "textarea" }
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" }
        ]}
      />
    </>
  );
}
