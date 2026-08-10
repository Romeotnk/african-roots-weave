import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

// server/src/app.ts generates a fresh CSP nonce per request and forwards it
// as the x-csp-nonce request header (see that file for the full chain).
// Reading it via a dedicated createServerFn — rather than a plain dynamic
// import inside router.tsx/__root.tsx — keeps it out of the client bundle
// without perturbing the SSR build's manual chunk graph (a raw dynamic
// import of "@tanstack/react-start/server" there broke cross-chunk
// resolution of TanStack Start's own createRequestHandler at runtime).
export const getCspNonce = createServerFn({ method: "GET" }).handler(async () => {
  return getRequestHeader("x-csp-nonce") ?? null;
});
