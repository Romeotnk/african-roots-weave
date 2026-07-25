import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Download, FileText, MessageCircle, PlayCircle } from "lucide-react";
import { trainings } from "@/data/trainings";
import { useDownloadFormation, useFormation } from "@/hooks/useEventsFormationsApi";
import { toTrainingCourse, type BackendFormation } from "@/lib/mappers/formation";

export const Route = createFileRoute("/formations/$id/apprendre")({
  head: () => ({ meta: [{ title: "Espace apprenant - IWOSAN" }] }),
  component: Learn,
});

function Learn() {
  const { id } = Route.useParams();
  const formationQuery = useFormation(id);
  const downloadFormation = useDownloadFormation();
  const apiCourse = useMemo(() => toTrainingCourse((formationQuery.data ?? {}) as BackendFormation), [formationQuery.data]);
  const course = apiCourse ?? trainings.find((item) => item.id === id || item.slug === id) ?? trainings[0];
  const rawFileUrl = (formationQuery.data as { fileUrl?: string } | undefined)?.fileUrl;

  const lessons = course.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, module: module.title })));
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id);
  const [done, setDone] = useState<string[]>([]);
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const progress = useMemo(() => Math.round((done.length / Math.max(lessons.length, 1)) * 100), [done.length, lessons.length]);

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
              onClick={() => rawFileUrl && downloadFormation.mutate(course.id, { onSuccess: () => window.open(rawFileUrl, "_blank", "noopener,noreferrer") })}
              disabled={downloadFormation.isPending}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              <Download size={16} /> {downloadFormation.isPending ? "Préparation..." : "Télécharger la ressource"}
            </button>
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
              onClick={() => setDone((current) => current.includes(activeLesson.id) ? current : [...current, activeLesson.id])}
              className="h-11 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white"
            >
              Marquer comme termine
            </button>
            <Link to="/forum" className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--brand-border)] px-5 text-[13px] font-semibold">
              <MessageCircle size={15} /> Questions sur la lecon
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
