import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./tests/setup.ts"],
    // Critical-path tests hit the real (shared dev) database sequentially —
    // running them in parallel worker processes would multiply contention
    // on Supabase's small pooled connection_limit for no benefit here.
    fileParallelism: false,
    // The shared dev Supabase pooler has shown request latency up to ~20s
    // under load during this project's development; give tests real headroom
    // above that instead of chasing a flaky threshold.
    testTimeout: 45000,
    hookTimeout: 45000,
  },
});
