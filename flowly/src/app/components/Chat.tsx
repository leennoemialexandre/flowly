"use client";

import { useState, useRef, useEffect } from "react";
import RecipeCard from "@/app/components/RecipeCard";
import { Automation } from "@/app/data/automations";

const CHIPS = [
  "Save invoice attachments to Drive",
  "Email me a weekly calendar digest",
  "Auto-reply to scheduling requests",
  "When a meeting ends, create a notes doc",
  "Remind me about unread emails after 2 days",
  "Send me a daily agenda at 8am",
  "Archive newsletters automatically",
];

const PROVIDERS = [
  { id: "anthropic", label: "Claude (Anthropic)", placeholder: "sk-ant-...", link: "https://console.anthropic.com", linkLabel: "console.anthropic.com" },
  { id: "openai", label: "ChatGPT (OpenAI)", placeholder: "sk-...", link: "https://platform.openai.com/api-keys", linkLabel: "platform.openai.com" },
];

type Message = { role: "user"; text: string } | { role: "ai"; text: string; recipe?: Automation };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "What would you like to automate? Describe it in plain English and I'll build the recipe." },
  ]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [apiKeySet, setApiKeySet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const selectedProvider = PROVIDERS.find((p) => p.id === provider)!;

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setChipsVisible(false);
    setError("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text, apiKey, provider }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't build that recipe. Check your API key and try again." }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "Here's your automation recipe. Hover any step to edit it.", recipe: data }]);
      }
    } catch {
      setError("Network error");
      setMessages((prev) => [...prev, { role: "ai", text: "Network error — please try again." }]);
    }

    setLoading(false);
  };

  if (!apiKeySet) {
    return (
      <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm p-8 gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span className="text-sm font-medium text-gray-800">Flowly</span>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-800 mb-4">Choose your AI provider</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setProvider(p.id); setApiKey(""); }}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${
                  provider === p.id
                    ? "border-violet-400 bg-violet-50 text-violet-800"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">{p.id === "anthropic" ? "Claude" : "ChatGPT"}</div>
                <div className="text-xs text-gray-400 mt-0.5">{p.id === "anthropic" ? "Anthropic" : "OpenAI"}</div>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mb-2">
            Paste your {selectedProvider.label} API key. Get one at{" "}
            <a href={selectedProvider.link} target="_blank" className="text-violet-600 underline">{selectedProvider.linkLabel}</a>.
          </p>
          <p className="text-xs text-gray-400 mb-3">Your key is never stored — it only lives in your browser session.</p>

          <input
            className="w-full text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 focus:bg-white transition-colors mb-3 font-mono"
            placeholder={selectedProvider.placeholder}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apiKey.length > 10 && setApiKeySet(true)}
          />
          <button
            onClick={() => setApiKeySet(true)}
            disabled={apiKey.length < 10}
            className="w-full py-2.5 bg-violet-600 text-white text-sm rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-colors font-medium"
          >
            Start building →
          </button>
        </div>

        <p className="text-xs text-gray-400">Flowly automates Gmail, Google Calendar, and Google Drive.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm" style={{ height: 620 }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
        <div className="w-2 h-2 rounded-full bg-violet-500" />
        <span className="text-sm font-medium text-gray-800">Flowly</span>
        <span className="text-xs text-gray-400 ml-1">· {provider === "anthropic" ? "Claude" : "ChatGPT"}</span>
        <div className="flex gap-1.5 ml-auto">
          {["Gmail", "Calendar", "Drive"].map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-sm ${
              msg.role === "user" ? "bg-violet-100 text-violet-900 rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              {msg.text}
            </div>
            {msg.role === "ai" && msg.recipe && <RecipeCard automation={msg.recipe} />}
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

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
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
