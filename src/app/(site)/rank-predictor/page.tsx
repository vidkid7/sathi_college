import { PageHero } from "@/components/ui/PageHero";
import { RankPredictorForm } from "@/components/predictor/RankPredictorForm";
import { ExamSelectionGrid } from "@/components/predictor/ExamSelectionGrid";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Rank Predictor",
  description: "Predict your rank for JEE Mains, JEE Advanced, EAMCET, KCET, MHT-CET, KEAM, TNEA and WBJEE from marks and category.",
  path: "/rank-predictor",
  keywords: ["rank predictor", "JEE Main rank predictor", "EAMCET rank predictor", "KCET rank predictor"]
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/rank-predictor",
            name: "Engineering entrance rank predictor",
            description: "Free rank prediction tool for engineering entrance exams based on marks, category and score bands."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Rank Predictor", path: "/rank-predictor" }
          ]),
          softwareApplicationJsonLd({
            path: "/rank-predictor",
            name: "SathiCollege Rank Predictor",
            description: "Free rank predictor for JEE, EAMCET, KCET, MHT-CET, KEAM, TNEA and WBJEE."
          })
        ]}
      />
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
