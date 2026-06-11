import type { Article } from "@/types";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "./Badge";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="bg-[var(--color-surface)] rounded-[12px] border border-[var(--brand-border-light)] shadow-iwosan-sm overflow-hidden card-hover flex flex-col">
      <div className="h-[200px] overflow-hidden">
        <img
          src={article.cover}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <Badge>{article.space}</Badge>
          <span className="inline-flex items-center gap-1 text-[12px] text-[var(--color-text-muted)]">
            <Clock size={12} /> {article.readTime} min
          </span>
        </div>
        <h3 className="text-[18px] font-bold leading-snug line-clamp-2 mb-2 text-[var(--color-text-primary)]">{article.title}</h3>
        <p className="text-[14px] text-[var(--color-text-secondary)] leading-[1.6] line-clamp-3 mb-4">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-3 border-t border-[var(--brand-border-light)]">
          <img
            src={article.authorAvatar}
            alt={article.authorName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold leading-tight truncate">{article.authorName}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] truncate">
              {article.authorSpecialty}
            </p>
          </div>
          <a className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--brand-primary)]">
            Lire <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}
