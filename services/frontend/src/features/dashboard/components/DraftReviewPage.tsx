"use client";

import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Layers,
  Sparkles,
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  Award,
  ExternalLink,
  Code2,
} from "lucide-react";
import { useProfileDraft, useApproveProfile } from "../hooks/useDashboard";

export function DraftReviewPage() {
  const { data: draft, isLoading } = useProfileDraft();
  const approveMutation = useApproveProfile();

  if (isLoading || !draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090E] p-8 text-slate-100">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          Loading extracted claims and evidence quotes...
        </div>
      </div>
    );
  }

  const getEvidenceText = (item: {
    evidence?: string | null;
  }): string | null => {
    return item.evidence?.trim() || null;
  };

  return (
    <div className="min-h-screen bg-[#07090E] p-6 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="mb-1 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Review Candidate Draft
              </h1>
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                Verified Claims
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspect grounded quotes attached to each claim. Every item is
              verified before publishing to your recruiter assistant.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:bg-slate-800"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing Site...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve &amp; Publish Site
                </>
              )}
            </button>
          </div>
        </div>

        {/* Flagged Inconsistencies Section */}
        {draft.flags && draft.flags.length > 0 && (
          <section className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400 uppercase">
              <AlertTriangle className="h-4 w-4" />
              <span>
                Flagged Items Requiring Candidate Attention (
                {draft.flags.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {draft.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="space-y-1.5 rounded-xl border border-amber-500/20 bg-slate-950/70 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] font-semibold text-amber-400">
                    <span>
                      {flag.kind || flag.code || "NEEDS_CONFIRMATION"}
                    </span>
                    <span className="text-slate-500">
                      {flag.target_id || flag.field}
                    </span>
                  </div>
                  <p className="text-slate-200">{flag.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Candidate Profile Summary */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-indigo-400 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Candidate Profile Header
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              Verified Schema 1.0.0
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-wide text-white">
              {draft.profile.name}
            </h2>
            <p className="text-sm font-medium text-indigo-300">
              {draft.profile.headline}
            </p>
            <p className="pt-1 text-xs leading-relaxed text-slate-300">
              {draft.profile.summary}
            </p>
          </div>

          {/* Contact Details */}
          {draft.contact && (
            <div className="flex flex-wrap items-center gap-4 border-t border-slate-800/80 pt-3 text-xs text-slate-300">
              {draft.contact.email && (
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{draft.contact.email}</span>
                </div>
              )}
              {draft.contact.phone && (
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{draft.contact.phone}</span>
                </div>
              )}
              {(draft.contact.links || []).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-indigo-300 transition hover:bg-slate-800"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Experience Facts */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Extracted Experience Facts
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {draft.experiences?.length ?? 0} verified roles
            </span>
          </div>

          <div className="space-y-4">
            {(draft.experiences ?? []).map((exp, i) => {
              const evidence = getEvidenceText(exp);
              return (
                <div
                  key={exp.id || i}
                  className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700"
                >
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <h4 className="text-sm font-bold text-white">
                      {exp.role} <span className="text-indigo-400">&bull;</span>{" "}
                      {exp.company}
                    </h4>
                    <span className="font-mono text-xs text-slate-400">
                      {exp.start_date} &ndash; {exp.end_date || "Present"}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-slate-300">
                    {exp.description}
                  </p>

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-inside list-disc space-y-1 pt-1 text-xs text-slate-400">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  )}

                  {evidence && (
                    <div className="flex items-start gap-2 rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 text-[11px] text-slate-400">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">
                          Verified Evidence Quote
                        </span>
                        <span className="font-mono text-slate-300">
                          &ldquo;{evidence}&rdquo;
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Projects Facts */}
        {draft.projects && draft.projects.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Extracted Project Facts
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {draft.projects.length} verified projects
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {draft.projects.map((proj, i) => {
                const evidence = getEvidenceText(proj);
                return (
                  <div
                    key={proj.id || i}
                    className="flex flex-col justify-between space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700"
                  >
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white">
                        {proj.name}
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {proj.description}
                      </p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.technologies.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {evidence && (
                      <div className="flex items-start gap-2 rounded-xl border border-slate-800/80 bg-slate-950/80 p-2.5 text-[10px] text-slate-400">
                        <ShieldCheck className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                        <span className="font-mono text-slate-300">
                          &ldquo;{evidence}&rdquo;
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {draft.skills && draft.skills.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-violet-400" />
                <h3 className="text-base font-bold text-white">
                  Extracted Skills
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {draft.skills.length} verified skills
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex flex-wrap gap-2">
                {draft.skills.map((skill, i) => (
                  <div
                    key={skill.id || i}
                    className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200"
                  >
                    <span className="font-medium text-white">{skill.name}</span>
                    {skill.level && (
                      <span className="font-mono text-[10px] text-indigo-400">
                        ({skill.level})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Educations Section */}
        {draft.educations && draft.educations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Education History
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {draft.educations.length} records
              </span>
            </div>

            <div className="space-y-3">
              {draft.educations.map((edu, i) => (
                <div
                  key={edu.id || i}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {edu.degree}{" "}
                      {edu.field_of_study ? `in ${edu.field_of_study}` : ""}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {edu.institution}
                    </span>
                  </div>
                  {(edu.start_date || edu.end_date) && (
                    <span className="font-mono text-[10px] text-slate-500">
                      {edu.start_date || ""} &ndash; {edu.end_date || "Present"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {draft.certifications && draft.certifications.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Certifications
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {draft.certifications.map((cert, i) => (
                <div
                  key={cert.id || i}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {cert.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {cert.issuer}
                    </span>
                  </div>
                  {cert.issue_date && (
                    <span className="font-mono text-[10px] text-slate-500">
                      Issued {cert.issue_date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/50 to-slate-900 p-6 sm:flex-row">
          <div className="text-xs text-slate-300">
            Clicking approve updates your live portfolio and feeds vector
            embeddings to your Recruiter AI bot.
          </div>
          <button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:bg-slate-800 sm:w-auto"
          >
            {approveMutation.isPending ? "Publishing..." : "Approve & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
