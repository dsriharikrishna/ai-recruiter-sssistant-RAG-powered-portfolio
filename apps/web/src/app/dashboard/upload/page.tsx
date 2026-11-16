"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/api/client";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      const res = await api.uploadResume(file);
      setJobId(res.job_id);

      // Transition to review after mock processing
      setTimeout(() => {
        router.push("/dashboard/review");
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-xl mx-auto p-8 bg-white border border-slate-200 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Upload Resume</h1>
        <p className="text-sm text-slate-600 mb-6">
          Upload your resume in PDF or Text format to extract structured profile facts.
        </p>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {jobId && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md">
            Job queued: {jobId}. Redirecting to review...
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!file || isUploading}
            className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium rounded-md transition"
          >
            {isUploading ? "Uploading & Extracting..." : "Start Extraction"}
          </button>
        </form>
      </div>
    </div>
  );
}

