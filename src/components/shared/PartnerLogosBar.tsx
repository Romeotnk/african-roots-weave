import { usePartnerLogos } from "@/hooks/useSiteConfig";

export function PartnerLogosBar() {
  const { data } = usePartnerLogos();
  const logos = data?.data ?? [];

  if (logos.length === 0) return null;

  return (
    <section className="border-t border-[var(--brand-border-light)] bg-white py-12">
      <div className="container-iwosan">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          Ils nous font confiance
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((logo) => {
            const image = (
              <img
                src={logo.imageUrl}
                alt={logo.title ?? ""}
                loading="lazy"
                decoding="async"
                className="h-10 max-w-[140px] object-contain grayscale opacity-70 transition hover:grayscale-0 hover:opacity-100"
              />
            );
            return logo.link ? (
              <a key={logo.id} href={logo.link} target="_blank" rel="noreferrer">
                {image}
              </a>
            ) : (
              <span key={logo.id}>{image}</span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
