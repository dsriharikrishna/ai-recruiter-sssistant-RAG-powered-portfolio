"use client";

import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  ExternalLink,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Globe,
  RefreshCw,
  Layers,
} from "lucide-react";
import { useSiteInfo, useProfileDraft } from "../hooks/useDashboard";

export function DashboardOverview() {
  const {
    data: site,
    isLoading: siteLoading,
    refetch: refetchSite,
  } = useSiteInfo();

  const {
    data: draft,
    isLoading: draftLoading,
    refetch: refetchDraft,
  } = useProfileDraft();

  return (
    <div className="min-h-screen bg-[#07090E] p-6 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20"
            >
              <Bot className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Candidate Dashboard
                </h1>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                  Tenant Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage your extracted facts, review grounded evidence, and
                monitor your recruiter AI bot.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchSite();
                refetchDraft();
              }}
              className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
              title="Refresh status"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Link
              href="/dashboard/upload"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              <FileText className="h-3.5 w-3.5" />
              Upload New Resume
            </Link>
          </div>
        </div>

        {/* Quick Action Banner */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 shadow-xl sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              RAG Pipeline Ready
            </div>
            <h2 className="text-lg font-bold text-white">
              {draft
                ? "Draft waiting for candidate approval"
                : "Upload your resume to begin extraction"}
            </h2>
            <p className="max-w-xl text-xs text-slate-300">
              {draft
                ? "Your resume has been parsed into structured claims. Review evidence quotes to publish your live site."
                : "Submit your latest CV in PDF or plain text to build a ground-truth portfolio with an AI recruiter assistant."}
            </p>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            {draft ? (
              <Link
                href="/dashboard/review"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 sm:w-auto"
              >
                <CheckCircle2 className="h-4 w-4" />
                Review & Approve Draft
              </Link>
            ) : (
              <Link
                href="/dashboard/upload"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 sm:w-auto"
              >
                Upload Resume
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Status Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Live Site Card */}
          <div className="flex flex-col justify-between space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-2 text-sky-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Live Public Site
                    </h3>
                    <p className="text-xs text-slate-400">
                      Current published candidate endpoint
                    </p>
                  </div>
                </div>
                {site?.url && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Published
                  </span>
                )}
              </div>

              {siteLoading ? (
                <div className="animate-pulse py-8 text-center text-xs text-slate-500">
                  Loading site status...
                </div>
              ) : site ? (
                <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800/60 py-1">
                    <span className="text-slate-400">Vanity Slug</span>
                    <span className="font-mono font-semibold text-indigo-300">
                      {site.slug}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/60 py-1">
                    <span className="text-slate-400">Theme & Template</span>
                    <span className="text-slate-200 capitalize">
                      {site.template} &bull; {site.theme}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/60 py-1">
                    <span className="text-slate-400">Version</span>
                    <span className="font-mono text-slate-300">
                      v{site.published_version}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">AI Recruiter Bot</span>
                    <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active & Grounded
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No site published yet. Approve a draft to publish.
                </div>
              )}
            </div>

            <div>
              {site?.slug ? (
                <Link
                  href={`/${site.slug}`}
                  target="_blank"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  <span>Open Public Portfolio</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              ) : (
                <Link
                  href="/alex-johnson"
                  target="_blank"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-800"
                >
                  <span>Preview Demo Portfolio</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Profile Draft Card */}
          <div className="flex flex-col justify-between space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Candidate Draft Facts
                    </h3>
                    <p className="text-xs text-slate-400">
                      Extracted claims & evidence status
                    </p>
                  </div>
                </div>
                {draft?.flags && draft.flags.length > 0 ? (
                  <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    {draft.flags.length} Flags
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    Grounded
                  </span>
                )}
              </div>

              {draftLoading ? (
                <div className="animate-pulse py-8 text-center text-xs text-slate-500">
                  Loading draft facts...
                </div>
              ) : draft ? (
                <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800/60 py-1">
                    <span className="text-slate-400">Candidate Name</span>
                    <span className="font-semibold text-white">
                      {draft.profile.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/60 py-1">
                    <span className="text-slate-400">
                      Experiences Extracted
                    </span>
                    <span className="text-slate-200">
                      {draft.experiences?.length ?? 0} verified roles
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/60 py-1">
                    <span className="text-slate-400">Projects Highlighted</span>
                    <span className="text-slate-200">
                      {draft.projects?.length ?? 0} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Evidence Quotes</span>
                    <span className="flex items-center gap-1 font-mono font-medium text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      100% Attached
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No draft in review. Upload a resume to create one.
                </div>
              )}
            </div>

            <div>
              <Link
                href="/dashboard/review"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                <span>Audit & Review Claims</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
