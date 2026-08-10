import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function HeroSection({
  image,
  badge,
  title,
  subtitle,
  breadcrumb,
  size = "lg",
  children,
}: {
  image: string;
  badge?: string;
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
  size?: "lg" | "md";
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative w-full flex items-center",
        size === "lg" ? "min-h-[88vh]" : "min-h-[44vh] md:min-h-[55vh]",
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <img src={image} alt="" className="hero-image-drift h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(15,61,26,0.92) 0%, rgba(26,92,42,0.75) 100%)",
          }}
        />
      </div>
      <div className="relative container-iwosan py-20 md:py-28 text-white">
        {breadcrumb && (
          <nav className="hero-fade-up mb-6 flex items-center gap-1.5 text-[13px] text-white/80">
            {breadcrumb.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={14} />}
                {b.to ? (
                  <Link to={b.to}>{b.label}</Link>
                ) : (
                  <span className="text-white">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className={cn(size === "lg" && "max-w-3xl mx-auto text-center")}>
          {badge && (
            <span
              className="hero-fade-up inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1.5 text-[12px] font-semibold tracking-wide text-white mb-6 backdrop-blur-sm"
              style={{ animationDelay: "80ms" }}
            >
              {badge}
            </span>
          )}
          <h1
            className={cn(
              "hero-fade-up text-white",
              size === "lg" ? "text-[36px] md:text-[56px]" : "text-[32px] md:text-[44px]",
            )}
            style={{ animationDelay: "150ms" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="hero-fade-up mt-5 text-[16px] md:text-[18px] leading-[1.7] text-white/80" style={{ animationDelay: "260ms" }}>
              {subtitle}
            </p>
          )}
          {children && (
            <div className="hero-fade-up mt-8" style={{ animationDelay: "360ms" }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
