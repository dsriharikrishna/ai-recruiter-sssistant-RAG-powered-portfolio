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
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          Loading extracted claims and evidence quotes...
        </div>
      </div>
    );
  }

  const getEvidenceText = (item: { evidence?: string | null }): string | null => {
    return item.evidence?.trim() || null;
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-6 md:p-10 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Review Candidate Draft
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Verified Claims
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspect grounded quotes attached to each claim. Every item is verified before publishing to your recruiter assistant.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing Site...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Approve &amp; Publish Site
                </>
              )}
            </button>
          </div>
        </div>

        {/* Flagged Inconsistencies Section */}
        {draft.flags && draft.flags.length > 0 && (
          <section className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Flagged Items Requiring Candidate Attention ({draft.flags.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {draft.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/20 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-amber-400 font-semibold">
                    <span>{flag.kind || flag.code || "NEEDS_CONFIRMATION"}</span>
                    <span className="text-slate-500">{flag.target_id || flag.field}</span>
                  </div>
                  <p className="text-slate-200">{flag.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Candidate Profile Summary */}
        <section className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Candidate Profile Header
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Schema 1.0.0
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-wide">{draft.profile.name}</h2>
            <p className="text-sm text-indigo-300 font-medium">{draft.profile.headline}</p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">{draft.profile.summary}</p>
          </div>

          {/* Contact Details */}
          {draft.contact && (
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              {draft.contact.email && (
                <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{draft.contact.email}</span>
                </div>
              )}
              {draft.contact.phone && (
                <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{draft.contact.phone}</span>
                </div>
              )}
              {(draft.contact.links || []).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-slate-950/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 text-indigo-300 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
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
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Extracted Experience Facts</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {draft.experiences?.length ?? 0} verified roles
            </span>
          </div>

          <div className="space-y-4">
            {(draft.experiences ?? []).map((exp, i) => {
              const evidence = getEvidenceText(exp);
              return (
                <div
                  key={exp.id || i}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-bold text-white text-sm">
                      {exp.role} <span className="text-indigo-400">&bull;</span> {exp.company}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {exp.start_date} &ndash; {exp.end_date || "Present"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{exp.description}</p>

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pt-1">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  )}

                  {evidence && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Verified Evidence Quote</span>
                        <span className="font-mono text-slate-300">&ldquo;{evidence}&rdquo;</span>
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
                <Layers className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-white">Extracted Project Facts</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {draft.projects.length} verified projects
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draft.projects.map((proj, i) => {
                const evidence = getEvidenceText(proj);
                return (
                  <div
                    key={proj.id || i}
                    className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <h4 className="font-bold text-white text-sm">{proj.name}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.technologies.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {evidence && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-2">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="font-mono text-slate-300">&ldquo;{evidence}&rdquo;</span>
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
                <Code2 className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-white">Extracted Skills</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {draft.skills.length} verified skills
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex flex-wrap gap-2">
                {draft.skills.map((skill, i) => (
                  <div
                    key={skill.id || i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200"
                  >
                    <span className="font-medium text-white">{skill.name}</span>
                    {skill.level && (
                      <span className="text-[10px] text-indigo-400 font-mono">({skill.level})</span>
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
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Education History</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {draft.educations.length} records
              </span>
            </div>

            <div className="space-y-3">
              {draft.educations.map((edu, i) => (
                <div
                  key={edu.id || i}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ""}
                    </h4>
                    <span className="text-[11px] text-slate-400">{edu.institution}</span>
                  </div>
                  {(edu.start_date || edu.end_date) && (
                    <span className="text-[10px] text-slate-500 font-mono">
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
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Certifications</h3>
              </div>
            </div>

            <div className="space-y-3">
              {draft.certifications.map((cert, i) => (
                <div
                  key={cert.id || i}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{cert.name}</h4>
                    <span className="text-[11px] text-slate-400">{cert.issuer}</span>
                  </div>
                  {cert.issue_date && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Issued {cert.issue_date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Actions */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            Clicking approve updates your live portfolio and feeds vector embeddings to your Recruiter AI bot.
          </div>
          <button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            {approveMutation.isPending ? "Publishing..." : "Approve & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
