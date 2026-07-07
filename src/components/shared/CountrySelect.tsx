import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { COUNTRIES_WITH_SUGGESTION, getCountryName } from "@/constants/countries";
import { cn } from "@/lib/utils";

type CountrySelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
};

const selectableCountries = COUNTRIES_WITH_SUGGESTION.filter((country) => country.code !== "SEPARATOR");

export function CountrySelect({ value, onChange, className, required }: CountrySelectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedName = value ? getCountryName(value) : "";
  const inputValue = open ? query : selectedName;

  const countries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return selectableCountries;
    return selectableCountries.filter((country) =>
      `${country.name} ${country.code}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const selectCountry = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" value={value} required={required} readOnly />
      <input
        type="text"
        value={inputValue}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        placeholder="Pays"
        className={cn("pr-10", className)}
        role="combobox"
        aria-expanded={open}
        aria-controls="country-options"
        aria-autocomplete="list"
      />
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setQuery("");
        }}
        className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--brand-surface-alt)]"
        aria-label="Choisir un pays"
      >
        <ChevronDown size={17} />
      </button>

      {open && (
        <div
          id="country-options"
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-[8px] border border-[var(--brand-border-light)] bg-white p-1 shadow-iwosan-lg"
          role="listbox"
        >
          {countries.length === 0 ? (
            <div className="px-3 py-2 text-[13px] text-[var(--color-text-muted)]">Aucun pays trouve</div>
          ) : (
            countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => selectCountry(country.code)}
                className="flex min-h-9 w-full items-center justify-between gap-3 rounded-md px-3 text-left text-[14px] hover:bg-[var(--brand-primary-subtle)]"
                role="option"
                aria-selected={country.code === value}
              >
                <span>
                  {country.flag} {country.name}
                </span>
                {country.code === value && <Check size={16} className="text-[var(--brand-primary)]" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
