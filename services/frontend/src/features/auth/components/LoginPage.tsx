"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useLogin } from "../hooks/useAuth";

export function LoginPage() {
  const [email, setEmail] = useState("recruiter-demo-user");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const loginMutation = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Set dev_user cookie and local state for authenticated session
    if (typeof document !== "undefined") {
      document.cookie = `dev_user=${encodeURIComponent(
        email
      )}; path=/; max-age=604800; SameSite=Lax`;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("dev_user", email);
    }

    loginMutation.mutate(
      { email, password },
      {
        onSettled: () => {
          router.push("/dashboard");
        },
      }
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#07090E] p-6 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-2">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-600/20 text-indigo-400">
              <Bot className="h-5 w-5" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[11px] text-indigo-400">
              <Sparkles className="h-3 w-3" />
              HTTP-Only Cookies &bull; DEV_AUTH
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Developer Login
            </h1>
            <p className="text-xs leading-relaxed text-slate-400">
              Authenticate tenant context for isolated database sessions.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Email / Tenant Identifier
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:bg-slate-800"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 border-t border-slate-800/80 pt-2 font-mono text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Strict Tenant RLS Bound</span>
          </div>
        </div>
      </div>
    </main>
  );
}
