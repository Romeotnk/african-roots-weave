import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BadgeCheck, Facebook, Instagram, Linkedin, MapPin, MessageCircle, Smartphone, Star } from "lucide-react";
import { useProducts, useProfessional } from "@/hooks/useApiCatalog";
import { useFormations } from "@/hooks/useEventsFormationsApi";
import { useCreateReview, useTargetReviews } from "@/hooks/useReviewsApi";
import { useAuth } from "@/lib/auth/AuthContext";
import { RatingStars } from "@/components/shared/RatingStars";
import { PractitionerAvatar } from "@/components/shared/PractitionerAvatar";
import { ProductCard } from "@/components/shared/ProductCard";
import { BookingWidget } from "@/components/shared/BookingWidget";
import { Skeleton } from "@/components/ui/skeleton";

type ProfessionalReview = {
  id: string;
  rating: number;
  comment: string | null;
  sellerReply: string | null;
  sellerReplyAt: string | null;
  createdAt: string;
  author: { firstName: string; lastName: string };
};

export const Route = createFileRoute("/pro/$id")({
  head: () => ({ meta: [{ title: "Vitrine professionnelle - IWOSAN" }] }),
  component: ProfessionalShowcase,
});

type FormationRecord = {
  id: string;
  title: string;
  type?: string;
  category?: string;
  coverImage?: string | null;
  downloadCount?: number;
};

