import { AiChatPreview } from "@/components/site/AiChatPreview";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AP EAPCET AI Chatbot",
  description: "Ask AP EAPCET counselling questions and capture student enquiries for follow-up."
});

export default function ApEapcetChatbotPage() {
  return (
    <>
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
