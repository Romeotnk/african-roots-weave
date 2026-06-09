import type { EventItem } from "@/types";

export const events: EventItem[] = [
  {
    id: "e1",
    title: "Webinaire — Pharmacopée et diabète type 2",
    type: "WEBINAIRE",
    date: "2026-06-18T18:00:00Z",
    location: "En ligne",
    online: true,
    description:
      "Quelles plantes africaines documentées dans la prise en charge du diabète ? Avec Dr. Kwame Mensah.",
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "e2",
    title: "Formation — Préparation des décoctions selon les protocoles INRSP",
    type: "FORMATION",
    date: "2026-06-24T09:00:00Z",
    location: "Bamako, Mali",
    online: false,
    description:
      "Atelier pratique 2 jours sur les bonnes pratiques de préparation, dosage et conservation.",
    image:
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "e3",
    title: "Salon Panafricain de la Médecine Traditionnelle",
    type: "SALON",
    date: "2026-07-12T10:00:00Z",
    location: "Dakar, Sénégal",
    online: false,
    description:
      "3 jours de conférences, exposants et rencontres entre tradi-praticiens, chercheurs et institutionnels.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "e4",
    title: "Webinaire — Rites de guérison et santé mentale",
    type: "WEBINAIRE",
    date: "2026-06-28T17:00:00Z",
    location: "En ligne",
    online: true,
    description:
      "Approche anthropologique et thérapeutique des rites traditionnels en santé mentale.",
    image:
      "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&q=80&auto=format&fit=crop",
  },
];
