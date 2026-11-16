"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export default function DashboardPage() {
  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ["site"],
    queryFn: () => api.getSite(),
  });

  const { data: draft, isLoading: draftLoading } = useQuery({
    queryKey: ["draft"],
    queryFn: () => api.getProfileDraft(),
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Portfolio Dashboard</h1>
            <p className="text-sm text-slate-600">
              Manage your extracted resume facts, preview, and publish your site.
            </p>
          </div>
          <div className="space-x-3">
            <Link
              href="/dashboard/upload"
              className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-medium"
            >
              Upload New Resume
            </Link>
            <Link
              href="/dashboard/review"
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 text-sm font-medium"
            >
              Review Draft
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-lg">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Live Site Info</h2>
            {siteLoading ? (
              <p className="text-sm text-slate-500">Loading site info...</p>
            ) : site ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Slug:</strong> {site.slug}</p>
                <p><strong>Template:</strong> {site.template}</p>
                <p><strong>Theme:</strong> {site.theme}</p>
                <p><strong>Bot Status:</strong> {site.bot_enabled ? "Enabled" : "Disabled"}</p>
                <Link
                  href={`/${site.slug}`}
                  className="inline-block mt-2 text-blue-600 hover:underline"
                  target="_blank"
                >
                  View Public Portfolio &rarr;
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No site published yet.</p>
            )}
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-lg">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Current Draft Status</h2>
            {draftLoading ? (
              <p className="text-sm text-slate-500">Loading draft...</p>
            ) : draft ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Candidate:</strong> {draft.profile.name}</p>
                <p><strong>Experiences:</strong> {draft.experiences?.length ?? 0} facts</p>
                <p><strong>Projects:</strong> {draft.projects?.length ?? 0} facts</p>
                <p><strong>Flags:</strong> {draft.flags?.length ?? 0} pending confirmations</p>
                <Link
                  href="/dashboard/review"
                  className="inline-block mt-2 text-blue-600 hover:underline"
                >
                  Go to review screen &rarr;
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No draft available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
