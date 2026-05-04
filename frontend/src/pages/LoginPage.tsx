import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Cpu } from "lucide-react";

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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 shadow-lg">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-zinc-900">IAnoIE</h1>
          <p className="text-sm text-zinc-500">GPU AI App Platform</p>
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
              placeholder="admin@ianoie.local"
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

        {/* Powered by */}
        <div className="mt-6 flex justify-center">
          <a
            href="https://aimization.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <img src="/logo-aimization.png" alt="Aimization" className="h-4 w-4 rounded" />
            Powered by Aimization
          </a>
        </div>
      </div>
    </div>
  );
}
