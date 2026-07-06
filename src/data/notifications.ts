export type NotificationType = "message" | "listing" | "order" | "review" | "forum";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  read: boolean;
  date: string;
}

export const notifications: AppNotification[] = [
  {
    id: "n1",
    type: "message",
    title: "Nouveau message",
    body: "Mama Aissata a repondu a votre demande de consultation.",
    href: "/messages",
    read: false,
    date: "2026-07-02 09:20",
  },
  {
    id: "n2",
    type: "listing",
    title: "Annonce approuvee",
    body: "Votre annonce Kinkeliba premium est maintenant visible.",
    href: "/dashboard/annonces",
    read: false,
    date: "2026-07-01 16:45",
  },
  {
    id: "n3",
    type: "order",
    title: "Commande recue",
    body: "Une nouvelle commande attend votre confirmation.",
    href: "/mes-commandes",
    read: true,
    date: "2026-06-30 12:10",
  },
  {
    id: "n4",
    type: "forum",
    title: "Reponse forum",
    body: "Une reponse a ete ajoutee a votre question sur le neem.",
    href: "/forum",
    read: true,
    date: "2026-06-28 08:05",
  },
];
