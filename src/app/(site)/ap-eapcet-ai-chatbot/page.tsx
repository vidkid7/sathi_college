import { AiChatPreview } from "@/components/site/AiChatPreview";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AP EAPCET AI Chatbot",
  description: "Ask AP EAPCET counselling questions about rank, colleges, documents, choices and admissions with SathiCollege support.",
  path: "/ap-eapcet-ai-chatbot",
  keywords: ["AP EAPCET chatbot", "AP EAMCET counselling", "AP EAPCET college predictor", "AP EAPCET rank guidance"]
});

export default function ApEapcetChatbotPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/ap-eapcet-ai-chatbot",
            name: "AP EAPCET AI chatbot",
            description: "Counselling assistant for AP EAPCET rank, documents, choices and follow-up enquiries."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "AP EAPCET AI Chatbot", path: "/ap-eapcet-ai-chatbot" }
          ]),
          softwareApplicationJsonLd({
            path: "/ap-eapcet-ai-chatbot",
            name: "AP EAPCET AI Chatbot",
            description: "Web counselling assistant for AP EAPCET admissions and student enquiries."
          })
        ]}
      />
      <PageHero
        eyebrow="AI Counsellor"
        title={<>AP EAPCET <span className="gradient-text">AI Chatbot</span></>}
        description="A smooth, mobile-ready counselling assistant surface for rank, documents, choices and follow-up enquiries."
      />
      <section className="container grid gap-8 py-12 xl:grid-cols-[1.1fr_0.9fr]">
        <AiChatPreview />
        <ContactForm source="ap-eapcet-ai-chatbot" className="xl:col-span-1" />
      </section>
    </>
  );
}
