import { useState } from "react";
import { GalleryLightbox } from "@/components/shared/GalleryLightbox";

type ProfileGalleryProps = {
  images: string[];
  alt: string;
};

export function ProfileGallery({ images, alt }: ProfileGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length < 2) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="aspect-square overflow-hidden rounded-[10px] border border-[var(--brand-border-light)] transition hover:opacity-90"
          >
            <img src={image} alt={`${alt} ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      <GalleryLightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} alt={alt} />
    </>
  );
}
