import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  AdminSubRole,
  EscrowStatus,
  KycStatus,
  MedCategory,
  OrderStatus,
  PrismaClient,
  ProductType,
  Role,
  SubscriptionPlan,
} from "@prisma/client";

const prisma = new PrismaClient();

const password = process.env.RBAC_TEST_PASSWORD || "Iwosan@2026!";
const hashPassword = (value: string) => bcrypt.hash(value, 12);

type RbacAccount = {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  adminSubRole?: AdminSubRole | null;
  isResearcher?: boolean;
  country?: string;
  avatarUrl?: string;
};

const accounts: RbacAccount[] = [
  {
    email: process.env.SUPER_ADMIN_EMAIL || "super.admin@iwosan.com",
    firstName: "Super",
    lastName: "Admin",
    role: Role.SUPER_ADMIN,
  },
  { email: "admin1@iwosan.com", firstName: "Amina", lastName: "Admin", role: Role.ADMIN },
  { email: "admin2@iwosan.com", firstName: "Koffi", lastName: "Admin", role: Role.ADMIN },
  {
    email: "moderator@iwosan.com",
    firstName: "Mariam",
    lastName: "Moderation",
    role: Role.MODERATOR,
    adminSubRole: AdminSubRole.MODERATOR,
  },
  {
    email: "editor@iwosan.com",
    firstName: "Nadine",
    lastName: "Edition",
    role: Role.EDITOR,
    adminSubRole: AdminSubRole.EDITOR,
  },
  { email: "pro1@iwosan.com", firstName: "Fatou", lastName: "Therapeute", role: Role.PROFESSIONAL, country: "SN" },
  { email: "pro2@iwosan.com", firstName: "Jean", lastName: "Praticien", role: Role.PROFESSIONAL, country: "BJ" },
  { email: "pro3@iwosan.com", firstName: "Akosua", lastName: "Naturopathe", role: Role.PROFESSIONAL, country: "GH" },
  {
    email: "researcher@iwosan.com",
    firstName: "Cheikh",
    lastName: "Recherche",
    role: Role.RESEARCHER,
    isResearcher: true,
  },
  { email: "user1@iwosan.com", firstName: "Awa", lastName: "Client", role: Role.USER },
  { email: "user2@iwosan.com", firstName: "Marc", lastName: "Client", role: Role.USER },
  { email: "user3@iwosan.com", firstName: "Henriette", lastName: "Client", role: Role.USER },
  { email: "user4@iwosan.com", firstName: "Issa", lastName: "Client", role: Role.USER },
  { email: "user5@iwosan.com", firstName: "Dina", lastName: "Client", role: Role.USER },
];

const referralCodeFor = (email: string) =>
  `RBAC${email
    .split("@")[0]
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 18)}`;

const avatarFor = (email: string) => `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`;

const proPhotos = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80&auto=format&fit=crop",
];

const ensureAccount = async (account: RbacAccount, passwordHash: string) => {
  const avatarUrl = account.avatarUrl ?? avatarFor(account.email);
  const user = await prisma.user.upsert({
    where: { email: account.email },
    update: {
      passwordHash,
      role: account.role,
      adminSubRole: account.adminSubRole ?? null,
      isResearcher: account.isResearcher ?? account.role === Role.RESEARCHER,
      firstName: account.firstName,
      lastName: account.lastName,
      avatarUrl,
      country: account.country ?? "BJ",
      isEmailVerified: true,
      kycStatus: account.role === Role.USER || account.role === Role.RESEARCHER ? KycStatus.PENDING : KycStatus.VERIFIED,
      isActive: true,
      isBanned: false,
      banReason: null,
      banExpiresAt: null,
    },
    create: {
      email: account.email,
      passwordHash,
      role: account.role,
      adminSubRole: account.adminSubRole ?? null,
      isResearcher: account.isResearcher ?? account.role === Role.RESEARCHER,
      firstName: account.firstName,
      lastName: account.lastName,
      avatarUrl,
      country: account.country ?? "BJ",
      language: "fr",
      isEmailVerified: true,
      kycStatus: account.role === Role.USER || account.role === Role.RESEARCHER ? KycStatus.PENDING : KycStatus.VERIFIED,
      referralCode: referralCodeFor(account.email),
    },
  });

  await prisma.mLMNode.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      level: 0,
      affiliateCode: user.referralCode,
    },
  });

  if (account.role === Role.PROFESSIONAL) {
    const professionalPhotos = [avatarUrl, ...proPhotos];
    await prisma.professionalProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: `${account.firstName} ${account.lastName}`,
        isVerified: true,
        verifiedAt: new Date(),
        photos: professionalPhotos,
      },
      create: {
        userId: user.id,
        displayName: `${account.firstName} ${account.lastName}`,
        specialty: ["Phytotherapie", "Bien-etre naturel"],
        biography: "Compte professionnel de test RBAC Iwosan.",
        location: account.country ?? "BJ",
        photos: professionalPhotos,
        isVerified: true,
        verifiedAt: new Date(),
        serviceBookingEnabled: true,
      },
    });

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: SubscriptionPlan.PRO,
        price: "15000",
        isActive: true,
        maxListings: 50,
        maxDownloads: 100,
      },
      create: {
        userId: user.id,
        plan: SubscriptionPlan.PRO,
        price: "15000",
        startDate: new Date(),
        isActive: true,
        maxListings: 50,
        maxDownloads: 100,
      },
    });
  }

  return user;
};

