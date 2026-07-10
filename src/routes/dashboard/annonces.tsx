import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Copy,
  Eye,
  Heart,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Trash2,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sellerListings } from "@/data/sellerListings";
import type { ListingStatus, SellerListing } from "@/types";

export const Route = createFileRoute("/dashboard/annonces")({
  head: () => ({ meta: [{ title: "Mes annonces - IWOSAN" }] }),
  component: ListingDashboard,
});

const statusLabels: Record<ListingStatus, string> = {
  draft: "Brouillon",
  pending: "En attente",
  active: "Actif",
  suspended: "Suspendu",
  expired: "Expire",
};

const statusClasses: Record<ListingStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-700",
  expired: "bg-zinc-100 text-zinc-700",
};

const boostOptions = [
  {
    id: "urgent",
    label: "Badge URGENT",
    desc: "Fond rouge visible pendant 3 jours.",
    price: 2500,
    duration: "3 jours",
    icon: Zap,
  },
  {
    id: "top",
    label: "Remontee en tete de liste",
    desc: "Votre annonce remonte dans les resultats pendant 7 jours.",
    price: 7500,
    duration: "7 jours",
    icon: Rocket,
  },
  {
    id: "home",
    label: "Mise en avant sur l'accueil",
    desc: "Placement en vedette pendant 14 jours.",
    price: 15000,
    duration: "14 jours",
    icon: BarChart3,
  },
];

type MetricItem = {
  label: string;
  value: number;
  Icon: LucideIcon;
};

type ListingAction = {
  Icon: LucideIcon;
  label: string;
  action: "edit" | "toggle" | "delete" | "renew" | "duplicate";
};

const formatRenewedDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
};

