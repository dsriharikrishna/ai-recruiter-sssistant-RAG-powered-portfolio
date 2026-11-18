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
  const [activeTab, setActiveTab] = useState<
    "all" | "experience" | "projects" | "skills"
  >("all");
  const [question, setQuestion] = useState("");

  const { messages, isStreaming, sendMessage, chatBottomRef } =
    useRecruiterChat(slug);

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
      <div className="flex min-h-screen items-center justify-center bg-[#07090E] p-8 text-slate-100">
        <div className="flex flex-col items-center gap-4 text-sm text-slate-400">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-600/20 text-indigo-400">
              <Bot className="h-6 w-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-emerald-400" />
          </div>
          <span>Loading verified candidate portfolio...</span>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-[#07090E] p-8 text-slate-100">
        <div className="max-w-md space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
            <Bot className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Portfolio Not Found</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            The candidate portfolio{" "}
            <span className="font-mono text-indigo-300">/{slug}</span> has not
            been published or does not exist.
          </p>
          <Link
            href="/"
            className="mt-2 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#07090E] font-sans text-slate-100 antialiased selection:bg-indigo-500 selection:text-white lg:flex-row">
      {/* Left Column: Candidate Portfolio */}
      <main className="max-w-5xl flex-1 space-y-12 overflow-y-auto px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-white"
          >
            <div className="rounded-md border border-slate-700 bg-slate-800 p-1 group-hover:border-slate-600">
              <ArrowLeft className="h-3.5 w-3.5" />
            </div>
            Back to Platform
          </Link>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Grounded Evidence &bull; RLS Protected</span>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <section className="relative space-y-6 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 shadow-2xl sm:p-10">
          <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
                  Verified Candidate
                </span>
                <span className="font-mono text-xs text-slate-500">
                  portfolio.domain/{site.slug}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                {site.name}
              </h1>
              <p className="text-lg font-medium text-indigo-300 sm:text-xl">
                {site.headline}
              </p>
              <p className="pt-1 text-sm leading-relaxed text-slate-300">
                {site.summary}
              </p>
            </div>

            <div className="flex shrink-0 gap-2 sm:flex-col">
              {site.contact?.email && (
                <a
                  href={`mailto:${site.contact.email}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  Contact
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
            {site.contact?.email && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Mail className="h-3.5 w-3.5 text-indigo-400" />
                {site.contact.email}
              </span>
            )}
            {site.contact?.phone && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Phone className="h-3.5 w-3.5 text-sky-400" />
                {site.contact.phone}
              </span>
            )}
            {(site.contact?.links ?? []).map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-300 underline decoration-slate-600 transition hover:text-white hover:decoration-indigo-400"
              >
                <span>{link.label}</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            ))}
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-800/80 pb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === "all"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            All Background
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === "experience"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            Work Experience ({(site.experiences ?? []).length})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === "projects"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            Projects ({(site.projects ?? []).length})
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === "skills"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
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
                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-1.5 text-indigo-400">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  Work Experience
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-500">
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
                    className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 transition hover:border-slate-700"
                  >
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {exp.role}
                        </h3>
                        <p className="text-xs font-semibold text-indigo-400">
                          {exp.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {exp.start_date} &ndash; {exp.end_date || "Present"}
                        </span>
                      </div>
                    </div>

                    <p className="pt-1 text-xs leading-relaxed text-slate-300">
                      {exp.description}
                    </p>

                    {exp.highlights && exp.highlights.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {exp.highlights.map((h, hIdx) => (
                          <div
                            key={hIdx}
                            className="flex items-start gap-2 text-xs text-slate-300"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
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
                <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-1.5 text-sky-400">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  Featured Projects
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-500">
                {(site.projects ?? []).length} Items
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(site.projects ?? []).map((projItem, i) => {
                const proj = projItem as {
                  name?: string;
                  description?: string;
                  technologies?: string[];
                };
                return (
                  <div
                    key={i}
                    className="flex flex-col justify-between space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 transition hover:border-slate-700"
                  >
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-white">
                        {proj.name}
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {proj.description}
                      </p>
                    </div>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 border-t border-slate-800/80 pt-2">
                        {proj.technologies.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[10px] text-indigo-300"
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
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-1.5 text-emerald-400">
                  <Cpu className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  Skills &amp; Verifications
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-500">
                {(site.skills ?? []).length} Verified Skills
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {(site.skills ?? []).map((skillItem, i) => {
                const skill = skillItem as {
                  name?: string;
                  category?: string;
                  level?: string;
                };
                return (
                  <div
                    key={i}
                    className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {skill.name}
                      </span>
                      {skill.level && (
                        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                          {skill.level}
                        </span>
                      )}
                    </div>
                    {skill.category && (
                      <p className="text-[11px] text-slate-400">
                        {skill.category}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Right Column: Recruiter AI Chat Sidebar */}
      <aside className="flex h-[700px] w-full shrink-0 flex-col border-t border-slate-800/90 bg-[#0B0E17] p-6 shadow-2xl sm:p-8 lg:sticky lg:top-0 lg:h-screen lg:w-[450px] lg:border-t-0 lg:border-l xl:w-[480px]">
        <div className="mb-4 space-y-2 border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-600/20 text-indigo-400 shadow-md shadow-indigo-600/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">
                  Recruiter Copilot
                </h3>
                <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Grounded in Verified Resume
                </span>
              </div>
            </div>
            <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
              Live RAG
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-400">
            Directly probe {site.name}&apos;s verified experience. Answers are
            streamed live and backed by citation tags.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(p)}
                disabled={isStreaming}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-left text-[10px] text-slate-300 transition hover:border-indigo-500/50 hover:text-white disabled:opacity-50"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-4 ${
                m.role === "user"
                  ? "ml-8 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "mr-4 space-y-2.5 border border-slate-800 bg-slate-900/90 text-slate-200"
              }`}
            >
              {m.role === "bot" && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Recruiter Copilot</span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="space-y-1.5 border-t border-slate-800 pt-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Citations:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {m.sources.map((s, i) => (
                      <span
                        key={i}
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-slate-300"
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
        <form
          onSubmit={handleSend}
          className="flex gap-2 border-t border-slate-800 pt-4"
        >
          <input
            type="text"
            placeholder="Ask about latency, Kafka, leadership..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isStreaming}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isStreaming || !question.trim()}
            className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </aside>
    </div>
  );
}
