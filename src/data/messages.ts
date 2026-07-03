import type { Conversation } from "@/types";

export const conversations: Conversation[] = [
  {
    id: "conv1",
    participantName: "Mama Aissata",
    participantRole: "Vendeuse - Tisane post-partum",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&q=80&auto=format&fit=crop",
    online: true,
    unreadCount: 2,
    messages: [
      {
        id: "m1",
        sender: "them",
        content: "Bonjour, la tisane est disponible en sachet de 250g et 500g.",
        createdAt: "2026-06-15T09:15:00",
        read: true,
      },
      {
        id: "m2",
        sender: "me",
        content: "Merci. Est-ce compatible avec l'allaitement ?",
        createdAt: "2026-06-15T09:18:00",
        read: true,
      },
      {
        id: "m3",
        sender: "them",
        content: "Oui, mais je recommande toujours de commencer par une faible dose.",
        createdAt: "2026-06-15T09:24:00",
        read: false,
      },
    ],
  },
  {
    id: "conv2",
    participantName: "Dr. Kwame Mensah",
    participantRole: "Consultation phytotherapie",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=160&q=80&auto=format&fit=crop",
    online: false,
    lastSeen: "Derniere connexion a 08:42",
    unreadCount: 0,
    messages: [
      {
        id: "m4",
        sender: "them",
        content: "Votre rendez-vous de jeudi est confirme.",
        createdAt: "2026-06-14T16:10:00",
        read: true,
      },
      {
        id: "m5",
        sender: "me",
        content: "Parfait, merci docteur.",
        createdAt: "2026-06-14T16:12:00",
        read: true,
      },
    ],
  },
  {
    id: "conv3",
    participantName: "Tata Ngozi",
    participantRole: "Beurre de karite brut",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&q=80&auto=format&fit=crop",
    online: true,
    unreadCount: 1,
    messages: [
      {
        id: "m6",
        sender: "them",
        content: "Je peux expedier demain matin si la commande est confirmee aujourd'hui.",
        createdAt: "2026-06-15T10:02:00",
        read: false,
      },
    ],
  },
];
