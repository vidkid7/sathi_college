import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/access");
  return (
    <>
      <AdminTopbar title="Site Settings" />
      <SettingsTabs active="/admin/settings" />
      <SettingsForm section="general" />
    </>
  );
}
