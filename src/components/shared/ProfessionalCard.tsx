import type { Professional } from "@/types";
import { MapPin, BadgeCheck } from "lucide-react";
import { RatingStars } from "./RatingStars";

export function ProfessionalCard({ pro }: { pro: Professional }) {
  return (
    <article className="bg-white rounded-[12px] border border-[var(--brand-border-light)] shadow-iwosan-sm overflow-hidden card-hover">
      <div className="h-[120px] overflow-hidden">
        <img src={pro.cover} alt="" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="px-4 pb-4">
        <img src={pro.avatar} alt={pro.name} loading="lazy" className="w-[72px] h-[72px] rounded-full object-cover border-[3px] border-white -mt-9 shadow-iwosan-sm" />
        <div className="mt-3 flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-bold leading-tight">{pro.name}</h3>
          {pro.verified && <BadgeCheck className="text-[var(--brand-gold)] shrink-0" size={18} />}
        </div>
        <p className="text-[13px] font-medium text-[var(--color-text-muted)] mt-1 line-clamp-1">{pro.specialty}</p>
        <div className="flex items-center gap-1 text-[12px] text-[var(--color-text-muted)] mt-2">
          <MapPin size={12} />
          <span>{pro.location}, {pro.country}</span>
        </div>
        <div className="mt-3">
          <RatingStars rating={pro.rating} reviewCount={pro.reviewCount} />
        </div>
        <button className="mt-4 w-full h-9 rounded-md bg-[var(--brand-primary)] text-white text-[13px] font-semibold hover:bg-[var(--brand-primary-dark)] transition">
          Voir le profil
        </button>
      </div>
    </article>
  );
}
