"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, ArrowLeft, ShieldCheck, Sparkles, ArrowRight, Loader2 } from "lucide-react";
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
    <main className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center items-center p-6 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
              <Bot className="w-5 h-5" />
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              <Sparkles className="w-3 h-3" />
              HTTP-Only Cookies &bull; DEV_AUTH
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Developer Login</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
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
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Tenant RLS Bound</span>
          </div>
        </div>
      </div>
    </main>
  );
}
