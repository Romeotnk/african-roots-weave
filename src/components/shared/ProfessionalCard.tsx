import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import type { Professional } from "@/types";
import { RatingStars } from "./RatingStars";
import { PractitionerAvatar } from "./PractitionerAvatar";

export function ProfessionalCard({ pro }: { pro: Professional }) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm transition hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-iwosan-lg">
      <div className="relative h-[120px] overflow-hidden">
        <img src={pro.cover} alt="" className="h-full w-full object-cover" />
        {pro.verified && <span className="absolute right-3 top-3 rounded-full bg-[var(--brand-gold)] px-3 py-1 text-[11px] font-bold text-white">Vérifié</span>}
      </div>
      <div className="px-4 pb-5 text-center">
        <div className="-mt-14 flex justify-center">
          <PractitionerAvatar src={pro.avatar} name={pro.name} isVerified={pro.verified} size="md" />
        </div>
        <h3 className="mt-4 text-[20px] font-bold">{pro.name}</h3>
        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{pro.specialty}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-[12px] text-[var(--color-text-muted)]"><MapPin size={12} />{pro.location}, {pro.country}</p>
        <div className="mt-3"><RatingStars rating={pro.rating} reviewCount={pro.reviewCount} /></div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {pro.specialties.slice(0, 3).map((item) => <span key={item} className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--brand-primary)]">{item}</span>)}
        </div>
        <div className="mt-5 space-y-2"><Link to="/pro/$id" params={{ id: pro.id }} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand-primary)] font-semibold text-white">Voir le profil officiel</Link><p className="text-[11px] text-[var(--color-text-muted)]">Fiche publique complète, réservations et contact direct.</p></div>
      </div>
    </article>
  );
}




