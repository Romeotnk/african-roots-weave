import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type GalleryLightboxProps = {
  images: string[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  alt: string;
};

export function GalleryLightbox({ images, index, onClose, onNavigate, alt }: GalleryLightboxProps) {
  useEffect(() => {
    if (index === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") onNavigate((index + 1) % images.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [images.length, index, onClose, onNavigate]);

  if (index === null) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer l'image"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X size={22} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onNavigate((index - 1 + images.length) % images.length)}
            aria-label="Photo précédente"
            className="absolute left-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate((index + 1) % images.length)}
            aria-label="Photo suivante"
            className="absolute right-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="flex max-h-[85vh] flex-col items-center gap-4">
        <img src={images[index]} alt={alt} className="max-h-[68vh] w-full max-w-[600px] rounded-[12px] object-contain shadow-2xl" />
        {images.length > 1 && (
          <>
            <p className="text-[13px] font-semibold text-white/80">
              {index + 1} / {images.length}
            </p>
            <div className="flex max-w-full gap-2 overflow-x-auto px-2">
              {images.map((image, imageIndex) => (
                <button
                  key={`${image}-${imageIndex}`}
                  type="button"
                  onClick={() => onNavigate(imageIndex)}
                  aria-label={`Voir la photo ${imageIndex + 1}`}
                  className={cn(
                    "h-14 w-14 shrink-0 overflow-hidden rounded-[8px] border-2 transition",
                    imageIndex === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
