"use client";

import { useState, useRef, useEffect } from "react";
import RecipeCard from "@/app/components/RecipeCard";
import { AUTOMATIONS, detectAutomation } from "@/app/data/automations";

const CHIPS = [
  "Save invoice attachments to Drive",
  "Email me a weekly calendar digest",
  "Auto-reply to scheduling requests",
  "When a meeting ends, create a notes doc",
  "Remind me about unread emails after 2 days",
  "Send me a daily agenda at 8am",
  "Archive newsletters automatically",
];

type Message = { role: "user"; text: string } | { role: "ai"; text: string; autoKey?: string };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "What would you like to automate? Describe it in plain English and I'll build the recipe." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    setChipsVisible(false);
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const key = detectAutomation(text);
      setMessages((prev) => [...prev, { role: "ai", text: "Here's your automation recipe. Hover any step to edit it.", autoKey: key }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm" style={{ height: 620 }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
        <div className="w-2 h-2 rounded-full bg-violet-500" />
        <span className="text-sm font-medium text-gray-800">Flowly</span>
        <div className="flex gap-1.5 ml-auto">
          {["Gmail", "Calendar", "Drive"].map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s}</span>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-sm ${msg.role === "user" ? "bg-violet-100 text-violet-900 rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
              {msg.text}
            </div>
            {msg.role === "ai" && msg.autoKey && AUTOMATIONS[msg.autoKey] && (
              <RecipeCard automation={AUTOMATIONS[msg.autoKey]} />
            )}
          </div>
        ))}
        {chipsVisible && (
          <div className="flex flex-wrap gap-2 mt-1">
            {CHIPS.map((chip) => (
              <button key={chip} onClick={() => send(chip)} className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-colors text-left">
                {chip}
              </button>
            ))}
          </div>
        )}
        {loading && (
          <div className="flex items-start">
            <div className="px-3.5 py-2.5 bg-gray-100 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-center">
        <input
          className="flex-1 text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
          placeholder="Describe your automation..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
        />
        <button onClick={() => send(input)} disabled={!input.trim() || loading} className="w-9 h-9 bg-violet-600 text-white rounded-xl flex items-center justify-center hover:bg-violet-700 disabled:opacity-40 transition-colors flex-shrink-0" aria-label="Send">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
