import type { SupportTicket } from "@/types";

export const faqCategories = [
  {
    name: "Compte et securite",
    items: [
      {
        question: "Comment verifier mon identite KYC ?",
        answer: "Depuis Mon compte > KYC, envoyez une piece valide, un selfie et la declaration sur l'honneur.",
      },
      {
        question: "Comment changer mon PIN portefeuille ?",
        answer: "Depuis Portefeuille > Securite, configurez ou remplacez votre PIN avant toute action sensible.",
      },
    ],
  },
  {
    name: "Marketplace",
    items: [
      {
        question: "Quand mon annonce devient-elle visible ?",
        answer: "Apres publication, une moderation mock indique un delai de 24h avant visibilite publique.",
      },
      {
        question: "Comment ouvrir un litige ?",
        answer: "Depuis Mes commandes, utilisez Signaler un probleme pour ajouter une raison et des preuves.",
      },
    ],
  },
  {
    name: "Savoirs editoriaux",
    items: [
      {
        question: "Puis-je signaler une erreur dans une monographie ?",
        answer: "Oui, chaque monographie propose Signaler une erreur et Suggerer une amelioration.",
      },
    ],
  },
];

export const supportTickets: SupportTicket[] = [
  {
    id: "TCK-1024",
    subject: "Question sur une annonce en moderation",
    category: "Marketplace",
    status: "pending",
    createdAt: "2026-06-12",
    messages: [
      {
        id: "tm1",
        author: "me",
        content: "Bonjour, mon annonce est en attente depuis hier. Pouvez-vous verifier ?",
        createdAt: "2026-06-12 09:10",
      },
      {
        id: "tm2",
        author: "support",
        content: "Bonjour, elle est bien dans la file de moderation. Nous revenons vers vous aujourd'hui.",
        createdAt: "2026-06-12 10:05",
      },
    ],
  },
  {
    id: "TCK-1019",
    subject: "Correction dans la fiche kinkeliba",
    category: "Pharmacopee",
    status: "resolved",
    createdAt: "2026-06-05",
    messages: [
      {
        id: "tm3",
        author: "me",
        content: "Une reference locale manque dans la fiche kinkeliba.",
        createdAt: "2026-06-05 14:00",
      },
      {
        id: "tm4",
        author: "support",
        content: "Merci, la suggestion a ete transmise a l'equipe editoriale.",
        createdAt: "2026-06-06 08:45",
      },
    ],
  },
];
