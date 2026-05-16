import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { SettingsTabs } from "@/components/admin/SettingsTabs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const s = await getServerSession(authOptions);
  if (!s) redirect("/admin/access");
  return (
    <>
      <AdminTopbar title="About section" />
      <SettingsTabs active="/admin/settings/about" />
      <SettingsForm section="about" />
    </>
  );
}
