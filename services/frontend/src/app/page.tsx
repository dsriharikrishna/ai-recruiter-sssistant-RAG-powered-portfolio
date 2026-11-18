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
    <div className="flex min-h-screen flex-col bg-[#000000] font-sans text-slate-100 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Floating Navigation Bar (B7) */}
      <nav
        aria-label="Main Navigation"
        className="fixed top-4 left-1/2 z-50 flex w-[92%] max-w-5xl -translate-x-1/2 items-center justify-between rounded-2xl border border-[#272727] bg-[#181818]/85 px-5 py-3 shadow-xl backdrop-blur-md transition-all"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#313131] bg-[#272727] text-white">
            <Bot className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            PersonaAI
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          <a
            href="#benefits"
            className="transition-colors duration-300 hover:text-white"
          >
            Benefits
          </a>
          <a
            href="#how-it-works"
            className="transition-colors duration-300 hover:text-white"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="transition-colors duration-300 hover:text-white"
          >
            FAQ
          </a>
          <Link
            href="/alex-johnson"
            className="flex items-center gap-1 text-slate-300 transition-colors duration-300 hover:text-white"
          >
            <span>Live demo</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition-colors duration-300 hover:bg-[#272727] hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-all duration-300 hover:bg-slate-200 active:scale-[0.98]"
          >
            <span>Upload resume</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section (A2, B5) */}
      <section className="flex flex-col items-center px-6 pt-32 pb-20 text-center md:pt-40 md:pb-24">
        <div className="mx-auto max-w-[680px] space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#272727] bg-[#181818] px-3 py-1 text-xs font-medium text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Verified evidence quotes &bull; Zero hallucinations</span>
          </div>

          {/* Heading with strict gradient from #FFFFFF to #9B9B9B (B5) */}
          <h1 className="bg-gradient-to-r from-[#FFFFFF] to-[#9B9B9B] bg-clip-text text-4xl leading-tight font-semibold tracking-tight [text-wrap:balance] text-transparent sm:text-5xl md:text-6xl">
            Turn your resume into an AI recruiter that speaks for you
          </h1>

          <p className="max-w-[680px] text-base leading-relaxed [text-wrap:pretty] text-slate-300 sm:text-lg">
            Upload your CV, verify extracted source evidence, and publish a
            candidate portfolio with an embedded RAG recruiter assistant that
            answers strictly from approved data.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
            <Link
              href="/dashboard/upload"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-slate-200 active:scale-[0.98] sm:w-auto"
            >
              <FileText className="h-4 w-4" />
              <span>Upload your resume</span>
            </Link>
            <Link
              href="/alex-johnson"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#272727] bg-[#181818] px-6 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-[#272727] active:scale-[0.98] sm:w-auto"
            >
              <Bot className="h-4 w-4 text-indigo-400" />
              <span>Explore live demo</span>
            </Link>
          </div>

          {/* Proof signal (A2.4) */}
          <div className="flex items-center justify-center gap-6 pt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Source quote verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-indigo-400" />
              <span>PostgreSQL RLS security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        {/* Hero Visual: Product Screenshot / Interface (A2.5) */}
        <div className="mx-auto mt-12 w-full max-w-4xl space-y-4 rounded-2xl border border-[#272727] bg-[#181818] p-4 text-left shadow-2xl sm:p-6">
          <div className="flex items-center justify-between border-b border-[#272727] pb-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#313131]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#313131]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#313131]" />
              <span className="ml-2 font-mono text-slate-500">
                portfolio.domain/alex-johnson
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400">
              &bull; Grounded assistant ready
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-12">
            <div className="space-y-4 md:col-span-7">
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase">
                  Verified candidate profile
                </span>
                <h3 className="text-xl font-semibold text-white">
                  Interactive Candidate Profile
                </h3>
                <p className="text-xs text-slate-300">
                  Principal Engineer &bull; Production Systems &amp; Distributed
                  Architecture
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-[#272727] bg-[#1F1F1F] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    Lead Infrastructure Architect &bull; Cloud Platform
                  </span>
                  <span className="font-mono text-slate-400">2021 to 2024</span>
                </div>
                <p className="text-xs text-slate-300">
                  Designed high throughput streaming and vector database
                  pipelines reducing system latency significantly.
                </p>
                <div className="flex items-center gap-1.5 pt-1 font-mono text-[11px] text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Evidence quote verified from candidate resume</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-3 rounded-xl border border-[#272727] bg-[#1F1F1F] p-4 md:col-span-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#272727] pb-2">
                  <Bot className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-white">
                    Recruiter assistant
                  </span>
                </div>

                <div className="space-y-1 rounded-lg bg-[#272727] p-2.5 text-xs text-slate-200">
                  <span className="block text-[10px] font-bold text-indigo-400 uppercase">
                    Recruiter query
                  </span>
                  <p>
                    &ldquo;What architectural impact did the candidate
                    achieve?&rdquo;
                  </p>
                </div>

                <div className="space-y-1.5 rounded-lg border border-[#272727] bg-[#181818] p-2.5 text-xs text-slate-300">
                  <span className="block font-mono text-[10px] text-emerald-400">
                    Verified answer (cites verified facts):
                  </span>
                  <p className="leading-relaxed">
                    The candidate architected distributed data pipelines
                    reducing p99 latency with proven production evidence.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/upload"
                className="block w-full rounded-lg bg-white py-2 text-center text-xs font-semibold text-black transition-colors duration-300 hover:bg-slate-200"
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
        className="flex flex-col items-center justify-center border-y border-[#272727] bg-[#181818] px-6 py-24 text-center"
      >
        <div className="mx-auto max-w-[680px] space-y-4">
          <span className="font-mono text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            Core Promise
          </span>
          <h2 className="text-2xl leading-relaxed font-semibold tracking-tight [text-wrap:balance] sm:text-3xl md:text-4xl">
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
      <section
        id="benefits"
        className="mx-auto w-full max-w-5xl space-y-12 px-6 py-24"
      >
        <div className="space-y-3 text-center">
          <span className="font-mono text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            Key Outcomes
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built for candidate authenticity and recruiter clarity
          </h2>
          <p className="mx-auto max-w-[680px] text-sm text-slate-400 sm:text-base">
            Give hiring teams immediate answers without misrepresenting your
            experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-3 rounded-2xl border border-[#272727] bg-[#181818] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#272727] text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Zero hallucinated claims
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong>Ground truth citations</strong> &mdash; every extracted
              fact anchors to a direct evidence quote from your resume source
              text.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#272727] bg-[#181818] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#272727] text-emerald-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Isolated candidate data
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong>Tenant row level security</strong> &mdash; database
              queries require an authenticated owner ID so user profiles never
              mingle.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#272727] bg-[#181818] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#272727] text-sky-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Real time recruiter responses
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong>Streamed token delivery</strong> &mdash; answers and
              entity citations arrive token by token via Server-Sent Events.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section (A2.8) */}
      <section
        id="how-it-works"
        className="border-y border-[#272727] bg-[#181818] px-6 py-24"
      >
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="space-y-3 text-center">
            <span className="font-mono text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Simple Process
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              From raw resume to active portfolio in three steps
            </h2>
            <p className="mx-auto max-w-[680px] text-sm text-slate-400 sm:text-base">
              You maintain complete control over what is indexed and shown.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-4 rounded-2xl border border-[#272727] bg-[#1F1F1F] p-6">
              <span className="font-mono text-2xl font-semibold text-indigo-400">
                01
              </span>
              <h3 className="text-base font-semibold text-white">
                Upload your resume
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Provide your CV in PDF or text format. The ingestion pipeline
                extracts roles, metrics, and skills into structured claims.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#272727] bg-[#1F1F1F] p-6">
              <span className="font-mono text-2xl font-semibold text-emerald-400">
                02
              </span>
              <h3 className="text-base font-semibold text-white">
                Review evidence quotes
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Inspect each claim alongside its verified evidence quote.
                Confirm flagged questions before anything is published.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#272727] bg-[#1F1F1F] p-6">
              <span className="font-mono text-2xl font-semibold text-sky-400">
                03
              </span>
              <h3 className="text-base font-semibold text-white">
                Share your public link
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Share your personal URL with recruiters so hiring managers can
                query your verified AI assistant directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (A2.10) */}
      <section
        id="faq"
        className="mx-auto w-full max-w-4xl space-y-12 px-6 py-24"
      >
        <div className="space-y-3 text-center">
          <span className="font-mono text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            Questions and Answers
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto max-w-[680px] text-sm text-slate-400 sm:text-base">
            Everything you need to know about grounding, tenant safety, and
            publishing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-[#272727] bg-[#181818] transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white transition-colors duration-300 hover:text-slate-200 sm:text-base"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>
              {openFaq === idx && (
                <div className="border-t border-[#272727] px-5 pt-4 pb-5 text-sm leading-relaxed text-slate-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section (A2.12) */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-[#272727] bg-[#181818] p-8 text-center shadow-2xl sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight [text-wrap:balance] text-white sm:text-4xl">
            Ready to build your verified AI candidate portfolio?
          </h2>
          <p className="mx-auto max-w-[680px] text-sm [text-wrap:pretty] text-slate-300 sm:text-base">
            Give recruiters immediate, accurate answers backed by your real
            career accomplishments.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
            <Link
              href="/dashboard/upload"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-semibold text-black transition-all duration-300 hover:bg-slate-200 active:scale-[0.98] sm:w-auto"
            >
              <FileText className="h-4 w-4" />
              <span>Upload your resume</span>
            </Link>
            <Link
              href="/login"
              className="w-full rounded-xl border border-[#313131] bg-[#272727] px-8 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-[#313131] active:scale-[0.98] sm:w-auto"
            >
              Developer sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (B10) */}
      <footer className="mt-auto border-t border-[#272727] bg-[#000000] px-6 py-10 text-xs text-slate-500">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">PersonaAI</span>
            <span>&bull;</span>
            <span>Multi-tenant portfolio builder & recruiter assistant</span>
          </div>

          <div className="flex flex-wrap gap-6 text-slate-400">
            <Link
              href="/login"
              className="transition-colors duration-300 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors duration-300 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/upload"
              className="transition-colors duration-300 hover:text-white"
            >
              Upload
            </Link>
            <Link
              href="/alex-johnson"
              className="transition-colors duration-300 hover:text-white"
            >
              Demo portfolio
            </Link>
            <span className="text-slate-600">Privacy & Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
