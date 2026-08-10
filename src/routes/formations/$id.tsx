import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, PlayCircle, Smartphone, Wallet } from "lucide-react";
import { RatingStars } from "@/components/shared/RatingStars";
import { professionals } from "@/data/professionals";
import { trainings } from "@/data/trainings";
import { useMeQuery } from "@/hooks/useAuthApi";
import { useEnrollFormation, useFormation, useMyFormationEnrollment } from "@/hooks/useEventsFormationsApi";
import { toTrainingCourse, type BackendFormation } from "@/lib/mappers/formation";

export const Route = createFileRoute("/formations/$id")({
  head: () => ({ meta: [{ title: "Detail formation - IWOSAN" }] }),
  component: TrainingDetail,
});

const fallbackAvatar = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&q=80";

function EnrollmentPanel({ formationId, price, currency }: { formationId: string; price: number; currency: string }) {
  const { data: profile } = useMeQuery();
  const enrollmentQuery = useMyFormationEnrollment(formationId);
  const enroll = useEnrollFormation();
  const [method, setMethod] = useState<"wallet" | "card" | "mobile_money">("wallet");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const isFree = price <= 0;

  if (!profile) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-[13px] text-[var(--color-text-muted)]">Connectez-vous pour vous inscrire à cette formation.</p>
        <Link to="/connexion" className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand-primary)] font-semibold text-white">
          Se connecter
        </Link>
      </div>
    );
  }

  if (enrollmentQuery.isLoading) {
    return (
      <div className="mt-4 flex justify-center">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={20} />
      </div>
    );
  }

  if (enrollmentQuery.data) {
    return (
      <Link
        to="/formations/$id/apprendre"
        params={{ id: formationId }}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] font-semibold text-white"
      >
        <CheckCircle2 size={16} /> Accéder au cours
      </Link>
    );
  }

  const submit = () => {
    setFeedback(null);
    enroll.mutate(
      { id: formationId, method: isFree ? "free" : method },
      {
        onSuccess: (result) => {
          if (result?.checkoutUrl) {
            window.location.href = result.checkoutUrl;
            return;
          }
          setFeedback({ type: "success", message: "Inscription confirmée ! Vous pouvez accéder au cours." });
        },
        onError: (error) =>
          setFeedback({
            type: "error",
            message: error instanceof Error ? error.message : "Impossible de finaliser l'inscription.",
          }),
      },
    );
  };

  return (
    <div className="mt-4 space-y-3">
      {!isFree && (
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "wallet" as const, label: "Portefeuille", icon: Wallet },
              { id: "card" as const, label: "Carte", icon: CreditCard },
              { id: "mobile_money" as const, label: "Mobile Money", icon: Smartphone },
            ]
          ).map(({ id: methodId, label, icon: Icon }) => (
            <button
              key={methodId}
              type="button"
              onClick={() => setMethod(methodId)}
              className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-[12px] font-semibold ${
                method === methodId
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"
                  : "border-[var(--brand-border)]"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={enroll.isPending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] font-semibold text-white disabled:opacity-60"
      >
        {enroll.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
        {enroll.isPending ? "Traitement..." : isFree ? "S'inscrire gratuitement" : `Acheter maintenant · ${price.toLocaleString("fr-FR")} ${currency}`}
      </button>
      {feedback && (
        <p className={`text-[12px] font-semibold ${feedback.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}

function TrainingDetail() {
  const { id } = Route.useParams();
  const formationQuery = useFormation(id);
  const apiCourse = useMemo(() => toTrainingCourse((formationQuery.data ?? {}) as BackendFormation), [formationQuery.data]);
  const course = apiCourse ?? trainings.find((item) => item.id === id || item.slug === id) ?? trainings[0];

  const fallbackInstructor =
    professionals.find((item) => item.id === course.instructorProfileId) ??
    professionals.find((item) => item.name === course.instructor) ??
    professionals[0];
  const instructorHref = course.instructorProfileId ?? fallbackInstructor.id;
  const instructorAvatar = course.instructorAvatar || fallbackAvatar;

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="bg-[var(--brand-primary-dark)] text-white">
        <div className="container-iwosan grid gap-8 py-12 lg:grid-cols-[1fr_380px]">
          <div>
            <Link to="/formations" className="text-[13px] font-semibold text-[var(--brand-gold)]">Retour aux formations</Link>
            <h1 className="mt-5 text-[36px] text-white md:text-[52px]">{course.title}</h1>
            <p className="mt-4 max-w-2xl text-white/75">{course.category} · {course.level} · {course.duration}</p>
            <div className="mt-5"><RatingStars rating={course.rating} reviewCount={course.students} /></div>
          </div>
          <div className="rounded-[12px] bg-white p-4 text-[var(--color-text-primary)]">
            <img src={course.image} alt="" className="aspect-video w-full rounded-lg object-cover" />
            <p className="mt-4 text-[24px] font-bold">{course.price === 0 ? "Gratuit" : `${course.price.toLocaleString("fr-FR")} ${course.currency}`}</p>
            <Link to="/pro/$id" params={{ id: instructorHref }} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--brand-border)] font-semibold">
              Voir le profil du formateur
            </Link>
            {apiCourse && <EnrollmentPanel formationId={apiCourse.id} price={course.price} currency={course.currency} />}
          </div>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
            <h2 className="text-[22px] font-bold">Ce que vous allez apprendre</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {course.learnings.map((item) => (
                <li key={item} className="flex gap-2 text-[14px]"><CheckCircle2 size={17} className="text-emerald-600" /> {item}</li>
              ))}
            </ul>
          </section>
          {course.modules.length > 0 && (
            <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
              <h2 className="text-[22px] font-bold">Programme</h2>
              <div className="mt-4 space-y-3">
                {course.modules.map((module) => (
                  <details key={module.title} open className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
                    <summary className="cursor-pointer font-bold">{module.title}</summary>
                    <div className="mt-3 space-y-2">
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between rounded bg-white px-3 py-2 text-[13px]">
                          <span className="inline-flex items-center gap-2"><PlayCircle size={15} /> {lesson.title}</span>
                          <span>{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}
          {course.reviews.length > 0 && (
            <section className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-6">
              <h2 className="text-[22px] font-bold">Avis des apprenants</h2>
              <div className="mt-4 space-y-3">
                {course.reviews.map((review, index) => (
                  <div key={`${review.authorName}-${index}`} className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
                    <RatingStars rating={review.rating} size="sm" showCount={false} />
                    <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">{review.comment}</p>
                    <p className="mt-1 text-[12px] font-semibold">{review.authorName}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="text-[18px] font-bold">Instructeur</h2>
          <div className="mt-4 flex gap-3">
            <img src={instructorAvatar} alt="" className="h-14 w-14 rounded-full object-cover" />
            <div><p className="font-bold">{course.instructor}</p><p className="text-[13px] text-[var(--color-text-muted)]">{course.instructorBio}</p></div>
          </div>
          {course.prerequisites.length > 0 && (
            <>
              <h3 className="mt-6 font-bold">Prerequis</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] text-[var(--color-text-secondary)]">
                {course.prerequisites.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
