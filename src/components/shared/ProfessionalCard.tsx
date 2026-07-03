import type { Professional } from "@/types";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { PractitionerAvatar } from "./PractitionerAvatar";

export function ProfessionalCard({ pro }: { pro: Professional }) {
  return (
    <article className="bg-[var(--color-surface)] rounded-[12px] border border-[var(--brand-border-light)] shadow-iwosan-sm overflow-hidden card-hover">
      <div className="h-[120px] overflow-hidden">
        <img src={pro.cover} alt="" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="px-4 pb-4 text-center">
        <div className="-mt-12 flex justify-center">
          <PractitionerAvatar src={pro.avatar} name={pro.name} isVerified={pro.verified} size="md" />
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <h3 className="w-full text-center text-[16px] font-bold leading-tight text-[var(--color-text-primary)]">{pro.name}</h3>
        </div>
        <p className="text-[13px] font-medium text-[var(--color-text-muted)] mt-1 line-clamp-1">
          {pro.specialty}
        </p>
        <div className="flex items-center gap-1 text-[12px] text-[var(--color-text-muted)] mt-2">
          <MapPin size={12} />
          <span>
            {pro.location}, {pro.country}
          </span>
        </div>
        <div className="mt-3">
          <RatingStars rating={pro.rating} reviewCount={pro.reviewCount} />
        </div>
        <Link
          to="/annuaire/$id"
          params={{ id: pro.id }}
          className="mt-4 w-full h-9 rounded-md bg-[var(--brand-primary)] text-white text-[13px] font-semibold hover:bg-[var(--brand-primary-dark)] transition inline-flex items-center justify-center"
        >
          Voir le profil
        </Link>
      </div>
    </article>
  );
}
