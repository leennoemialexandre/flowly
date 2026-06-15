import { NextRequest, NextResponse } from "next/server";

const PROMPT = (d: string) => `You are an automation recipe builder. The user wants to automate: "${d}"\n\nReturn ONLY valid JSON, no markdown:\n{"title":"Short name","steps":[{"type":"trigger","label":"What triggers this","detail":"Trigger detail"},{"type":"action","label":"What to do","detail":"Action detail"}]}`;

async function callAnthropic(description: string, apiKey: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: PROMPT(description) }] }),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error?.message || "Anthropic error"); }
  const data = await res.json();
  return data.content[0].text.trim();
}

async function callOpenAI(description: string, apiKey: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: PROMPT(description) }], max_tokens: 1000 }),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error?.message || "OpenAI error"); }
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

export async function POST(req: NextRequest) {
  const { description, apiKey, provider } = await req.json();
  if (!apiKey) return NextResponse.json({ error: "No API key provided" }, { status: 401 });
  if (!description) return NextResponse.json({ error: "No description" }, { status: 400 });
  try {
    const text = provider === "openai" ? await callOpenAI(description, apiKey) : await callAnthropic(description, apiKey);
    const clean = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(clean));
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
