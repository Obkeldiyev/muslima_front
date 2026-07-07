import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="eyebrow mb-4">Error 404</div>
        <h1 className="font-serif text-5xl text-ink">Not on the shelf.</h1>
        <p className="mt-4 text-ink-soft">
          The page you were looking for is no longer in this issue.
        </p>
        <a href="/" className="mt-8 inline-block eyebrow border-b border-ink pb-1 hover:text-accent">
          Return to the reading room
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="eyebrow mb-4">Something interrupted the print</div>
        <h1 className="font-serif text-3xl text-ink">This page didn't load.</h1>
        <p className="mt-3 text-sm text-ink-soft">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 eyebrow border-b border-ink pb-1 hover:text-accent"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Muslima — A Reading Room for Essays & Books" },
      { name: "description", content: "A quiet literary publication of essays, topics, and books. Read slowly." },
      { property: "og:title", content: "Muslima — A Reading Room" },
      { property: "og:description", content: "A quiet literary publication of essays, topics, and books." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="bottom-right" theme="light" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
