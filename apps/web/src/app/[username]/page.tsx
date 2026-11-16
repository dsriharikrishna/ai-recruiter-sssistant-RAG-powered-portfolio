"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

interface SourceItem {
  entity_id: string;
  title: string;
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = Array.isArray(params?.username)
    ? params.username[0]
    : (params?.username as string) || "alex-johnson";

  const { data: site, isLoading, error } = useQuery({
    queryKey: ["public-site", slug],
    queryFn: () => api.getPublicSite(slug),
  });

  // Chat Widget State
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "bot"; text: string; sources?: SourceItem[] }>
  >([
    {
      role: "bot",
      text: "Hello! I am the AI recruiter assistant for this portfolio. Ask me anything about their background, skills, or experience.",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isStreaming) return;

    const userMsg = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsStreaming(true);

    try {
      const response = await fetch("http://localhost:8000/public/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, message: userMsg }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botAnswer = "";
      let botSources: SourceItem[] = [];

      // Append initial bot reply placeholder
      setMessages((prev) => [...prev, { role: "bot", text: "" }]);

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          const match = block.match(/event:\s*(.+)\ndata:\s*(.+)/);
          if (match) {
            const event = match[1].trim();
            const data = JSON.parse(match[2].trim());

            if (event === "sources") {
              botSources = data.sources || [];
            } else if (event === "token") {
              botAnswer += data.token || "";
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === "bot") {
                  last.text = botAnswer;
                  last.sources = botSources;
                }
                return next;
              });
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "An error occurred while answering. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-slate-600">Loading portfolio...</div>;
  }

  if (error || !site) {
    return <div className="p-8 text-red-600">Portfolio not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Portfolio Content */}
      <main className="flex-1 p-8 max-w-3xl mx-auto space-y-8">
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-4xl font-extrabold text-slate-900">{site.name}</h1>
          <p className="text-xl text-slate-700 mt-1">{site.headline}</p>
          <p className="text-slate-600 mt-4 leading-relaxed">{site.summary}</p>

          <div className="mt-4 flex gap-4 text-sm text-slate-600">
            {site.contact?.email && <span>Email: {site.contact.email}</span>}
            {site.contact?.phone && <span>Phone: {site.contact.phone}</span>}
            {(site.contact?.links ?? []).map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </header>

        {/* Experience Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Experience</h2>
          {(site.experiences ?? []).map((expItem, i) => {
            const exp = expItem as {
              role?: string;
              company?: string;
              start_date?: string;
              end_date?: string;
              description?: string;
            };
            return (
              <div key={i} className="p-5 bg-white border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-slate-900">
                  {exp.role} &middot; {exp.company}
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  {exp.start_date} - {exp.end_date || "Present"}
                </p>
                <p className="text-sm text-slate-700">{exp.description}</p>
              </div>
            );
          })}
        </section>

        {/* Projects Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          {(site.projects ?? []).map((projItem, i) => {
            const proj = projItem as {
              name?: string;
              description?: string;
            };
            return (
              <div key={i} className="p-5 bg-white border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-slate-900">{proj.name}</h3>
                <p className="text-sm text-slate-700">{proj.description}</p>
              </div>
            );
          })}
        </section>
      </main>

      {/* Recruiter Chat Widget */}
      <aside className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-200 bg-white p-6 flex flex-col h-auto md:h-screen sticky top-0">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Recruiter AI Assistant</h2>
        <p className="text-xs text-slate-500 mb-4">
          Answers questions solely from {site.name}&apos;s verified background.
        </p>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg text-sm ${
                m.role === "user"
                  ? "bg-slate-900 text-white ml-6"
                  : "bg-slate-100 text-slate-800 mr-6"
              }`}
            >
              <p>{m.text}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
                  <span className="font-bold">Sources:</span>{" "}
                  {m.sources.map((s) => s.title).join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about skills, experience..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isStreaming}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={isStreaming || !question.trim()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-medium rounded-md transition"
          >
            Ask
          </button>
        </form>
      </aside>
    </div>
  );
}
