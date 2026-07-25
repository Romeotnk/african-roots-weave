import type { TrainingCourse } from "@/types";

const fallbackFormationImage = "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=1200&q=80&auto=format&fit=crop";
const fallbackAvatar = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&q=80";

export type BackendLesson = { id?: string; title?: string; duration?: string | null; type?: string };
export type BackendModule = { id?: string; title?: string; lessons?: BackendLesson[] };
export type BackendReview = { id?: string; rating?: number; comment?: string | null; author?: { firstName?: string | null; lastName?: string | null } | null };

export type BackendFormation = {
  id?: string;
  slug?: string | null;
  title?: string;
  description?: string | null;
  type?: "VIDEO" | "DOCUMENT" | "CATALOGUE" | "IMAGE";
  coverImage?: string | null;
  category?: string;
  level?: string | null;
  duration?: string | null;
  price?: string | number | null;
  currency?: string | null;
  prerequisites?: string[];
  learnings?: string[];
  instructorBio?: string | null;
  downloadCount?: number;
  rating?: number;
  reviewCount?: number;
  modules?: BackendModule[];
  reviews?: BackendReview[];
  createdBy?: {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    professionalProfile?: { id?: string; displayName?: string | null; photos?: string[] } | null;
  } | null;
};

export function toTrainingCourse(course: BackendFormation): TrainingCourse | null {
  if (!course.id || !course.title) return null;
  const format = course.type === "DOCUMENT" || course.type === "CATALOGUE" ? "document" : "video";
  const instructorName =
    course.createdBy?.professionalProfile?.displayName ||
    [course.createdBy?.firstName, course.createdBy?.lastName].filter(Boolean).join(" ").trim() ||
    "Equipe IWOSAN";

  return {
    id: course.id,
    slug: course.slug || course.id,
    title: course.title,
    instructor: instructorName,
    instructorProfileId: course.createdBy?.id,
    instructorAvatar: course.createdBy?.professionalProfile?.photos?.[0] || fallbackAvatar,
    instructorBio: course.instructorBio || "Ressource publiee dans la bibliotheque de formation IWOSAN.",
    duration: course.duration || (format === "document" ? "Document" : "A votre rythme"),
    level: (course.level as TrainingCourse["level"]) || "Debutant",
    format,
    category: course.category ?? "Formation",
    price: Number(course.price ?? 0),
    currency: course.currency ?? "XOF",
    rating: course.rating ?? 0,
    students: course.downloadCount ?? 0,
    image: course.coverImage ?? fallbackFormationImage,
    prerequisites: course.prerequisites?.length ? course.prerequisites : [],
    learnings: course.learnings?.length ? course.learnings : [course.description ?? "Consulter la ressource et ses supports associes."],
    modules: (course.modules ?? []).map((module) => ({
      title: module.title ?? "Module",
      lessons: (module.lessons ?? []).map((lesson) => ({
        id: lesson.id ?? "",
        title: lesson.title ?? "Lecon",
        duration: lesson.duration ?? "",
        type: lesson.type === "document" ? "document" : "video",
      })),
    })),
    reviews: (course.reviews ?? []).map((review) => ({
      authorName: [review.author?.firstName, review.author?.lastName].filter(Boolean).join(" ").trim() || "Membre Iwosan",
      rating: review.rating ?? 5,
      comment: review.comment ?? "",
    })),
  };
}

export function toTrainingCourses(courses: unknown[] | undefined): TrainingCourse[] {
  return ((courses ?? []) as BackendFormation[]).map(toTrainingCourse).filter((item): item is TrainingCourse => Boolean(item));
}
