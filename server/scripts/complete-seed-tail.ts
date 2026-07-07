import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const requireUser = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`Required seed user missing: ${email}`);
  }
  return user;
};

try {
  const admin = await requireUser("admin@iwosan.com");
  const user1 = await requireUser("user1@iwosan.com");
  const user2 = await requireUser("user2@iwosan.com");
  const pro1 = await requireUser("pro1@iwosan.com");
  const pro2 = await requireUser("pro2@iwosan.com");

  const subscribers = [
    { email: "contact@sante-afrique.org", isActive: true },
    { email: "info@phytoafrica.net", isActive: true },
    { email: "docteur.kofi@gmail.com", isActive: true },
    { email: "recherche@uac.bj", isActive: true },
    { email: "aminata.wellness@gmail.com", isActive: false },
  ];

  for (const subscriber of subscribers) {
    await prisma.newsletterSubscriber.upsert({
      where: { email: subscriber.email },
      update: {
        isActive: subscriber.isActive,
        unsubscribedAt: subscriber.isActive ? null : new Date(),
      },
      create: {
        email: subscriber.email,
        unsubscribeToken: randomUUID(),
        isActive: subscriber.isActive,
        unsubscribedAt: subscriber.isActive ? null : new Date(),
      },
    });
  }

  const existingMessages = await prisma.message.count({
    where: {
      OR: [
        { senderId: user1.id, receiverId: pro1.id },
        { senderId: pro1.id, receiverId: user1.id },
        { senderId: user2.id, receiverId: pro2.id },
      ],
    },
  });

  if (existingMessages === 0) {
    await prisma.message.createMany({
      data: [
        {
          senderId: user1.id,
          receiverId: pro1.id,
          content:
            "Bonjour Maitre Mensah, j'ai une question concernant la preparation au Moringa pour mon enfant de 3 ans. Est-ce adapte a son age ?",
          isRead: true,
        },
        {
          senderId: pro1.id,
          receiverId: user1.id,
          content:
            "Bonjour, merci pour votre question. Pour un enfant de 3 ans, une tres petite dose est possible, mais je vous recommande d'abord une consultation.",
          isRead: false,
        },
        {
          senderId: user2.id,
          receiverId: pro2.id,
          content:
            "Je suis interessee par votre programme d'accompagnement post-partum. Pouvez-vous me donner plus d'informations ?",
          isRead: true,
        },
      ],
    });
  }

  const bannerCount = await prisma.homeBanner.count();
  if (bannerCount === 0) {
    await prisma.homeBanner.createMany({
      data: [
        {
          imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1600",
          title: "Iwosan - Les Savoirs Africains au Service de Votre Sante",
          link: "/marketplace",
          order: 1,
          isActive: true,
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600",
          title: "Decouvrez notre Pharmacopee Vivante",
          link: "/pharmacopee",
          order: 2,
          isActive: true,
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?q=80&w=1600",
          title: "1er Salon Iwosan - Dakar 2026",
          link: "/evenements",
          order: 3,
          isActive: true,
        },
      ],
    });
  }

  const config = [
    { key: "site.title", value: "Iwosan" },
    { key: "site.tagline", value: "Les savoirs africains au service de votre sante" },
    { key: "site.defaultLanguage", value: "fr" },
    { key: "site.supportedLanguages", value: JSON.stringify(["fr", "en", "ar"]) },
    { key: "commission.globalRate", value: "0.10" },
    { key: "commission.mlmLevel1", value: "0.05" },
    { key: "commission.mlmLevel2", value: "0.03" },
    { key: "commission.mlmLevel3", value: "0.02" },
    { key: "subscription.FREE", value: JSON.stringify({ maxListings: 5, maxDownloads: 10, price: 0 }) },
    { key: "subscription.BASIC", value: JSON.stringify({ maxListings: 25, maxDownloads: 50, price: 10000 }) },
    { key: "subscription.PRO", value: JSON.stringify({ maxListings: 100, maxDownloads: 200, price: 25000 }) },
    { key: "subscription.EXPERT", value: JSON.stringify({ maxListings: 9999, maxDownloads: 9999, price: 50000 }) },
    { key: "site.maintenanceMode", value: "false" },
    { key: "site.allowRegistration", value: "true" },
  ];

  for (const item of config) {
    await prisma.siteConfig.upsert({
      where: { key: item.key },
      update: { value: item.value, updatedById: admin.id },
      create: { ...item, updatedById: admin.id },
    });
  }

  const adCount = await prisma.adSpace.count();
  if (adCount === 0) {
    await prisma.adSpace.createMany({
      data: [
        { name: "Banniere Header", position: "header", code: "<!-- AdSpace Header -->", isActive: false },
        { name: "Sidebar Droite", position: "sidebar-right", code: "<!-- AdSpace Sidebar -->", isActive: false },
        { name: "Entre Articles", position: "between-articles", code: "<!-- AdSpace Articles -->", isActive: false },
      ],
    });
  }

  console.log("Seed tail completed.");
} finally {
  await prisma.$disconnect();
}
