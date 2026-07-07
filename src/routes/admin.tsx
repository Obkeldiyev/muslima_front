import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const nav: { to: "/admin" | "/admin/essays" | "/admin/topics" | "/admin/books" | "/admin/pages" | "/admin/media"; label: string; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/essays", label: "Essays" },
  { to: "/admin/topics", label: "Topics" },
  { to: "/admin/books", label: "Books" },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/media", label: "Media" },
];

function AdminLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!isAuthenticated && !onLogin) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, onLogin, navigate]);

  if (onLogin) return <Outlet />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background text-ink flex">
      <aside className="w-64 shrink-0 rule-b md:min-h-screen md:border-b-0 md:border-r border-rule bg-secondary/30">
        <div className="p-6">
          <Link to="/" className="font-serif text-xl text-ink">Muslima</Link>
          <div className="eyebrow mt-1">The Studio</div>
        </div>
        <nav className="px-3 pb-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="block px-3 py-2 text-sm text-ink-soft hover:text-ink hover:bg-secondary rounded-sm"
              activeProps={{ className: "block px-3 py-2 text-sm text-ink bg-secondary rounded-sm" }}
              activeOptions={n.exact ? { exact: true } : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-6 rule-t text-xs text-ink-soft">
          <div className="truncate">{user?.email}</div>
          <button onClick={() => { logout(); navigate({ to: "/admin/login" }); }} className="mt-2 eyebrow hover:text-accent">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
