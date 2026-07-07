import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/admin" });
  }, [isAuthenticated, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back.");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <div className="eyebrow mb-4 text-center">The Studio</div>
        <h1 className="font-serif text-4xl text-ink text-center">Sign in</h1>
        <p className="mt-2 text-sm text-ink-soft text-center">Enter the editorial office.</p>
        <div className="mt-10 space-y-5">
          <label className="block">
            <span className="eyebrow">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full bg-transparent border-b border-ink/40 py-2 focus:border-ink focus:outline-none text-ink"
            />
          </label>
          <label className="block">
            <span className="eyebrow">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full bg-transparent border-b border-ink/40 py-2 focus:border-ink focus:outline-none text-ink"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-ink text-paper py-3 text-sm tracking-[0.14em] uppercase hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
