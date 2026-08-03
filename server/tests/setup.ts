import "dotenv/config";

// These integration tests exercise the real Express app against the shared
// dev database (there's no separate test DB / Docker in this environment —
// see tests/README.md). Force test-safe behavior regardless of what's in
// the local .env, so a stray production-like value never makes the suite
// flaky or rate-limited.
process.env.NODE_ENV = "test";
process.env.DISABLE_RATE_LIMIT = "true";
