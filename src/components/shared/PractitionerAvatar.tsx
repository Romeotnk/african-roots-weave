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

export function PractitionerAvatar({
  src,
  name,
  isVerified = false,
  size = "md",
  clickable = false,
  gallery,
}: PractitionerAvatarProps) {
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
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [images.length, lightboxIndex]);

  const avatar = (
    <span
      className={cn(
        "group relative inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-gold)] p-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
        clickable && "cursor-zoom-in",
      )}
    >
      <img
        src={src}
        alt={name}
        loading="lazy"
        className={cn(
          sizes[size],
          "rounded-full border-[3px] border-[var(--color-surface)] object-cover bg-[var(--color-surface)] transition duration-200 group-hover:scale-[1.05]",
        )}
      />
      {isVerified && (
        <span className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-md">
          <CheckCircle2 size={16} />
        </span>
      )}
    </span>
  );

  return (
    <>
      {clickable ? (
        <button type="button" onClick={() => setLightboxIndex(startIndex)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2">
          {avatar}
        </button>
      ) : (
        avatar
      )}

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Fermer l'image"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X size={22} />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-[24px] font-bold text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Image precedente"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-[24px] font-bold text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Image suivante"
              >
                ›
              </button>
            </>
          )}
          <img
            src={images[lightboxIndex]}
            alt={name}
            className="max-h-[82vh] w-full max-w-[500px] rounded-[12px] object-contain shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </>
  );
}
