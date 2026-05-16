import { db } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/access");
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminTopbar title="Leads" />
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto nice-scroll">
          <table className="w-full text-sm">
            <thead className="bg-[rgb(var(--bg-elev))]/60">
              <tr>
                {["Name", "Email", "Phone", "Exam", "Message", "Source", "When"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-[rgb(var(--fg-muted))]" colSpan={7}>No leads yet.</td></tr>
              )}
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-[rgb(var(--border))]">
                  <td className="px-4 py-3">{l.name}</td>
                  <td className="px-4 py-3">{l.email}</td>
                  <td className="px-4 py-3">{l.phone}</td>
                  <td className="px-4 py-3">{l.exam ?? "—"}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{l.message ?? "—"}</td>
                  <td className="px-4 py-3">{l.source ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[rgb(var(--fg-muted))]">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );
}
