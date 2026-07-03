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
  languages?: string[];
  gallery?: string[];
  yearsExperience?: number;
  consultationPrice?: number;
  online?: boolean;
  availability?: Record<string, string[]>;
}

export interface ProfessionalBooking {
  id: string;
  patientName: string;
  date: string;
  time: string;
  mode: "online" | "onsite";
  status: "pending" | "confirmed" | "cancelled" | "done";
  reason: string;
}

export interface ProfessionalReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
  response?: string;
}

export type KycStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  content: string;
  createdAt: string;
  read: boolean;
  attachment?: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  unreadCount: number;
  messages: ChatMessage[];
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
  location?: string;
  country?: string;
  verified?: boolean;
  urgent?: boolean;
  shareCount?: number;
  createdAt?: string;
  popularity?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MarketplaceAlert {
  id: string;
  name: string;
  summary: string;
  active: boolean;
  createdAt: string;
}

export type OrderStatus = "confirmed" | "paid" | "preparing" | "shipped" | "delivered" | "completed";

export interface OrderItem {
  title: string;
  seller: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  role: "buyer" | "seller";
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

export type WalletTransactionType =
  | "deposit"
  | "withdrawal"
  | "payment"
  | "reception"
  | "refund"
  | "commission";

export type WalletTransactionStatus = "pending" | "completed" | "failed";

export interface WalletTransaction {
  id: string;
  date: string;
  type: WalletTransactionType;
  label: string;
  amount: number;
  status: WalletTransactionStatus;
  note?: string;
}

export type ListingStatus = "draft" | "pending" | "active" | "suspended" | "expired";

export interface SellerListing extends Product {
  status: ListingStatus;
  createdAt: string;
  expiresAt: string;
  city: string;
  views: number;
  clicks: number;
  favorites: number;
  messages: number;
  urgent?: boolean;
  featured?: boolean;
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
  gallery?: string[];
  summary: string;
  region?: string;
  therapeuticCategory?: string;
  botanicalDescription?: string;
  medicinalProperties?: { property: string; use: string; evidence: string }[];
  preparations?: string[];
  precautions?: string[];
  references?: string[];
}

export interface EventItem {
  id: string;
  title: string;
  type: "WEBINAIRE" | "FORMATION" | "SALON" | "CONFERENCE" | "ATELIER";
  date: string; // ISO
  endDate?: string;
  category?: string;
  location: string;
  address?: string;
  online: boolean;
  description: string;
  image: string;
  program?: { title: string; detail: string }[];
  speakers?: { name: string; avatar: string; bio: string }[];
  price?: number;
  currency?: string;
  capacity?: number;
  registered?: number;
  status?: "confirmed" | "pending" | "cancelled";
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  cover: string;
  space: string;
  category?: string;
  readTime: number;
  date: string;
  authorName: string;
  authorAvatar: string;
  authorSpecialty: string;
  authorProfileId?: string;
  comments?: { id: string; authorName: string; content: string; date: string }[];
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  type: "Infusion" | "Decoction" | "Cataplasme" | "Baume" | "Preparation culinaire";
  difficulty: "Facile" | "Intermediaire" | "Avance";
  prepTime: string;
  plants: { name: string; slug: string }[];
  ingredients: string[];
  steps: string[];
  cautions: string[];
}

export type SupportTicketStatus = "open" | "pending" | "resolved";

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: SupportTicketStatus;
  createdAt: string;
  messages: {
    id: string;
    author: "me" | "support";
    content: string;
    createdAt: string;
  }[];
}

export interface TrainingCourse {
  id: string;
  slug: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  instructorBio: string;
  duration: string;
  level: "Debutant" | "Intermediaire" | "Avance";
  format: "video" | "document" | "presentiel";
  category: string;
  price: number;
  currency: string;
  rating: number;
  students: number;
  image: string;
  prerequisites: string[];
  learnings: string[];
  modules: {
    title: string;
    lessons: { id: string; title: string; duration: string; type: "video" | "document" }[];
  }[];
  reviews: { authorName: string; rating: number; comment: string }[];
}

export interface AffiliateNode {
  id: string;
  name: string;
  level: 0 | 1 | 2 | 3;
  joinedAt: string;
  active: boolean;
  commissions: number;
  children?: AffiliateNode[];
}

export type AffiliateEarningStatus = "pending" | "paid";

export interface AffiliateEarning {
  id: string;
  date: string;
  type: "direct_sale" | "level_2" | "level_3";
  amount: number;
  status: AffiliateEarningStatus;
  source: string;
}

export interface Question {
  id: string;
  title: string;
  excerpt: string;
  body?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  resolved: boolean;
  featured?: boolean;
  closed?: boolean;
  followed?: boolean;
  attachments?: ForumAttachment[];
  answerItems?: ForumAnswer[];
  authorName: string;
  authorAvatar?: string;
  authorReputation?: number;
  date: string;
}

export interface ForumAttachment {
  id: string;
  type: "image" | "file";
  name: string;
  url: string;
}

export interface ForumComment {
  id: string;
  authorName: string;
  content: string;
  date: string;
}

export interface ForumAnswer {
  id: string;
  body: string;
  authorName: string;
  authorAvatar?: string;
  authorReputation: number;
  date: string;
  votes: number;
  accepted: boolean;
  comments: ForumComment[];
}
