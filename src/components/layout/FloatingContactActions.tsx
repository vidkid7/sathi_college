"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, Compass, Loader2, MessageCircle, PhoneCall, SendHorizonal, ShieldCheck, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { FormattedAssistantMessage } from "@/components/ui/AiMessageContent";

type ChatMessage = {
  from: "bot" | "user";
  text: string;
  sources?: Array<{ type: string; title: string; url?: string }>;
};

const starterPrompts = [
  "Find MBA in Canada with scholarship",
  "Compare computer science universities in USA",
  "Best careers after B.Tech CSE",
  "Courses without IELTS"
];

export function FloatingContactActions({ whatsappHref }: { whatsappHref: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "bot",
      text: "Hi, I am Sathi AI. I can search programs, universities, colleges, courses, careers, scholarships, exams and comparisons from SathiCollege data."
    }
  ]);

  const apiMessages = useMemo(
    () =>
      messages
        .map((message) => ({ role: message.from === "bot" ? "assistant" : "user", content: message.text }))
        .slice(-8),
    [messages]
  );

  function scrollToBottom() {
    window.setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 0);
  }

  async function sendMessage(value = text) {
    const question = value.trim();
    if (!question || loading) return;
    setOpen(true);
    setText("");
    setLoading(true);
    setMessages((items) => [...items, { from: "user", text: question }]);
    scrollToBottom();
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, messages: [...apiMessages, { role: "user", content: question }] })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Assistant failed");
      setMessages((items) => [
        ...items,
        {
          from: "bot",
          text: payload.answer || "I could not find a strong answer yet. Try adding a country, course, university or exam name.",
          sources: Array.isArray(payload.sources) ? payload.sources.slice(0, 5) : []
        }
      ]);
    } catch (error: any) {
      setMessages((items) => [
        ...items,
        {
          from: "bot",
          text: error?.message || "I could not reach the SathiCollege assistant. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div data-sathi-floating-actions className="fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] right-2 z-[45] flex flex-col items-end gap-1.5 sm:bottom-4 sm:right-4 sm:gap-3">
      {open ? (
        <motion.div
          data-sathi-chat-panel
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-2 top-[5.35rem] z-[45] flex w-[min(calc(100vw-1rem),410px)] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-2xl shadow-blue-950/18 backdrop-blur-md sm:bottom-20 sm:right-4 sm:top-24 dark:border-white/12 dark:bg-slate-950/92"
        >
          <div className="shrink-0 flex items-center justify-between gap-3 border-b border-[rgb(var(--border))] bg-gradient-to-r from-blue-600 via-violet-600 to-sky-500 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/18 ring-1 ring-white/25">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold">Sathi AI Assistant</p>
                <p className="truncate text-[11px] text-white/82">Courses, careers, schools, universities and comparisons</p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/14 px-2 py-0.5 text-[10px] font-extrabold text-white/90 ring-1 ring-white/18">
                  <ShieldCheck className="h-3 w-3" />
                  Database-grounded and privacy-safe
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Sathi AI Assistant"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/12 transition hover:bg-white/22"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[rgb(var(--bg-soft))]/45 p-3 nice-scroll dark:bg-white/[0.03]">
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
                    message.from === "user"
                      ? "max-w-[84%] bg-[rgb(var(--primary))] text-white"
                      : "border border-white/70 bg-white/82 text-[rgb(var(--fg))] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.08]"
                  }`}
                >
                  {message.from === "bot" ? <FormattedAssistantMessage text={message.text} /> : <div className="whitespace-pre-wrap">{message.text}</div>}
                  {message.sources?.length ? (
                    <div className="mt-3 border-t border-[rgb(var(--border))] pt-2">
                      <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[rgb(var(--fg-muted))]">Related links</p>
                      <div className="grid gap-1.5">
                        {message.sources.map((source) => (
                          <a
                            key={`${source.type}-${source.title}`}
                            href={source.url || "/search-program"}
                            className="group/source flex items-center justify-between gap-2 rounded-lg border border-[rgb(var(--border))] bg-white/62 px-2.5 py-2 text-[11px] font-extrabold text-[rgb(var(--primary))] transition hover:bg-white dark:bg-white/5"
                          >
                            <span className="line-clamp-2">{source.title}</span>
                            <Compass className="h-3.5 w-3.5 shrink-0 opacity-70 transition group-hover/source:translate-x-0.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/82 px-3.5 py-2.5 text-sm shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.08]">
                  <Loader2 className="h-4 w-4 animate-spin text-[rgb(var(--primary))]" />
                  Searching SathiCollege data...
                </div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-[rgb(var(--border))] bg-white/82 p-3 backdrop-blur-sm dark:bg-slate-950/82">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 nice-scroll">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[rgb(var(--border))] bg-white/65 px-3 py-1.5 text-[11px] font-extrabold text-[rgb(var(--fg))] transition hover:border-[rgb(var(--primary))]/50 hover:text-[rgb(var(--primary))] disabled:opacity-55 dark:bg-white/5"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask to find, compare, shortlist..."
                className="min-h-11 max-h-24 flex-1 resize-none rounded-xl border border-[rgb(var(--border))] bg-white/78 px-3 py-2 text-sm outline-none transition focus:border-[rgb(var(--primary))] focus:ring-4 focus:ring-blue-500/10 dark:bg-white/5"
              />
              <button
                type="submit"
                disabled={loading || !text.trim()}
                aria-label="Send message"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[rgb(var(--primary))] text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-55"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </motion.div>
      ) : null}

      <div className="flex flex-row-reverse items-end gap-1.5 sm:flex-col sm:gap-3">
        <motion.button
          type="button"
          onClick={() => setOpen((value) => !value)}
          initial={{ opacity: 0, x: 16, scale: 0.86 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 1.05, type: "spring", stiffness: 210, damping: 18 }}
          whileHover={{ y: -2, scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open SathiCollege AI assistant"
          title="Sathi AI Assistant"
          className="group relative grid h-10 w-10 place-items-center rounded-xl border border-white/70 bg-gradient-to-br from-blue-600 via-violet-600 to-sky-500 text-white shadow-2xl shadow-blue-500/30 backdrop-blur-sm sm:h-14 sm:w-14 sm:rounded-2xl dark:border-white/15"
        >
          <span className="absolute inset-0 rounded-xl bg-white/12 opacity-0 transition group-hover:opacity-100 sm:rounded-2xl" />
          <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border border-white/80 bg-white text-[rgb(var(--primary))] shadow-lg sm:h-5 sm:w-5">
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </span>
          <Bot className="relative h-[18px] w-[18px] sm:h-6 sm:w-6" />
          <MessageCircle className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 text-white/85 sm:bottom-2 sm:right-2 sm:h-3 sm:w-3" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-xs font-extrabold text-[rgb(var(--fg))] opacity-0 shadow-lg backdrop-blur-sm transition group-hover:opacity-100 sm:block dark:border-white/10 dark:bg-slate-950/86">
            Sathi AI
          </span>
        </motion.button>

        <motion.a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 16, scale: 0.86 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 210, damping: 18 }}
          whileHover={{ y: -2, scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Chat with SathiCollege on WhatsApp"
          title="WhatsApp"
          className="group relative grid h-9 w-9 place-items-center rounded-xl border border-white/70 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white shadow-2xl shadow-emerald-500/25 backdrop-blur-sm sm:h-12 sm:w-12 sm:rounded-2xl dark:border-white/15"
        >
          <span className="absolute inset-0 animate-ping rounded-xl bg-emerald-400/18 sm:rounded-2xl" />
          <MessageCircle className="relative h-4 w-4 sm:h-5 sm:w-5" />
          <PhoneCall className="absolute bottom-1.5 right-1.5 h-2 w-2 text-white/90 sm:bottom-2 sm:right-2 sm:h-2.5 sm:w-2.5" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-xs font-extrabold text-[rgb(var(--fg))] opacity-0 shadow-lg backdrop-blur-sm transition group-hover:opacity-100 sm:block dark:border-white/10 dark:bg-slate-950/86">
            WhatsApp
          </span>
        </motion.a>
      </div>
    </div>
  );
}
