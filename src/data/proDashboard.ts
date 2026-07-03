import type { ProfessionalBooking, ProfessionalReview } from "@/types";

export const proBookings: ProfessionalBooking[] = [
  {
    id: "bk1",
    patientName: "Awa D.",
    date: "2026-06-17",
    time: "09:00",
    mode: "onsite",
    status: "pending",
    reason: "Suivi post-partum",
  },
  {
    id: "bk2",
    patientName: "Marc L.",
    date: "2026-06-18",
    time: "14:30",
    mode: "online",
    status: "confirmed",
    reason: "Conseil dermatologique",
  },
  {
    id: "bk3",
    patientName: "Henriette B.",
    date: "2026-06-20",
    time: "11:00",
    mode: "onsite",
    status: "done",
    reason: "Douleurs articulaires",
  },
];

export const proReviews: ProfessionalReview[] = [
  {
    id: "rv1",
    authorName: "Awa D.",
    rating: 5,
    comment: "Ecoute remarquable, explications tres claires et suivi serieux.",
    date: "2026-06-08",
  },
  {
    id: "rv2",
    authorName: "Issa K.",
    rating: 4,
    comment: "Bon accompagnement et preparation bien documentee.",
    date: "2026-05-29",
    response: "Merci pour votre confiance.",
  },
];
