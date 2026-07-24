import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminAds,
  useAdminAdsActions,
  useAdminBanners,
  useAdminBannersActions,
} from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/site/publicites")({
  head: () => ({ meta: [{ title: "Admin publicites - IWOSAN" }] }),
  component: AdminAdsPage,
});

type Banner = { id: string; imageUrl: string; title: string | null; link: string | null; isActive: boolean };
type Ad = { id: string; name: string; position: string; isActive: boolean };

function AdminAdsPage() {
  const bannersQuery = useAdminBanners();
  const bannerActions = useAdminBannersActions();
  const adsQuery = useAdminAds();
  const adActions = useAdminAdsActions();

  const [newBanner, setNewBanner] = useState({ imageUrl: "", title: "", link: "" });
  const [newAd, setNewAd] = useState({ name: "", position: "", code: "" });
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const [deleteAd, setDeleteAd] = useState<Ad | null>(null);
  const [notice, setNotice] = useState("");

  const banners = (bannersQuery.data?.data ?? []) as Banner[];
  const ads = (adsQuery.data?.data ?? []) as Ad[];

  return (
    <AdminLayout title="Bannières et publicités" description="Emplacements, campagnes et carrousel d'accueil.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Carrousel d'accueil</h2>
          <div className="space-y-3">
            {banners.length === 0 && <p className="text-[13px] text-slate-400">Aucune bannière configurée.</p>}
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                {banner.imageUrl && <img src={banner.imageUrl} alt="" className="h-12 w-20 rounded object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{banner.title || "Sans titre"}</p>
                  <p className="truncate text-[11px] text-slate-500">{banner.link || banner.imageUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => bannerActions.update.mutate({ id: banner.id, body: { isActive: !banner.isActive } })}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${banner.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-400"}`}
                >
                  {banner.isActive ? "Actif" : "Inactif"}
                </button>
                <button type="button" onClick={() => setDeleteBanner(banner)} className="rounded-full bg-red-500/80 px-3 py-1 text-[11px] font-bold text-white">
                  Suppr.
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
            <p className="text-[13px] font-semibold text-white">Ajouter une bannière</p>
            <input value={newBanner.imageUrl} onChange={(event) => setNewBanner((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="URL de l'image" className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={newBanner.title} onChange={(event) => setNewBanner((current) => ({ ...current, title: event.target.value }))} placeholder="Titre (optionnel)" className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
              <input value={newBanner.link} onChange={(event) => setNewBanner((current) => ({ ...current, link: event.target.value }))} placeholder="Lien (optionnel)" className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            </div>
            <button
              type="button"
              disabled={bannerActions.create.isPending || !newBanner.imageUrl.trim()}
              onClick={() =>
                bannerActions.create.mutate(
                  { imageUrl: newBanner.imageUrl.trim(), title: newBanner.title.trim() || undefined, link: newBanner.link.trim() || undefined, isActive: true },
                  { onSuccess: () => { setNewBanner({ imageUrl: "", title: "", link: "" }); setNotice("Bannière ajoutée."); } },
                )
              }
              className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827] disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Emplacements publicitaires</h2>
          <div className="space-y-3">
            {ads.length === 0 && <p className="text-[13px] text-slate-400">Aucun emplacement configuré.</p>}
            {ads.map((ad) => (
              <div key={ad.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{ad.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{ad.position}</p>
                </div>
                <button
                  type="button"
                  onClick={() => adActions.update.mutate({ id: ad.id, body: { isActive: !ad.isActive } })}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${ad.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-400"}`}
                >
                  {ad.isActive ? "Actif" : "Inactif"}
                </button>
                <button type="button" onClick={() => setDeleteAd(ad)} className="rounded-full bg-red-500/80 px-3 py-1 text-[11px] font-bold text-white">
                  Suppr.
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
            <p className="text-[13px] font-semibold text-white">Ajouter un emplacement</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={newAd.name} onChange={(event) => setNewAd((current) => ({ ...current, name: event.target.value }))} placeholder="Nom" className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
              <input value={newAd.position} onChange={(event) => setNewAd((current) => ({ ...current, position: event.target.value }))} placeholder="Position (ex: home_top)" className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            </div>
            <textarea value={newAd.code} onChange={(event) => setNewAd((current) => ({ ...current, code: event.target.value }))} placeholder="Code / embed publicitaire" className="min-h-20 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none" />
            <button
              type="button"
              disabled={adActions.create.isPending || !newAd.name.trim() || !newAd.position.trim()}
              onClick={() =>
                adActions.create.mutate(
                  { name: newAd.name.trim(), position: newAd.position.trim(), code: newAd.code.trim(), isActive: true },
                  { onSuccess: () => { setNewAd({ name: "", position: "", code: "" }); setNotice("Emplacement ajouté."); } },
                )
              }
              className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827] disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </AdminCard>
      </div>

      <ConfirmDialog
        open={Boolean(deleteBanner)}
        onOpenChange={(open) => !open && setDeleteBanner(null)}
        title="Supprimer cette bannière ?"
        description="Cette action est définitive."
        danger
        confirmLabel="Supprimer"
        pending={bannerActions.remove.isPending}
        onConfirm={() => {
          if (!deleteBanner) return;
          bannerActions.remove.mutate(deleteBanner.id, { onSuccess: () => setDeleteBanner(null) });
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteAd)}
        onOpenChange={(open) => !open && setDeleteAd(null)}
        title="Supprimer cet emplacement ?"
        description="Cette action est définitive."
        danger
        confirmLabel="Supprimer"
        pending={adActions.remove.isPending}
        onConfirm={() => {
          if (!deleteAd) return;
          adActions.remove.mutate(deleteAd.id, { onSuccess: () => setDeleteAd(null) });
        }}
      />
    </AdminLayout>
  );
}
