import type { Plant } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlantCard({ plant, dark = false }: { plant: Plant; dark?: boolean }) {
  return (
    <article
      className={cn(
        "rounded-[12px] overflow-hidden border card-hover flex flex-col",
        dark
          ? "bg-[var(--color-surface)] border-[var(--brand-border)] text-[var(--color-text-primary)]"
          : "bg-[var(--color-surface)] border-[var(--brand-border-light)] shadow-iwosan-sm",
      )}
    >
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={plant.image}
          alt={plant.scientificName}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--brand-primary-dark)]/60 to-transparent" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3
          className={cn(
            "italic font-semibold text-[15px]",
            dark ? "text-[var(--brand-gold-light)]" : "text-[var(--brand-primary)]",
          )}
        >
          {plant.scientificName}
        </h3>
        <p
          className={cn(
            "text-[13px] mt-0.5",
            dark ? "text-white/60" : "text-[var(--color-text-muted)]",
          )}
        >
          {plant.vernacularNames.join(" · ")}
        </p>
        <p
          className={cn(
            "text-[13px] mt-2 line-clamp-2 leading-[1.6]",
            dark ? "text-white/80" : "text-[var(--color-text-secondary)]",
          )}
        >
          {plant.summary}
        </p>
        <Link
          to="/pharmacopee/$slug"
          params={{ slug: plant.slug }}
          className={cn(
            "mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold",
            dark ? "text-[var(--brand-gold)]" : "text-[var(--brand-primary)]",
          )}
        >
          Lire la monographie <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
