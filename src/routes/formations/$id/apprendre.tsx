import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, FileText, Loader2, Lock, MessageCircle, PlayCircle } from "lucide-react";
import { trainings } from "@/data/trainings";
import { useMeQuery } from "@/hooks/useAuthApi";
import {
  useDownloadFormation,
  useFormation,
  useMyFormationEnrollment,
  useUpdateFormationProgress,
} from "@/hooks/useEventsFormationsApi";
import { toTrainingCourse, type BackendFormation } from "@/lib/mappers/formation";

export const Route = createFileRoute("/formations/$id/apprendre")({
  head: () => ({ meta: [{ title: "Espace apprenant - IWOSAN" }] }),
  component: Learn,
});

function Learn() {
  const { id } = Route.useParams();
  const formationQuery = useFormation(id);
  const downloadFormation = useDownloadFormation();
  const { data: profile } = useMeQuery();
  const enrollmentQuery = useMyFormationEnrollment(id);
  const updateProgress = useUpdateFormationProgress();
  const apiCourse = useMemo(() => toTrainingCourse((formationQuery.data ?? {}) as BackendFormation), [formationQuery.data]);
  const course = apiCourse ?? trainings.find((item) => item.id === id || item.slug === id) ?? trainings[0];
  const rawFileUrl = (formationQuery.data as { fileUrl?: string } | undefined)?.fileUrl;

  const lessons = course.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, module: module.title })));
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id);
  const [done, setDone] = useState<string[]>([]);
  const [progressError, setProgressError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const progress = useMemo(() => Math.round((done.length / Math.max(lessons.length, 1)) * 100), [done.length, lessons.length]);

  useEffect(() => {
    if (enrollmentQuery.data?.completedLessonIds) {
      setDone(enrollmentQuery.data.completedLessonIds);
    }
  }, [enrollmentQuery.data?.completedLessonIds]);

  const markDone = (lessonId: string) => {
    setProgressError("");
    setDone((current) => (current.includes(lessonId) ? current : [...current, lessonId]));
    if (apiCourse) {
      updateProgress.mutate(
        { id: apiCourse.id, lessonId, completed: true },
        {
          // The optimistic update above can drift from the server if this
          // fails (expired session, network) — roll it back and say so
          // instead of leaving a phantom "done" state that isn't persisted.
          onError: (error) => {
            setDone((current) => current.filter((item) => item !== lessonId));
            setProgressError(error instanceof Error ? error.message : "La progression n'a pas pu etre enregistree.");
          },
        },
      );
    }
  };

  if (apiCourse && !profile) {
    return (
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="container-iwosan py-16 text-center">
          <Lock size={48} className="mx-auto text-[var(--brand-primary)]" />
          <h1 className="mt-4 text-[24px] font-bold">Connexion requise</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Connectez-vous pour accéder à cette formation.</p>
          <Link to="/connexion" className="mt-6 inline-flex h-11 items-center rounded-full bg-[var(--brand-primary)] px-6 text-[13px] font-semibold text-white">
            Se connecter
          </Link>
        </section>
      </main>
    );
  }

  if (apiCourse && profile && enrollmentQuery.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--brand-bg)]">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={28} />
      </main>
    );
  }

  if (apiCourse && profile && !enrollmentQuery.data) {
    return (
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="container-iwosan py-16 text-center">
          <Lock size={48} className="mx-auto text-[var(--brand-primary)]" />
          <h1 className="mt-4 text-[24px] font-bold">Inscription requise</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            Vous devez vous inscrire à cette formation pour accéder à son contenu.
          </p>
          <Link
            to="/formations/$id"
            params={{ id }}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-[var(--brand-primary)] px-6 text-[13px] font-semibold text-white"
          >
            Voir la formation
          </Link>
        </section>
      </main>
    );
  }

  if (lessons.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="container-iwosan py-16">
          <Link to="/formations/$id" params={{ id: course.id }} className="text-[13px] font-semibold text-[var(--brand-primary)]">Retour au cours</Link>
          <div className="mt-6 rounded-[12px] border border-[var(--brand-border-light)] bg-white p-8 text-center">
            <FileText size={48} className="mx-auto text-[var(--brand-primary)]" />
            <h1 className="mt-4 text-[24px] font-bold">{course.title}</h1>
            <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
              Cette ressource est une documentation à télécharger, sans découpage en leçons.
            </p>
            <button
              type="button"
              onClick={() => {
                setDownloadError("");
                if (!rawFileUrl) return;
                downloadFormation.mutate(course.id, {
                  onSuccess: () => window.open(rawFileUrl, "_blank", "noopener,noreferrer"),
                  onError: (error) => setDownloadError(error instanceof Error ? error.message : "Telechargement impossible."),
                });
              }}
              disabled={downloadFormation.isPending}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              <Download size={16} /> {downloadFormation.isPending ? "Préparation..." : "Télécharger la ressource"}
            </button>
            {downloadError && <p className="mt-3 text-[13px] font-semibold text-red-700">{downloadError}</p>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="grid min-h-screen lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-[var(--brand-border-light)] bg-white p-5">
          <Link to="/formations/$id" params={{ id: course.id }} className="text-[13px] font-semibold text-[var(--brand-primary)]">Retour au cours</Link>
          <h1 className="mt-4 text-[22px] font-bold">{course.title}</h1>
          <div className="mt-5">
            <div className="flex justify-between text-[12px] font-semibold"><span>Progression</span><span>{progress}%</span></div>
            <div className="mt-2 h-2 rounded-full bg-[var(--brand-surface-alt)]"><div className="h-2 rounded-full bg-[var(--brand-primary)]" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="mt-6 space-y-2">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`w-full rounded-lg p-3 text-left text-[13px] ${activeLessonId === lesson.id ? "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "bg-[var(--brand-surface-alt)]"}`}
              >
                <span className="block text-[11px] font-bold uppercase">{lesson.module}</span>
                <span className="mt-1 flex items-center gap-2 font-semibold">
                  {done.includes(lesson.id) ? <CheckCircle2 size={15} /> : lesson.type === "video" ? <PlayCircle size={15} /> : <FileText size={15} />}
                  {lesson.title}
                </span>
              </button>
            ))}
          </div>
        </aside>
        <section className="p-5 md:p-8">
          <div className="rounded-[12px] bg-[var(--brand-primary-dark)] p-6 text-white">
            <div className="grid min-h-[340px] place-items-center rounded-lg border border-white/15 bg-black/20 text-center">
              <div>
                {activeLesson.type === "video" ? <PlayCircle size={54} className="mx-auto text-[var(--brand-gold)]" /> : <FileText size={54} className="mx-auto text-[var(--brand-gold)]" />}
                <h2 className="mt-4 text-[26px] text-white">{activeLesson.title}</h2>
                <p className="mt-2 text-white/70">{activeLesson.type === "video" ? "Lecteur vidéo" : "Visionneuse document"} · {activeLesson.duration}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => markDone(activeLesson.id)}
              disabled={done.includes(activeLesson.id)}
              className="h-11 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:opacity-60"
            >
              {done.includes(activeLesson.id) ? "Leçon terminée" : "Marquer comme terminé"}
            </button>
            <Link to="/forum" className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--brand-border)] px-5 text-[13px] font-semibold">
              <MessageCircle size={15} /> Questions sur la lecon
            </Link>
          </div>
          {progressError && <p className="mt-3 text-[13px] font-semibold text-red-700">{progressError}</p>}
        </section>
      </section>
    </main>
  );
}
