"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/api/client";

export default function ReviewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: draft, isLoading } = useQuery({
    queryKey: ["draft"],
    queryFn: () => api.getProfileDraft(),
  });

  const approveMutation = useMutation({
    mutationFn: () => api.approveProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft"] });
      queryClient.invalidateQueries({ queryKey: ["site"] });
      router.push("/dashboard");
    },
  });

  if (isLoading || !draft) {
    return <div className="p-8 text-slate-600">Loading draft for review...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Review Candidate Draft</h1>
            <p className="text-sm text-slate-600">
              Hover over fact tags to inspect evidence quotes. Confirm flags before publishing.
            </p>
          </div>
          <button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-md text-sm font-medium"
          >
            {approveMutation.isPending ? "Approving..." : "Approve & Publish"}
          </button>
        </header>

        {(draft.flags?.length ?? 0) > 0 && (
          <section className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
            <h2 className="text-sm font-bold text-amber-900 uppercase">
              Action Required: Review Flags
            </h2>
            <ul className="space-y-1 text-sm text-amber-800">
              {(draft.flags ?? []).map((flag, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="font-semibold">[{flag.kind}]:</span>
                  <span>{flag.message} (Target: {flag.target_id})</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{draft.profile.name}</h2>
          <p className="text-sm font-medium text-slate-700">{draft.profile.headline}</p>
          <p className="text-sm text-slate-600 whitespace-pre-line">{draft.profile.summary}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Work & Project Experiences</h3>
          {(draft.experiences ?? []).map((exp) => (
            <div
              key={exp.id}
              className="p-5 bg-white border border-slate-200 rounded-lg space-y-2 relative group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {exp.role} @ {exp.company}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {exp.start_date} - {exp.end_date || "Present"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 text-xs text-slate-700 rounded">
                    Type: {exp.type}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 text-xs text-slate-700 rounded cursor-help">
                    Source: {exp.source}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600">{exp.description}</p>

              {exp.evidence && (
                <div className="p-2 bg-slate-50 border border-dashed border-slate-300 rounded text-xs text-slate-600 mt-2">
                  <span className="font-bold">Evidence quote:</span> &ldquo;{exp.evidence}&rdquo;
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(draft.skills ?? []).map((skill) => (
              <span
                key={skill.id}
                title={skill.evidence || "User added"}
                className="px-3 py-1 bg-white border border-slate-300 text-sm text-slate-800 rounded-md cursor-help"
              >
                {skill.name} {skill.level ? `(${skill.level})` : ""}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
