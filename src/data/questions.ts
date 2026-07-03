import type { Question } from "@/types";

export const forumCategories = [
  {
    name: "Pharmacopee",
    children: ["Plantes africaines", "Preparation", "Conservation"],
  },
  {
    name: "Sante familiale",
    children: ["Grossesse", "Enfance", "Nutrition"],
  },
  {
    name: "Soins du corps",
    children: ["Peau", "Cheveux", "Qualite produit"],
  },
  {
    name: "Douleurs et mobilite",
    children: ["Articulations", "Inflammation", "Recuperation"],
  },
];

export const questions: Question[] = [
  {
    id: "q1",
    title: "Quelle posologie de kinkeliba pour un foie fatigue chez un adulte ?",
    excerpt:
      "Bonjour, j'ai des transaminases elevees suite a un traitement. On m'a recommande le kinkeliba, mais a quelle dose et combien de temps ?",
    body:
      "<p>Bonjour a tous. Apres un traitement medical recent, mes analyses montrent des transaminases elevees. Dans ma famille on utilise souvent le kinkeliba en infusion pour soutenir le foie.</p><p>Je cherche une approche prudente : quantite de feuilles, frequence, duree maximale, et signes qui doivent pousser a arreter.</p>",
    category: "Pharmacopee",
    subcategory: "Plantes africaines",
    tags: ["kinkeliba", "foie", "posologie"],
    votes: 24,
    answers: 5,
    views: 412,
    resolved: true,
    featured: true,
    followed: true,
    authorName: "Issa K.",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80",
    authorReputation: 640,
    date: "2026-06-14T09:15:00Z",
    attachments: [
      {
        id: "att-q1-1",
        type: "image",
        name: "feuilles-kinkeliba.jpg",
        url: "https://images.unsplash.com/photo-1515446134809-993c501ca304?w=900&q=80",
      },
      {
        id: "att-q1-2",
        type: "file",
        name: "resultats-anonymises.pdf",
        url: "#",
      },
    ],
    answerItems: [
      {
        id: "a1",
        body:
          "Sur un adulte, je conseille de rester sur une infusion legere et courte, surtout avec des analyses perturbees. Faites valider avec le medecin qui suit le traitement, car certaines plantes peuvent modifier le metabolisme hepatique.",
        authorName: "Dr. Amina T.",
        authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&q=80",
        authorReputation: 2840,
        date: "2026-06-14T10:10:00Z",
        votes: 18,
        accepted: true,
        comments: [
          {
            id: "c1",
            authorName: "Issa K.",
            content: "Merci, je vais demander l'avis du medecin avant de commencer.",
            date: "2026-06-14T11:30:00Z",
          },
        ],
      },
      {
        id: "a2",
        body:
          "Dans mon village, on evite les cures longues. La qualite de sechage compte beaucoup : feuilles propres, seches a l'ombre, sans moisissure.",
        authorName: "Mama Aissata",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&q=80",
        authorReputation: 2210,
        date: "2026-06-14T12:20:00Z",
        votes: 9,
        accepted: false,
        comments: [],
      },
    ],
  },
  {
    id: "q2",
    title: "Moringa en poudre pendant la grossesse : prudence ou benefice ?",
    excerpt:
      "Ma belle-mere insiste pour que je prenne du moringa quotidiennement. Existe-t-il des contre-indications au premier trimestre ?",
    body:
      "<p>Je suis au premier trimestre. Je consommais deja du moringa avant la grossesse, mais je ne veux prendre aucun risque. Les avis de praticiens et sages-femmes m'interessent.</p>",
    category: "Sante familiale",
    subcategory: "Grossesse",
    tags: ["moringa", "grossesse", "securite"],
    votes: 38,
    answers: 7,
    views: 1024,
    resolved: true,
    featured: true,
    authorName: "Awa D.",
    authorAvatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&q=80",
    authorReputation: 410,
    date: "2026-06-12T16:20:00Z",
    answerItems: [
      {
        id: "a3",
        body:
          "Pendant la grossesse, la moderation et le suivi prenatal priment. Il faut distinguer feuilles alimentaires, poudre concentree et extraits. Evitez les doses fortes sans avis professionnel.",
        authorName: "Sage-femme Mireille",
        authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&q=80",
        authorReputation: 1980,
        date: "2026-06-12T17:45:00Z",
        votes: 22,
        accepted: true,
        comments: [],
      },
    ],
  },
  {
    id: "q3",
    title: "Reconnaitre un vrai beurre de karite non raffine ?",
    excerpt:
      "Le marche est inonde de produits raffines vendus comme bruts. Quels criteres concrets pour ne pas se tromper ?",
    body:
      "<p>Je veux acheter du beurre de karite pour des soins de peau. Comment verifier l'odeur, la texture, la couleur et la conservation sans laboratoire ?</p>",
    category: "Soins du corps",
    subcategory: "Qualite produit",
    tags: ["karite", "qualite", "achat"],
    votes: 19,
    answers: 3,
    views: 287,
    resolved: false,
    authorName: "Marc L.",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&q=80",
    authorReputation: 260,
    date: "2026-06-10T12:30:00Z",
    attachments: [
      {
        id: "att-q3-1",
        type: "image",
        name: "texture-karite.jpg",
        url: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=900&q=80",
      },
    ],
    answerItems: [
      {
        id: "a4",
        body:
          "La couleur varie selon la region, donc elle ne suffit pas. Regardez surtout l'odeur naturelle, la fonte entre les doigts, l'absence de parfum ajoute et la confiance dans la filiere.",
        authorName: "Tata Ngozi",
        authorAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&q=80",
        authorReputation: 1120,
        date: "2026-06-10T14:00:00Z",
        votes: 11,
        accepted: false,
        comments: [
          {
            id: "c2",
            authorName: "Marc L.",
            content: "Tres utile, merci. Je vais demander l'origine exacte au vendeur.",
            date: "2026-06-10T15:05:00Z",
          },
        ],
      },
    ],
  },
  {
    id: "q4",
    title: "Plantes recommandees contre l'arthrose du genou ?",
    excerpt:
      "Je cherche des alternatives complementaires aux anti-inflammatoires classiques. Quelles plantes africaines documentees ?",
    body:
      "<p>Douleurs chroniques du genou chez ma mere. Elle suit deja son medecin, mais souhaite des soins complementaires serieux et non agressifs.</p>",
    category: "Douleurs et mobilite",
    subcategory: "Articulations",
    tags: ["arthrose", "anti-inflammatoire", "douleur"],
    votes: 31,
    answers: 6,
    views: 654,
    resolved: true,
    authorName: "Henriette B.",
    authorAvatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=160&q=80",
    authorReputation: 720,
    date: "2026-06-08T08:45:00Z",
    answerItems: [
      {
        id: "a5",
        body:
          "Les cataplasmes et massages peuvent aider, mais le diagnostic de l'arthrose doit guider le choix. Attention aux plantes irritantes sur peau fragile.",
        authorName: "Baba Sadio",
        authorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&q=80",
        authorReputation: 1450,
        date: "2026-06-08T09:30:00Z",
        votes: 13,
        accepted: true,
        comments: [],
      },
    ],
  },
  {
    id: "q5",
    title: "Comment conserver une decoction maison sans perdre les principes actifs ?",
    excerpt:
      "Preparation 1L de decoction le matin : combien de temps reste-t-elle efficace, et faut-il la refrigerer ?",
    body:
      "<p>Je prepare souvent une decoction le matin pour la journee. Je voudrais eviter la contamination et la perte d'efficacite.</p>",
    category: "Pharmacopee",
    subcategory: "Conservation",
    tags: ["conservation", "decoction", "hygiene"],
    votes: 12,
    answers: 0,
    views: 198,
    resolved: false,
    authorName: "Yannick T.",
    authorAvatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=160&q=80",
    authorReputation: 180,
    date: "2026-06-06T19:10:00Z",
    answerItems: [],
  },
  {
    id: "q6",
    title: "Neem et peau acneique : usage externe seulement ?",
    excerpt:
      "Je vois des conseils contradictoires sur le neem. Pour une peau acneique, vaut-il mieux eviter l'usage interne ?",
    body:
      "<p>Je cherche une routine simple et prudente pour une adolescente. Je veux eviter les recettes trop agressives.</p>",
    category: "Soins du corps",
    subcategory: "Peau",
    tags: ["neem", "acne", "peau"],
    votes: 8,
    answers: 1,
    views: 141,
    resolved: false,
    closed: false,
    authorName: "Fatou N.",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80",
    authorReputation: 95,
    date: "2026-06-15T07:45:00Z",
    answerItems: [
      {
        id: "a6",
        body:
          "Pour une adolescente, je commencerais par un usage externe tres dilue et un test sur petite zone. L'usage interne doit etre encadre.",
        authorName: "Dr. Kwame M.",
        authorAvatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=160&q=80",
        authorReputation: 1980,
        date: "2026-06-15T08:20:00Z",
        votes: 6,
        accepted: false,
        comments: [],
      },
    ],
  },
];
