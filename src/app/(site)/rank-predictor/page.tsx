import { PageHero } from "@/components/ui/PageHero";
import { RankPredictorForm } from "@/components/predictor/RankPredictorForm";
import { ExamSelectionGrid } from "@/components/predictor/ExamSelectionGrid";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Rank Predictor",
  description: "Predict your rank for JEE Mains, JEE Advanced, EAMCET, KCET, MHT-CET, KEAM, TNEA, WBJEE."
});

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Free tool"
        title={<>Rank <span className="gradient-text">Predictor</span></>}
        description="Enter your marks and category to get an instant rank estimate based on previous year trends."
      />
      <section className="container grid gap-8 py-12">
        <ExamSelectionGrid mode="rank" />
        <RankPredictorForm />
      </section>
    </>
  );
}
