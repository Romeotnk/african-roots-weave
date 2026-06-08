export interface Professional {
  id: string;
  name: string;
  specialty: string;
  location: string;
  country: string;
  bio: string;
  avatar: string;
  cover: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  specialties: string[];
}

export interface Product {
  id: string;
  title: string;
  category: string;
  type: "physical" | "service" | "digital";
  price: number;
  currency: string;
  image: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  rating: number;
  reviewCount: number;
  auction?: boolean;
}

export interface Plant {
  id: string;
  slug: string;
  scientificName: string;
  vernacularNames: string[];
  family: string;
  origin: string;
  indications: string[];
  image: string;
  summary: string;
}

export interface EventItem {
  id: string;
  title: string;
  type: "WEBINAIRE" | "FORMATION" | "SALON";
  date: string; // ISO
  location: string;
  online: boolean;
  description: string;
  image: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  space: string;
  readTime: number;
  date: string;
  authorName: string;
  authorAvatar: string;
  authorSpecialty: string;
}

export interface Question {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  resolved: boolean;
  authorName: string;
  date: string;
}
