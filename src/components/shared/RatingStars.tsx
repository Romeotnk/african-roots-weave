import { Star } from "lucide-react";

interface Props {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

const sizes = { sm: 12, md: 16, lg: 20 };

export function RatingStars({ rating, reviewCount, size = "sm", showCount = true }: Props) {
  const px = sizes[size];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={px}
            className={i <= Math.round(rating) ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]" : "text-[var(--brand-border)]"}
          />
        ))}
      </div>
      <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{rating.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className="text-[13px] text-[var(--color-text-muted)]">({reviewCount})</span>
      )}
    </div>
  );
}
