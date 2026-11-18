"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  Briefcase,
  Layers,
  GraduationCap,
  Award,
  ExternalLink,
  Mail,
  Phone,
  ArrowLeft,
  Loader2,
  Calendar,
  Cpu,
} from "lucide-react";
import { usePublicSite, useRecruiterChat } from "../hooks/usePortfolio";

interface PublicPortfolioViewProps {
  slug: string;
}

export function PublicPortfolioView({ slug }: PublicPortfolioViewProps) {
  const { data: site, isLoading, error } = usePublicSite(slug);
  const [activeTab, setActiveTab] = useState<"all" | "experience" | "projects" | "skills">("all");
  const [question, setQuestion] = useState("");

  const { messages, isStreaming, sendMessage, chatBottomRef } = useRecruiterChat(slug);

  const suggestedPrompts = [
    `Tell me about ${site?.name ? `${site.name}'s` : "their"} professional background`,
    site?.experiences?.[0]
      ? `What were their key accomplishments at ${site.experiences[0].company}?`
      : "What are their primary technical contributions?",
    "What tech stack & tools do they specialize in?",
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isStreaming) return;
    const text = question;
    setQuestion("");
    sendMessage(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-slate-400 text-sm">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span>Loading verified candidate portfolio...</span>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3 max-w-md">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Portfolio Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The candidate portfolio <span className="font-mono text-indigo-300">/{slug}</span> has not been published or does not exist.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col lg:flex-row antialiased">
      {/* Left Column: Candidate Portfolio */}
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-14 lg:py-12 space-y-12 max-w-5xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition group"
          >
            <div className="p-1 rounded-md bg-slate-800 border border-slate-700 group-hover:border-slate-600">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            Back to Platform
          </Link>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grounded Evidence &bull; RLS Protected</span>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <section className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 p-8 sm:p-10 shadow-2xl overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Verified Candidate
                </span>
                <span className="text-xs text-slate-500 font-mono">portfolio.domain/{site.slug}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {site.name}
              </h1>
              <p className="text-lg sm:text-xl text-indigo-300 font-medium">
                {site.headline}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed pt-1">
                {site.summary}
              </p>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              {site.contact?.email && (
                <a
                  href={`mailto:${site.contact.email}`}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  Contact
                </a>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {site.contact?.email && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                {site.contact.email}
              </span>
            )}
            {site.contact?.phone && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                {site.contact.phone}
              </span>
            )}
            {(site.contact?.links ?? []).map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-300 hover:text-white underline decoration-slate-600 hover:decoration-indigo-400 transition"
              >
                <span>{link.label}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            ))}
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-800/80 pb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "all"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            All Background
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "experience"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Work Experience ({(site.experiences ?? []).length})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "projects"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Projects ({(site.projects ?? []).length})
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "skills"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Skills ({(site.skills ?? []).length})
          </button>
        </div>

        {/* Experience Section */}
        {(activeTab === "all" || activeTab === "experience") && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">Work Experience</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {(site.experiences ?? []).length} Verified Roles
              </span>
            </div>

            <div className="space-y-4">
              {(site.experiences ?? []).map((expItem, i) => {
                const exp = expItem as {
                  role?: string;
                  company?: string;
                  start_date?: string;
                  end_date?: string;
                  description?: string;
                  highlights?: string[];
                };
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h3 className="text-base font-bold text-white">{exp.role}</h3>
                        <p className="text-xs font-semibold text-indigo-400">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {exp.start_date} &ndash; {exp.end_date || "Present"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{exp.description}</p>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        {exp.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {(activeTab === "all" || activeTab === "projects") && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">Featured Projects</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {(site.projects ?? []).length} Items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(site.projects ?? []).map((projItem, i) => {
                const proj = projItem as {
                  name?: string;
                  description?: string;
                  technologies?: string[];
                };
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-white">{proj.name}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                    </div>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                        {proj.technologies.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-indigo-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {(activeTab === "all" || activeTab === "skills") && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Cpu className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">Skills &amp; Verifications</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {(site.skills ?? []).length} Verified Skills
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(site.skills ?? []).map((skillItem, i) => {
                const skill = skillItem as {
                  name?: string;
                  category?: string;
                  level?: string;
                };
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{skill.name}</span>
                      {skill.level && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {skill.level}
                        </span>
                      )}
                    </div>
                    {skill.category && (
                      <p className="text-[11px] text-slate-400">{skill.category}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Right Column: Recruiter AI Chat Sidebar */}
      <aside className="w-full lg:w-[450px] xl:w-[480px] border-t lg:border-t-0 lg:border-l border-slate-800/90 bg-[#0B0E17] p-6 sm:p-8 flex flex-col h-[700px] lg:h-screen lg:sticky lg:top-0 shadow-2xl shrink-0">
        <div className="border-b border-slate-800 pb-4 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-600/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Recruiter Copilot</h3>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Grounded in Verified Resume
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              Live RAG
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Directly probe {site.name}&apos;s verified experience. Answers are streamed live and backed by citation tags.
          </p>

          <div className="pt-2 flex flex-wrap gap-1.5">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(p)}
                disabled={isStreaming}
                className="text-[10px] text-left px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition disabled:opacity-50"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl ${
                m.role === "user"
                  ? "bg-indigo-600 text-white ml-8 shadow-md shadow-indigo-600/20"
                  : "bg-slate-900/90 border border-slate-800 text-slate-200 mr-4 space-y-2.5"
              }`}
            >
              {m.role === "bot" && (
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Recruiter Copilot</span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Citations:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {m.sources.map((s, i) => (
                      <span
                        key={i}
                        className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-slate-300"
                      >
                        {s.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Question Input Form */}
        <form onSubmit={handleSend} className="pt-4 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Ask about latency, Kafka, leadership..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isStreaming}
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={isStreaming || !question.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center shadow-md shadow-indigo-600/20"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </aside>
    </div>
  );
}
