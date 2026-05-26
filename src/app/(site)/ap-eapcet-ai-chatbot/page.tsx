import { AiChatPreview } from "@/components/site/AiChatPreview";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, softwareApplicationJsonLd, webPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "SathiCollege AI Assistant",
  description: "Ask SathiCollege about programs, colleges, exams, courses, careers, rank prediction, scholarships, countries and counselling.",
  path: "/ap-eapcet-ai-chatbot",
  keywords: ["SathiCollege AI assistant", "course finder chatbot", "college search chatbot", "admission counselling AI"]
});

export default function ApEapcetChatbotPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/ap-eapcet-ai-chatbot",
            name: "SathiCollege AI Assistant",
            description: "AI assistant for program search, college discovery, exams, courses, careers and counselling enquiries."
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "SathiCollege AI Assistant", path: "/ap-eapcet-ai-chatbot" }
          ]),
          softwareApplicationJsonLd({
            path: "/ap-eapcet-ai-chatbot",
            name: "SathiCollege AI Assistant",
            description: "Web assistant for SathiCollege admissions, search and student enquiries."
          })
        ]}
      />
      <PageHero
        eyebrow="AI Assistant"
        title={<>SathiCollege <span className="gradient-text">AI Chatbot</span></>}
        description="Ask about programs, countries, scholarships, exams, courses, careers, rank prediction and counselling."
      />
      <section className="container grid gap-8 py-12 xl:grid-cols-[1.1fr_0.9fr]">
        <AiChatPreview />
        <ContactForm source="ap-eapcet-ai-chatbot" className="xl:col-span-1" />
      </section>
    </>
  );
}
