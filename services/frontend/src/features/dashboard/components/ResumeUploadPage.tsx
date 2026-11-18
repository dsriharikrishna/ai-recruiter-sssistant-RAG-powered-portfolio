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
          setUploadProgress("Validating ground-truth quotes against source text...");
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
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-6 md:p-10 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              Grounded Ingestion Pipeline
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Upload Candidate Resume</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your CV in PDF or TXT format. Our parser extracts roles, skills, metrics, and quotes for your approval.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {uploadProgress && (
            <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>{uploadProgress}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <label
              htmlFor="resume-file"
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                file
                  ? "border-indigo-500/60 bg-indigo-950/20 text-white"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400"
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

              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-slate-200">
                  {file ? file.name : "Click to browse or drag and drop your resume"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Supported formats: PDF, TXT (Max 10MB)
                </p>
              </div>

              {file && (
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  File Selected: {(file.size / 1024).toFixed(1)} KB
                </div>
              )}
            </label>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={!file || uploadMutation.isPending}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting Grounded Claims...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Extract & Verify Profile
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Strict Evidence Matching</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
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
