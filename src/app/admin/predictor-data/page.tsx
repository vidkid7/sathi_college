import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BarChart3, Building2, ClipboardList, Target } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { LargeDataAdmin, type LargeAdminEntity } from "@/components/admin/LargeDataAdmin";
import { GlassCard } from "@/components/ui/GlassCard";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPredictorDataPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/access");

  const [colleges, exams, cutoffCount, mappingCount, predictionCount] = await Promise.all([
    db.college.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, city: true, state: true } }),
    db.exam.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, shortName: true } }),
    db.cutoff.count(),
    db.collegeExam.count(),
    db.rankPrediction.count()
  ]);

  const collegeOptions = colleges.map((college) => ({
    value: college.id,
    label: `${college.name}${college.city ? `, ${college.city}` : ""}${college.state ? ` (${college.state})` : ""}`
  }));
  const examOptions = exams.map((exam) => ({
    value: exam.id,
    label: `${exam.name}${exam.shortName ? ` (${exam.shortName})` : ""}`
  }));

  const entities: LargeAdminEntity[] = [
    {
      key: "cutoffs",
      label: "Cutoffs",
      description: "Manage college, exam, branch, category, year, and closing-rank data used by the college predictor.",
      columns: [
        { key: "collegeName", label: "College" },
        { key: "examName", label: "Exam" },
        { key: "branch", label: "Branch" },
        { key: "category", label: "Category" },
        { key: "year", label: "Year" },
        { key: "closingRank", label: "Closing Rank" }
      ],
      fields: [
        { name: "collegeId", label: "College", type: "select", required: true, options: collegeOptions },
        { name: "examId", label: "Exam", type: "select", required: true, options: examOptions },
        { name: "branch", label: "Branch", required: true },
        { name: "category", label: "Category", required: true },
        { name: "year", label: "Year", type: "number", required: true },
        { name: "closingRank", label: "Closing rank", type: "number", required: true }
      ]
    },
    {
      key: "college-exams",
      label: "College Exam Mappings",
      description: "Create and delete which exams belong to each college. Edit by deleting the old pair and creating the new pair.",
      allowEdit: false,
      columns: [
        { key: "collegeName", label: "College" },
        { key: "examName", label: "Exam" },
        { key: "collegeId", label: "College ID" },
        { key: "examId", label: "Exam ID" }
      ],
      fields: [
        { name: "collegeId", label: "College", type: "select", required: true, options: collegeOptions },
        { name: "examId", label: "Exam", type: "select", required: true, options: examOptions }
      ]
    },
    {
      key: "rank-predictions",
      label: "Rank Predictions",
      description: "Review and manage rank-predictor calculation history and manual calibration entries.",
      columns: [
        { key: "exam", label: "Exam" },
        { key: "marks", label: "Marks" },
        { key: "category", label: "Category" },
        { key: "predicted", label: "Predicted Rank" },
        { key: "createdAt", label: "Created" }
      ],
      fields: [
        { name: "exam", label: "Exam", required: true },
        { name: "marks", label: "Marks", type: "number", required: true },
        { name: "category", label: "Category", required: true },
        { name: "predicted", label: "Predicted rank", type: "number", required: true },
        { name: "meta", label: "Metadata", type: "textarea" }
      ]
    }
  ];

  const stats = [
    { label: "Cutoffs", value: cutoffCount, icon: Target },
    { label: "College Exam Maps", value: mappingCount, icon: Building2 },
    { label: "Rank Predictions", value: predictionCount, icon: BarChart3 },
    { label: "Active Exams", value: exams.length, icon: ClipboardList }
  ];

  return (
    <>
      <AdminTopbar title="Predictor Data" />
      <section className="reference-panel mb-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">Prediction engine admin</p>
            <h1 className="mt-2 font-display text-2xl font-extrabold">College and rank predictor data</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgb(var(--fg-muted))]">
              Manage cutoffs, college-exam relationships, and prediction logs so public predictor results stay connected to real database records.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/college-predictor" className="btn-ghost">College Predictor</Link>
            <Link href="/rank-predictor" className="btn-primary">Rank Predictor</Link>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} hover={false}>
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
                <stat.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs text-[rgb(var(--fg-muted))]">{stat.label}</p>
                <p className="font-display text-2xl font-bold">{stat.value.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <LargeDataAdmin apiBase="/api/admin/predictor-data" entities={entities} />
    </>
  );
}
