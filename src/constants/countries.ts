// ─────────────────────────────────────────────────────────────
// 🌍 LISTE COMPLÈTE DES PAYS DU MONDE
// Bénin suggéré en premier (marché principal Iwosan)
// Reste classé par ordre alphabétique
// ─────────────────────────────────────────────────────────────

export interface Country {
  code: string;   // Code ISO 3166-1 alpha-2
  name: string;   // Nom en français
  flag: string;   // Emoji drapeau
  suggested?: boolean; // Suggéré en haut de liste
}

// ─── PAYS SUGGÉRÉS (affichés en premier) ───
export const SUGGESTED_COUNTRIES: Country[] = [
  { code: "BJ", name: "Bénin", flag: "🇧🇯", suggested: true },
];

// ─── TOUS LES PAYS PAR ORDRE ALPHABÉTIQUE ───
export const ALL_COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦" },
  { code: "AL", name: "Albanie", flag: "🇦🇱" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪" },
  { code: "AD", name: "Andorre", flag: "🇦🇩" },
  { code: "AO", name: "Angola", flag: "🇦🇴" },
  { code: "AG", name: "Antigua-et-Barbuda", flag: "🇦🇬" },
  { code: "SA", name: "Arabie Saoudite", flag: "🇸🇦" },
  { code: "AR", name: "Argentine", flag: "🇦🇷" },
  { code: "AM", name: "Arménie", flag: "🇦🇲" },
  { code: "AU", name: "Australie", flag: "🇦🇺" },
  { code: "AT", name: "Autriche", flag: "🇦🇹" },
  { code: "AZ", name: "Azerbaïdjan", flag: "🇦🇿" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸" },
  { code: "BH", name: "Bahreïn", flag: "🇧🇭" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "BB", name: "Barbade", flag: "🇧🇧" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
  { code: "BZ", name: "Belize", flag: "🇧🇿" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯" },
  { code: "BT", name: "Bhoutan", flag: "🇧🇹" },
  { code: "BY", name: "Biélorussie", flag: "🇧🇾" },
  { code: "MM", name: "Birmanie (Myanmar)", flag: "🇲🇲" },
  { code: "BO", name: "Bolivie", flag: "🇧🇴" },
  { code: "BA", name: "Bosnie-Herzégovine", flag: "🇧🇦" },
  { code: "BW", name: "Botswana", flag: "🇧🇼" },
  { code: "BR", name: "Brésil", flag: "🇧🇷" },
  { code: "BN", name: "Brunéi", flag: "🇧🇳" },
  { code: "BG", name: "Bulgarie", flag: "🇧🇬" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "BI", name: "Burundi", flag: "🇧🇮" },
  { code: "CV", name: "Cabo Verde", flag: "🇨🇻" },
  { code: "KH", name: "Cambodge", flag: "🇰🇭" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CF", name: "Centrafrique", flag: "🇨🇫" },
  { code: "CL", name: "Chili", flag: "🇨🇱" },
  { code: "CN", name: "Chine", flag: "🇨🇳" },
  { code: "CY", name: "Chypre", flag: "🇨🇾" },
  { code: "CO", name: "Colombie", flag: "🇨🇴" },
  { code: "KM", name: "Comores", flag: "🇰🇲" },
  { code: "CG", name: "Congo", flag: "🇨🇬" },
  { code: "CD", name: "Congo (RDC)", flag: "🇨🇩" },
  { code: "KP", name: "Corée du Nord", flag: "🇰🇵" },
  { code: "KR", name: "Corée du Sud", flag: "🇰🇷" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "HR", name: "Croatie", flag: "🇭🇷" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "DK", name: "Danemark", flag: "🇩🇰" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯" },
  { code: "DM", name: "Dominique", flag: "🇩🇲" },
  { code: "EG", name: "Égypte", flag: "🇪🇬" },
  { code: "AE", name: "Émirats Arabes Unis", flag: "🇦🇪" },
  { code: "EC", name: "Équateur", flag: "🇪🇨" },
  { code: "ER", name: "Érythrée", flag: "🇪🇷" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "EE", name: "Estonie", flag: "🇪🇪" },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿" },
  { code: "ET", name: "Éthiopie", flag: "🇪🇹" },
  { code: "FJ", name: "Fidji", flag: "🇫🇯" },
  { code: "FI", name: "Finlande", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "GM", name: "Gambie", flag: "🇬🇲" },
  { code: "GE", name: "Géorgie", flag: "🇬🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "GR", name: "Grèce", flag: "🇬🇷" },
  { code: "GD", name: "Grenade", flag: "🇬🇩" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "GN", name: "Guinée", flag: "🇬🇳" },
  { code: "GW", name: "Guinée-Bissau", flag: "🇬🇼" },
  { code: "GQ", name: "Guinée équatoriale", flag: "🇬🇶" },
  { code: "GY", name: "Guyana", flag: "🇬🇾" },
  { code: "HT", name: "Haïti", flag: "🇭🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "HU", name: "Hongrie", flag: "🇭🇺" },
  { code: "IN", name: "Inde", flag: "🇮🇳" },
  { code: "ID", name: "Indonésie", flag: "🇮🇩" },
  { code: "IQ", name: "Irak", flag: "🇮🇶" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IE", name: "Irlande", flag: "🇮🇪" },
  { code: "IS", name: "Islande", flag: "🇮🇸" },
  { code: "IL", name: "Israël", flag: "🇮🇱" },
  { code: "IT", name: "Italie", flag: "🇮🇹" },
  { code: "JM", name: "Jamaïque", flag: "🇯🇲" },
  { code: "JP", name: "Japon", flag: "🇯🇵" },
  { code: "JO", name: "Jordanie", flag: "🇯🇴" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "KG", name: "Kirghizistan", flag: "🇰🇬" },
  { code: "KI", name: "Kiribati", flag: "🇰🇮" },
  { code: "XK", name: "Kosovo", flag: "🇽🇰" },
  { code: "KW", name: "Koweït", flag: "🇰🇼" },
  { code: "LA", name: "Laos", flag: "🇱🇦" },
  { code: "LS", name: "Lesotho", flag: "🇱🇸" },
  { code: "LV", name: "Lettonie", flag: "🇱🇻" },
  { code: "LB", name: "Liban", flag: "🇱🇧" },
  { code: "LR", name: "Libéria", flag: "🇱🇷" },
  { code: "LY", name: "Libye", flag: "🇱🇾" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮" },
  { code: "LT", name: "Lituanie", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬" },
  { code: "MY", name: "Malaisie", flag: "🇲🇾" },
  { code: "MW", name: "Malawi", flag: "🇲🇼" },
  { code: "MV", name: "Maldives", flag: "🇲🇻" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "MT", name: "Malte", flag: "🇲🇹" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "MH", name: "Marshall (Îles)", flag: "🇲🇭" },
  { code: "MU", name: "Maurice", flag: "🇲🇺" },
  { code: "MR", name: "Mauritanie", flag: "🇲🇷" },
  { code: "MX", name: "Mexique", flag: "🇲🇽" },
  { code: "FM", name: "Micronésie", flag: "🇫🇲" },
  { code: "MD", name: "Moldavie", flag: "🇲🇩" },
  { code: "MC", name: "Monaco", flag: "🇲🇨" },
  { code: "MN", name: "Mongolie", flag: "🇲🇳" },
  { code: "ME", name: "Monténégro", flag: "🇲🇪" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿" },
  { code: "NA", name: "Namibie", flag: "🇳🇦" },
  { code: "NR", name: "Nauru", flag: "🇳🇷" },
  { code: "NP", name: "Népal", flag: "🇳🇵" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "NE", name: "Niger", flag: "🇳🇪" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norvège", flag: "🇳🇴" },
  { code: "NZ", name: "Nouvelle-Zélande", flag: "🇳🇿" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "UG", name: "Ouganda", flag: "🇺🇬" },
  { code: "UZ", name: "Ouzbékistan", flag: "🇺🇿" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "PW", name: "Palaos", flag: "🇵🇼" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "PG", name: "Papouasie-Nouvelle-Guinée", flag: "🇵🇬" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "NL", name: "Pays-Bas", flag: "🇳🇱" },
  { code: "PE", name: "Pérou", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Pologne", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "RO", name: "Roumanie", flag: "🇷🇴" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "RU", name: "Russie", flag: "🇷🇺" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "KN", name: "Saint-Kitts-et-Nevis", flag: "🇰🇳" },
  { code: "LC", name: "Sainte-Lucie", flag: "🇱🇨" },
  { code: "VC", name: "Saint-Vincent-et-les-Grenadines", flag: "🇻🇨" },
  { code: "SB", name: "Salomon (Îles)", flag: "🇸🇧" },
  { code: "SV", name: "Salvador", flag: "🇸🇻" },
  { code: "WS", name: "Samoa", flag: "🇼🇸" },
  { code: "SM", name: "Saint-Marin", flag: "🇸🇲" },
  { code: "ST", name: "Sao Tomé-et-Principe", flag: "🇸🇹" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "RS", name: "Serbie", flag: "🇷🇸" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱" },
  { code: "SG", name: "Singapour", flag: "🇸🇬" },
  { code: "SK", name: "Slovaquie", flag: "🇸🇰" },
  { code: "SI", name: "Slovénie", flag: "🇸🇮" },
  { code: "SO", name: "Somalie", flag: "🇸🇴" },
  { code: "SD", name: "Soudan", flag: "🇸🇩" },
  { code: "SS", name: "Soudan du Sud", flag: "🇸🇸" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "SE", name: "Suède", flag: "🇸🇪" },
  { code: "CH", name: "Suisse", flag: "🇨🇭" },
  { code: "SR", name: "Suriname", flag: "🇸🇷" },
  { code: "SY", name: "Syrie", flag: "🇸🇾" },
  { code: "TJ", name: "Tadjikistan", flag: "🇹🇯" },
  { code: "TZ", name: "Tanzanie", flag: "🇹🇿" },
  { code: "TD", name: "Tchad", flag: "🇹🇩" },
  { code: "CZ", name: "Tchéquie", flag: "🇨🇿" },
  { code: "TH", name: "Thaïlande", flag: "🇹🇭" },
  { code: "TL", name: "Timor oriental", flag: "🇹🇱" },
  { code: "TG", name: "Togo", flag: "🇹🇬" },
  { code: "TO", name: "Tonga", flag: "🇹🇴" },
  { code: "TT", name: "Trinité-et-Tobago", flag: "🇹🇹" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳" },
  { code: "TM", name: "Turkménistan", flag: "🇹🇲" },
  { code: "TR", name: "Turquie", flag: "🇹🇷" },
  { code: "TV", name: "Tuvalu", flag: "🇹🇻" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺" },
  { code: "VA", name: "Vatican", flag: "🇻🇦" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "YE", name: "Yémen", flag: "🇾🇪" },
  { code: "ZM", name: "Zambie", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼" },
];

// ─────────────────────────────────────────────────────────────
// 🎯 LISTE FINALE : Bénin en premier + tous les autres
// C'est cette liste que tu utilises dans tes formulaires
// ─────────────────────────────────────────────────────────────

export const COUNTRIES_WITH_SUGGESTION: Country[] = [
  ...SUGGESTED_COUNTRIES,
  { code: "SEPARATOR", name: "──────────────", flag: "" }, // Séparateur visuel
  ...ALL_COUNTRIES,
];

// ─────────────────────────────────────────────────────────────
// 🔍 FONCTIONS UTILITAIRES
// ─────────────────────────────────────────────────────────────

// Obtenir le nom d'un pays par son code
export const getCountryName = (code: string): string => {
  const country = ALL_COUNTRIES.find((c) => c.code === code);
  return country ? country.name : code;
};

// Obtenir le drapeau d'un pays par son code
export const getCountryFlag = (code: string): string => {
  const country = ALL_COUNTRIES.find((c) => c.code === code);
  return country ? country.flag : "🌍";
};

// Rechercher des pays par nom
export const searchCountries = (query: string): Country[] => {
  const q = query.toLowerCase().trim();
  if (!q) return COUNTRIES_WITH_SUGGESTION;
  return ALL_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(q)
  );
};

export default COUNTRIES_WITH_SUGGESTION;
