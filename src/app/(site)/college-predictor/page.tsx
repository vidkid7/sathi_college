import { PageHero } from "@/components/ui/PageHero";
import { CollegePredictorForm } from "@/components/predictor/CollegePredictorForm";
import { ExamSelectionGrid } from "@/components/predictor/ExamSelectionGrid";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "College Predictor",
  description: "Find engineering colleges you can get with your rank for JEE, EAMCET, KCET, MHT-CET, KEAM, TNEA and WBJEE.",
  path: "/college-predictor",
  keywords: ["college predictor", "JEE college predictor", "EAMCET college predictor", "KCET college predictor"]
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/college-predictor",
            name: "Engineering college predictor",
            description: "Free college predictor for engineering admissions based on rank, category and cutoff trends."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "College Predictor", path: "/college-predictor" }
          ]),
          softwareApplicationJsonLd({
            path: "/college-predictor",
            name: "SathiCollege College Predictor",
            description: "Free college predictor for JEE, EAMCET, KCET, MHT-CET, KEAM, TNEA and WBJEE counselling."
          })
        ]}
      />
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
