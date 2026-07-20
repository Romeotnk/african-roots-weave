import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Facebook, MessageCircle } from "lucide-react";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { articles } from "@/data/articles";

export function ArticleDetailPage({ slug, fallbackSpace }: { slug: string; fallbackSpace?: string }) {
  const article = articles.find((item) => item.slug === slug) ?? articles.find((item) => item.space === fallbackSpace) ?? articles[0];
  const related = articles.filter((item) => item.id !== article.id && item.space === article.space).slice(0, 3);
  const breadcrumbSpace = article.space === "Sante au quotidien" ? "Sante" : article.space;
  const [shareNotice, setShareNotice] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentNotice, setCommentNotice] = useState("");
  const shareArticle = (label: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(article.title);
    if (label === "Copier") {
      navigator.clipboard?.writeText(url).catch(() => undefined);
      setShareNotice("Lien de l article copie.");
      return;
    }
    const target = label === "WhatsApp" ? `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` : `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(target, "_blank", "noopener,noreferrer");
    setShareNotice(`Ouverture du partage ${label}.`);
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="relative min-h-[440px] bg-[var(--brand-primary-dark)] text-white">
        <img src={article.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative container-iwosan py-12 md:py-20">
          <nav className="flex flex-wrap gap-2 text-[13px] text-white/75">
            <Link to="/">Accueil</Link>
            <span>&gt;</span>
            <span>{breadcrumbSpace}</span>
            <span>&gt;</span>
            <span>{article.category}</span>
          </nav>
          <h1 className="mt-6 max-w-4xl text-[34px] leading-tight text-white md:text-[54px]">{article.title}</h1>
          <p className="mt-4 max-w-2xl text-white/80">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px] text-white/75">
            <img src={article.authorAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-semibold text-white">{article.authorName}</span>
            <span>{article.authorSpecialty}</span>
            <span>{article.readTime} min</span>
            <span>{new Intl.DateTimeFormat("fr-FR").format(new Date(article.date))}</span>
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <article className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6 md:p-8">
          <div
            className="prose max-w-none text-[var(--color-text-secondary)]"
            dangerouslySetInnerHTML={{ __html: article.body ?? article.excerpt }}
          />

          <div className="mt-8 rounded-[12px] bg-[var(--brand-surface-alt)] p-5">
            <h2 className="text-[18px] font-bold">Auteur</h2>
            <div className="mt-4 flex gap-4">
              <img src={article.authorAvatar} alt="" className="h-16 w-16 rounded-full object-cover" />
              <div>
                <p className="font-bold">{article.authorName}</p>
                <p className="text-[13px] text-[var(--color-text-muted)]">{article.authorSpecialty}</p>
                {article.authorProfileId && (
                  <Link to="/annuaire/$id" params={{ id: article.authorProfileId }} className="mt-2 inline-flex text-[13px] font-semibold text-[var(--brand-primary)]">
                    Voir le profil
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-[18px] font-bold">Commentaires</h2>
            <div className="mt-4 space-y-3">
              {(article.comments ?? []).map((comment) => (
                <div key={comment.id} className="rounded-lg bg-[var(--brand-surface-alt)] p-4 text-[13px]">
                  <p className="font-semibold">{comment.authorName}</p>
                  <p className="mt-1 text-[var(--color-text-secondary)]">{comment.content}</p>
                </div>
              ))}
              <div className="rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Répondre sans compte</p>
                <div className="mt-3 grid gap-3">
                  <input value={commentName} onChange={(event) => setCommentName(event.target.value)} placeholder="Votre nom (optionnel)" className="h-11 rounded-full border border-[var(--brand-border)] px-4 text-[13px]" />
                  <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} rows={4} placeholder="Votre commentaire" className="w-full rounded-2xl border border-[var(--brand-border)] px-4 py-3" />
                  <button type="button" onClick={() => { setCommentNotice(commentName ? `Commentaire de ${commentName} préparé.` : "Commentaire préparé."); setCommentBody(""); }} className="h-11 rounded-full bg-[var(--brand-primary)] px-4 font-semibold text-white">Publier</button>
                  {commentNotice && <p className="text-[13px] text-[var(--brand-primary)]">{commentNotice}</p>}
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside className="h-fit space-y-5">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="mb-3 text-[15px] font-bold">Partager</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: MessageCircle, label: "WhatsApp" },
                { icon: Facebook, label: "Facebook" },
                { icon: Copy, label: "Copier" },
              ].map(({ icon: Icon, label }) => (
                <button key={label} type="button" onClick={() => shareArticle(label)} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-3 text-[12px] font-semibold">
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
            {shareNotice && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[12px] text-emerald-800">{shareNotice}</p>}
          </div>
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="mb-4 text-[15px] font-bold">Articles connexes</h2>
            <div className="space-y-4">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
