// FR → EN dictionary. Keys are the exact French strings used in JSX text nodes
// or in the whitelisted props (placeholder, title, alt, aria-label).
// When a string isn't found, the original is returned (no-op for English-only
// or technical strings).

export const dict: Record<string, string> = {
  // ---------- Navbar / Footer ----------
  "Le savoir africain, documenté et vivant": "African knowledge, documented and alive",
  "Accueil": "Home",
  "Marketplace": "Marketplace",
  "Annuaire": "Directory",
  "Pharmacopée": "Pharmacopoeia",
  "Communauté": "Community",
  "Discutons-en": "Let's talk",
  "Blog": "Blog",
  "Rites & Cultures": "Rites & Cultures",
  "Recettes santé": "Health recipes",
  "Recettes Santé": "Health Recipes",
  "Agenda": "Calendar",
  "Formations": "Courses",
  "Se connecter": "Sign in",
  "S'inscrire": "Sign up",
  "Menu": "Menu",
  "Navigation": "Navigation",
  "Nos Espaces": "Our Spaces",
  "Contact & Légal": "Contact & Legal",
  "WhatsApp : +221 77 000 00 00": "WhatsApp: +221 77 000 00 00",
  "CGU": "Terms of use",
  "Politique de confidentialité": "Privacy policy",
  "Mentions légales": "Legal notice",
  "© 2025 Iwosan. Tous droits réservés.": "© 2025 Iwosan. All rights reserved.",
  "Fait avec ❤️ pour l'Afrique": "Made with ❤️ for Africa",
  "Plateforme panafricaine dédiée à la médecine traditionnelle, aux plantes médicinales et au patrimoine de guérison africain.":
    "A pan-African platform dedicated to traditional medicine, medicinal plants and Africa's healing heritage.",
  "Pharmacopée vivante": "Living Pharmacopoeia",
  "Santé au quotidien": "Everyday Health",

  // ---------- Home ----------
  "🌿 Plateforme panafricaine": "🌿 Pan-African platform",
  "Le patrimoine médical africain, enfin documenté et accessible":
    "Africa's medical heritage, finally documented and accessible",
  "Iwosan connecte praticiens traditionnels, chercheurs et communautés autour d'un savoir endogène rigoureusement documenté.":
    "Iwosan connects traditional practitioners, researchers and communities around endogenous knowledge, rigorously documented.",
  "Explorer la plateforme": "Explore the platform",
  "Rejoindre la communauté": "Join the community",
  "Praticiens": "Practitioners",
  "Plantes": "Plants",
  "Pays": "Countries",
  "Mise en lumière": "Spotlight",
  "Portrait de la semaine": "Practitioner of the week",
  "⭐ Praticien de la semaine": "⭐ Practitioner of the week",
  "Voir le profil complet": "View full profile",
  "Prendre rendez-vous": "Book an appointment",
  "Découvrir": "Discover",
  "Six espaces de savoir": "Six spaces of knowledge",
  "Une plateforme structurée, rigoureuse, qui met le savoir endogène au même niveau d'exigence que la science moderne.":
    "A structured, rigorous platform that holds endogenous knowledge to the same standard as modern science.",
  "Explorer": "Explore",
  "Produits & services en vedette": "Featured products & services",
  "Voir tout le marketplace": "Browse the full marketplace",
  "Tous": "All",
  "Produits": "Products",
  "Services": "Services",
  "Numériques": "Digital",
  "Voir les 500+ produits": "Browse 500+ products",
  "Confiance & Expertise": "Trust & Expertise",
  "Praticiens vérifiés": "Verified practitioners",
  "Chaque praticien est documenté, évalué et vérifié par notre équipe éditoriale.":
    "Every practitioner is documented, reviewed and verified by our editorial team.",
  "Voir l'annuaire complet": "Browse the full directory",
  "Plantes médicinales documentées": "Documented medicinal plants",
  "Nomenclature scientifique, principes actifs, indications thérapeutiques et préparations illustrées.":
    "Scientific nomenclature, active compounds, therapeutic uses and illustrated preparations.",
  "Explorer la pharmacopée": "Explore the pharmacopoeia",
  "Prochains événements": "Upcoming events",
  "Voir tout →": "See all →",
  "Tout voir →": "View all →",
  "Praticiens documentés": "Documented practitioners",
  "Plantes médicinales": "Medicinal plants",
  "Utilisateurs actifs": "Active users",
  "Pays africains": "African countries",
  "Restez informé des dernières découvertes": "Stay informed of the latest discoveries",
  "Une lettre mensuelle, sans bruit, avec les meilleurs articles et études cliniques publiés sur Iwosan.":
    "A monthly, quiet newsletter with the best articles and clinical studies published on Iwosan.",
  "votre@email.com": "your@email.com",
  "S'abonner": "Subscribe",

  // Space descriptions (home cards)
  "Monographies scientifiques des plantes médicinales africaines.":
    "Scientific monographs of African medicinal plants.",
  "1 200+ plantes": "1,200+ plants",
  "Cérémonies, symboliques végétales et transmission ancestrale.":
    "Ceremonies, plant symbolism and ancestral transmission.",
  "180 articles": "180 articles",
  "Conseils, prévention et bien-être issus des savoirs africains.":
    "Tips, prevention and wellness rooted in African knowledge.",
  "320 articles": "320 articles",
  "Préparations traditionnelles documentées pas à pas.":
    "Traditional preparations documented step by step.",
  "240 recettes": "240 recipes",
  "Forum Q&A entre praticiens, chercheurs et communauté.":
    "Q&A forum between practitioners, researchers and the community.",
  "5 400+ questions": "5,400+ questions",
  "Cours en ligne, webinaires et certifications encadrés.":
    "Online courses, webinars and supervised certifications.",
  "90 formations": "90 courses",

  // ---------- Agenda ----------
  "📅 Agenda": "📅 Calendar",
  "Agenda & Événements": "Calendar & Events",
  "Webinaires, formations, salons et portes ouvertes partout en Afrique et en ligne.":
    "Webinars, training, fairs and open days across Africa and online.",
  "Webinaires": "Webinars",
  "Salons": "Fairs",
  "Portes ouvertes": "Open days",
  "Liste": "List",
  "Calendrier": "Calendar",
  "Juin 2026": "June 2026",

  // ---------- Annuaire ----------
  "📖 Annuaire": "📖 Directory",
  "Annuaire des Praticiens": "Practitioner Directory",
  "Annuaire des praticiens — IWOSAN": "Practitioner Directory — IWOSAN",
  "1 200 praticiens · 35 spécialités · 22 pays — chacun vérifié par notre équipe éditoriale.":
    "1,200 practitioners · 35 specialties · 22 countries — each one vetted by our editorial team.",
  "Toutes spécialités": "All specialties",
  "Tous pays": "All countries",
  "Vérifié uniquement": "Verified only",
  "Charger plus de praticiens": "Load more practitioners",
  "Nom, spécialité, localisation...": "Name, specialty, location...",

  // ---------- Connexion ----------
  "Bon retour !": "Welcome back!",
  "Connectez-vous à votre espace Iwosan": "Sign in to your Iwosan space",
  "Email": "Email",
  "Mot de passe": "Password",
  "Mot de passe oublié ?": "Forgot password?",
  "Connexion": "Sign in",
  "ou": "or",
  "Pas encore inscrit ?": "Not registered yet?",
  "Créer un compte →": "Create an account →",

  // ---------- Discutons-en ----------
  "💬 Forum": "💬 Forum",
  "Posez vos questions, partagez vos savoirs. Un espace modéré où les meilleures réponses sont validées par des praticiens vérifiés.":
    "Ask your questions, share your knowledge. A moderated space where the best answers are validated by verified practitioners.",
  "Poser une question": "Ask a question",
  "Récentes": "Recent",
  "Populaires": "Popular",
  "Sans réponse": "Unanswered",
  "Résolues": "Resolved",
  "Rechercher dans le forum...": "Search the forum...",
  "Top contributeurs": "Top contributors",
  " pts": " pts",
  "Tags populaires": "Popular tags",

  // ---------- Formations ----------
  "🎓 Formations": "🎓 Courses",
  "Formations IWOSAN": "IWOSAN Courses",
  "Cours en ligne, webinaires et certifications encadrés par des praticiens et chercheurs reconnus.":
    "Online courses, webinars and certifications led by recognised practitioners and researchers.",
  "Cours, formateur, thème...": "Course, instructor, topic...",
  "Débutant": "Beginner",
  "Intermédiaire": "Intermediate",
  "Avancé": "Advanced",
  "Gratuit": "Free",
  "Live": "Live",
  "Vidéo": "Video",
  "Accéder": "Open",
  "Pharmacopée fondamentale : 80 plantes essentielles":
    "Foundational pharmacopoeia: 80 essential plants",
  "Protocoles de préparation et dosage clinique":
    "Preparation protocols and clinical dosing",
  "Accompagnement périnatal selon les rites Sawa":
    "Perinatal support according to Sawa rites",
  "Ethnobotanique de terrain : méthodologie":
    "Field ethnobotany: methodology",

  // ---------- Inscription ----------
  "Créer un compte": "Create an account",
  "Rejoignez la communauté Iwosan": "Join the Iwosan community",
  "Je suis...": "I am...",
  "Utilisateur": "User",
  "Découvrir, acheter, échanger": "Discover, buy, share",
  "Professionnel": "Professional",
  "Publier, vendre, consulter": "Publish, sell, consult",
  "Chercheur": "Researcher",
  "Documenter, publier, étudier": "Document, publish, study",
  "Prénom": "First name",
  "Nom": "Last name",
  "🇸🇳 Sénégal": "🇸🇳 Senegal",
  "🇲🇱 Mali": "🇲🇱 Mali",
  "🇨🇮 Côte d'Ivoire": "🇨🇮 Côte d'Ivoire",
  "🇨🇲 Cameroun": "🇨🇲 Cameroon",
  "🇳🇬 Nigeria": "🇳🇬 Nigeria",
  "Confirmer le mot de passe": "Confirm password",
  "ou continuer avec": "or continue with",
  "Déjà inscrit ?": "Already registered?",
  "Se connecter →": "Sign in →",

  // ---------- Marketplace ----------
  "🛍️ Marketplace": "🛍️ Marketplace",
  "Marketplace Iwosan": "Iwosan Marketplace",
  "Produits, services et ressources numériques de la médecine traditionnelle africaine — vérifiés par notre équipe.":
    "Products, services and digital resources from African traditional medicine — vetted by our team.",
  "Plante, produit, vendeur...": "Plant, product, seller...",
  "Filtres": "Filters",
  "Réinitialiser": "Reset",
  "Catégorie": "Category",
  "Type": "Type",
  "Produit physique": "Physical product",
  "Service": "Service",
  "Produit numérique": "Digital product",
  "Évaluation": "Rating",
  "4★ et plus": "4★ and up",
  "3★ et plus": "3★ and up",
  "Vendeur vérifié uniquement": "Verified sellers only",
  "Appliquer les filtres": "Apply filters",
  "Pertinence": "Relevance",
  "Prix croissant": "Price: low to high",
  "Prix décroissant": "Price: high to low",
  "Les mieux notés": "Top rated",
  "Les plus récents": "Most recent",
  // Marketplace categories
  "Gynéco-obstétriques": "Gynaecology & obstetrics",
  "Gastro-intestinales": "Gastro-intestinal",
  "Maladies de l'enfance": "Childhood illnesses",
  "États fébriles/Ictères": "Fevers & jaundice",
  "Affections cutanées": "Skin conditions",
  "Affections du système nerveux": "Nervous system",
  "Affections ostéo-articulaires": "Bone & joint",
  "Affections pulmonaires": "Pulmonary",
  "Affections uro-génitales": "Urogenital",
  "Affections ORL": "ENT",
  "Affections ophtalmologiques": "Ophthalmology",
  "Affections bucco-dentaires": "Oral & dental",
  "Affections cardio-vasculaires": "Cardiovascular",
  "Affections stomatologiques": "Stomatology",
  "Affections mystiques": "Spiritual conditions",

  // ---------- Pharmacopée ----------
  "Exclusif — Géré par l'équipe éditoriale Iwosan":
    "Exclusive — Curated by the Iwosan editorial team",
  "Pharmacopée Vivante": "Living Pharmacopoeia",
  "Monographies scientifiques des plantes médicinales africaines — nomenclature, principes actifs, indications thérapeutiques et modes de préparation illustrés.":
    "Scientific monographs of African medicinal plants — nomenclature, active compounds, therapeutic uses and illustrated preparation methods.",
  "Rechercher une plante par nom scientifique ou vernaculaire...":
    "Search a plant by scientific or vernacular name...",
  "🌿 Plante de la semaine": "🌿 Plant of the week",
  "Indications": "Indications",
  "Lire la monographie complète": "Read the full monograph",
  "Lire la monographie": "Read monograph",
  "Parcourir": "Browse",
  "Par catégorie thérapeutique": "By therapeutic category",
  "Toutes": "All",
  "Anti-infectieux": "Anti-infectives",
  "Gynécologie": "Gynaecology",
  "Gastro-intestinal": "Gastro-intestinal",
  "Neurologie": "Neurology",
  "Dermatologie": "Dermatology",
  "Cardio-vasculaire": "Cardiovascular",
  "Pulmonaire": "Pulmonary",

  // ---------- Recettes santé ----------
  "🍵 Recettes": "🍵 Recipes",
  "Préparations traditionnelles documentées pas à pas, avec dosages, indications et précautions.":
    "Traditional preparations documented step by step — dosages, uses and precautions.",
  "Recette, plante, indication...": "Recipe, plant, use...",
  "Parcourir par thème": "Browse by theme",
  "Tisanes & infusions": "Teas & infusions",
  "Décoctions": "Decoctions",
  "Cataplasmes & baumes": "Poultices & balms",
  "Préparations culinaires santé": "Healthful cooking",
  "64 recettes": "64 recipes",
  "42 recettes": "42 recipes",
  "28 recettes": "28 recipes",
  "53 recettes": "53 recipes",
  "Besoin d'aide ?": "Need help?",
  "Un doute sur une posologie, une plante, une indication ? Notre équipe répond sous 24h.":
    "A doubt about a dosage, a plant or a use? Our team replies within 24h.",
  "Ouvrir un ticket": "Open a ticket",

  // ---------- Rites & Cultures ----------
  "📜 Patrimoine vivant": "📜 Living heritage",
  "Cérémonies de guérison, symboliques végétales et transmission des savoirs initiatiques à travers le continent.":
    "Healing ceremonies, plant symbolism and transmission of initiatory knowledge across the continent.",
  "Cérémonies de guérison": "Healing ceremonies",
  "Symboliques végétales": "Plant symbolism",
  "Transmission maître-disciple": "Master-disciple transmission",
  "Rites initiatiques": "Initiation rites",

  // ---------- Santé au quotidien ----------
  "📰 Blog": "📰 Blog",
  "Conseils pratiques, prévention et bien-être issus des savoirs africains, vulgarisés par nos experts.":
    "Practical tips, prevention and wellness from African knowledge, made accessible by our experts.",
  "Catégories": "Categories",
  "Nutrition": "Nutrition",
  "Sommeil": "Sleep",
  "Prévention": "Prevention",
  "Femme & enfant": "Women & children",
  "Maladies chroniques": "Chronic diseases",
  "Bien-être mental": "Mental wellness",
  "Articles populaires": "Popular articles",

  // ---------- Tableau de bord ----------
  "Vue d'ensemble": "Overview",
  "Boutique": "Shop",
  "Mes produits": "My products",
  "Commandes": "Orders",
  "Revenus": "Revenue",
  "Coupons": "Coupons",
  "Profil": "Profile",
  "Mon profil": "My profile",
  "Avis reçus": "Reviews received",
  "Mon blog": "My blog",
  "Mes questions": "My questions",
  "Mes formations": "My courses",
  "Mes événements": "My events",
  "Réseau": "Network",
  "Mon réseau": "My network",
  "Affiliations": "Affiliations",
  "Commissions": "Commissions",
  "Compte": "Account",
  "Paramètres": "Settings",
  "Notifications": "Notifications",
  "KYC": "KYC",
  "Déconnexion": "Sign out",
  "Praticien": "Practitioner",
  "Bonjour, Aïssata 👋": "Hi, Aïssata 👋",
  "Lundi 8 juin 2026": "Monday, June 8, 2026",
  "Revenus du mois": "Monthly revenue",
  "Commandes actives": "Active orders",
  "Produits publiés": "Published products",
  "Messages non lus": "Unread messages",
  " vs mois dernier": " vs last month",
  "+ Ajouter un produit": "+ Add a product",
  "Voir mes commandes": "View my orders",
  "Voir mes messages": "View my messages",
  "Commandes récentes": "Recent orders",
  "Produit": "Product",
  "Acheteur": "Buyer",
  "Montant": "Amount",
  "Statut": "Status",
  "Expédiée": "Shipped",
  "Livrée": "Delivered",
  "En attente": "Pending",
  "Tisane post-partum": "Post-partum tea",
  "Beurre de karité 250g": "Shea butter 250g",
  "Consultation 60 min": "60 min consultation",
  "Ebook Atlas plantes": "Plant Atlas eBook",
  "Messages récents": "Recent messages",
  "Bonjour, est-ce que la tisane est sans danger pendant l'allaitement ?":
    "Hello, is the tea safe while breastfeeding?",
  "Merci pour la livraison rapide ! Avez-vous d'autres produits...":
    "Thanks for the fast delivery! Do you have other products...",
  "Je souhaiterais reporter mon rendez-vous de jeudi":
    "I'd like to reschedule my Thursday appointment",
  "L'ebook est-il téléchargeable plusieurs fois ?":
    "Can the eBook be downloaded multiple times?",
  "il y a 12 min": "12 min ago",
  "il y a 1h": "1h ago",
  "il y a 3h": "3h ago",
  "hier": "yesterday",

  // ---------- Shared components ----------
  "Lire": "Read",
  "Voir": "View",
  "Contacter": "Contact",
  "Enchère": "Auction",
  "Voir le profil": "View profile",
  "Rechercher...": "Search...",
  "par ": "by ",
  " rép.": " replies",
  "S'inscrire →": "Register →",

  // ---------- Data: spaces (article cards) — "Pharmacopée" already mapped above ----------


  // ---------- Data: articles ----------
  "Le Moringa, superaliment endémique : 12 études cliniques décodées":
    "Moringa, an endemic superfood: 12 clinical studies decoded",
  "Synthèse rigoureuse des recherches sur Moringa oleifera, ses indications validées et les zones d'ombre.":
    "A rigorous synthesis of research on Moringa oleifera, its validated uses and remaining gaps.",
  "Rites de naissance chez les Baoulé : transmission et symbolique":
    "Birth rites among the Baoulé: transmission and symbolism",
  "Du septième jour à l'imposition du nom, un voyage ethnographique au cœur de la Côte d'Ivoire centrale.":
    "From the seventh day to the naming ceremony — an ethnographic journey through central Côte d'Ivoire.",
  "Alimentation anti-inflammatoire : retour aux fondamentaux africains":
    "Anti-inflammatory diet: back to African fundamentals",
  "Fonio, baobab, hibiscus : trois piliers d'une diète traditionnelle redécouverte par la nutrition moderne.":
    "Fonio, baobab, hibiscus: three pillars of a traditional diet rediscovered by modern nutrition.",
  "Recette : tisane digestive kinkéliba-citronnelle":
    "Recipe: kinkeliba & lemongrass digestive tea",
  "Préparation, dosage et précautions d'usage pour une infusion quotidienne post-repas.":
    "Preparation, dosage and precautions for a daily after-meal infusion.",
  "Le neem face au paludisme : où en est la science ?":
    "Neem against malaria: where does the science stand?",
  "Revue des essais cliniques et limites des extraits standardisés d'Azadirachta indica.":
    "Review of clinical trials and the limits of standardised Azadirachta indica extracts.",
  "Le beurre de karité : preuves cliniques en cicatrisation":
    "Shea butter: clinical evidence for wound healing",
  "Composition, mécanismes d'action et indications validées sur l'eczéma et les brûlures superficielles.":
    "Composition, mechanisms and validated uses for eczema and superficial burns.",
  "Ethnobotanique": "Ethnobotany",
  "Sage-femme": "Midwife",
  "Nutritionniste": "Nutritionist",
  "Tradi-praticienne": "Traditional practitioner",
  "Phytothérapeute": "Phytotherapist",
  "Herboriste": "Herbalist",

  // ---------- Data: events ----------
  "Webinaire — Pharmacopée et diabète type 2":
    "Webinar — Pharmacopoeia and type-2 diabetes",
  "WEBINAIRE": "WEBINAR",
  "FORMATION": "COURSE",
  "SALON": "FAIR",
  "En ligne": "Online",
  "Quelles plantes africaines documentées dans la prise en charge du diabète ? Avec Dr. Kwame Mensah.":
    "Which documented African plants help manage diabetes? With Dr. Kwame Mensah.",
  "Formation — Préparation des décoctions selon les protocoles INRSP":
    "Course — Preparing decoctions following INRSP protocols",
  "Bamako, Mali": "Bamako, Mali",
  "Atelier pratique 2 jours sur les bonnes pratiques de préparation, dosage et conservation.":
    "Two-day hands-on workshop on best practices for preparation, dosing and storage.",
  "Salon Panafricain de la Médecine Traditionnelle":
    "Pan-African Traditional Medicine Fair",
  "Dakar, Sénégal": "Dakar, Senegal",
  "3 jours de conférences, exposants et rencontres entre tradi-praticiens, chercheurs et institutionnels.":
    "Three days of talks, exhibitors and meetings between traditional practitioners, researchers and institutions.",
  "Webinaire — Rites de guérison et santé mentale":
    "Webinar — Healing rites and mental health",
  "Approche anthropologique et thérapeutique des rites traditionnels en santé mentale.":
    "Anthropological and therapeutic approach to traditional rites in mental health.",

  // ---------- Data: plants ----------
  "Plante emblématique du Sahel, utilisée en infusion pour ses propriétés hépatoprotectrices et diurétiques.":
    "Iconic Sahelian plant, used as an infusion for its hepatoprotective and diuretic properties.",
  "Source exceptionnelle de protéines, vitamines et minéraux. Utilisé en feuilles fraîches ou poudre.":
    "An exceptional source of protein, vitamins and minerals. Used as fresh leaves or powder.",
  "Arbre aux mille vertus, principes actifs étudiés pour leurs effets antimicrobiens et antiparasitaires.":
    "Tree of a thousand virtues, with compounds studied for antimicrobial and antiparasitic effects.",
  "Beurre extrait des noix, riche en insaponifiables, base de la cosmétique traditionnelle ouest-africaine.":
    "Butter extracted from the nuts, rich in unsaponifiables, the basis of West African traditional cosmetics.",
  "Toutes les parties sont utilisées : fruit (pulpe acidulée), feuilles (lalo), écorce (fibres médicinales).":
    "All parts are used: fruit (tangy pulp), leaves (lalo), bark (medicinal fibres).",
  "Source d'artémisinine, désormais cultivée et étudiée par les programmes africains de lutte antipaludique.":
    "Source of artemisinin, now grown and studied by African antimalarial programmes.",
  "Digestion": "Digestion",
  "Détoxification hépatique": "Liver detoxification",
  "Fièvre": "Fever",
  "Malnutrition": "Malnutrition",
  "Anémie": "Anaemia",
  "Hypertension": "Hypertension",
  "Paludisme": "Malaria",
  "Dermatoses": "Skin conditions",
  "Antiparasitaire": "Antiparasitic",
  "Cicatrisation": "Wound healing",
  "Eczéma": "Eczema",
  "Vergetures": "Stretch marks",
  "Diarrhée": "Diarrhea",
  "Carences vitamine C": "Vitamin C deficiency",
  "Fièvres récurrentes": "Recurring fevers",

  // ---------- Data: products ----------
  "Tisane post-partum — Mélange Kinkéliba & Moringa":
    "Post-partum tea — Kinkeliba & Moringa blend",
  "Consultation phytothérapie diabète — 60 min":
    "Diabetes phytotherapy consultation — 60 min",
  "Beurre de karité brut — Soin dermatologique 250g":
    "Raw shea butter — Skincare 250g",
  "Ebook — Atlas de 80 plantes médicinales sahéliennes":
    "eBook — Atlas of 80 Sahelian medicinal plants",
  "Huile essentielle de Kinkéliba — 30ml":
    "Kinkeliba essential oil — 30ml",
  "Formation — Préparation des décoctions traditionnelles":
    "Course — Preparing traditional decoctions",
  "Baume rebouteux — Entorses & douleurs musculaires":
    "Bonesetter's balm — Sprains & muscle pain",
  "Programme nutrition diabète — 12 semaines":
    "Diabetes nutrition programme — 12 weeks",

  // ---------- Data: professionals ----------
  "Tradi-praticienne — Pharmacopée femme & enfant":
    "Traditional practitioner — Women & children pharmacopoeia",
  "Bamako": "Bamako",
  "Mali": "Mali",
  "Quarante ans d'expérience auprès des femmes enceintes et nourrissons. Formée à l'INRSP.":
    "Forty years of experience with pregnant women and infants. INRSP-trained.",
  "Gynéco-obstétrique": "Gynaecology & obstetrics",
  "Soins du nourrisson": "Infant care",
  "Fertilité": "Fertility",
  "Phytothérapeute — Maladies chroniques": "Phytotherapist — Chronic diseases",
  "Accra": "Accra",
  "Ghana": "Ghana",
  "Médecin et tradi-praticien, pont entre pharmacopée moderne et savoirs ancestraux Akan.":
    "Physician and traditional practitioner, bridging modern pharmacopoeia and ancestral Akan knowledge.",
  "Diabète": "Diabetes",
  "Hépatites": "Hepatitis",
  "Herboriste — Dermatologie traditionnelle": "Herbalist — Traditional dermatology",
  "Enugu": "Enugu",
  "Nigeria": "Nigeria",
  "Gardienne du savoir Igbo sur les affections cutanées et préparations à base de karité et neem.":
    "Keeper of Igbo knowledge on skin conditions and shea- and neem-based preparations.",
  "Vitiligo": "Vitiligo",
  "Guérisseur — Affections ostéo-articulaires": "Healer — Bone & joint conditions",
  "Conakry": "Conakry",
  "Guinée": "Guinea",
  "Rebouteur reconnu, transmission familiale sur six générations. Spécialiste des entorses et fractures.":
    "Renowned bonesetter, family lineage of six generations. Specialist in sprains and fractures.",
  "Fractures": "Fractures",
  "Arthrose": "Osteoarthritis",
  "Lombalgies": "Lower-back pain",
  "Chercheuse — Ethnobotanique": "Researcher — Ethnobotany",
  "Ouagadougou": "Ouagadougou",
  "Burkina Faso": "Burkina Faso",
  "Docteure en ethnopharmacologie, auteure de 30+ publications sur les plantes médicinales sahéliennes.":
    "PhD in ethnopharmacology, author of 30+ publications on Sahelian medicinal plants.",
  "Recherche clinique": "Clinical research",
  "Inventaire floristique": "Floristic survey",
  "Formation": "Training",
  "Sage-femme traditionnelle": "Traditional midwife",
  "Douala": "Douala",
  "Cameroun": "Cameroon",
  "Accompagnement de grossesse et postpartum selon les rites Sawa, intégration approche moderne.":
    "Pregnancy and postpartum support following Sawa rites, integrated with a modern approach.",
  "Accouchement": "Childbirth",
  "Postpartum": "Postpartum",
  "Lactation": "Lactation",
  "Aromathérapeute — Huiles essentielles africaines":
    "Aromatherapist — African essential oils",
  "Dakar": "Dakar",
  "Sénégal": "Senegal",
  "Producteur et formateur en huiles essentielles de plantes endémiques ouest-africaines.":
    "Producer and trainer in essential oils from endemic West African plants.",
  "Aromathérapie": "Aromatherapy",
  "Distillation": "Distillation",
  "Cosmétique naturelle": "Natural cosmetics",
  "Nutritionniste traditionnelle": "Traditional nutritionist",
  "Saint-Louis": "Saint-Louis",
  "Spécialiste de la diététique africaine et du jeûne thérapeutique selon les traditions wolof.":
    "Specialist in African nutrition and therapeutic fasting following Wolof traditions.",
  "Diabète type 2": "Type-2 diabetes",
  "Surpoids": "Overweight",
  "Nutrition enfant": "Child nutrition",

  // ---------- Data: questions ----------
  "Quelle posologie de kinkéliba pour un foie fatigué chez un adulte ?":
    "What kinkeliba dosage for a tired liver in an adult?",
  "Bonjour, j'ai des transaminases élevées suite à un traitement. On m'a recommandé le kinkéliba, mais à quelle dose et combien de temps ?":
    "Hi, I have elevated transaminases after a treatment. Kinkeliba was recommended — what dose and for how long?",
  "Moringa en poudre pendant la grossesse : prudence ou bénéfice ?":
    "Moringa powder during pregnancy: caution or benefit?",
  "Ma belle-mère insiste pour que je prenne du moringa quotidiennement. Existe-t-il des contre-indications au premier trimestre ?":
    "My mother-in-law insists I take moringa daily. Are there contraindications in the first trimester?",

  // ---------- Misc tokens used in JSX ----------
  ", ": ", ",
};
