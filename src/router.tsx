import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { getCspNonce } from "./lib/api/cspNonce.functions";
import { routeTree } from "./routeTree.gen";

export const getRouter = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // Stamping the per-request CSP nonce here makes TanStack Start's own
  // injected inline scripts (hydration stream barrier, scroll restoration)
  // carry a valid nonce instead of being blocked by CSP. SSR-gated: on the
  // client there's no request to read a header from, and calling the
  // serverFn there would trigger a pointless RPC round-trip.
  if (import.meta.env.SSR) {
    try {
      const nonce = await getCspNonce();
      if (nonce) router.options.ssr = { ...router.options.ssr, nonce };
    } catch {
      // No request context available (e.g. route-tree generation at build time) — skip.
    }
  }

  return router;
};
