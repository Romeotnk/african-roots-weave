import {
  PrismaClient,
  Role,
  KycStatus,
  MedCategory,
  ProductType,
  ArticleSpace,
  EventType,
  FormationType,
  OrderStatus,
  EscrowStatus,
  SubscriptionPlan,
  CommissionType,
  CommissionStatus,
  TransactionType,
  TicketStatus,
  ReportStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();
const passwordHash = await bcrypt.hash("Admin@123", 12);

// ─────────────────────────────────────
// 🌍 DONNÉES RÉALISTES AFRICAINES
// ─────────────────────────────────────

const countries = [
  "Bénin", "Sénégal", "Côte d'Ivoire", "Cameroun", "Ghana",
  "Mali", "Togo", "RDC", "Maroc", "Nigeria", "Burkina Faso", "Guinée",
];

const firstNames = [
  "Kofi", "Aminata", "Kwame", "Fatoumata", "Seydou", "Aïssatou",
  "Moussa", "Mariama", "Ibrahim", "Rokiatou", "Cheikh", "Bintou",
  "Oumar", "Kadiatou", "Mamadou", "Oumou", "Lamine", "Hawa",
];

const lastNames = [
  "Diop", "Konaté", "Traoré", "Coulibaly", "Diallo", "Sow",
  "Touré", "Bah", "Camara", "Sylla", "Barry", "Baldé",
  "N'Gom", "Cissé", "Keita", "Kouyaté", "Ouédraogo", "Zongo",
];

// ─────────────────────────────────────
// 🌿 PLANTES MÉDICINALES AFRICAINES
// ─────────────────────────────────────

const plantsData = [
  {
    scientificName: "Moringa oleifera",
    vernacularNames: {
      fr: ["Moringa", "Arbre de vie", "Nebeday"],
      en: ["Moringa", "Drumstick tree"],
      local: ["Gawara (Hausa)", "Kpashima (Yoruba)"],
    },
    botanicalDescription:
      "Arbre à croissance rapide de la famille des Moringaceae, pouvant atteindre 12 mètres. " +
      "Feuilles composées tripennées d'un vert brillant. Fleurs blanches à crème, odorantes. " +
      "Originaire du sous-continent indien, naturalisé dans toute l'Afrique tropicale. " +
      "Très résistant à la sécheresse grâce à ses racines tubéreuses.",
    activeCompounds:
      "Isothiocyanates (moringin), glucosinolates, quercétine, kaempférol, acide chlorogénique, " +
      "vitamines A, C, E, fer, calcium, potassium. Teneur en protéines remarquable (25-30% en poids sec).",
    therapeuticIndications:
      "Malnutrition et dénutrition infantile, anémie ferriprive, hypertension artérielle légère, " +
      "hyperglycémie modérée (diabète de type 2), inflammation chronique, insuffisance lactée, " +
      "déficiences immunitaires. Usage traditionnel documenté dans plus de 82 pays.",
    dosage:
      "Poudre de feuilles séchées : 1 à 2 cuillères à café (5-10g) par jour, mélangées à de la " +
      "nourriture ou diluées dans de l'eau. Infusion : 10g de feuilles fraîches pour 250ml d'eau bouillante, " +
      "laisser infuser 10 minutes, 2 tasses par jour. Durée maximale recommandée : 3 mois.",
    contraindications:
      "Grossesse (racines abortives à haute dose), allaitement (prudence sur les nourrissons), " +
      "hypothyroïdie (présence de thiocyanates), prise d'anticoagulants (interaction avec la vitamine K), " +
      "chirurgie prévue (effet hypotenseur). Éviter les racines et l'écorce chez l'enfant.",
    clinicalStudies:
      "Étude randomisée contrôlée (2019, Sénégal, n=120) montrant une réduction de 18% de la " +
      "glycémie à jeun après 3 mois de supplémentation. Méta-analyse Cochrane (2021) confirmant " +
      "l'efficacité sur les marqueurs nutritionnels chez l'enfant de moins de 5 ans.",
    drugInteractions:
      "Antidiabétiques oraux (risque d'hypoglycémie additive), antihypertenseurs (risque de " +
      "chute tensionnelle), lévothyroxine (réduction d'absorption), anticoagulants oraux.",
    preparationMethods:
      "1. Poudre : sécher les feuilles à l'ombre 3-5 jours, réduire en poudre fine, conserver " +
      "hermétiquement. 2. Infusion : feuilles fraîches ou séchées en tisane. 3. Décoction de " +
      "graines : 10 graines pour 1L d'eau, bouillir 20 min (usage purification d'eau). " +
      "4. Huile de graines : pression à froid pour usage cosmétique et alimentaire.",
    isPublished: true,
  },
  {
    scientificName: "Combretum micranthum",
    vernacularNames: {
      fr: ["Kinkeliba", "Kinkéliba"],
      en: ["Kinkeliba"],
      local: ["Kinkeliba (Wolof)", "Nakambe (Mooré)", "Dabileni (Bambara)"],
    },
    botanicalDescription:
      "Arbuste sarmenteux ou liane de la famille des Combretaceae, fréquent dans les savanes " +
      "soudano-sahéliennes. Feuilles opposées, elliptiques, légèrement coriaces, vert grisâtre. " +
      "Petites fleurs blanches en épis axillaires. Très répandu au Sénégal, Mali, Burkina Faso.",
    activeCompounds:
      "Vitexine, isovitexine, orientine, acide chlorogénique, flavonoïdes C-glycosylés, " +
      "tanins condensés, saponosides, mucilages. Teneur élevée en polyphénols antioxydants.",
    therapeuticIndications:
      "Cholagogue et cholérétique (stimulation biliaire), constipation chronique, dyslipidémies " +
      "légères, surpoids, infections urinaires légères, paludisme (usage traditionnel), " +
      "digestion difficile, ballonnements. Boisson quotidienne traditionnelle au Sénégal.",
    dosage:
      "Décoction : 30g de feuilles séchées pour 1 litre d'eau, bouillir 15-20 minutes, " +
      "filtrer, boire 2-3 tasses par jour avant les repas. Usage courant comme boisson de santé " +
      "quotidienne sans restriction de durée à doses normales.",
    contraindications:
      "Obstruction biliaire, lithiase biliaire symptomatique, hépatite aiguë. " +
      "Prudence en grossesse (effet sur la motricité intestinale). Déconseillé aux enfants " +
      "de moins de 6 ans sans avis médical.",
    clinicalStudies:
      "Étude pilote (Dakar, 2018, n=45) sur l'effet hypolipémiant : réduction de 12% du " +
      "LDL-cholestérol après 8 semaines. Usage traditionnel documenté depuis le XIXe siècle " +
      "par des explorateurs européens en Afrique de l'Ouest.",
    drugInteractions:
      "Anticoagulants (prudence), médicaments hépatotoxiques (potentialisation possible), " +
      "traitements de la lithiase biliaire (interaction mécanique).",
    preparationMethods:
      "Décoction classique : la méthode la plus répandue. Infusion légère pour usage quotidien. " +
      "Association fréquente avec le citron et le gingembre pour améliorer le goût et l'efficacité.",
    isPublished: true,
  },
  {
    scientificName: "Azadirachta indica",
    vernacularNames: {
      fr: ["Neem", "Margousier", "Lilas des Indes"],
      en: ["Neem tree", "Indian Lilac"],
      local: ["Dongoyaro (Hausa)", "Ekuemelu (Igbo)", "Eepin (Yoruba)"],
    },
    botanicalDescription:
      "Grand arbre de la famille des Meliaceae, pouvant atteindre 15-20 mètres. " +
      "Feuilles composées imparipennées, folioles dentées, persistantes. Fleurs blanches " +
      "odorantes en panicules axillaires. Fruits drupacés jaune-vert à maturité. " +
      "Extrêmement répandu dans toute l'Afrique subsaharienne.",
    activeCompounds:
      "Azadirachtine (principal limonoïde), mélantriol, nimbine, nimbidine, acide nimbioique, " +
      "quercétine, kaempférol, acides gras insaturés (huile de graines). " +
      "Plus de 70 composés bioactifs identifiés.",
    therapeuticIndications:
      "Antiparasitaire (gale, poux, parasites intestinaux), antifongique (candidose cutanée, " +
      "teigne), antibactérien, antipaludéen (usage traditionnel), soins dentaires (branches " +
      "comme cure-dents antibactériens), cicatrisant, anti-inflammatoire cutané.",
    dosage:
      "Décoction de feuilles : 50g pour 1L d'eau, bouillir 20 min, usage externe (bains, " +
      "compresses). Usage interne avec prudence : 10g de feuilles séchées en infusion, " +
      "maximum 2 semaines. Huile de graines : usage externe uniquement, 2-3 applications/jour.",
    contraindications:
      "Usage interne déconseillé en grossesse (effet abortif documenté), enfants de moins " +
      "de 12 ans (risque d'encéphalopathie à forte dose), insuffisance hépatique ou rénale. " +
      "L'huile pure ne doit jamais être ingérée.",
    clinicalStudies:
      "Nombreuses études in vitro et sur modèles animaux. Essai clinique (Nigeria, 2020) " +
      "sur l'efficacité en bain de bouche : réduction de 67% des bactéries cariogènes. " +
      "Méta-analyse 2022 sur les propriétés antiparasitaires cutanées.",
    drugInteractions:
      "Immunosuppresseurs (effets antagonistes possibles), antidiabétiques (potentialisation), " +
      "médicaments métabolisés par le CYP3A4.",
    preparationMethods:
      "Bain de feuilles fraîches pour usage externe. Poudre d'écorce pour usage dentaire. " +
      "Huile de graines par pression à froid. Pâte de feuilles écrasées pour application cutanée.",
    isPublished: true,
  },
  {
    scientificName: "Adansonia digitata",
    vernacularNames: {
      fr: ["Baobab", "Arbre du pain de singe"],
      en: ["Baobab", "Monkey bread tree"],
      local: ["Buye (Wolof)", "Bouy (Mandingue)", "Ose (Yoruba)"],
    },
    botanicalDescription:
      "Arbre majestueux de la famille des Malvaceae, pouvant vivre plus de 1000 ans et atteindre " +
      "25 mètres de hauteur pour 10 mètres de diamètre. Tronc massif et renflé, stockant des " +
      "centaines de litres d'eau. Feuilles palmées, caduques en saison sèche. " +
      "Grandes fleurs blanches pendantes s'ouvrant la nuit. Fruit ellipsoïde à pulpe farineuse.",
    activeCompounds:
      "Acide ascorbique (vitamine C, 10x l'orange), calcium, potassium, magnésium, phosphore, " +
      "fer, zinc, acides aminés essentiels, pectines, acide tartrique, acide citrique, " +
      "mucilages, tanins. Huile des graines riche en acides gras insaturés.",
    therapeuticIndications:
      "Scorbut et carence en vitamine C, diarrhées et gastro-entérites (pulpe astringente), " +
      "fièvre (effet antipyrétique de la pulpe), anémie, malnutrition, réhydratation orale, " +
      "soins cutanés (huile des graines), inflammations buccales (feuilles).",
    dosage:
      "Pulpe de fruit : 20-30g par jour dans de l'eau (boisson de réhydratation naturelle). " +
      "Poudre de pulpe : 1-2 cuillères à soupe par jour. Décoction de feuilles : " +
      "20g pour 500ml d'eau, 2 tasses par jour. Huile de graines : usage externe.",
    contraindications:
      "Aucune contre-indication majeure connue aux doses alimentaires. Prudence en cas de " +
      "syndrome de l'intestin irritable (teneur en fibres élevée). Allergie rare possible.",
    clinicalStudies:
      "Étude comparative (Malawi, 2019) : supplémentation en poudre de baobab vs placebo " +
      "sur 12 semaines, amélioration significative du statut en vitamine C chez les enfants " +
      "de 6-24 mois. Plusieurs études sur l'effet prébiotique des fibres de pulpe.",
    drugInteractions:
      "Peu d'interactions médicamenteuses documentées. Prudence avec les anticoagulants " +
      "(teneur en vitamine K des feuilles).",
    preparationMethods:
      "Jus de pulpe : diluer dans l'eau froide, filtrer. Poudre commerciale ou artisanale. " +
      "Décoction de feuilles fraîches ou séchées. Sauce de feuilles (usage alimentaire courant). " +
      "Huile de graines par pression à froid.",
    isPublished: true,
  },
  {
    scientificName: "Hibiscus sabdariffa",
    vernacularNames: {
      fr: ["Hibiscus", "Bissap", "Roselle", "Groseille de pays"],
      en: ["Roselle", "Sorrel", "Red sorrel"],
      local: ["Bissap (Wolof)", "Foléré (Peul)", "Zobo (Yoruba)", "Da (Bambara)"],
    },
    botanicalDescription:
      "Plante herbacée annuelle de la famille des Malvaceae, atteignant 1-3 mètres. " +
      "Tiges rougeâtres, feuilles palmatilobées, fleurs jaune pâle à centre rouge. " +
      "Calice charnu, rouge vif à maturité, constituant la partie utilisée. " +
      "Cultivée dans toute l'Afrique tropicale et subtropicale.",
    activeCompounds:
      "Anthocyanes (hibiscine, delphinidine), acide hibiscique, acide malique, " +
      "acide citrique, vitamine C, calcium, fer, phosphore, polyphénols, flavonoïdes " +
      "(quercétine, kaempférol). Pigments rouges très stables.",
    therapeuticIndications:
      "Hypertension artérielle légère à modérée (effet IEC naturel documenté), " +
      "dyslipidémies (réduction LDL), infections urinaires légères (effet diurétique), " +
      "constipation, digestion difficile, carence en vitamine C, fièvre, obésité " +
      "(effet coupe-faim et métabolique). Antioxydant puissant.",
    dosage:
      "Infusion : 1.5g de calices séchés pour 150ml d'eau bouillante, infuser 5-10 min, " +
      "2-3 tasses par jour. Boisson froide : 10g pour 1L d'eau froide, laisser macérer 2h. " +
      "Durée de traitement : 4-6 semaines pour l'hypertension, réévaluation médicale ensuite.",
    contraindications:
      "Hypotension artérielle (risque de chute tensionnelle), grossesse à forte dose " +
      "(effet utérotonique possible), prise de chloroquine (réduction d'absorption documentée), " +
      "insuffisance rénale avancée (effet diurétique). Prudence avec les antihypertenseurs.",
    clinicalStudies:
      "Essai clinique randomisé (Iran, 2015, n=54) : réduction de 7.2 mmHg de la " +
      "pression systolique après 4 semaines vs placebo. Méta-analyse (2015, 5 ECR) " +
      "confirmant l'effet antihypertenseur modéré. Étude sur les effets lipidiques (2011).",
    drugInteractions:
      "Chloroquine (réduction majeure de l'absorption, espacer de 4 heures), " +
      "antihypertenseurs (potentialisation), diurétiques (effets additifs), " +
      "acétaminophène (modification du métabolisme hépatique).",
    preparationMethods:
      "Infusion chaude classique. Bissap froid (boisson nationale sénégalaise) : " +
      "macération froide avec sucre et menthe. Sirop concentré. Confiture de calices. " +
      "Poudre de calices séchés pour gélules ou compléments.",
    isPublished: true,
  },
  {
    scientificName: "Zingiber officinale",
    vernacularNames: {
      fr: ["Gingembre"],
      en: ["Ginger"],
      local: ["Jinja (Swahili)", "Chitta (Hausa)", "Ataale (Yoruba)"],
    },
    botanicalDescription:
      "Plante herbacée rhizomateuse de la famille des Zingiberaceae, cultivée dans toute " +
      "la zone tropicale africaine. Tiges aériennes atteignant 1 mètre. Feuilles alternes " +
      "lancéolées. Rhizomes noueux, aromatiques, à saveur piquante caractéristique.",
    activeCompounds:
      "Gingérols (6-gingérol principal), shogaols, paradols, zingirone, résines, " +
      "huiles essentielles (zingibérène, bisabolène), amidon, protéines. " +
      "Les shogaols se forment lors du séchage à partir des gingérols.",
    therapeuticIndications:
      "Nausées et vomissements (grossesse, chimiothérapie, mal des transports), " +
      "dyspepsie et digestion difficile, douleurs articulaires et musculaires " +
      "(effet anti-inflammatoire), rhume et grippe, dysménorrhée, prévention " +
      "thromboembolique légère.",
    dosage:
      "Nausées de grossesse : 250mg de poudre 4 fois/jour. Usage digestif : " +
      "1-2g de poudre ou 5g de rhizome frais en infusion. Durée : 4 semaines maximum " +
      "en traitement, usage libre en condiment alimentaire.",
    contraindications:
      "Lithiase biliaire (stimulation de la bile), traitement anticoagulant " +
      "(effet antiplaquettaire additif), chirurgie prévue, grossesse au-delà " +
      "du premier trimestre à haute dose.",
    clinicalStudies:
      "Plus de 100 essais cliniques publiés. Méta-analyse Cochrane (2014) : " +
      "efficacité sur les nausées de grossesse. Revue systématique (2015) : " +
      "effet anti-inflammatoire comparable à l'ibuprofène sur les douleurs menstruelles.",
    drugInteractions:
      "Anticoagulants et antiplaquettaires (risque hémorragique), antidiabétiques " +
      "(potentialisation), antihypertenseurs (légère potentialisation).",
    preparationMethods:
      "Infusion de rhizome frais râpé. Décoction pour usage externe (douleurs articulaires). " +
      "Poudre séchée en gélules. Jus frais pressé. Sirop avec miel et citron.",
    isPublished: true,
  },
  {
    scientificName: "Carica papaya",
    vernacularNames: {
      fr: ["Papayer", "Papaye"],
      en: ["Papaya", "Pawpaw"],
      local: ["Isabelawbe (Peul)", "Ibepe (Yoruba)", "Papai (Bambara)"],
    },
    botanicalDescription:
      "Arbre fruitier de la famille des Caricaceae, originaire d'Amérique centrale, " +
      "naturalisé dans toute l'Afrique tropicale. Tronc non ramifié portant des feuilles " +
      "palmées en couronne apicale. Fruits charnus, verts puis jaune-orangé à maturité.",
    activeCompounds:
      "Papaïne et chymopapaïne (enzymes protéolytiques du latex), carpaine (alcaloïde), " +
      "lycopène, bêta-carotène, vitamine C, vitamine E, folates, potassium, flavonoïdes, " +
      "isothiocyanates (graines).",
    therapeuticIndications:
      "Troubles digestifs et parasitoses intestinales (graines antiparasitaires), " +
      "cicatrisation des plaies (latex et feuilles), dengue (feuilles : augmentation " +
      "des plaquettes, usage traditionnel validé par études), inflammation, " +
      "constipation (fruit mûr), carence en micronutriments.",
    dosage:
      "Antiparasitaire : 1 cuillère à soupe de graines fraîches avec du miel, " +
      "à jeun pendant 7 jours. Plaies : latex frais en application directe. " +
      "Feuilles (dengue) : jus de 2 feuilles fraîches, 2 fois/jour, maximum 5 jours.",
    contraindications:
      "Grossesse (latex et graines abortifs à haute dose), allergie au latex " +
      "(réaction croisée possible), anticoagulants (la papaïne potentialise l'effet).",
    clinicalStudies:
      "Essai clinique (Sri Lanka, 2015, n=228) sur l'effet des feuilles de papaye " +
      "dans la dengue : augmentation significative des plaquettes. Plusieurs études " +
      "sur l'activité antiparasitaire des graines.",
    drugInteractions:
      "Anticoagulants (papaïne potentialise la warfarine), hypoglycémiants " +
      "(effet additif possible).",
    preparationMethods:
      "Jus de feuilles fraîches (extraction mécanique). Graines fraîches consommées directement. " +
      "Latex frais collecté par incision du fruit vert. Décoction de feuilles séchées.",
    isPublished: true,
  },
];

// ─────────────────────────────────────
// 👨‍⚕️ PROFESSIONNELS DÉTAILLÉS
// ─────────────────────────────────────

const professionalsData = [
  {
    displayName: "Maître Kofi Mensah",
    specialty: ["Pharmacopée yoruba", "Soins de la peau", "Maladies infantiles"],
    biography:
      "Né en 1962 à Ouidah (Bénin), Maître Kofi Mensah est le gardien d'une tradition " +
      "thérapeutique transmise sur quatre générations dans sa famille. Son père, guérisseur " +
      "réputé du sud-Bénin, lui a enseigné dès l'âge de 12 ans les secrets des plantes " +
      "du littoral béninois. Après vingt ans de pratique communautaire, il a intégré " +
      "les apports de la phytothérapie moderne sans renier les fondements spirituels " +
      "de sa tradition. Ses consultations mêlent observation clinique minutieuse, " +
      "écoute profonde et prescriptions végétales personnalisées.",
    initiationPath:
      "Initiation par son père à partir de 12 ans. Apprentissage des cérémonies " +
      "de cueillette et des prières d'ouverture. Formation complémentaire auprès " +
      "d'un botaniste de l'Université d'Abomey-Calavi. Reconnaissance par le " +
      "Conseil des Anciens de Ouidah en 1998.",
    innovations:
      "Développement d'un protocole documenté de 47 préparations avec dosages précis. " +
      "Partenariat avec une ONG pour des tests de qualité microbiologique. " +
      "Création d'un jardin botanique communautaire de 2 hectares.",
    communityImpact:
      "Suivi gratuit de 200 familles vulnérables par an. Formation de 15 jeunes praticiens " +
      "sur 10 ans. Collaboration avec 3 centres de santé locaux pour les cas complexes.",
    philosophy:
      "La plante n'est pas un médicament isolé : elle s'inscrit dans une relation entre " +
      "le praticien, le patient et la nature. Guérir, c'est d'abord rétablir une harmonie.",
    location: "Ouidah, Bénin",
    latitude: 6.3676,
    longitude: 2.0837,
    averageRating: 4.8,
    totalReviews: 47,
  },
  {
    displayName: "Docteure Aminata Sow",
    specialty: ["Gynécologie traditionnelle", "Accompagnement périnatal", "Infertilité"],
    biography:
      "Aminata Sow, 54 ans, est une sage-femme traditionnelle de Ziguinchor (Casamance, Sénégal) " +
      "dont la réputation dépasse largement les frontières régionales. Formée par sa grand-mère " +
      "et deux tantes maternelles, toutes accoucheuses traditionnelles, elle a accompagné " +
      "plus de 2 000 naissances en 30 ans de pratique. Sa double compétence — savoirs " +
      "ancestraux casamançais et formation en obstétrique — en fait une référence unique " +
      "pour les femmes enceintes souhaitant un accompagnement intégratif.",
    initiationPath:
      "Formation initiale de 7 ans auprès de sa grand-mère. Stages dans trois régions " +
      "du Sénégal. Certification en accompagnement périnatal par l'École des Sages-Femmes " +
      "de Dakar (2001). Reconnaissance du Ministère de la Santé sénégalais.",
    innovations:
      "Protocole de préparation à l'accouchement alliant exercices traditionnels et " +
      "respiration consciente. Documentation de 35 plantes galactogènes et ocytociques. " +
      "Création d'un réseau de référencement avec 8 maternités.",
    communityImpact:
      "Réduction du taux de mortalité maternelle dans sa zone d'intervention de 34% " +
      "en 15 ans selon les statistiques du district sanitaire. Formation de 40 accoucheuses " +
      "villageoises. Consultations gratuites pour les femmes sans ressources.",
    philosophy:
      "La femme est le centre du monde. Accompagner une naissance, c'est tenir dans ses " +
      "mains le fil entre les ancêtres et les générations à venir.",
    location: "Ziguinchor, Sénégal",
    latitude: 12.5833,
    longitude: -16.2719,
    averageRating: 4.9,
    totalReviews: 63,
  },
  {
    displayName: "Herboriste Kwame Asante",
    specialty: ["Herboristerie sahélienne", "Maladies chroniques", "Détoxification"],
    biography:
      "Kwame Asante, 48 ans, dirige l'Institut des Plantes du Sahel à Ouagadougou " +
      "(Burkina Faso), qu'il a fondé en 2005. Après une formation initiale chez les " +
      "guérisseurs peuls du Sahel burkinabè, il a entrepris un voyage de dix ans " +
      "à travers sept pays africains pour collecter et documenter les savoirs botaniques " +
      "locaux. Son approche systématique — journaux de terrain, échantillons d'herbier, " +
      "recueil de témoignages — lui a valu la reconnaissance de plusieurs universités africaines.",
    initiationPath:
      "Apprentissage chez les Peuls du Nord-Burkina de 18 à 26 ans. Voyage d'étude " +
      "au Mali, Niger, Ghana, Togo, Bénin, Côte d'Ivoire et Nigeria. Collaboration avec " +
      "l'Institut de Recherche en Sciences de la Santé (IRSS) de Bobo-Dioulasso.",
    innovations:
      "Création d'une base de données de 380 plantes médicinales sahéliennes avec " +
      "géolocalisation des zones de collecte. Publication de 3 guides pratiques " +
      "sur la phytothérapie burkinabè. Développement de 12 formules standardisées.",
    communityImpact:
      "Formation de 80 herboristes ruraux en 10 ans. Mise en place de jardins " +
      "médicinaux communautaires dans 12 villages. Partage de revenus avec les " +
      "communautés fournisseurs de plantes.",
    philosophy:
      "Les plantes sont un bien commun. Mon rôle est de préserver leur usage, " +
      "de documenter pour les générations futures et de rendre ce savoir accessible.",
    location: "Ouagadougou, Burkina Faso",
    latitude: 12.3714,
    longitude: -1.5197,
    averageRating: 4.7,
    totalReviews: 38,
  },
  {
    displayName: "Guérisseur Moussa Touré",
    specialty: ["Savoirs peuls", "Maladies fébriles", "Rites de guérison"],
    biography:
      "Moussa Touré, 61 ans, est l'héritier d'une longue lignée de guérisseurs peuls " +
      "de la région de Mopti (Mali). Dans sa tradition, la maladie n'est jamais seulement " +
      "physique : elle témoigne d'un déséquilibre entre le monde visible et invisible. " +
      "Ses consultations associent diagnostic médical traditionnel, préparations végétales " +
      "et rituels de purification. Reconnu par les chefs de communauté de cinq régions " +
      "maliennes, il est régulièrement consulté pour des cas que la médecine conventionnelle " +
      "n'a pas réussi à résoudre.",
    initiationPath:
      "Initiation secrète à 15 ans par son oncle maternel, maître guérisseur. " +
      "Apprentissage de 10 ans incluant les voyages rituels. Transmission des " +
      "noms secrets des plantes et des prières d'invocation. Intronisation publique à 27 ans.",
    innovations:
      "Documentation partielle de 120 préparations (en respectant la confidentialité " +
      "des recettes sacrées). Collaboration avec une ONG de santé pour le suivi " +
      "des patients référés. Développement d'un système de consultation à distance.",
    communityImpact:
      "Référent culturel pour cinq communes. Médiation dans des conflits familiaux " +
      "liés à la maladie. Formation de deux successeurs désignés par le conseil des anciens.",
    philosophy:
      "Je ne guéris pas : je crée les conditions pour que la guérison advienne. " +
      "La plante, la parole et le rituel sont trois clés du même cadenas.",
    location: "Mopti, Mali",
    latitude: 14.4943,
    longitude: -4.1978,
    averageRating: 4.6,
    totalReviews: 29,
  },
  {
    displayName: "Thérapeute Fatoumata Konaté",
    specialty: ["Massage thérapeutique", "Bien-être", "Soins post-partum"],
    biography:
      "Fatoumata Konaté, 39 ans, a développé une approche thérapeutique unique à Abidjan " +
      "(Côte d'Ivoire) qui allie les techniques de massage mandingues transmises par " +
      "sa mère avec des apports de la réflexologie et du shiatsu. Après une formation " +
      "à Paris en kinésithérapie, elle a décidé de revenir en Afrique pour valoriser " +
      "les savoirs corporels ancestraux. Son cabinet spécialisé dans l'accompagnement " +
      "des femmes (grossesse, post-partum, ménopause) est devenu une référence en Afrique de l'Ouest.",
    initiationPath:
      "Apprentissage des massages traditionnels dioula par sa mère et ses tantes. " +
      "Formation en kinésithérapie (Paris, 3 ans). Certification en réflexologie plantaire " +
      "et massage prénatal. Stage chez des thérapeutes traditionnelles au Sénégal et au Mali.",
    innovations:
      "Création du protocole 'Retour au Corps' pour les femmes en post-partum : " +
      "combinaison de massages aux huiles végétales africaines, de bains de vapeur " +
      "aux plantes et d'exercices de rééducation périnéale traditionnels.",
    communityImpact:
      "Ateliers mensuels gratuits pour les femmes enceintes en situation précaire. " +
      "Formation de 20 masseuses traditionnelles aux pratiques sécurisées. " +
      "Partenariat avec 4 maternités d'Abidjan.",
    philosophy:
      "Le corps a une mémoire. Les mains du thérapeute ne font qu'éveiller ce que " +
      "le corps sait déjà faire : guérir, se régénérer, retrouver son équilibre.",
    location: "Abidjan, Côte d'Ivoire",
    latitude: 5.3599,
    longitude: -4.0083,
    averageRating: 4.9,
    totalReviews: 71,
  },
];

// ─────────────────────────────────────
// 🛒 PRODUITS MARKETPLACE
// ─────────────────────────────────────

const productsData = [
  { title: "Tisane Bien-être Quotidien — Kinkeliba & Gingembre", category: MedCategory.GASTRO_INTESTINAL, type: ProductType.PHYSICAL, price: 4500, stock: 50 },
  { title: "Poudre de Moringa Bio certifiée — 250g", category: MedCategory.MALADIES_ENFANCE, type: ProductType.PHYSICAL, price: 7500, stock: 100 },
  { title: "Huile de Neem thérapeutique — Dermatologie naturelle", category: MedCategory.AFFECTIONS_CUTANEES, type: ProductType.PHYSICAL, price: 6000, stock: 35 },
  { title: "Poudre de pulpe de Baobab — Reminéralisant", category: MedCategory.GASTRO_INTESTINAL, type: ProductType.PHYSICAL, price: 5500, stock: 80 },
  { title: "Bissap séché premium — 500g", category: MedCategory.CARDIO_VASCULAIRE, type: ProductType.PHYSICAL, price: 3500, stock: 200 },
  { title: "Consultation en ligne — Phytothérapie personnalisée", category: MedCategory.GYNECO_OBSTETRIQUE, type: ProductType.SERVICE, price: 15000, stock: 999 },
  { title: "Guide PDF — 50 plantes médicinales du Sahel", category: MedCategory.GASTRO_INTESTINAL, type: ProductType.DIGITAL, price: 5000, stock: 999 },
  { title: "Préparation anti-paludéenne traditionnelle — Neem & Artemisia", category: MedCategory.ETATS_FEBRILES_ICTERES, type: ProductType.PHYSICAL, price: 8000, stock: 40 },
  { title: "Massage thérapeutique post-partum — 90 min", category: MedCategory.GYNECO_OBSTETRIQUE, type: ProductType.SERVICE, price: 25000, stock: 999 },
  { title: "Kit Premiers soins naturels — 8 essentiels", category: MedCategory.AFFECTIONS_CUTANEES, type: ProductType.PHYSICAL, price: 18000, stock: 25 },
  { title: "Sirop Immunité Enfant — Moringa & Miel", category: MedCategory.MALADIES_ENFANCE, type: ProductType.PHYSICAL, price: 4200, stock: 60 },
  { title: "E-book — Grossesse et plantes médicinales africaines", category: MedCategory.GYNECO_OBSTETRIQUE, type: ProductType.DIGITAL, price: 3500, stock: 999 },
  { title: "Tisane Anti-stress — Melissa & Passiflore africaine", category: MedCategory.SYSTEME_NERVEUX, type: ProductType.PHYSICAL, price: 3800, stock: 70 },
  { title: "Pommade cicatrisante — Karité & Aloé vera", category: MedCategory.AFFECTIONS_CUTANEES, type: ProductType.PHYSICAL, price: 5500, stock: 45 },
  { title: "Programme détox 21 jours — Accompagnement personnalisé", category: MedCategory.GASTRO_INTESTINAL, type: ProductType.SERVICE, price: 35000, stock: 10 },
  { title: "Gélules Gingembre & Curcuma — Anti-inflammatoire", category: MedCategory.OSTEO_ARTICULAIRE, type: ProductType.PHYSICAL, price: 9000, stock: 55 },
  { title: "Collyre naturel — Euphraise & eau florale", category: MedCategory.OPHTALMOLOGIQUE, type: ProductType.PHYSICAL, price: 4500, stock: 30 },
  { title: "Tisane Hypertension — Hibiscus & Aubépine", category: MedCategory.CARDIO_VASCULAIRE, type: ProductType.PHYSICAL, price: 4000, stock: 90 },
  { title: "Baume Articulations — Harpagophytum & Menthol", category: MedCategory.OSTEO_ARTICULAIRE, type: ProductType.PHYSICAL, price: 7800, stock: 40 },
  { title: "Consultation Astrologie médicale africaine", category: MedCategory.MYSTIQUE, type: ProductType.SERVICE, price: 20000, stock: 999 },
];

// ─────────────────────────────────────
// 📰 ARTICLES ÉDITORIAUX
// ─────────────────────────────────────

const articlesData = [
  {
    space: ArticleSpace.SANTE_QUOTIDIEN,
    title: "Le Moringa : l'arbre de vie au cœur de l'alimentation africaine",
    content: "Le Moringa oleifera, surnommé 'arbre de vie' dans de nombreuses cultures africaines, " +
      "est bien plus qu'une plante médicinale. Ses feuilles, riches en vitamines, minéraux et " +
      "acides aminés essentiels, constituent un complément nutritionnel exceptionnel pour les " +
      "populations vulnérables. Des études récentes confirment son efficacité dans la lutte " +
      "contre la malnutrition infantile et l'anémie maternelle...",
    category: "Nutrition",
    tags: ["moringa", "nutrition", "malnutrition", "plantes"],
  },
  {
    space: ArticleSpace.SANTE_QUOTIDIEN,
    title: "Hypertension artérielle : que dit la médecine traditionnelle africaine ?",
    content: "L'hypertension artérielle touche près de 30% des adultes africains selon l'OMS. " +
      "Face à ce défi de santé publique, les savoirs traditionnels africains offrent des pistes " +
      "intéressantes. Le Kinkeliba, le Bissap et l'ail sauvage sont utilisés depuis des siècles " +
      "dans plusieurs régions d'Afrique de l'Ouest pour réguler la tension artérielle. " +
      "Des essais cliniques récents commencent à valider ces usages empiriques...",
    category: "Cardiologie",
    tags: ["hypertension", "bissap", "kinkeliba", "prévention"],
  },
  {
    space: ArticleSpace.RECETTES_SANTE,
    title: "Recette : Tchiakpalo béninois renforcé — digestion et vitalité",
    content: "Le Tchiakpalo est une boisson fermentée traditionnelle du Bénin, préparée à base " +
      "de gingembre, d'hibiscus et de citronelle. Sa richesse en probiotiques naturels en fait " +
      "un excellent soutien digestif. Voici la recette traditionnelle enrichie de l'expertise " +
      "de Maître Kofi Mensah, avec des ajouts thérapeutiques documentés...",
    category: "Boissons thérapeutiques",
    tags: ["recette", "digestif", "fermenté", "bénin"],
  },
  {
    space: ArticleSpace.RITES_CULTURES,
    title: "Les rites de naissance chez les Peuls du Fouta-Djalon",
    content: "Dans la tradition peule du Fouta-Djalon (Guinée), la naissance d'un enfant est " +
      "entourée de rituels complexes mêlant plantes médicinales, prières et gestes codifiés. " +
      "La sage-femme traditionnelle, dite 'muso jatigi', joue un rôle central qui dépasse " +
      "largement le cadre médical pour toucher aux dimensions spirituelles et sociales " +
      "de l'entrée dans la vie...",
    category: "Rites de naissance",
    tags: ["peul", "naissance", "rites", "Guinée"],
  },
  {
    space: ArticleSpace.PHARMACOPEE,
    title: "Monographie clinique : Hibiscus sabdariffa et hypertension",
    content: "Cette monographie présente une synthèse des données cliniques disponibles sur " +
      "l'utilisation d'Hibiscus sabdariffa (Bissap) dans le traitement de l'hypertension " +
      "artérielle légère à modérée. Cinq essais contrôlés randomisés ont été analysés, " +
      "incluant un total de 390 participants. Les résultats montrent une réduction moyenne " +
      "de 7.4 mmHg de la pression systolique après 4-6 semaines de traitement...",
    category: "Cardiologie",
    tags: ["bissap", "hypertension", "pharmacopée", "clinique"],
  },
  {
    space: ArticleSpace.SANTE_QUOTIDIEN,
    title: "Diabète de type 2 : approches complémentaires par les plantes africaines",
    content: "Le diabète de type 2 est en forte progression en Afrique subsaharienne, avec " +
      "une augmentation de 150% prévue d'ici 2045 selon la Fédération Internationale du Diabète. " +
      "Plusieurs plantes médicinales africaines — dont le Momordica charantia (karela), " +
      "le Gymnema sylvestre et le Moringa oleifera — montrent des propriétés hypoglycémiantes " +
      "intéressantes dans les études préliminaires...",
    category: "Endocrinologie",
    tags: ["diabète", "hypoglycémiant", "plantes", "prévention"],
  },
  {
    space: ArticleSpace.RECETTES_SANTE,
    title: "Thiébou dieun santé : comment rendre le plat national sénégalais plus nutritif",
    content: "Le Thiébou dieun (riz au poisson) est le plat national sénégalais, consommé " +
      "quotidiennement par des millions de personnes. Des modifications simples, inspirées " +
      "de la sagesse nutritionnelle traditionnelle, peuvent considérablement améliorer son " +
      "profil nutritionnel : ajout de feuilles de Moringa, substitution partielle du riz " +
      "par du fonio, enrichissement aux légumes du terroir...",
    category: "Nutrition",
    tags: ["recette", "sénégal", "nutrition", "thiébou"],
  },
  {
    space: ArticleSpace.RITES_CULTURES,
    title: "Le Vodoun béninois : médecine, spiritualité et cohésion sociale",
    content: "Le Vodoun, souvent réduit à ses représentations caricaturales occidentales, " +
      "est en réalité un système complexe de médecine holistique qui intègre pharmacopée " +
      "végétale, pratiques rituelles et accompagnement psychologique. Au Bénin, pays de " +
      "son origine, il constitue toujours un recours thérapeutique majeur pour une large " +
      "part de la population...",
    category: "Médecine holistique",
    tags: ["vodoun", "bénin", "spiritualité", "médecine"],
  },
];

// ─────────────────────────────────────
// ❓ QUESTIONS FORUM
// ─────────────────────────────────────

const questionsData = [
  {
    title: "Peut-on associer le Kinkeliba avec des médicaments pour la tension ?",
    content: "Bonjour, ma mère prend de l'amlodipine pour son hypertension depuis 6 mois. " +
      "Elle souhaite aussi boire du Kinkeliba quotidiennement comme elle le faisait avant " +
      "son diagnostic. Y a-t-il des risques d'interaction ? Est-ce que les deux peuvent " +
      "être utilisés ensemble ou faut-il espacer les prises ?",
    category: "Interactions médicamenteuses",
    tags: ["kinkeliba", "hypertension", "interaction", "médicaments"],
  },
  {
    title: "Moringa pendant l'allaitement : sécurité et dosage recommandé ?",
    content: "Je viens d'accoucher il y a 3 semaines et j'allaite mon bébé. Une amie m'a " +
      "recommandé le Moringa pour stimuler ma lactation. Mais je voudrais des informations " +
      "fiables sur la sécurité pour mon bébé et le dosage approprié. Est-ce que quelqu'un " +
      "a une expérience documentée là-dessus ?",
    category: "Périnatalité",
    tags: ["moringa", "allaitement", "lactation", "nourrisson"],
  },
  {
    title: "Traitement traditionnel du paludisme : quelles plantes sont réellement efficaces ?",
    content: "Dans notre région (Bénin rural), les accès palustres sont fréquents et l'accès " +
      "aux médicaments conventionnels est parfois difficile. Quelles sont les plantes dont " +
      "l'efficacité contre le paludisme est réellement documentée par des études sérieuses ? " +
      "Je cherche des informations basées sur des preuves, pas seulement des traditions.",
    category: "Maladies infectieuses",
    tags: ["paludisme", "artemisia", "neem", "fièvre"],
  },
  {
    title: "Comment préparer correctement une décoction de feuilles de papayer ?",
    content: "J'ai lu que les feuilles de papayer pouvaient aider dans la dengue. " +
      "Ma fille a été diagnostiquée et son médecin a dit qu'on pouvait essayer en complément " +
      "du traitement médical. Quelle est la bonne façon de préparer cette décoction ? " +
      "Quelles feuilles choisir, comment les préparer, quelle quantité donner ?",
    category: "Préparations",
    tags: ["papayer", "dengue", "plaquettes", "préparation"],
  },
  {
    title: "Plantes médicinales pour les douleurs menstruelles intenses",
    content: "J'ai une dysménorrhée sévère chaque mois depuis l'adolescence. Les antidouleurs " +
      "conventionnels me causent des problèmes gastriques. Y a-t-il des plantes africaines " +
      "dont l'efficacité sur les règles douloureuses est prouvée ? J'ai entendu parler " +
      "du gingembre, de l'artémise... Quelles sont vos recommandations ?",
    category: "Gynécologie",
    tags: ["dysménorrhée", "règles", "gingembre", "gynécologie"],
  },
  {
    title: "Le Neem est-il dangereux pris par voie interne ?",
    content: "Beaucoup de personnes dans ma communauté prennent des décoctions de feuilles " +
      "de Neem pour traiter les parasites intestinaux. Certains disent que c'est efficace, " +
      "d'autres mettent en garde sur la toxicité. Qu'est-ce que la littérature scientifique " +
      "dit vraiment sur la sécurité du Neem en usage interne ?",
    category: "Toxicologie",
    tags: ["neem", "toxicité", "sécurité", "parasites"],
  },
];

// ─────────────────────────────────────
// 🌱 FONCTION PRINCIPALE
// ─────────────────────────────────────

async function main() {
  const shouldReset = process.env.SEED_RESET === "true";
  console.log(shouldReset ? "Resetting database before seed..." : "Seed append mode: preserving existing data.");

  if (shouldReset) await prisma.$transaction([
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

  if (shouldReset) console.log("Database reset complete.");

  if (!shouldReset) {
    const existingDemoAdmin = await prisma.user.findUnique({
      where: { email: "admin@iwosan.com" },
      select: { id: true },
    });

    if (existingDemoAdmin) {
      console.log("Demo seed already exists. Use SEED_RESET=true to rebuild it.");
      return;
    }
  }

  // ─── ADMIN ───
  console.log("👑 Création de l'administrateur...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@iwosan.com",
      passwordHash,
      role: Role.ADMIN,
      firstName: "Admin",
      lastName: "Iwosan",
      country: "Bénin",
      isEmailVerified: true,
      kycStatus: KycStatus.VERIFIED,
      referralCode: "IWOSANADMIN",
      walletBalance: 500000,
      mlmNode: { create: { affiliateCode: "IWOSANADMIN", level: 0 } },
      subscription: {
        create: {
          plan: SubscriptionPlan.EXPERT,
          price: 0,
          startDate: new Date(),
          maxListings: 9999,
          maxDownloads: 9999,
          isActive: true,
        },
      },
    },
  });
  console.log(`✅ Admin créé : ${admin.email}`);

  // ─── RESEARCHER ───
  console.log("🔬 Création du chercheur...");
  const researcher = await prisma.user.create({
    data: {
      email: "researcher@iwosan.com",
      passwordHash,
      role: Role.RESEARCHER,
      firstName: "Amina",
      lastName: "Diop",
      country: "Sénégal",
      isEmailVerified: true,
      kycStatus: KycStatus.VERIFIED,
      referralCode: "RESEARCHIWO",
      walletBalance: 75000,
      mlmNode: {
        create: {
          affiliateCode: "RESEARCHIWO",
          level: 1,
          parent: { connect: { userId: admin.id } },
        },
      },
      subscription: {
        create: {
          plan: SubscriptionPlan.PRO,
          price: 25000,
          startDate: new Date(),
          maxListings: 100,
          maxDownloads: 200,
          isActive: true,
        },
      },
    },
  });
  console.log(`✅ Chercheur créé : ${researcher.email}`);

  // ─── UTILISATEURS ───
  console.log("👥 Création des utilisateurs...");
  const users = [];
  for (let i = 1; i <= 12; i++) {
    const firstName = firstNames[(i - 1) % firstNames.length];
    const lastName = lastNames[(i - 1) % lastNames.length];
    const user = await prisma.user.create({
      data: {
        email: `user${i}@iwosan.com`,
        passwordHash,
        firstName,
        lastName,
        country: countries[(i - 1) % countries.length],
        isEmailVerified: i % 2 === 0,
        kycStatus:
          i % 4 === 0 ? KycStatus.VERIFIED :
          i % 3 === 0 ? KycStatus.SUBMITTED :
          KycStatus.PENDING,
        referralCode: `USER${i}IWO`,
        referredById: admin.id,
        walletBalance: 10000 + (i * 5000),
        mlmNode: {
          create: {
            affiliateCode: `USER${i}IWO`,
            level: 1,
            parent: { connect: { userId: admin.id } },
          },
        },
        subscription: {
          create: {
            plan: i <= 4 ? SubscriptionPlan.BASIC : SubscriptionPlan.FREE,
            price: i <= 4 ? 10000 : 0,
            startDate: new Date(),
            maxListings: i <= 4 ? 25 : 5,
            maxDownloads: i <= 4 ? 50 : 10,
            isActive: true,
          },
        },
      },
    });
    users.push(user);
  }
  console.log(`✅ ${users.length} utilisateurs créés`);

  // ─── PROFESSIONNELS ───
  console.log("👨‍⚕️ Création des professionnels...");
  const professionals = [];
  for (let i = 0; i < professionalsData.length; i++) {
    const pd = professionalsData[i];
    const professional = await prisma.user.create({
      data: {
        email: `pro${i + 1}@iwosan.com`,
        passwordHash,
        role: Role.PROFESSIONAL,
        firstName: pd.displayName.split(" ")[1] || `Praticien${i + 1}`,
        lastName: pd.displayName.split(" ")[2] || "Iwosan",
        country: pd.location.split(", ")[1] || countries[i],
        isEmailVerified: true,
        kycStatus: KycStatus.VERIFIED,
        referralCode: `PRO${i + 1}IWO`,
        referredById: users[i % users.length].id,
        walletBalance: 150000 + (i * 25000),
        mlmNode: {
          create: {
            affiliateCode: `PRO${i + 1}IWO`,
            level: 2,
            parent: { connect: { userId: users[i % users.length].id } },
          },
        },
        professionalProfile: {
          create: {
            displayName: pd.displayName,
            specialty: pd.specialty,
            biography: pd.biography,
            initiationPath: pd.initiationPath,
            innovations: pd.innovations,
            communityImpact: pd.communityImpact,
            philosophy: pd.philosophy,
            location: pd.location,
            latitude: pd.latitude,
            longitude: pd.longitude,
            isVerified: true,
            verifiedAt: new Date(),
            photos: [
              `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200`,
              `https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200`,
            ],
            averageRating: pd.averageRating,
            totalReviews: pd.totalReviews,
            serviceBookingEnabled: true,
            isPortraitOfWeek: i === 0,
            portraitStartDate: i === 0 ? new Date() : null,
            portraitEndDate: i === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
          },
        },
        subscription: {
          create: {
            plan: i >= 3 ? SubscriptionPlan.EXPERT : SubscriptionPlan.PRO,
            price: i >= 3 ? 50000 : 25000,
            startDate: new Date(),
            maxListings: i >= 3 ? 9999 : 100,
            maxDownloads: i >= 3 ? 9999 : 200,
            isActive: true,
          },
        },
      },
    });
    professionals.push(professional);
  }
  console.log(`✅ ${professionals.length} professionnels créés`);

  // ─── PLANTES ───
  console.log("🌿 Création des monographies de plantes...");
  for (const plant of plantsData) {
    await prisma.plantMonograph.create({
      data: {
        ...plant,
        vernacularNames: plant.vernacularNames,
        fieldPhotos: [
          `https://images.unsplash.com/photo-1508193638397-1c4234db14d8?q=80&w=1200`,
        ],
        illustration: `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200`,
        createdById: researcher.id,
      },
    });
  }
  console.log(`✅ ${plantsData.length} monographies créées`);

  // ─── PRODUITS ───
  console.log("🛒 Création des produits marketplace...");
  const createdProducts = [];
  for (let i = 0; i < productsData.length; i++) {
    const pd = productsData[i];
    const product = await prisma.product.create({
      data: {
        sellerId: professionals[i % professionals.length].id,
        title: pd.title,
        slug: pd.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        description:
          "Produit soigneusement préparé et documenté par un professionnel vérifié Iwosan. " +
          "Chaque préparation respecte les protocoles traditionnels transmis de génération " +
          "en génération, avec les adaptations nécessaires pour garantir qualité et sécurité.",
        price: pd.price,
        category: pd.category,
        type: pd.type,
        images: [
          `https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200`,
          `https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200`,
        ],
        stock: pd.stock,
        isApproved: true,
        isActive: true,
        isFeatured: i < 6,
        commissionRate: 0.10,
        auctionEnabled: i === 0,
        auctionEndDate: i === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        currentBid: i === 0 ? 5000 : null,
        viewCount: Math.floor(Math.random() * 500) + 10,
      },
    });
    createdProducts.push(product);
  }
  console.log(`✅ ${createdProducts.length} produits créés`);

  // ─── ARTICLES ───
  console.log("📰 Création des articles...");
  for (let i = 0; i < articlesData.length; i++) {
    const ad = articlesData[i];
    await prisma.article.create({
      data: {
        authorId: i % 2 === 0
          ? professionals[i % professionals.length].id
          : i % 3 === 0 ? researcher.id : admin.id,
        space: ad.space,
        title: ad.title,
        slug: ad.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 80),
        content: ad.content,
        coverImage: `https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1600`,
        category: ad.category,
        tags: ad.tags,
        isApproved: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
        views: Math.floor(Math.random() * 2000) + 50,
      },
    });
  }
  console.log(`✅ ${articlesData.length} articles créés`);

  // ─── FORUM ───
  console.log("💬 Création des questions/réponses forum...");
  for (let i = 0; i < questionsData.length; i++) {
    const qd = questionsData[i];
    const question = await prisma.question.create({
      data: {
        authorId: users[i % users.length].id,
        title: qd.title,
        content: qd.content,
        category: qd.category,
        tags: qd.tags,
        voteCount: Math.floor(Math.random() * 20) + 1,
        viewCount: Math.floor(Math.random() * 500) + 20,
        attachments: [],
        isFeatured: i < 2,
      },
    });

    const answer = await prisma.answer.create({
      data: {
        questionId: question.id,
        authorId: professionals[i % professionals.length].id,
        content:
          "Merci pour cette question importante. D'après mon expérience clinique et " +
          "les données disponibles dans la littérature scientifique, voici ma réponse : " +
          "il est essentiel de consulter un professionnel de santé avant toute association " +
          "de plantes médicinales avec un traitement conventionnel. Dans ce cas spécifique, " +
          "les interactions documentées suggèrent une prudence particulière. Je recommande " +
          "une consultation personnalisée pour évaluer votre situation précise.",
        voteCount: Math.floor(Math.random() * 15) + 1,
        isAccepted: i % 2 === 0,
        attachments: [],
      },
    });

    if (i % 2 === 0) {
      await prisma.question.update({
        where: { id: question.id },
        data: { acceptedAnswerId: answer.id },
      });
    }

    await prisma.vote.create({
      data: {
        userId: users[(i + 1) % users.length].id,
        targetId: question.id,
        targetType: "QUESTION",
        value: 1,
      },
    });

    await prisma.vote.create({
      data: {
        userId: users[(i + 2) % users.length].id,
        targetId: answer.id,
        targetType: "ANSWER",
        value: 1,
      },
    });
  }
  console.log(`✅ ${questionsData.length} questions créées avec réponses`);

  // ─── ÉVÉNEMENTS ───
  console.log("📅 Création des événements...");
  await prisma.event.createMany({
    data: [
      {
        title: "Webinaire : Pharmacopée africaine et maladies chroniques",
        description:
          "Session en ligne réunissant 5 praticiens de 4 pays pour discuter des approches " +
          "traditionnelles face aux maladies chroniques (diabète, hypertension, obésité). " +
          "Présentation de cas cliniques documentés et échanges interactifs.",
        type: EventType.WEBINAR,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        isOnline: true,
        meetingUrl: "https://meet.google.com/iwosan-webinar",
        maxAttendees: 200,
        createdById: admin.id,
        isPublished: true,
      },
      {
        title: "Formation : Documentation des savoirs thérapeutiques",
        description:
          "Atelier pratique de 4 heures sur les méthodes de documentation des savoirs " +
          "traditionnels : prise de notes structurées, photographie botanique, " +
          "recueil de témoignages, gestion des données sensibles.",
        type: EventType.FORMATION,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        location: "Cotonou, Bénin",
        isOnline: false,
        maxAttendees: 30,
        createdById: professionals[0].id,
        isPublished: true,
      },
      {
        title: "1er Salon Iwosan des Savoirs Africains — Dakar 2026",
        description:
          "Première édition du salon panafricain dédié aux savoirs endogènes africains. " +
          "80 exposants de 15 pays, conférences, ateliers, démonstrations. " +
          "Un événement historique pour la valorisation du patrimoine thérapeutique africain.",
        type: EventType.SALON,
        startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000),
        location: "Centre International de Conférences Abdou Diouf, Dakar",
        isOnline: false,
        maxAttendees: 2000,
        createdById: admin.id,
        isPublished: true,
      },
      {
        title: "Portes ouvertes : Institut des Plantes du Sahel",
        description:
          "Journée portes ouvertes à l'Institut des Plantes du Sahel de Ouagadougou. " +
          "Visite du jardin botanique, démonstrations de préparations traditionnelles, " +
          "rencontre avec les herboristes et chercheurs.",
        type: EventType.PORTES_OUVERTES,
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        location: "Institut des Plantes du Sahel, Ouagadougou",
        isOnline: false,
        maxAttendees: 100,
        createdById: professionals[2].id,
        isPublished: true,
      },
    ],
  });
  console.log("✅ 4 événements créés");

  // ─── FORMATIONS ───
  console.log("📚 Création des formations...");
  await prisma.formation.createMany({
    data: [
      {
        title: "Introduction à la pharmacopée africaine — Vidéo 90 min",
        type: FormationType.VIDEO,
        fileUrl: "https://example.com/formations/intro-pharmacopee.mp4",
        coverImage: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?q=80&w=800",
        category: "Pharmacopée",
        tags: ["introduction", "pharmacopée", "africaine"],
        createdById: admin.id,
        isPublished: true,
        downloadCount: 145,
      },
      {
        title: "Guide complet — Plantes médicinales d'Afrique de l'Ouest (PDF 180 pages)",
        type: FormationType.DOCUMENT,
        fileUrl: "https://example.com/formations/guide-plantes-afo.pdf",
        coverImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800",
        category: "Botanique",
        tags: ["guide", "plantes", "Afrique de l'Ouest"],
        createdById: researcher.id,
        isPublished: true,
        downloadCount: 312,
      },
      {
        title: "Catalogue illustré — 200 plantes médicinales panafricaines",
        type: FormationType.CATALOGUE,
        fileUrl: "https://example.com/formations/catalogue-plantes.pdf",
        coverImage: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800",
        category: "Référence",
        tags: ["catalogue", "illustré", "panafricain"],
        createdById: admin.id,
        isPublished: true,
        downloadCount: 89,
      },
      {
        title: "Module : Interactions plantes-médicaments — ce que tout praticien doit savoir",
        type: FormationType.DOCUMENT,
        fileUrl: "https://example.com/formations/interactions-plantes-medicaments.pdf",
        coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800",
        category: "Pharmacologie",
        tags: ["interactions", "sécurité", "médicaments"],
        createdById: researcher.id,
        isPublished: true,
        downloadCount: 203,
      },
    ],
  });
  console.log("✅ 4 formations créées");

  // ─── COMMANDES & AVIS ───
  console.log("🛍️ Création de commandes et avis...");
  for (let i = 0; i < 8; i++) {
    const product = createdProducts[i % createdProducts.length];
    const buyer = users[i % users.length];
    const seller = professionals[i % professionals.length];

    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        sellerId: seller.id,
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
        totalAmount: product.price,
        commissionAmount: product.price * 0.10,
        status: i < 5 ? OrderStatus.DELIVERED : OrderStatus.PAID,
        paymentMethod: "mobile_money",
        escrowStatus: i < 5 ? EscrowStatus.RELEASED : EscrowStatus.HELD,
        deliveryConfirmedAt: i < 5 ? new Date() : null,
      },
    });

    if (i < 5) {
      await prisma.review.create({
        data: {
          authorId: buyer.id,
          targetId: product.id,
          targetType: "PRODUCT",
          rating: 4 + (i % 2),
          comment:
            i % 2 === 0
              ? "Excellent produit, très efficace. Je le recommande vivement !"
              : "Bonne qualité, livraison rapide. Conforme à la description.",
        },
      });
    }
  }
  console.log("✅ 8 commandes et 5 avis créés");

  // ─── COUPONS ───
  console.log("🎟️ Création des coupons...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "IWOSAN10",
        discount: 10,
        isPercentage: true,
        maxUses: 100,
        usedCount: 12,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: "BIENVENUE",
        discount: 15,
        isPercentage: true,
        maxUses: 500,
        usedCount: 78,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: "SALON2026",
        discount: 20,
        isPercentage: true,
        maxUses: 200,
        usedCount: 0,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ],
  });
  console.log("✅ 3 coupons créés");

  // ─── NOTIFICATIONS ───
  console.log("🔔 Création des notifications...");
  const notifications = [];
  for (const user of [...users.slice(0, 5), ...professionals.slice(0, 3)]) {
    notifications.push(
      { userId: user.id, type: "WELCOME", title: "Bienvenue sur Iwosan !", message: "Votre compte a été créé avec succès. Explorez notre plateforme de savoirs africains.", isRead: false },
      { userId: user.id, type: "NEW_ARTICLE", title: "Nouvel article disponible", message: "Un nouvel article sur les plantes médicinales africaines vient d'être publié.", isRead: Math.random() > 0.5, link: "/blog" },
    );
  }
  await prisma.notification.createMany({ data: notifications });
  console.log(`✅ ${notifications.length} notifications créées`);

  // ─── TICKETS SUPPORT ───
  console.log("🎫 Création des tickets support...");
  const ticket1 = await prisma.ticket.create({
    data: {
      authorId: users[0].id,
      subject: "Problème avec ma commande #12345",
      category: "Commande",
      status: TicketStatus.IN_PROGRESS,
    },
  });
  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket1.id,
      authorId: users[0].id,
      content: "Bonjour, ma commande est marquée comme livrée mais je n'ai rien reçu. Pouvez-vous m'aider ?",
    },
  });
  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket1.id,
      authorId: admin.id,
      content: "Bonjour, nous sommes désolés pour ce désagrément. Nous allons contacter le vendeur et revenir vers vous sous 24h.",
    },
  });
  console.log("✅ 1 ticket support créé avec messages");

  // ─── ABONNÉS NEWSLETTER ───
  console.log("📧 Création des abonnés newsletter...");
  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "contact@sante-afrique.org", unsubscribeToken: randomUUID(), isActive: true },
      { email: "info@phytoafrica.net", unsubscribeToken: randomUUID(), isActive: true },
      { email: "docteur.kofi@gmail.com", unsubscribeToken: randomUUID(), isActive: true },
      { email: "recherche@uac.bj", unsubscribeToken: randomUUID(), isActive: true },
      { email: "aminata.wellness@gmail.com", unsubscribeToken: randomUUID(), isActive: false },
    ],
  });
  console.log("✅ 5 abonnés newsletter créés");

  // ─── MESSAGES PRIVÉS ───
  console.log("💬 Création des messages privés...");
  await prisma.message.createMany({
    data: [
      {
        senderId: users[0].id,
        receiverId: professionals[0].id,
        content: "Bonjour Maître Mensah, j'ai une question concernant la préparation au Moringa pour mon enfant de 3 ans. Est-ce adapté à son âge ?",
        isRead: true,
      },
      {
        senderId: professionals[0].id,
        receiverId: users[0].id,
        content: "Bonjour, merci pour votre question. Pour un enfant de 3 ans, une très petite dose est possible (1/4 de cuillère à café de poudre dans la bouillie) mais je vous recommande d'abord une consultation pour évaluer les besoins spécifiques de votre enfant.",
        isRead: false,
      },
      {
        senderId: users[1].id,
        receiverId: professionals[1].id,
        content: "Je suis intéressée par votre programme d'accompagnement post-partum. Pouvez-vous me donner plus d'informations sur le déroulement des séances ?",
        isRead: true,
      },
    ],
  });
  console.log("✅ 3 messages privés créés");

  // ─── BANNIÈRES & CONFIG ───
  console.log("🖼️ Création des bannières et configuration...");
  await prisma.homeBanner.createMany({
    data: [
      {
        imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1600",
        title: "Iwosan — Les Savoirs Africains au Service de Votre Santé",
        link: "/marketplace",
        order: 1,
        isActive: true,
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600",
        title: "Découvrez notre Pharmacopée Vivante",
        link: "/pharmacopee",
        order: 2,
        isActive: true,
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?q=80&w=1600",
        title: "1er Salon Iwosan — Dakar 2026",
        link: "/evenements",
        order: 3,
        isActive: true,
      },
    ],
  });

  await prisma.siteConfig.createMany({
    data: [
      { key: "site.title", value: "Iwosan", updatedById: admin.id },
      { key: "site.tagline", value: "Les savoirs africains au service de votre santé", updatedById: admin.id },
      { key: "site.defaultLanguage", value: "fr", updatedById: admin.id },
      { key: "site.supportedLanguages", value: JSON.stringify(["fr", "en", "ar"]), updatedById: admin.id },
      { key: "commission.globalRate", value: "0.10", updatedById: admin.id },
      { key: "commission.mlmLevel1", value: "0.05", updatedById: admin.id },
      { key: "commission.mlmLevel2", value: "0.03", updatedById: admin.id },
      { key: "commission.mlmLevel3", value: "0.02", updatedById: admin.id },
      { key: "subscription.FREE", value: JSON.stringify({ maxListings: 5, maxDownloads: 10, price: 0 }), updatedById: admin.id },
      { key: "subscription.BASIC", value: JSON.stringify({ maxListings: 25, maxDownloads: 50, price: 10000 }), updatedById: admin.id },
      { key: "subscription.PRO", value: JSON.stringify({ maxListings: 100, maxDownloads: 200, price: 25000 }), updatedById: admin.id },
      { key: "subscription.EXPERT", value: JSON.stringify({ maxListings: 9999, maxDownloads: 9999, price: 50000 }), updatedById: admin.id },
      { key: "site.maintenanceMode", value: "false", updatedById: admin.id },
      { key: "site.allowRegistration", value: "true", updatedById: admin.id },
    ],
  });

  await prisma.adSpace.createMany({
    data: [
      { name: "Bannière Header", position: "header", code: "<!-- AdSpace Header -->", isActive: false },
      { name: "Sidebar Droite", position: "sidebar-right", code: "<!-- AdSpace Sidebar -->", isActive: false },
      { name: "Entre Articles", position: "between-articles", code: "<!-- AdSpace Articles -->", isActive: false },
    ],
  });
  console.log("✅ Bannières, config et espaces publicitaires créés");

  // ─── RÉSUMÉ FINAL ───
  console.log("\n🌿 ═══════════════════════════════════════");
  console.log("   SEED IWOSAN TERMINÉ AVEC SUCCÈS !");
  console.log("═══════════════════════════════════════");
  console.log(`
  👑 Admin         : admin@iwosan.com / Admin@123
  🔬 Chercheur     : researcher@iwosan.com / Admin@123
  👥 Utilisateurs  : user1@iwosan.com à user12@iwosan.com / Admin@123
  👨‍⚕️ Professionnels : pro1@iwosan.com à pro5@iwosan.com / Admin@123
  
  📊 Données créées :
     • ${plantsData.length} monographies de plantes
     • ${productsData.length} produits marketplace
     • ${articlesData.length} articles éditoriaux
     • ${questionsData.length} questions forum avec réponses
     • 4 événements (webinaire, formation, salon, portes ouvertes)
     • 4 formations (vidéo, PDF, catalogue)
     • 8 commandes + 5 avis clients
     • 3 coupons de réduction
     • 3 bannières d'accueil
     • Configuration complète du site
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Erreur lors du seed :", error);
    await prisma.$disconnect();
    process.exit(1);
  });
