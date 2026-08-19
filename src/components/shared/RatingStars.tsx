import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const sizes = { sm: 12, md: 16, lg: 20 };

export function RatingStars({ rating, reviewCount, size = "sm", showCount = true, interactive = false, onChange }: Props) {
  const px = sizes[size];
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = interactive && hoverValue > 0 ? hoverValue : rating;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center" onMouseLeave={interactive ? () => setHoverValue(0) : undefined}>
        {[1, 2, 3, 4, 5].map((value) =>
          interactive ? (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHoverValue(value)}
              onClick={() => onChange?.(value)}
              aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <Star
                size={px}
                className={value <= Math.round(displayValue) ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]" : "text-[var(--brand-border)]"}
              />
            </button>
          ) : (
            <Star
              key={value}
              size={px}
              className={value <= Math.round(displayValue) ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]" : "text-[var(--brand-border)]"}
            />
          ),
        )}
      </div>
      {!interactive && <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{rating.toFixed(1)}</span>}
      {!interactive && showCount && reviewCount !== undefined && (
        <span className="text-[13px] text-[var(--color-text-muted)]">({reviewCount})</span>
      )}
    </div>
  );
}
