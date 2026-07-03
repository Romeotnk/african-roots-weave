export interface PublicProfile {
  username: string;
  name: string;
  role: string;
  avatar: string;
  country: string;
  memberSince: string;
  reputation: number;
  activeListings: number;
  sellerRating: number;
  buyerReliability: number;
  reviews: Array<{ from: string; type: "acheteur" | "vendeur"; rating: number; comment: string }>;
}

export const publicProfiles: PublicProfile[] = [
  {
    username: "mama-aissata",
    name: "Mama Aissata Diallo",
    role: "Praticienne verifiee",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop",
    country: "Mali",
    memberSince: "2024",
    reputation: 96,
    activeListings: 8,
    sellerRating: 4.9,
    buyerReliability: 98,
    reviews: [
      { from: "Awa K.", type: "acheteur", rating: 5, comment: "Commande soignee, conseils tres clairs." },
      { from: "Kwame M.", type: "vendeur", rating: 5, comment: "Acheteuse fiable, paiement rapide." },
    ],
  },
  {
    username: "hakim-mbaye",
    name: "Hakim Mbaye",
    role: "Vendeur",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop",
    country: "Senegal",
    memberSince: "2025",
    reputation: 82,
    activeListings: 5,
    sellerRating: 4.5,
    buyerReliability: 91,
    reviews: [
      { from: "Fatou S.", type: "acheteur", rating: 4, comment: "Produits conformes et bonne communication." },
      { from: "Rose E.", type: "vendeur", rating: 5, comment: "Transaction fluide et respectueuse." },
    ],
  },
];
