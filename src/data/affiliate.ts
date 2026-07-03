import type { AffiliateEarning, AffiliateNode } from "@/types";

export const affiliateProfile = {
  code: "ISSANIWO",
  link: "https://iwosan.com/inscription?ref=ISSANIWO",
  clicks: 428,
  conversionRate: 18,
};

export const affiliateTree: AffiliateNode = {
  id: "me",
  name: "Issa K.",
  level: 0,
  joinedAt: "2025-11-04",
  active: true,
  commissions: 184500,
  children: [
    {
      id: "n1-awa",
      name: "Awa D.",
      level: 1,
      joinedAt: "2026-01-14",
      active: true,
      commissions: 62300,
      children: [
        {
          id: "n2-yannick",
          name: "Yannick T.",
          level: 2,
          joinedAt: "2026-02-02",
          active: true,
          commissions: 18800,
          children: [
            {
              id: "n3-fatou",
              name: "Fatou N.",
              level: 3,
              joinedAt: "2026-03-09",
              active: true,
              commissions: 6200,
            },
          ],
        },
        {
          id: "n2-marc",
          name: "Marc L.",
          level: 2,
          joinedAt: "2026-02-18",
          active: false,
          commissions: 9400,
        },
      ],
    },
    {
      id: "n1-henriette",
      name: "Henriette B.",
      level: 1,
      joinedAt: "2026-01-28",
      active: true,
      commissions: 47700,
      children: [
        {
          id: "n2-kossi",
          name: "Kossi A.",
          level: 2,
          joinedAt: "2026-04-01",
          active: true,
          commissions: 12300,
        },
      ],
    },
    {
      id: "n1-rene",
      name: "Rene M.",
      level: 1,
      joinedAt: "2026-05-05",
      active: false,
      commissions: 5200,
    },
  ],
};

export const affiliateEarnings: AffiliateEarning[] = [
  {
    id: "aff-001",
    date: "2026-06-12",
    type: "direct_sale",
    amount: 22500,
    status: "paid",
    source: "Achat pack Pharmacophee",
  },
  {
    id: "aff-002",
    date: "2026-06-09",
    type: "level_2",
    amount: 9800,
    status: "pending",
    source: "Commande marketplace via Awa D.",
  },
  {
    id: "aff-003",
    date: "2026-06-02",
    type: "level_3",
    amount: 4200,
    status: "paid",
    source: "Formation achetee par reseau niveau 3",
  },
  {
    id: "aff-004",
    date: "2026-05-26",
    type: "direct_sale",
    amount: 18100,
    status: "paid",
    source: "Inscription praticien premium",
  },
];

export const affiliateLeaderboard = [
  { rank: 1, name: "Ami***", active: 42, earnings: 482000 },
  { rank: 2, name: "Kof***", active: 37, earnings: 416500 },
  { rank: 3, name: "Mar***", active: 31, earnings: 352200 },
  { rank: 4, name: "Iss***", active: 24, earnings: 284900 },
  { rank: 5, name: "Fat***", active: 21, earnings: 241300 },
];
