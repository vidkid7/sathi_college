"use client";

import { useMemo, useRef, useState } from "react";
import { Bot, Loader2, SendHorizonal, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const quickReplies = [
  "Find MBA in Canada with scholarship",
  "Which countries are in search?",
  "JEE Main counselling documents",
  "Computer science without IELTS"
];

type UiMessage = {
  from: "bot" | "user";
  text: string;
  sources?: Array<{
    type: string;
    title: string;
    url?: string;
  }>;
};

export function AiChatPreview() {
  const listRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      from: "bot",
      text: "Hi, I am SathiCollege AI. Ask me about programs, countries, scholarships, exams, courses, careers, rank prediction, communities or counselling."
    }
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const apiMessages = useMemo(
    () =>
      messages
        .map((message) => ({
          role: message.from === "bot" ? "assistant" : "user",
          content: message.text
        }))
        .slice(-8),
    [messages]
  );

  async function send(value = text) {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    const nextMessages: UiMessage[] = [...messages, { from: "user", text: trimmed }];
    setMessages(nextMessages);
    setText("");
    setLoading(true);
    window.setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 0);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          messages: [...apiMessages, { role: "user", content: trimmed }]
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "AI assistant failed");
      setMessages((items) => [
        ...items,
        {
          from: "bot",
          text: payload.answer || "I could not generate a useful answer for that yet.",
          sources: Array.isArray(payload.sources) ? payload.sources.slice(0, 4) : []
        }
      ]);
    } catch (error: any) {
      setMessages((items) => [
        ...items,
        {
          from: "bot",
          text: error?.message || "I could not reach the SathiCollege AI service. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
      window.setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      }, 0);
    }
  }

  return (
    <GlassCard hover={false} className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold">SathiCollege AI Assistant</h2>
          <p className="text-xs text-[rgb(var(--fg-muted))]">Connected to your search, content, community and admin-managed data.</p>
        </div>
      </div>

      <div ref={listRef} className="max-h-[460px] space-y-3 overflow-y-auto rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elev))]/35 p-3 nice-scroll">
        {messages.map((message, index) => (
          <div key={`${message.from}-${index}`} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.from === "user" ? "bg-[rgb(var(--primary))] text-white" : "glass"}`}>
              <div>{message.text}</div>
              {message.sources?.length ? (
                <div className="mt-3 flex flex-wrap gap-2 whitespace-normal">
                  {message.sources.map((source) => (
                    <a
                      key={`${source.type}-${source.title}`}
                      href={source.url || "/search-program"}
                      className="rounded-lg border border-[rgb(var(--border))] bg-white/45 px-2.5 py-1 text-[11px] font-extrabold text-[rgb(var(--primary))] transition hover:bg-white/70 dark:bg-white/5"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex justify-start">
            <div className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-[rgb(var(--primary))]" />
              Searching SathiCollege data...
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickReplies.map((reply) => (
          <button key={reply} type="button" onClick={() => send(reply)} disabled={loading} className="badge transition hover:border-[rgb(var(--primary))] disabled:pointer-events-none disabled:opacity-60">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            {reply}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="input"
          placeholder="Ask about programs, exams, colleges, scholarships..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !text.trim()} className="btn-primary shrink-0 disabled:pointer-events-none disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
          Send
        </button>
      </form>
    </GlassCard>
  );
}
