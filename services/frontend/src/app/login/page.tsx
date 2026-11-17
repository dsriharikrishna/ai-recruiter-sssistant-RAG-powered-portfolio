"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("recruiter-demo-user");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("dev_user", username);
    }
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Developer Login</h1>
        <p className="text-sm text-slate-600 mb-6">
          Local development authentication via <code>DEV_AUTH</code>
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dev User / Email Identifier
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-md transition"
          >
            Enter Dashboard
          </button>
        </form>
      </div>
    </main>
  );
}

