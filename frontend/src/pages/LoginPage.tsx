import { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PartnerLogo } from "@/components/layout/PartnerLogo";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ email, password });
      window.location.href = "/";
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <a href="https://aimization.com/" target="_blank" rel="noopener noreferrer">
            <img src="/logo-aimization.png" alt="IAnoIE" className="h-[200px] w-auto object-contain" />
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-zinc-700">Email</label>
            <input
              type="email"
              placeholder="admin@aimization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              required
            />
          </div>
          <Button type="submit" disabled={login.isPending} className="w-full">
            {login.isPending ? <><Spinner size="sm" /> Signing in...</> : "Sign in"}
          </Button>
        </form>

        {/* Partner / Supporter */}
        <PartnerLogo className="mt-6" />

        {/* Powered by + Terms of Use */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
          <a
            href="https://aimization.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-600 transition-colors"
          >
            Powered by Aimization
          </a>
          <span className="text-zinc-300">·</span>
          <Link to="/terms" className="hover:text-zinc-600 transition-colors">
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
}
