import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryLightbox } from "@/components/shared/GalleryLightbox";

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

  const avatar = (
    <span className={cn("relative inline-grid shrink-0 place-items-center rounded-full bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.16)]", clickable && "cursor-zoom-in")}>
      <img src={src} alt={name} className={cn(sizes[size], "rounded-full border-[4px] border-white object-cover")} />
      {isVerified && <span className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-[var(--brand-gold)] text-white shadow-md"><CheckCircle2 size={16} /></span>}
    </span>
  );

  return (
    <>
      {clickable ? <button type="button" onClick={() => setLightboxIndex(startIndex)}>{avatar}</button> : avatar}
      <GalleryLightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} alt={name} />
    </>
  );
}
