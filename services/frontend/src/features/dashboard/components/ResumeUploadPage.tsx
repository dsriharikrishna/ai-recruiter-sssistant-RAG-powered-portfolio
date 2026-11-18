"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Bot,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useUploadResume } from "../hooks/useDashboard";

export function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const uploadMutation = useUploadResume();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError(null);
    setUploadProgress("Uploading resume to ingestion pipeline...");

    uploadMutation.mutate(file, {
      onSuccess: () => {
        setUploadProgress("Extracting structured facts & evidence quotes...");
        setTimeout(() => {
          setUploadProgress(
            "Validating ground-truth quotes against source text..."
          );
        }, 600);
        setTimeout(() => {
          router.push("/dashboard/review");
        }, 1200);
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : "Upload failed");
        setUploadProgress(null);
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#07090E] p-6 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white md:p-10">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              Grounded Ingestion Pipeline
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Upload Candidate Resume
            </h1>
            <p className="text-xs leading-relaxed text-slate-400">
              Upload your CV in PDF or TXT format. Our parser extracts roles,
              skills, metrics, and quotes for your approval.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {uploadProgress && (
            <div className="space-y-2 rounded-xl border border-indigo-500/30 bg-indigo-950/60 p-4 text-xs text-indigo-200">
              <div className="flex items-center gap-2 font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <span>{uploadProgress}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-1.5 w-3/4 animate-pulse rounded-full bg-indigo-500" />
              </div>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <label
              htmlFor="resume-file"
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition ${
                file
                  ? "border-indigo-500/60 bg-indigo-950/20 text-white"
                  : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
              }`}
            >
              <input
                id="resume-file"
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                disabled={uploadMutation.isPending}
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-600/10 text-indigo-400">
                <UploadCloud className="h-6 w-6" />
              </div>

              <div className="space-y-1 text-center">
                <p className="text-xs font-semibold text-slate-200">
                  {file
                    ? file.name
                    : "Click to browse or drag and drop your resume"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Supported formats: PDF, TXT (Max 10MB)
                </p>
              </div>

              {file && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  File Selected: {(file.size / 1024).toFixed(1)} KB
                </div>
              )}
            </label>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={!file || uploadMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting Grounded Claims...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Extract & Verify Profile
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Strict Evidence Matching</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-emerald-400" />
                  <span>No Model Hallucinations</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
