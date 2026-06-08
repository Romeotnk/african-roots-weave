import { Search, SlidersHorizontal } from "lucide-react";

export function SearchBar({
  placeholder = "Rechercher...",
  showFilters = true,
  onChange,
  value,
}: {
  placeholder?: string;
  showFilters?: boolean;
  onChange?: (v: string) => void;
  value?: string;
}) {
  return (
    <div className="flex items-center w-full h-[52px] rounded-full bg-white border-[1.5px] border-[var(--brand-border)] focus-within:border-[var(--brand-primary)] focus-within:shadow-[0_0_0_3px_rgba(26,92,42,0.12)] transition-all">
      <div className="pl-5 pr-2 text-[var(--color-text-muted)]">
        <Search size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-full bg-transparent text-[15px] outline-none placeholder:text-[var(--color-text-muted)]"
      />
      {showFilters && (
        <>
          <div className="h-6 w-px bg-[var(--brand-border)]" />
          <button className="flex items-center gap-2 px-5 text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)]">
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filtres</span>
          </button>
        </>
      )}
    </div>
  );
}