const main = async () => {
  const passwordHash = await hashPassword(process.env.SUPER_ADMIN_PASSWORD || password);
  const created = [];
  const users = new Map<string, Awaited<ReturnType<typeof ensureAccount>>>();

  for (const account of accounts) {
    const accountPasswordHash =
      account.role === Role.SUPER_ADMIN ? passwordHash : await hashPassword(password);
    const user = await ensureAccount(account, accountPasswordHash);
    users.set(account.email, user);
    created.push({ email: user.email, role: user.role });
  }

  const pro1 = users.get("pro1@iwosan.com");
  const pro2 = users.get("pro2@iwosan.com");
  const user1 = users.get("user1@iwosan.com");
  const user2 = users.get("user2@iwosan.com");
  const researcher = users.get("researcher@iwosan.com");

  if (pro1 && pro2 && user1 && user2 && researcher) {
    const product1 = await prisma.product.upsert({
      where: { slug: "rbac-tisane-post-partum" },
      update: {
        sellerId: pro1.id,
        images: ["https://images.unsplash.com/photo-1597318181409-cf64d0b9d3d2?w=900&q=80&auto=format&fit=crop"],
        isApproved: true,
        isActive: true,
      },
      create: {
        sellerId: pro1.id,
        title: "Tisane post-partum RBAC",
        slug: "rbac-tisane-post-partum",
        description: "Produit de test lie au compte professionnel pro1.",
        price: "8500",
        category: MedCategory.GYNECO_OBSTETRIQUE,
        type: ProductType.PHYSICAL,
        images: ["https://images.unsplash.com/photo-1597318181409-cf64d0b9d3d2?w=900&q=80&auto=format&fit=crop"],
        stock: 25,
        isApproved: true,
        isActive: true,
      },
    });

    await prisma.product.upsert({
      where: { slug: "rbac-baume-karite" },
      update: {
        sellerId: pro2.id,
        images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900&q=80&auto=format&fit=crop"],
        isApproved: true,
        isActive: true,
      },
      create: {
        sellerId: pro2.id,
        title: "Baume karite RBAC",
        slug: "rbac-baume-karite",
        description: "Produit de test lie au compte professionnel pro2.",
        price: "6500",
        category: MedCategory.AFFECTIONS_CUTANEES,
        type: ProductType.PHYSICAL,
        images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900&q=80&auto=format&fit=crop"],
        stock: 40,
        isApproved: true,
        isActive: true,
      },
    });

    const existingOrder = await prisma.order.findFirst({
      where: { buyerId: user1.id, sellerId: pro1.id, productId: product1.id },
      select: { id: true },
    });
    if (!existingOrder) {
      await prisma.order.create({
        data: {
          buyerId: user1.id,
          sellerId: pro1.id,
          productId: product1.id,
          quantity: 1,
          unitPrice: "8500",
          totalAmount: "8500",
          commissionAmount: "850",
          status: OrderStatus.PAID,
          escrowStatus: EscrowStatus.HELD,
          paymentMethod: "wallet",
        },
      });
    }

    const ensureMessage = async (senderId: string, receiverId: string, content: string, isRead = false) => {
      const exists = await prisma.message.findFirst({ where: { senderId, receiverId, content } });
      if (!exists) {
        await prisma.message.create({ data: { senderId, receiverId, content, isRead, attachments: [] } });
      }
    };

    await ensureMessage(user1.id, pro1.id, "[RBAC] Bonjour, la tisane est-elle disponible cette semaine ?", true);
    await ensureMessage(pro1.id, user1.id, "[RBAC] Oui, elle est disponible. Je peux expedier demain matin.");
    await ensureMessage(researcher.id, pro2.id, "[RBAC] Bonjour, puis-je recevoir la fiche de composition du baume ?", true);
    await ensureMessage(pro2.id, researcher.id, "[RBAC] Bien sur, je vous envoie les details dans la journee.");
    await ensureMessage(user2.id, pro1.id, "[RBAC] Merci pour votre accompagnement, je souhaite reprendre rendez-vous.");

    const ensureNotification = async (userId: string, title: string, message: string, link: string, type = "NEW_MESSAGE") => {
      const exists = await prisma.notification.findFirst({ where: { userId, title, message, link } });
      if (!exists) {
        await prisma.notification.create({ data: { userId, title, message, link, type, isRead: false } });
      }
    };

    await ensureNotification(pro1.id, "Nouveau message", "Un client vous a contacte au sujet de la tisane.", `/messages/${user1.id}`);
    await ensureNotification(user1.id, "Commande payee", "Votre commande RBAC est enregistree.", "/tableau-de-bord/commandes", "ORDER");
    await ensureNotification(researcher.id, "Message professionnel", "Un praticien vous a repondu.", `/messages/${pro2.id}`);
    await ensureNotification(pro2.id, "Demande chercheur", "Un chercheur demande une fiche de composition.", `/messages/${researcher.id}`);
  }

  console.table(
    created.map((account) => ({
      email: account.email,
      role: account.role,
      password:
        account.role === Role.SUPER_ADMIN && process.env.SUPER_ADMIN_PASSWORD
          ? "SUPER_ADMIN_PASSWORD env"
          : password,
    })),
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
