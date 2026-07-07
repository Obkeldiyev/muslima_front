import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth";
import { SiteSettingsProvider } from "../lib/site-settings";
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
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <AuthProvider>
          <Outlet />
          <Toaster position="bottom-right" theme="light" />
        </AuthProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
}
