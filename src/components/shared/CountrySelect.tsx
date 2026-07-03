import { useMemo, useState } from "react";
import { COUNTRIES_WITH_SUGGESTION } from "@/constants/countries";

type CountrySelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
};

export function CountrySelect({ value, onChange, className, required }: CountrySelectProps) {
  const [query, setQuery] = useState("");

  const countries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return COUNTRIES_WITH_SUGGESTION;
    return COUNTRIES_WITH_SUGGESTION.filter((country) => {
      if (country.code === "SEPARATOR") return false;
      return (
        country.name.toLowerCase().includes(normalizedQuery) ||
        country.code.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  return (
    <div className="space-y-2">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher un pays..."
        className={className}
        aria-label="Rechercher un pays"
      />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={className}
        aria-label="Pays"
      >
        <option value="">Choisir un pays</option>
        {countries.map((country, index) =>
          country.code === "SEPARATOR" ? (
            <option key={`${country.code}-${index}`} disabled>
              {country.name}
            </option>
          ) : (
            <option key={`${country.code}-${index}`} value={country.code}>
              {country.flag} {country.name}
            </option>
          ),
        )}
      </select>
    </div>
  );
}
