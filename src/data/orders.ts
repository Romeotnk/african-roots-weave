import type { Order } from "@/types";

export const orders: Order[] = [
  {
    id: "CMD-2026-1048",
    role: "buyer",
    date: "2026-06-12",
    status: "shipped",
    total: 18500,
    items: [
      { title: "Tisane post-partum", seller: "Mama Aissata", quantity: 1, price: 8500 },
      { title: "Beurre de karite brut", seller: "Tata Ngozi", quantity: 1, price: 6500 },
    ],
  },
  {
    id: "CMD-2026-1047",
    role: "buyer",
    date: "2026-06-08",
    status: "delivered",
    total: 12000,
    items: [{ title: "Ebook Atlas plantes", seller: "Dr. Amina", quantity: 1, price: 12000 }],
  },
  {
    id: "CMD-2026-1039",
    role: "seller",
    date: "2026-06-03",
    status: "preparing",
    total: 25000,
    items: [{ title: "Consultation phytotherapie diabete", seller: "Vous", quantity: 1, price: 25000 }],
  },
];
