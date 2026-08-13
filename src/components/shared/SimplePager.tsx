import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SimplePager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={t("simplePager.ariaLabel")} className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label={t("simplePager.previousPage")}
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-3 text-[13px] font-semibold text-[var(--color-text-secondary)]">
        {t("simplePager.pageOf", { page, totalPages })}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label={t("simplePager.nextPage")}
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
