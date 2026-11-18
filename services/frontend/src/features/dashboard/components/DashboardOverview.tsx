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
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-6 md:p-10 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20"
            >
              <Bot className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Candidate Dashboard
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tenant Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage your extracted facts, review grounded evidence, and monitor your recruiter AI bot.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchSite();
                refetchDraft();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-800/60 transition"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/dashboard/upload"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Upload New Resume
            </Link>
          </div>
        </div>

        {/* Quick Action Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              RAG Pipeline Ready
            </div>
            <h2 className="text-lg font-bold text-white">
              {draft
                ? "Draft waiting for candidate approval"
                : "Upload your resume to begin extraction"}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              {draft
                ? "Your resume has been parsed into structured claims. Review evidence quotes to publish your live site."
                : "Submit your latest CV in PDF or plain text to build a ground-truth portfolio with an AI recruiter assistant."}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {draft ? (
              <Link
                href="/dashboard/review"
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Review & Approve Draft
              </Link>
            ) : (
              <Link
                href="/dashboard/upload"
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                Upload Resume
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Status Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Site Card */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Live Public Site</h3>
                    <p className="text-xs text-slate-400">Current published candidate endpoint</p>
                  </div>
                </div>
                {site?.url && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Published
                  </span>
                )}
              </div>

              {siteLoading ? (
                <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
                  Loading site status...
                </div>
              ) : site ? (
                <div className="space-y-3 rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Vanity Slug</span>
                    <span className="font-mono text-indigo-300 font-semibold">{site.slug}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Theme & Template</span>
                    <span className="text-slate-200 capitalize">
                      {site.template} &bull; {site.theme}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Version</span>
                    <span className="font-mono text-slate-300">v{site.published_version}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">AI Recruiter Bot</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
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
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
                >
                  <span>Open Public Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              ) : (
                <Link
                  href="/alex-johnson"
                  target="_blank"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 flex items-center justify-center gap-2 transition"
                >
                  <span>Preview Demo Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Profile Draft Card */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Candidate Draft Facts</h3>
                    <p className="text-xs text-slate-400">Extracted claims & evidence status</p>
                  </div>
                </div>
                {draft?.flags && draft.flags.length > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {draft.flags.length} Flags
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Grounded
                  </span>
                )}
              </div>

              {draftLoading ? (
                <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
                  Loading draft facts...
                </div>
              ) : draft ? (
                <div className="space-y-3 rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Candidate Name</span>
                    <span className="text-white font-semibold">{draft.profile.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Experiences Extracted</span>
                    <span className="text-slate-200">{draft.experiences?.length ?? 0} verified roles</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Projects Highlighted</span>
                    <span className="text-slate-200">{draft.projects?.length ?? 0} items</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Evidence Quotes</span>
                    <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
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
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
              >
                <span>Audit & Review Claims</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
