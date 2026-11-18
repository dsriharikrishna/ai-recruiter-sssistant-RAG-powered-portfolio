"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Lock,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Search,
} from "lucide-react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Mandatory Tagline Reveal Section (B11) using IntersectionObserver
  const [revealedWords, setRevealedWords] = useState<number>(0);
  const taglineRef = useRef<HTMLDivElement>(null);

  const taglineText =
    "A portfolio that speaks for your real career achievements with source quotes and zero hallucinations.";
  const words = taglineText.split(" ");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let count = 0;
            const interval = setInterval(() => {
              count += 1;
              setRevealedWords(count);
              if (count >= words.length) {
                clearInterval(interval);
              }
            }, 75);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (taglineRef.current) {
      observer.observe(taglineRef.current);
    }

    return () => observer.disconnect();
  }, [words.length]);

  const faqs = [
    {
      q: "How does the AI recruiter avoid making up false information?",
      a: "Every single metric, company title, and skill is extracted with an explicit verbatim quote from your resume source text. If a recruiter asks a question outside your approved candidate profile, the assistant explicitly states that the information is not in your verified record.",
    },
    {
      q: "Can other users or tenants see my resume data?",
      a: "No. The platform enforces strict multi-tenant isolation. Every database query requires a verified owner ID and runs behind PostgreSQL Row Level Security (RLS). Cross-tenant queries are blocked at the database engine level.",
    },
    {
      q: "Do I get to review what the AI says before publishing?",
      a: "Yes. You have full human-in-the-loop review. After uploading your resume, you inspect every extracted fact, resolve flagged questions, and approve the profile JSON before anything is indexed into vector storage.",
    },
    {
      q: "What format can I upload my resume in?",
      a: "You can upload standard PDF files, plain text documents (.txt), or Word documents (.docx). The ingestion pipeline cleans and parses text without loss of context.",
    },
    {
      q: "How does the recruiter chatbot stream answers in real time?",
      a: "The assistant uses Server-Sent Events (SSE) over HTTP streaming. Tokens and source reference chips are delivered incrementally to the public portfolio screen without blocking UI rendering.",
    },
    {
      q: "Where is my portfolio hosted?",
      a: "Each candidate receives their own vanity URL slug (for example portfolio.domain/your-name) that can be linked on LinkedIn, your email signature, or directly inside job applications.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white antialiased">
      {/* Floating Navigation Bar (B7) */}
      <nav
        aria-label="Main Navigation"
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 rounded-2xl bg-[#181818]/85 backdrop-blur-md border border-[#272727] px-5 py-3 flex items-center justify-between shadow-xl transition-all"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#272727] border border-[#313131] flex items-center justify-center text-white">
            <Bot className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-base text-white tracking-tight">
            PersonaAI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a
            href="#benefits"
            className="hover:text-white transition-colors duration-300"
          >
            Benefits
          </a>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors duration-300"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="hover:text-white transition-colors duration-300"
          >
            FAQ
          </a>
          <Link
            href="/alex-johnson"
            className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors duration-300"
          >
            <span>Live demo</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-[#272727] transition-colors duration-300"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard/upload"
            className="text-sm font-semibold bg-white text-black hover:bg-slate-200 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-1.5 active:scale-[0.98]"
          >
            <span>Upload resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section (A2, B5) */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-24 px-6 flex flex-col items-center text-center">
        <div className="max-w-[680px] mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#272727] text-xs font-medium text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified evidence quotes &bull; Zero hallucinations</span>
          </div>

          {/* Heading with strict gradient from #FFFFFF to #9B9B9B (B5) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight bg-gradient-to-r from-[#FFFFFF] to-[#9B9B9B] bg-clip-text text-transparent [text-wrap:balance]">
            Turn your resume into an AI recruiter that speaks for you
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-[680px] [text-wrap:pretty]">
            Upload your CV, verify extracted source evidence, and publish a candidate portfolio with an embedded RAG recruiter assistant that answers strictly from approved data.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/upload"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black hover:bg-slate-200 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              <span>Upload your resume</span>
            </Link>
            <Link
              href="/alex-johnson"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#181818] hover:bg-[#272727] border border-[#272727] text-slate-200 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Explore live demo</span>
            </Link>
          </div>

          {/* Proof signal (A2.4) */}
          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Source quote verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>PostgreSQL RLS security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        {/* Hero Visual: Product Screenshot / Interface (A2.5) */}
        <div className="mt-12 w-full max-w-4xl mx-auto rounded-2xl bg-[#181818] border border-[#272727] p-4 sm:p-6 shadow-2xl text-left space-y-4">
          <div className="flex items-center justify-between border-b border-[#272727] pb-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#313131]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#313131]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#313131]" />
              <span className="ml-2 font-mono text-slate-500">
                portfolio.domain/alex-johnson
              </span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">
              &bull; Grounded assistant ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">
                  Verified candidate profile
                </span>
                <h3 className="text-xl font-semibold text-white">Interactive Candidate Profile</h3>
                <p className="text-xs text-slate-300">
                  Principal Engineer &bull; Production Systems &amp; Distributed Architecture
                </p>
              </div>

              <div className="rounded-xl bg-[#1F1F1F] border border-[#272727] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    Lead Infrastructure Architect &bull; Cloud Platform
                  </span>
                  <span className="text-slate-400 font-mono">2021 to 2024</span>
                </div>
                <p className="text-xs text-slate-300">
                  Designed high throughput streaming and vector database pipelines reducing system latency significantly.
                </p>
                <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Evidence quote verified from candidate resume</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 rounded-xl bg-[#1F1F1F] border border-[#272727] p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#272727] pb-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-white">Recruiter assistant</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#272727] text-xs text-slate-200 space-y-1">
                  <span className="text-[10px] uppercase text-indigo-400 font-bold block">
                    Recruiter query
                  </span>
                  <p>&ldquo;What architectural impact did the candidate achieve?&rdquo;</p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#181818] border border-[#272727] text-xs text-slate-300 space-y-1.5">
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    Verified answer (cites verified facts):
                  </span>
                  <p className="leading-relaxed">
                    The candidate architected distributed data pipelines reducing p99 latency with proven production evidence.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/upload"
                className="w-full py-2 bg-white text-black hover:bg-slate-200 text-xs font-semibold rounded-lg text-center transition-colors duration-300 block"
              >
                Create your verified portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Tagline Reveal Section (B11) */}
      <section
        ref={taglineRef}
        className="py-24 px-6 bg-[#181818] border-y border-[#272727] flex flex-col items-center justify-center text-center"
      >
        <div className="max-w-[680px] mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
            Core Promise
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-relaxed tracking-tight [text-wrap:balance]">
            {words.map((word, idx) => (
              <span
                key={idx}
                className={`transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  idx < revealedWords ? "text-white" : "text-[#4A4A4A]"
                }`}
              >
                {word}{" "}
              </span>
            ))}
          </h2>
        </div>
      </section>

      {/* Benefits Section (A2.7, A5) */}
      <section id="benefits" className="py-24 px-6 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
            Key Outcomes
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Built for candidate authenticity and recruiter clarity
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-[680px] mx-auto">
            Give hiring teams immediate answers without misrepresenting your experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#181818] border border-[#272727] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#272727] flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Zero hallucinated claims
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Ground truth citations</strong> &mdash; every extracted fact anchors to a direct evidence quote from your resume source text.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#181818] border border-[#272727] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#272727] flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Isolated candidate data
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Tenant row level security</strong> &mdash; database queries require an authenticated owner ID so user profiles never mingle.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#181818] border border-[#272727] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#272727] flex items-center justify-center text-sky-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Real time recruiter responses
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Streamed token delivery</strong> &mdash; answers and entity citations arrive token by token via Server-Sent Events.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section (A2.8) */}
      <section id="how-it-works" className="py-24 px-6 bg-[#181818] border-y border-[#272727]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              From raw resume to active portfolio in three steps
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-[680px] mx-auto">
              You maintain complete control over what is indexed and shown.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#1F1F1F] border border-[#272727] space-y-4">
              <span className="text-2xl font-semibold font-mono text-indigo-400">01</span>
              <h3 className="text-base font-semibold text-white">Upload your resume</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Provide your CV in PDF or text format. The ingestion pipeline extracts roles, metrics, and skills into structured claims.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#1F1F1F] border border-[#272727] space-y-4">
              <span className="text-2xl font-semibold font-mono text-emerald-400">02</span>
              <h3 className="text-base font-semibold text-white">Review evidence quotes</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Inspect each claim alongside its verified evidence quote. Confirm flagged questions before anything is published.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#1F1F1F] border border-[#272727] space-y-4">
              <span className="text-2xl font-semibold font-mono text-sky-400">03</span>
              <h3 className="text-base font-semibold text-white">Share your public link</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Share your personal URL with recruiters so hiring managers can query your verified AI assistant directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (A2.10) */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
            Questions and Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-[680px] mx-auto">
            Everything you need to know about grounding, tenant safety, and publishing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#181818] border border-[#272727] overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-slate-200 transition-colors duration-300"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-[#272727] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section (A2.12) */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-[#181818] border border-[#272727] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight [text-wrap:balance]">
            Ready to build your verified AI candidate portfolio?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-[680px] mx-auto [text-wrap:pretty]">
            Give recruiters immediate, accurate answers backed by your real career accomplishments.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/upload"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-black hover:bg-slate-200 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              <span>Upload your resume</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#272727] hover:bg-[#313131] border border-[#313131] text-slate-200 font-semibold text-sm transition-all duration-300 active:scale-[0.98]"
            >
              Developer sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (B10) */}
      <footer className="mt-auto border-t border-[#272727] bg-[#000000] py-10 px-6 text-slate-500 text-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">PersonaAI</span>
            <span>&bull;</span>
            <span>Multi-tenant portfolio builder & recruiter assistant</span>
          </div>

          <div className="flex flex-wrap gap-6 text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors duration-300">
              Sign in
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors duration-300">
              Dashboard
            </Link>
            <Link href="/dashboard/upload" className="hover:text-white transition-colors duration-300">
              Upload
            </Link>
            <Link href="/alex-johnson" className="hover:text-white transition-colors duration-300">
              Demo portfolio
            </Link>
            <span className="text-slate-600">Privacy & Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
