import { ChevronLeft, ChevronRight } from "lucide-react";

export function SimplePager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Page précédente"
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-3 text-[13px] font-semibold text-[var(--color-text-secondary)]">
        Page {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Page suivante"
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