function ProfessionalShowcase() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const professionalQuery = useProfessional(id);
  const productsQuery = useProducts(useMemo(() => new URLSearchParams({ sellerId: id }), [id]));
  const formationsQuery = useFormations(useMemo(() => ({ createdById: id }), [id]));
  const [tab, setTab] = useState<"about" | "location" | "products" | "training" | "reviews" | "booking">("about");
  const reviewsQuery = useTargetReviews(professionalQuery.data?.profileId ?? "", "PROFESSIONAL", tab === "reviews");
  const createReview = useCreateReview();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");

  // "Réserver ce produit" lands here with a prefilled message — the
  // conversation must open automatically, not require an extra click.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");
    if (message) {
      navigate({ to: "/messages", search: { to: id, text: message } as never, replace: true });
    }
  }, [id, navigate]);

  const pro = professionalQuery.data;
  const products = productsQuery.data?.products ?? [];
  const formations = (formationsQuery.data?.formations ?? []) as FormationRecord[];

  const stats = useMemo(
    () =>
      pro
        ? [
            [products.length, t("pro.about.statsProducts")],
            [formations.length, t("pro.about.statsFormations")],
            [pro.reviewCount, t("pro.about.statsReviews")],
          ]
        : [],
    [pro, products.length, formations.length, t],
  );

  const contactMessage = useMemo(() => (pro ? t("pro.contact.defaultMessage", { name: pro.name }) : ""), [pro, t]);

  const socialLinks = useMemo(() => {
    if (!pro?.socialLinks) return [];
    const links = pro.socialLinks;
    return [
      links.whatsapp && { label: "WhatsApp", href: `https://wa.me/${links.whatsapp.replace(/\D/g, "")}`, icon: Smartphone },
      links.facebook && { label: "Facebook", href: links.facebook, icon: Facebook },
      links.instagram && { label: "Instagram", href: links.instagram, icon: Instagram },
      links.linkedin && { label: "LinkedIn", href: links.linkedin, icon: Linkedin },
    ].filter(Boolean) as { label: string; href: string; icon: typeof Smartphone }[];
  }, [pro]);

  if (professionalQuery.isLoading) {
    return (
      <main className="bg-[var(--brand-bg)]">
        <section className="bg-[linear-gradient(135deg,#1f5a39_0%,#2d7a4f_100%)]">
          <div className="container-iwosan py-16 md:py-20">
            <div className="flex flex-col gap-5 md:flex-row md:items-end">
              <Skeleton className="h-24 w-24 rounded-full bg-white/15" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-64 bg-white/15" />
                <Skeleton className="h-4 w-48 bg-white/15" />
                <Skeleton className="h-4 w-40 bg-white/15" />
              </div>
            </div>
          </div>
        </section>
        <section className="container-iwosan py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-8">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-32 rounded-full" />
                ))}
              </div>
              <div className="space-y-4 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-64 rounded-[24px]" />
          </div>
        </section>
      </main>
    );
  }

  if (!pro) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[var(--brand-bg)] px-6 text-center">
        <div>
          <h1 className="text-[28px] font-bold">{t("pro.notFound.title")}</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            {t("pro.notFound.desc")}
          </p>
          <Link to="/annuaire" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white">
            {t("pro.backToDirectory")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[var(--brand-bg)]">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#1f5a39_0%,#2d7a4f_100%)] text-white">
        <div className="absolute inset-0">
          <img src={pro.cover} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,57,38,.35),rgba(20,57,38,.92))]" />
        </div>
        <div className="relative container-iwosan py-16 md:py-20">
          <div className="max-w-5xl">
            <Link
              to="/annuaire"
              className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/75 transition hover:text-white"
            >
              <ArrowLeft size={15} /> {t("pro.backToDirectory")}
            </Link>
            <span className="font-mono text-[12px] tracking-[0.22em] text-[var(--brand-gold)]">{t("pro.showcaseLabel")}</span>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 md:flex-row md:items-end">
                <PractitionerAvatar src={pro.avatar} name={pro.name} isVerified={pro.verified} size="lg" clickable gallery={pro.gallery ?? [pro.avatar, pro.cover]} />
                <div>
                  <h1 className="text-[38px] text-white md:text-[60px]">{pro.name}</h1>
                  <p className="mt-2 max-w-2xl text-white/80">{pro.specialty}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-white/75"><MapPin size={16} /> {pro.location}, {pro.country}</p>
                  {pro.verified && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white"><BadgeCheck size={14} className="text-[var(--brand-gold)]" /> {t("pro.verifiedBadge")}</div>
                  )}
                </div>
              </div>
              <div className="rounded-[20px] bg-white/10 p-4 backdrop-blur">
                <RatingStars rating={pro.rating} reviewCount={pro.reviewCount} size="md" />
                <p className="mt-2 text-[13px] text-white/80">{pro.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-iwosan py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <nav className="flex flex-wrap gap-2">
              {[
                ["about", t("pro.tabs.about")],
                ["location", t("pro.tabs.location")],
                ["products", t("pro.tabs.products", { count: products.length })],
                ["training", t("pro.tabs.training", { count: formations.length })],
                ["reviews", t("pro.tabs.reviews", { count: pro.reviewCount })],
                ...(pro.serviceBookingEnabled ? [["booking", t("pro.tabs.booking")]] : []),
              ].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key as typeof tab)} className={`rounded-full px-4 py-2 text-[13px] font-semibold ${tab === key ? "bg-[var(--brand-primary)] text-white" : "bg-white border border-[var(--brand-border)]"}`}>{label}</button>
              ))}
            </nav>

            {tab === "about" && (
              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">{t("pro.about.label")}</p>
                <p className="mt-4 text-[16px] leading-8 text-[var(--color-text-secondary)]">{pro.bio}</p>
                {pro.innovations && (
                  <div className="mt-6">
                    <p className="font-mono text-[12px] tracking-[0.14em] text-[var(--brand-primary)]">{t("pro.about.innovations")}</p>
                    <p className="mt-2 text-[14px] leading-7 text-[var(--color-text-secondary)]">{pro.innovations}</p>
                  </div>
                )}
                {pro.communityImpact && (
                  <div className="mt-6">
                    <p className="font-mono text-[12px] tracking-[0.14em] text-[var(--brand-primary)]">{t("pro.about.communityImpact")}</p>
                    <p className="mt-2 text-[14px] leading-7 text-[var(--color-text-secondary)]">{pro.communityImpact}</p>
                  </div>
                )}
                {pro.philosophy && (
                  <div className="mt-6">
                    <p className="font-mono text-[12px] tracking-[0.14em] text-[var(--brand-primary)]">{t("pro.about.philosophy")}</p>
                    <p className="mt-2 text-[14px] leading-7 text-[var(--color-text-secondary)]">{pro.philosophy}</p>
                  </div>
                )}
                {pro.socialLinks && Object.values(pro.socialLinks).some(Boolean) && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {pro.socialLinks.facebook && <a href={pro.socialLinks.facebook} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-[13px] font-semibold">Facebook</a>}
                    {pro.socialLinks.instagram && <a href={pro.socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-[13px] font-semibold">Instagram</a>}
                    {pro.socialLinks.whatsapp && <a href={pro.socialLinks.whatsapp} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--brand-border)] px-4 py-2 text-[13px] font-semibold">WhatsApp</a>}
                  </div>
                )}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {stats.map(([value, label]) => (
                    <div key={label as string} className="rounded-2xl bg-[var(--brand-surface-alt)] p-5 text-center">
                      <div className="text-[32px] font-bold text-[var(--brand-primary)]">{value}</div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "location" && (
              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">{t("pro.location.label")}</p>
                <p className="mt-4 text-[14px] text-[var(--color-text-secondary)]">{pro.location}, {pro.country}</p>
                {pro.latitude && pro.longitude ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--brand-border-light)]">
                    <iframe title={t("pro.location.label")} className="h-[280px] w-full" src={`https://maps.google.com/maps?q=${pro.latitude},${pro.longitude}&output=embed`} />
                  </div>
                ) : (
                  <p className="mt-4 rounded-2xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-4 text-[13px] text-[var(--color-text-muted)]">
                    {t("pro.location.noLocation")}
                  </p>
                )}
              </section>
            )}

            {tab === "products" && (
              <section className="space-y-5">
                <div className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                  <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">{t("pro.products.label")}</p>
                  {products.length > 0 ? (
                    <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {products.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                  ) : (
                    <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">{t("pro.products.empty")}</p>
                  )}
                </div>
              </section>
            )}

            {tab === "training" && (
              <section className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">{t("pro.training.label")}</p>
                {formations.length > 0 ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {formations.map((course) => (
                      <article key={course.id} className="overflow-hidden rounded-2xl border border-[var(--brand-border-light)]">
                        <div className="h-40 bg-[var(--brand-surface-alt)]">
                          {course.coverImage && <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />}
                        </div>
                        <div className="p-4">
                          {course.category && <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[11px] font-bold text-[var(--brand-primary)]">{course.category}</span>}
                          <h3 className="mt-3 text-[20px] font-bold">{course.title}</h3>
                          <a href={`/formations/${course.id}`} className="mt-4 inline-flex rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[13px] font-semibold text-white">{t("pro.training.access")}</a>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">{t("pro.training.empty")}</p>
                )}
              </section>
            )}

            {tab === "reviews" && (
              <section className="space-y-5">
                {user && user.id !== id && (
                  <div className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                    <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">{t("pro.reviews.leaveReview")}</p>
                    <div className="mt-4 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onMouseEnter={() => setReviewHoverRating(value)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(value)}
                          aria-label={t("pro.reviews.starLabel", { count: value })}
                        >
                          <Star
                            size={26}
                            className={
                              value <= (reviewHoverRating || reviewRating)
                                ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]"
                                : "text-[var(--brand-border)]"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      placeholder={t("pro.reviews.commentPlaceholder")}
                      className="mt-3 w-full rounded-lg border border-[var(--brand-border)] px-3 py-2 text-[14px]"
                    />
                    <button
                      type="button"
                      disabled={createReview.isPending}
                      onClick={() => {
                        if (reviewRating < 1) {
                          setReviewNotice(t("pro.reviews.ratingRequired"));
                          return;
                        }
                        createReview.mutate(
                          { targetId: professionalQuery.data!.profileId, targetType: "PROFESSIONAL", rating: reviewRating, comment: reviewComment.trim() || undefined },
                          {
                            onSuccess: () => {
                              setReviewNotice(t("pro.reviews.success"));
                              setReviewRating(0);
                              setReviewComment("");
                              reviewsQuery.refetch();
                              professionalQuery.refetch();
                            },
                            onError: (error) => setReviewNotice(error instanceof Error ? error.message : t("pro.reviews.loginRequired")),
                          },
                        );
                      }}
                      className="mt-3 h-10 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:opacity-60"
                    >
                      {createReview.isPending ? t("pro.reviews.submitting") : t("pro.reviews.submit")}
                    </button>
                    {reviewNotice && <p className="mt-3 text-[13px] font-semibold text-[var(--color-text-secondary)]">{reviewNotice}</p>}
                  </div>
                )}

                <div className="rounded-[24px] border border-[var(--brand-border-light)] bg-white p-5 sm:p-7">
                  <p className="font-mono text-[12px] tracking-[0.18em] text-[var(--brand-terracotta)]">{t("pro.reviews.patientReviews", { count: pro.reviewCount })}</p>
                  {reviewsQuery.isLoading && <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">{t("pro.reviews.loading")}</p>}
                  {!reviewsQuery.isLoading && ((reviewsQuery.data as ProfessionalReview[] | undefined)?.length ?? 0) === 0 && (
                    <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">{t("pro.reviews.empty")}</p>
                  )}
                  <div className="mt-4 divide-y divide-[var(--brand-border-light)]">
                    {((reviewsQuery.data as ProfessionalReview[] | undefined) ?? []).map((review) => (
                      <div key={review.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[var(--color-text-primary)]">{review.author.firstName} {review.author.lastName.slice(0, 1)}.</p>
                          <RatingStars rating={review.rating} showCount={false} />
                        </div>
                        {review.comment && <p className="mt-2 text-[14px] leading-6 text-[var(--color-text-secondary)]">{review.comment}</p>}
                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{new Date(review.createdAt).toLocaleDateString("fr-FR")}</p>
                        {review.sellerReply && (
                          <div className="mt-3 rounded-lg bg-[var(--brand-surface-alt)] p-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--brand-primary)]">{t("pro.reviews.replyFrom", { name: pro.name })}</p>
                            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{review.sellerReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {tab === "booking" && pro.serviceBookingEnabled && (
              <BookingWidget professionalId={id} professionalName={pro.name} />
            )}
          </div>

          <aside className="lg:sticky lg:top-24 h-fit space-y-5 rounded-[24px] border border-[var(--brand-border-light)] bg-white p-6">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--brand-terracotta)]">{t("pro.contact.label")}</p>
              <h2 className="mt-2 text-[26px]">{t("pro.contact.title", { name: pro.name.split(" ")[0] })}</h2>
              <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{t("pro.contact.subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/messages", search: { to: id, text: contactMessage } as never })}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#1f5a39_0%,#2d7a4f_100%)] px-4 py-3 text-center font-semibold text-white"
            >
              <MessageCircle size={18} /> {t("pro.contact.openMessaging")}
            </button>
            <div className="border-t border-[var(--brand-border-light)] pt-4 text-[13px] text-[var(--color-text-secondary)]">
              <p><strong>{t("pro.contact.availability")}</strong> {t("pro.contact.availabilityValue")}</p>
              <p className="mt-2"><strong>{t("pro.contact.languages")}</strong> {pro.languages?.join(", ") ?? t("pro.contact.defaultLanguage")}</p>
            </div>
            {socialLinks.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-surface-alt)]" aria-label={label}><Icon size={16} /></a>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