function ListingDashboard() {
  const [listings, setListings] = useState<SellerListing[]>(sellerListings);
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const [category, setCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [boostListing, setBoostListing] = useState<SellerListing | null>(null);
  const [selectedBoost, setSelectedBoost] = useState(boostOptions[0].id);
  const [actionMessage, setActionMessage] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(listings.map((listing) => listing.category))).sort((a, b) => a.localeCompare(b, "fr")),
    [listings],
  );

  const filteredListings = useMemo(
    () =>
      listings.filter((listing) => {
        const matchesStatus = status === "all" || listing.status === status;
        const matchesCategory = category === "all" || listing.category === category;
        const createdAt = new Date(listing.createdAt).getTime();
        const now = new Date("2026-06-15").getTime();
        const matchesDate =
          dateFilter === "week"
            ? now - createdAt <= 7 * 24 * 60 * 60 * 1000
            : dateFilter === "month"
              ? now - createdAt <= 31 * 24 * 60 * 60 * 1000
              : true;
        return matchesStatus && matchesCategory && matchesDate;
      }),
    [category, dateFilter, listings, status],
  );

  const totals = listings.reduce(
    (acc, listing) => ({
      views: acc.views + listing.views,
      clicks: acc.clicks + listing.clicks,
      favorites: acc.favorites + listing.favorites,
      messages: acc.messages + listing.messages,
    }),
    { views: 0, clicks: 0, favorites: 0, messages: 0 },
  );

  const selectedBoostOption = boostOptions.find((option) => option.id === selectedBoost) ?? boostOptions[0];
  const metricItems: MetricItem[] = [
    { label: "Vues", value: totals.views, Icon: Eye },
    { label: "Clics", value: totals.clicks, Icon: Search },
    { label: "Favoris", value: totals.favorites, Icon: Heart },
    { label: "Messages", value: totals.messages, Icon: MessageSquare },
  ];

  const resetFilters = () => {
    setStatus("all");
    setCategory("all");
    setDateFilter("all");
  };

  const runListingAction = (listing: SellerListing, action: ListingAction["action"]) => {
    if (action === "edit") {
      setActionMessage(`Edition mock ouverte pour : ${listing.title}.`);
      return;
    }

    if (action === "toggle") {
      const nextStatus: ListingStatus = listing.status === "active" ? "suspended" : "active";
      setListings((current) => current.map((item) => (item.id === listing.id ? { ...item, status: nextStatus } : item)));
      setActionMessage(`Annonce ${nextStatus === "active" ? "reactivee" : "desactivee"} : ${listing.title}.`);
      return;
    }

    if (action === "delete") {
      setListings((current) => current.filter((item) => item.id !== listing.id));
      setActionMessage(`Annonce supprimee localement : ${listing.title}.`);
      return;
    }

    if (action === "renew") {
      setListings((current) => current.map((item) => (item.id === listing.id ? { ...item, status: "active", expiresAt: formatRenewedDate() } : item)));
      setActionMessage(`Annonce renouvelee pour 30 jours : ${listing.title}.`);
      return;
    }

    setListings((current) => [
      {
        ...listing,
        id: `${listing.id}-copy-${Date.now()}`,
        title: `${listing.title} (copie)`,
        status: "draft",
        createdAt: new Date().toISOString().slice(0, 10),
        expiresAt: formatRenewedDate(),
        views: 0,
        clicks: 0,
        favorites: 0,
        messages: 0,
        urgent: false,
        featured: false,
      },
      ...current,
    ]);
    setActionMessage(`Brouillon duplique : ${listing.title}.`);
  };

  const confirmBoost = () => {
    if (!boostListing) return;
    setListings((current) =>
      current.map((listing) =>
        listing.id === boostListing.id
          ? {
              ...listing,
              urgent: selectedBoost === "urgent" ? true : listing.urgent,
              featured: selectedBoost === "home" || selectedBoost === "top" ? true : listing.featured,
            }
          : listing,
      ),
    );
    setActionMessage(`Boost mock applique : ${selectedBoostOption.label} sur ${boostListing.title}. Paiement non active.`);
    setBoostListing(null);
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
              Dashboard annonceur
            </p>
            <h1 className="mt-2 text-[32px] md:text-[42px]">Mes annonces</h1>
            <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
              Statuts, actions, performances et options de boost en mock.
            </p>
          </div>
          <Link
            to="/marketplace/deposer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white"
          >
            <Plus size={17} /> Deposer une annonce
          </Link>
        </div>
      </section>

      <section className="container-iwosan py-8 space-y-6">
        {actionMessage && (
          <p className="rounded-[12px] border border-emerald-200 bg-emerald-50 p-4 text-[13px] font-semibold text-emerald-800">
            {actionMessage}
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricItems.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {label}
                </p>
                <Icon size={17} className="text-[var(--brand-primary)]" />
              </div>
              <p className="mt-3 text-[28px] font-extrabold">{Number(value).toLocaleString("fr-FR")}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ListingStatus | "all")}
              className="h-10 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold"
            >
              <option value="all">Tous statuts</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold"
            >
              <option value="all">Toutes categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-10 rounded-full border border-[var(--brand-border)] bg-white px-4 text-[13px] font-semibold"
            >
              <option value="all">Toutes dates</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
            {(status !== "all" || category !== "all" || dateFilter !== "all") && (
              <button type="button" onClick={resetFilters} className="h-10 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                Reinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[12px] border border-[var(--brand-border-light)] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-[13px]">
              <thead className="bg-[var(--brand-surface-alt)] text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-5 py-3 text-left">Annonce</th>
                  <th className="px-5 py-3 text-left">Statut</th>
                  <th className="px-5 py-3 text-left">Stats</th>
                  <th className="px-5 py-3 text-left">Expiration</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                  <th className="px-5 py-3 text-left">Boost</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="border-t border-[var(--brand-border-light)] align-top">
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <img src={listing.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold">{listing.title}</p>
                          <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                            {listing.category} - {listing.city} - {listing.price.toLocaleString("fr-FR")} {listing.currency}
                          </p>
                          <div className="mt-2 flex gap-2">
                            {listing.urgent && <span className="rounded bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">URGENT</span>}
                            {listing.featured && <span className="rounded bg-[var(--brand-primary-subtle)] px-2 py-1 text-[10px] font-bold text-[var(--brand-primary)]">VEDETTE</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusClasses[listing.status]}`}>
                        {statusLabels[listing.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                        <span>{listing.views} vues</span>
                        <span>{listing.clicks} clics</span>
                        <span>{listing.favorites} favoris</span>
                        <span>{listing.messages} messages</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-muted)]">{listing.expiresAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {([
                          { Icon: Pencil, label: "Modifier", action: "edit" },
                          { Icon: RefreshCw, label: listing.status === "active" ? "Desactiver" : "Reactiver", action: "toggle" },
                          { Icon: Trash2, label: "Supprimer", action: "delete" },
                          { Icon: RefreshCw, label: "Renouveler", action: "renew" },
                          { Icon: Copy, label: "Dupliquer", action: "duplicate" },
                        ] satisfies ListingAction[]).map(({ Icon, label, action }) => (
                          <button
                            key={`${listing.id}-${action}`}
                            type="button"
                            onClick={() => runListingAction(listing, action)}
                            className="inline-flex h-8 items-center gap-1 rounded-full border border-[var(--brand-border)] px-3 text-[12px] font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                          >
                            <Icon size={13} /> {label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setBoostListing(listing)}
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--brand-gold)] px-4 text-[12px] font-bold text-[var(--color-text-primary)]"
                      >
                        <Rocket size={14} /> Booster
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredListings.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-bold">Aucune annonce ne correspond aux filtres.</p>
              <button type="button" onClick={resetFilters} className="mt-4 h-10 rounded-full bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white">
                Effacer les filtres
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[13px] text-[var(--color-text-muted)]">
          <span>Page 1 sur 1 - {filteredListings.length} annonce(s)</span>
          <div className="flex gap-2">
            <button disabled className="h-9 rounded-full border border-[var(--brand-border)] px-4 font-semibold opacity-50">Precedent</button>
            <button disabled className="h-9 rounded-full border border-[var(--brand-border)] px-4 font-semibold opacity-50">Suivant</button>
          </div>
        </div>
      </section>

      <Dialog open={Boolean(boostListing)} onOpenChange={(open) => !open && setBoostListing(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Booster cette annonce</DialogTitle>
            <DialogDescription>
              Choisissez une option. Le paiement reel sera branche plus tard.
            </DialogDescription>
          </DialogHeader>
          {boostListing && (
            <div className="space-y-5">
              <div className="rounded-lg bg-[var(--brand-surface-alt)] p-3 text-[13px]">
                <strong>{boostListing.title}</strong>
              </div>
              <div className="grid gap-3">
                {boostOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedBoost(option.id)}
                    className={`flex items-center gap-3 rounded-[12px] border-2 p-4 text-left ${selectedBoost === option.id ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--brand-border)]"}`}
                  >
                    <option.icon size={20} className="text-[var(--brand-primary)]" />
                    <div className="flex-1">
                      <p className="font-bold">{option.label}</p>
                      <p className="text-[12px] text-[var(--color-text-muted)]">{option.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold">{option.price.toLocaleString("fr-FR")} XOF</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">{option.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="rounded-lg border border-[var(--brand-border-light)] p-4">
                <p className="font-bold">Recapitulatif du cout</p>
                <div className="mt-2 flex justify-between text-[14px]">
                  <span>{selectedBoostOption.label}</span>
                  <strong>{selectedBoostOption.price.toLocaleString("fr-FR")} XOF</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={confirmBoost}
                className="h-11 w-full rounded-full bg-[var(--brand-primary)] font-semibold text-white"
              >
                Appliquer le boost en mock
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}