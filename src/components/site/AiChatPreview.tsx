"use client";

import { useState } from "react";
import { Bot, SendHorizonal, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const quickReplies = [
  "AP EAMCET rank prediction",
  "Counselling documents",
  "Best branches for my rank"
];

export function AiChatPreview() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I can help you understand AP EAMCET counselling, rank bands, document readiness and college shortlists." }
  ]);
  const [text, setText] = useState("");

  function send(value = text) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMessages((items) => [
      ...items,
      { from: "user", text: trimmed },
      { from: "bot", text: "Based on your query, start with your score/rank, category, local area and preferred branches. Then compare likely colleges with cutoff trends before filling choices." }
    ]);
    setText("");
  }

  return (
    <GlassCard hover={false} className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold">AP EAPCET AI Counsellor</h2>
          <p className="text-xs text-[rgb(var(--fg-muted))]">Interactive demo connected to your lead and content system.</p>
        </div>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elev))]/35 p-3 nice-scroll">
        {messages.map((message, index) => (
          <div key={`${message.from}-${index}`} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.from === "user" ? "bg-[rgb(var(--primary))] text-white" : "glass"}`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickReplies.map((reply) => (
          <button key={reply} type="button" onClick={() => send(reply)} className="badge transition hover:border-[rgb(var(--primary))]">
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
        <input value={text} onChange={(event) => setText(event.target.value)} className="input" placeholder="Ask about rank, colleges, documents or counselling..." />
        <button type="submit" className="btn-primary shrink-0">
          <SendHorizonal className="h-4 w-4" />
          Send
        </button>
      </form>
    </GlassCard>
  );
}
