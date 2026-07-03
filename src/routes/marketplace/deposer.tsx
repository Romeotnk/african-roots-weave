import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileArchive,
  Gavel,
  ImagePlus,
  Info,
  Leaf,
  MapPin,
  Package,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { ProductCard } from "@/components/shared/ProductCard";
import type { Product } from "@/types";

export const Route = createFileRoute("/marketplace/deposer")({
  head: () => ({ meta: [{ title: "Deposer une annonce - IWOSAN" }] }),
  component: DepositListing,
});

const sellerReadiness = [
  { label: "Email verifie", done: true },
  { label: "KYC soumis et approuve", done: true },
  { label: "Photo de profil ajoutee", done: true },
  { label: "Numero de telephone verifie", done: true },
];

const productTypes = [
  { id: "physical", label: "Physique", desc: "Plantes, remedes, huiles, produits a livrer.", icon: Package },
  { id: "service", label: "Service", desc: "Consultation, accompagnement, preparation sur demande.", icon: Stethoscope },
  { id: "digital", label: "Digital", desc: "PDF, formation, fichier ou ressource telechargeable.", icon: FileArchive },
] as const;

const medicalCategories = [
  "Gyneco-obstetriques",
  "Gastro-intestinales",
  "Maladies de l'enfance",
  "Etats febriles/Icteres",
  "Affections cutanees",
  "Systeme nerveux",
  "Osteo-articulaire",
  "Pulmonaire",
  "Uro-genital",
  "ORL",
  "Ophtalmologique",
  "Bucco-dentaire",
  "Cardio-vasculaire",
  "Stomatologique",
  "Mystique",
];

const steps = ["Base", "Localisation", "Medias", "Options", "Recapitulatif"];

