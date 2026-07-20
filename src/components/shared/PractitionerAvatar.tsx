import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PractitionerAvatarProps {
  src: string;
  name: string;
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
  gallery?: string[];
}

const sizes = {
  sm: "h-16 w-16",
  md: "h-24 w-24 md:h-28 md:w-28",
  lg: "h-[150px] w-[150px] md:h-[180px] md:w-[180px]",
};

export function PractitionerAvatar({ src, name, isVerified = false, size = "md", clickable = false, gallery }: PractitionerAvatarProps) {
  const images = gallery?.length ? gallery : [src];
  const startIndex = Math.max(0, images.indexOf(src));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft") setLightboxIndex((value) => (value === null ? value : (value - 1 + images.length) % images.length));
      if (event.key === "ArrowRight") setLightboxIndex((value) => (value === null ? value : (value + 1) % images.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKeyDown); };
  }, [images.length, lightboxIndex]);

  const avatar = (
    <span className={cn("relative inline-grid shrink-0 place-items-center rounded-full bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.16)]", clickable && "cursor-zoom-in")}>
      <img src={src} alt={name} className={cn(sizes[size], "rounded-full border-[4px] border-white object-cover")} />
      {isVerified && <span className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-[var(--brand-gold)] text-white shadow-md"><CheckCircle2 size={16} /></span>}
    </span>
  );

  return (
    <>
      {clickable ? <button type="button" onClick={() => setLightboxIndex(startIndex)}>{avatar}</button> : avatar}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4" role="dialog" aria-modal="true">
          <button type="button" onClick={() => setLightboxIndex(null)} aria-label="Fermer l'image" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white"><X size={22} /></button>
          <img src={images[lightboxIndex]} alt={name} className="max-h-[82vh] w-full max-w-[500px] rounded-[12px] object-contain shadow-2xl" />
        </div>
      )}
    </>
  );
}
