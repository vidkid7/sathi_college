import { PageHero } from "@/components/ui/PageHero";
import { CollegePredictorForm } from "@/components/predictor/CollegePredictorForm";
import { ExamSelectionGrid } from "@/components/predictor/ExamSelectionGrid";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "College Predictor",
  description: "Find colleges you can get with your rank for JEE, EAMCET, KCET, MHT-CET, KEAM, TNEA, WBJEE."
});

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Smart matching"
        title={<>College <span className="gradient-text">Predictor</span></>}
        description="Enter your rank and category to discover colleges you are likely to get based on previous year cutoff trends."
      />
      <section className="container grid gap-8 py-12">
        <ExamSelectionGrid mode="college" />
        <CollegePredictorForm />
      </section>
    </>
  );
}
