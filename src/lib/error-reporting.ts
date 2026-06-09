type ErrorReportContext = Record<string, unknown>;

export type ErrorReporter = (error: unknown, context?: ErrorReportContext) => void;

let reporter: ErrorReporter | undefined;

export function configureErrorReporter(nextReporter: ErrorReporter | undefined) {
  reporter = nextReporter;
}

export function reportClientError(error: unknown, context: ErrorReportContext = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    route: window.location.pathname,
    ...context,
  };

  if (reporter) {
    reporter(error, payload);
    return;
  }

  console.error("Client error", error, payload);
}
