import { PrismaClient, Role, KycStatus, MedCategory, ProductType, ArticleSpace, EventType, FormationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const passwordHash = await bcrypt.hash('Admin@123', 12);

const countries = ['Benin', 'Senegal', 'Cote d Ivoire', 'Cameroun', 'Ghana', 'Mali', 'Togo', 'RDC', 'Maroc', 'Nigeria'];

async function main() {
  await prisma.$transaction([
    prisma.ticketMessage.deleteMany(),
    prisma.ticket.deleteMany(),
    prisma.message.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.walletTransaction.deleteMany(),
    prisma.commission.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.mLMNode.deleteMany(),
    prisma.eventRegistration.deleteMany(),
    prisma.event.deleteMany(),
    prisma.formation.deleteMany(),
    prisma.report.deleteMany(),
    prisma.vote.deleteMany(),
    prisma.forumComment.deleteMany(),
    prisma.answer.deleteMany(),
    prisma.question.deleteMany(),
    prisma.article.deleteMany(),
    prisma.plantMonograph.deleteMany(),
    prisma.bid.deleteMany(),
    prisma.review.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.professionalProfile.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.emailVerificationToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.siteConfig.deleteMany(),
    prisma.adSpace.deleteMany(),
    prisma.homeBanner.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@iwosan.com',
      passwordHash,
      role: Role.ADMIN,
      firstName: 'Admin',
      lastName: 'Iwosan',
      country: 'Benin',
      isEmailVerified: true,
      kycStatus: KycStatus.VERIFIED,
      referralCode: 'IWOSANADMIN',
      mlmNode: { create: { affiliateCode: 'IWOSANADMIN', level: 0 } },
      subscription: { create: { plan: 'EXPERT', price: 0, startDate: new Date(), maxListings: 999, maxDownloads: 999 } },
    },
  });

  const users = [];
  for (let index = 1; index <= 10; index += 1) {
    users.push(
      await prisma.user.create({
        data: {
          email: `user${index}@iwosan.com`,
          passwordHash,
          firstName: `Utilisateur${index}`,
          lastName: 'Iwosan',
          country: countries[index - 1],
          isEmailVerified: index % 2 === 0,
          kycStatus: index % 3 === 0 ? KycStatus.SUBMITTED : index % 2 === 0 ? KycStatus.VERIFIED : KycStatus.PENDING,
          referralCode: `USER${index}IWO`,
          referredById: admin.id,
          walletBalance: 50000,
          mlmNode: { create: { affiliateCode: `USER${index}IWO`, level: 1, parent: { connect: { userId: admin.id } } } },
          subscription: { create: { plan: 'FREE', price: 0, startDate: new Date() } },
        },
      }),
    );
  }

  const researcher = await prisma.user.create({
    data: {
      email: 'researcher@iwosan.com',
      passwordHash,
      role: Role.RESEARCHER,
      firstName: 'Amina',
      lastName: 'Diop',
      country: 'Senegal',
      isEmailVerified: true,
      kycStatus: KycStatus.VERIFIED,
      referralCode: 'RESEARCHIWO',
      mlmNode: { create: { affiliateCode: 'RESEARCHIWO', level: 1, parent: { connect: { userId: admin.id } } } },
    },
  });

  const professionals = [];
  const specialties = ['Pharmacopée yoruba', 'Massage therapeutique', 'Savoirs peuls', 'Herboristerie sahelienne', 'Rites et soins communautaires'];
  for (let index = 1; index <= 5; index += 1) {
    const professional = await prisma.user.create({
      data: {
        email: `pro${index}@iwosan.com`,
        passwordHash,
        role: Role.PROFESSIONAL,
        firstName: `Praticien${index}`,
        lastName: 'Iwosan',
        country: countries[index + 2],
        isEmailVerified: true,
        kycStatus: KycStatus.VERIFIED,
        referralCode: `PRO${index}IWO`,
        referredById: users[index - 1].id,
        walletBalance: 125000,
        mlmNode: { create: { affiliateCode: `PRO${index}IWO`, level: 2, parent: { connect: { userId: users[index - 1].id } } } },
        professionalProfile: {
          create: {
            displayName: `Cabinet Iwosan ${index}`,
            specialty: [specialties[index - 1]],
            biography: `Parcours de transmission familiale et communautaire autour de ${specialties[index - 1]}.`,
            initiationPath: 'Apprentissage aupres des anciens, terrain rural et consultations accompagnees.',
            innovations: 'Documentation des preparations et suivi structure des consultations.',
            communityImpact: 'Ateliers locaux, accompagnement familial et prevention de proximite.',
            philosophy: 'Respect du vivant, prudence therapeutique et dialogue avec la medecine moderne.',
            location: countries[index + 2],
            latitude: 6 + index,
            longitude: 2 + index,
            isVerified: true,
            verifiedAt: new Date(),
            photos: [`https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop`],
            averageRating: 4.2 + index / 10,
            totalReviews: 8 + index,
            serviceBookingEnabled: true,
          },
        },
        subscription: { create: { plan: index > 3 ? 'PRO' : 'BASIC', price: index > 3 ? 25000 : 10000, startDate: new Date(), maxListings: 25, maxDownloads: 50 } },
      },
    });
    professionals.push(professional);
  }

  const categoryValues = Object.values(MedCategory);
  for (let index = 0; index < 20; index += 1) {
    await prisma.product.create({
      data: {
        sellerId: professionals[index % professionals.length].id,
        title: `Preparation traditionnelle ${index + 1}`,
        slug: `preparation-traditionnelle-${index + 1}`,
        description: 'Produit documente par un professionnel verifie, avec conseils d usage et precautions.',
        price: 2500 + index * 850,
        category: categoryValues[index % categoryValues.length],
        type: index % 3 === 0 ? ProductType.DIGITAL : index % 3 === 1 ? ProductType.PHYSICAL : ProductType.SERVICE,
        images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop'],
        stock: 20 + index,
        isApproved: true,
        isActive: true,
        isFeatured: index < 4,
        auctionEnabled: index === 0,
        auctionEndDate: index === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
      },
    });
  }

  const plants = ['Moringa oleifera', 'Combretum micranthum', 'Azadirachta indica', 'Adansonia digitata', 'Hibiscus sabdariffa'];
  for (const plant of plants) {
    await prisma.plantMonograph.create({
      data: {
        scientificName: plant,
        vernacularNames: { fr: [plant.split(' ')[0]], en: [plant.split(' ')[0]] },
        botanicalDescription: 'Description botanique synthetique avec habitat, feuilles, fleurs et usages connus.',
        activeCompounds: 'Polyphenols, flavonoides, mineraux et composes bioactifs documentes.',
        therapeuticIndications: 'Usages traditionnels de soutien, a encadrer par un professionnel qualifie.',
        dosage: 'Dosage indicatif a adapter selon le contexte, l age et les contre-indications.',
        contraindications: 'Grossesse, allaitement, allergies connues ou interactions medicamenteuses possibles.',
        preparationMethods: 'Infusion, decoction ou poudre selon la partie utilisee.',
        fieldPhotos: [],
        createdById: researcher.id,
        isPublished: true,
      },
    });
  }

  for (let index = 1; index <= 10; index += 1) {
    await prisma.article.create({
      data: {
        authorId: index % 2 === 0 ? admin.id : professionals[index % professionals.length].id,
        space: Object.values(ArticleSpace)[index % 4],
        title: `Article Iwosan ${index}`,
        slug: `article-iwosan-${index}`,
        content: 'Contenu editorial long sur les savoirs endogenes, la prevention et les pratiques culturelles.',
        category: 'Transmission',
        tags: ['iwosan', 'savoirs'],
        isApproved: true,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  for (let index = 1; index <= 5; index += 1) {
    const question = await prisma.question.create({
      data: { authorId: users[index].id, title: `Question sante communautaire ${index}`, content: 'Comment mieux documenter cette pratique ?', category: 'General', tags: ['discussion'], attachments: [] },
    });
    await prisma.answer.create({ data: { questionId: question.id, authorId: professionals[index % professionals.length].id, content: 'Reponse prudente avec orientation vers un professionnel verifie.', attachments: [], voteCount: 3 } });
    await prisma.vote.create({ data: { userId: users[0].id, targetId: question.id, targetType: 'QUESTION', value: 1 } });
  }

  await prisma.event.createMany({
    data: [
      { title: 'Webinar pharmacopée', description: 'Session en ligne.', type: EventType.WEBINAR, startDate: new Date(), endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), isOnline: true, createdById: admin.id, isPublished: true },
      { title: 'Formation documentation', description: 'Atelier pratique.', type: EventType.FORMATION, startDate: new Date(), endDate: new Date(Date.now() + 4 * 60 * 60 * 1000), location: 'Cotonou', createdById: professionals[0].id, isPublished: true },
      { title: 'Salon Iwosan', description: 'Rencontre panafricaine.', type: EventType.SALON, startDate: new Date(), endDate: new Date(Date.now() + 8 * 60 * 60 * 1000), location: 'Dakar', createdById: admin.id, isPublished: true },
    ],
  });

  await prisma.formation.createMany({
    data: [
      { title: 'Video initiation', type: FormationType.VIDEO, fileUrl: 'https://example.com/video.mp4', category: 'Video', tags: ['video'], createdById: admin.id, isPublished: true },
      { title: 'Guide PDF', type: FormationType.DOCUMENT, fileUrl: 'https://example.com/guide.pdf', category: 'Document', tags: ['pdf'], createdById: admin.id, isPublished: true },
      { title: 'Catalogue plantes', type: FormationType.CATALOGUE, fileUrl: 'https://example.com/catalogue.pdf', category: 'Catalogue', tags: ['catalogue'], createdById: admin.id, isPublished: true },
    ],
  });

  await prisma.homeBanner.create({ data: { imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1600&auto=format&fit=crop', title: 'Iwosan', order: 1 } });
  await prisma.siteConfig.createMany({
    data: [
      { key: 'site.title', value: 'Iwosan', updatedById: admin.id },
      { key: 'site.defaultLanguage', value: 'fr', updatedById: admin.id },
      { key: 'commission.globalRate', value: '0.10', updatedById: admin.id },
      { key: 'subscription.FREE', value: JSON.stringify({ maxListings: 5, maxDownloads: 10 }), updatedById: admin.id },
      { key: 'subscription.BASIC', value: JSON.stringify({ price: 10000, maxListings: 25, maxDownloads: 50 }), updatedById: admin.id },
      { key: 'subscription.PRO', value: JSON.stringify({ price: 25000, maxListings: 100, maxDownloads: 200 }), updatedById: admin.id },
      { key: 'subscription.EXPERT', value: JSON.stringify({ price: 50000, maxListings: 999, maxDownloads: 999 }), updatedById: admin.id },
    ],
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