function DepositListing() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Tisane digestive au kinkeliba");
  const [type, setType] = useState<(typeof productTypes)[number]["id"]>("physical");
  const [category, setCategory] = useState(medicalCategories[0]);
  const [description, setDescription] = useState(
    "Preparation traditionnelle documentee, issue de feuilles selectionnees et sechees a l'ombre.",
  );
  const [price, setPrice] = useState("8500");
  const [currency, setCurrency] = useState("XOF");
  const [oldPrice, setOldPrice] = useState("");
  const [quantity, setQuantity] = useState("25");
  const [country, setCountry] = useState("BJ");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState({ lat: 6.37, lng: 2.43 });
  const [media, setMedia] = useState<string[]>([
    "https://images.unsplash.com/photo-1597318181409-cf64d0b9d3d2?w=800&q=80&auto=format&fit=crop",
  ]);
  const [digitalUrl, setDigitalUrl] = useState("");
  const [auction, setAuction] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState(false);
  const [tags, setTags] = useState(["kinkeliba", "digestion"]);
  const [tagInput, setTagInput] = useState("");
  const [terms, setTerms] = useState(false);
  const [salesPolicy, setSalesPolicy] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const canAccess = sellerReadiness.every((item) => item.done);
  const estimatedCommission = Math.round((Number(price) || 0) * 0.1);

  const previewProduct: Product = useMemo(
    () => ({
      id: "preview",
      title: title || "Titre de l'annonce",
      category,
      type,
      price: Number(price) || 0,
      currency,
      image: media[0] ?? "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
      sellerId: "me",
      sellerName: "Votre boutique",
      sellerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
      rating: 0,
      reviewCount: 0,
      auction,
    }),
    [auction, category, currency, media, price, title, type],
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const previews = Array.from(files)
      .slice(0, 10 - media.length)
      .map((file) => URL.createObjectURL(file));
    setMedia((current) => [...current, ...previews].slice(0, 10));
  };

  const addTag = () => {
    const next = tagInput.trim().toLowerCase();
    if (!next || tags.includes(next)) return;
    setTags((current) => [...current, next]);
    setTagInput("");
  };

  const publish = (mode: "draft" | "publish") => {
    if (mode === "publish" && (!terms || !salesPolicy)) {
      setConfirmation("Veuillez accepter les CGU et la politique de vente avant publication.");
      return;
    }
    setConfirmation(
      mode === "draft"
        ? "Brouillon enregistre localement. La liaison API sera branchee en section finale."
        : "Votre annonce est soumise a moderation et sera visible sous 24h.",
    );
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
            Marketplace
          </p>
          <h1 className="mt-2 text-[32px] md:text-[44px]">Deposer une annonce</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--color-text-secondary)]">
            Publiez un produit, un service ou une ressource digitale avec un parcours complet en mock,
            pret pour la moderation puis le branchement API.
          </p>
        </div>
      </section>

      <section className="container-iwosan py-8 grid lg:grid-cols-[300px_1fr] gap-8">
        <aside className="space-y-5">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="font-bold">Profil vendeur</h2>
            <div className="mt-4 space-y-3">
              {sellerReadiness.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-[13px]">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full ${item.done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                  >
                    {item.done ? <Check size={14} /> : <Info size={14} />}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            {!canAccess && (
              <div className="mt-4 rounded-lg bg-amber-50 p-3 text-[13px] text-amber-800">
                Completez les etapes manquantes pour publier une annonce.
              </div>
            )}
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="font-bold">Progression</h2>
            <ol className="mt-4 space-y-2">
              {steps.map((label, index) => (
                <li key={label}>
                  <button
                    onClick={() => setStep(index)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold ${step === index ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)]"}`}
                  >
                    {index + 1}. {label}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 md:p-7">
          {!canAccess ? (
            <div className="p-8 text-center">
              <ShieldCheck className="mx-auto text-[var(--brand-primary)]" size={42} />
              <h2 className="mt-4 text-[24px]">Verification requise</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
                La publication est bloquee tant que le profil vendeur n'est pas complet.
              </p>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[13px] font-semibold">Titre</label>
                    <input
                      value={title}
                      maxLength={150}
                      onChange={(event) => setTitle(event.target.value)}
                      className="mt-2 h-11 w-full rounded-lg border border-[var(--brand-border)] px-4 outline-none focus:border-[var(--brand-primary)]"
                    />
                    <p className="mt-1 text-right text-[12px] text-[var(--color-text-muted)]">
                      {title.length}/150
                    </p>
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold">Type de produit</p>
                    <div className="mt-3 grid md:grid-cols-3 gap-3">
                      {productTypes.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setType(item.id)}
                          className={`rounded-[12px] border-2 p-4 text-left transition ${type === item.id ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border)] hover:border-[var(--brand-primary)]"}`}
                        >
                          <item.icon size={22} className="text-[var(--brand-primary)]" />
                          <p className="mt-3 font-bold">{item.label}</p>
                          <p className="mt-1 text-[12px] leading-5 text-[var(--color-text-muted)]">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold">Categorie medicale</p>
                    <div className="mt-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {medicalCategories.map((item) => (
                        <button
                          key={item}
                          onClick={() => setCategory(item)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] ${category === item ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] font-semibold text-[var(--brand-primary)]" : "border-[var(--brand-border)]"}`}
                        >
                          <Leaf size={15} /> {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold">Description longue</label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={6}
                      className="mt-2 w-full rounded-lg border border-[var(--brand-border)] px-4 py-3 outline-none focus:border-[var(--brand-primary)]"
                    />
                    <div className="mt-2 flex gap-2 text-[12px]">
                      {["Gras", "Italique", "Liste"].map((item) => (
                        <span key={item} className="rounded-full bg-[var(--brand-surface-alt)] px-3 py-1 font-semibold">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3">
                    {!quoteRequest && (
                      <>
                        <input
                          type="number"
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                          placeholder="Prix"
                          className="h-11 rounded-lg border border-[var(--brand-border)] px-4"
                        />
                        <select
                          value={currency}
                          onChange={(event) => setCurrency(event.target.value)}
                          className="h-11 rounded-lg border border-[var(--brand-border)] px-4 bg-white"
                        >
                          <option>XOF</option>
                          <option>EUR</option>
                          <option>USD</option>
                        </select>
                        <input
                          type="number"
                          value={oldPrice}
                          onChange={(event) => setOldPrice(event.target.value)}
                          placeholder="Prix barre"
                          className="h-11 rounded-lg border border-[var(--brand-border)] px-4"
                        />
                      </>
                    )}
                    {type === "physical" && (
                      <input
                        type="number"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        placeholder="Quantite"
                        className="h-11 rounded-lg border border-[var(--brand-border)] px-4"
                      />
                    )}
                  </div>
                  {!quoteRequest && (
                    <p className="rounded-lg bg-[var(--brand-primary-subtle)] px-4 py-3 text-[13px] text-[var(--brand-primary)]">
                      Commission estimee: {estimatedCommission.toLocaleString("fr-FR")} {currency} (10%).
                    </p>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <CountrySelect
                    value={country}
                    onChange={setCountry}
                    className="w-full h-11 rounded-lg border border-[var(--brand-border)] px-4 bg-white"
                    required
                  />
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="Ville"
                      className="h-11 rounded-lg border border-[var(--brand-border)] px-4"
                    />
                    <input
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Adresse precise (optionnel)"
                      className="h-11 rounded-lg border border-[var(--brand-border)] px-4"
                    />
                  </div>
                  <div className="rounded-[12px] border border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-4">
                    <div className="relative h-[280px] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#dff1e7,#f8f3d4)]">
                      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
                      <div className="absolute left-[52%] top-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-primary)] p-3 text-white shadow-iwosan-md">
                        <MapPin size={24} />
                      </div>
                      <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-[12px]">
                        Lat {coords.lat.toFixed(3)} / Lng {coords.lng.toFixed(3)}
                      </div>
                    </div>
                    <div className="mt-3 grid md:grid-cols-3 gap-3">
                      <input
                        type="number"
                        step="0.001"
                        value={coords.lat}
                        onChange={(event) => setCoords((current) => ({ ...current, lat: Number(event.target.value) }))}
                        className="h-10 rounded-lg border border-[var(--brand-border)] px-3"
                      />
                      <input
                        type="number"
                        step="0.001"
                        value={coords.lng}
                        onChange={(event) => setCoords((current) => ({ ...current, lng: Number(event.target.value) }))}
                        className="h-10 rounded-lg border border-[var(--brand-border)] px-3"
                      />
                      <button
                        onClick={() => setCoords({ lat: 6.37, lng: 2.43 })}
                        className="h-10 rounded-lg bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white"
                      >
                        Utiliser ma position
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <label
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleFiles(event.dataTransfer.files);
                    }}
                    className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-6 text-center"
                  >
                    <Upload className="text-[var(--brand-primary)]" size={34} />
                    <p className="mt-3 font-bold">Glissez vos photos ici</p>
                    <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">Min 1, max 10. La premiere photo est principale.</p>
                    <input type="file" multiple accept="image/*" className="sr-only" onChange={(event) => handleFiles(event.target.files)} />
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {media.map((item, index) => (
                      <div key={item} className="relative aspect-square overflow-hidden rounded-lg border border-[var(--brand-border-light)]">
                        <img src={item} alt="" className="h-full w-full object-cover" />
                        <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[11px] font-bold">
                          {index === 0 ? "Principale" : `Photo ${index + 1}`}
                        </span>
                        <button
                          onClick={() => setMedia((current) => current.filter((photo) => photo !== item))}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-red-600"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute inset-x-2 bottom-2 h-1 rounded bg-white/70">
                          <div className="h-full rounded bg-[var(--brand-primary)]" style={{ width: "100%" }} />
                        </div>
                      </div>
                    ))}
                    {media.length < 10 && (
                      <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border border-dashed border-[var(--brand-border)] text-[var(--color-text-muted)]">
                        <ImagePlus size={28} />
                        <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleFiles(event.target.files)} />
                      </label>
                    )}
                  </div>
                  <div className="rounded-lg border border-[var(--brand-border-light)] p-4">
                    <p className="flex items-center gap-2 text-[13px] font-semibold">
                      <Sparkles size={16} className="text-[var(--brand-gold)]" /> Apercu du filigrane IWOSAN
                    </p>
                    <div className="mt-3 inline-flex rounded bg-black/70 px-4 py-2 text-[12px] font-bold tracking-[0.2em] text-white">
                      IWOSAN
                    </div>
                  </div>
                  {type === "digital" && (
                    <input
                      value={digitalUrl}
                      onChange={(event) => setDigitalUrl(event.target.value)}
                      placeholder="URL de telechargement ou reference du fichier"
                      className="h-11 w-full rounded-lg border border-[var(--brand-border)] px-4"
                    />
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-[var(--brand-border-light)] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">Activer les encheres</p>
                        <p className="text-[13px] text-[var(--color-text-muted)]">Prix de depart, reserve et date de cloture.</p>
                      </div>
                      <Switch checked={auction} onCheckedChange={setAuction} />
                    </div>
                    {auction && (
                      <div className="mt-4 grid md:grid-cols-3 gap-3">
                        <input placeholder="Prix de depart" className="h-10 rounded-lg border border-[var(--brand-border)] px-3" />
                        <input placeholder="Prix de reserve" className="h-10 rounded-lg border border-[var(--brand-border)] px-3" />
                        <input type="date" className="h-10 rounded-lg border border-[var(--brand-border)] px-3" />
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-[var(--brand-border-light)] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">Demande de devis</p>
                        <p className="text-[13px] text-[var(--color-text-muted)]">Masque le prix fixe et invite l'acheteur a vous contacter.</p>
                      </div>
                      <Switch checked={quoteRequest} onCheckedChange={setQuoteRequest} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold">Tags / mots-cles</label>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={tagInput}
                        onChange={(event) => setTagInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Ajouter un tag"
                        className="h-10 flex-1 rounded-lg border border-[var(--brand-border)] px-3"
                      />
                      <button onClick={addTag} className="h-10 rounded-lg bg-[var(--brand-primary)] px-4 text-white">
                        Ajouter
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((item) => (
                        <button
                          key={item}
                          onClick={() => setTags((current) => current.filter((tag) => tag !== item))}
                          className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]"
                        >
                          #{item} x
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Conditions speciales, ex: Livraison dans Cotonou uniquement"
                    className="min-h-[120px] w-full rounded-lg border border-[var(--brand-border)] px-4 py-3"
                  />
                </div>
              )}

              {step === 4 && (
                <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                  <div className="space-y-4">
                    <div className="rounded-lg bg-[var(--brand-surface-alt)] p-4">
                      <h2 className="font-bold">Recapitulatif</h2>
                      <dl className="mt-3 grid sm:grid-cols-2 gap-3 text-[13px]">
                        <div><dt className="text-[var(--color-text-muted)]">Titre</dt><dd className="font-semibold">{title}</dd></div>
                        <div><dt className="text-[var(--color-text-muted)]">Categorie</dt><dd className="font-semibold">{category}</dd></div>
                        <div><dt className="text-[var(--color-text-muted)]">Localisation</dt><dd className="font-semibold">{city}</dd></div>
                        <div><dt className="text-[var(--color-text-muted)]">Commission</dt><dd className="font-semibold">{estimatedCommission.toLocaleString("fr-FR")} {currency}</dd></div>
                      </dl>
                    </div>
                    <label className="flex items-center gap-3 text-[13px]">
                      <Checkbox checked={terms} onCheckedChange={(checked) => setTerms(Boolean(checked))} />
                      J'accepte les CGU.
                    </label>
                    <label className="flex items-center gap-3 text-[13px]">
                      <Checkbox checked={salesPolicy} onCheckedChange={(checked) => setSalesPolicy(Boolean(checked))} />
                      J'accepte la politique de vente.
                    </label>
                    {confirmation && (
                      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
                        {confirmation}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => publish("draft")} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] px-5 font-semibold">
                        <Save size={16} /> Enregistrer comme brouillon
                      </button>
                      <button onClick={() => publish("publish")} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 font-semibold text-white">
                        <Send size={16} /> Publier
                      </button>
                    </div>
                  </div>
                  <ProductCard product={previewProduct} />
                </div>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-[var(--brand-border-light)] pt-5">
                <button
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  disabled={step === 0}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold disabled:opacity-40"
                >
                  <ArrowLeft size={15} /> Retour
                </button>
                <button
                  onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
                  disabled={step === steps.length - 1}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white disabled:opacity-40"
                >
                  Continuer <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
