import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminAds,
  useAdminAdsActions,
  useAdminBanners,
  useAdminBannersActions,
  useAdminPartnerLogos,
  useAdminPartnerLogosActions,
} from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/site/publicites")({
  head: () => ({ meta: [{ title: "Admin publicites - IWOSAN" }] }),
  component: AdminAdsPage,
});

type Banner = { id: string; imageUrl: string; title: string | null; link: string | null; isActive: boolean };
type Ad = { id: string; name: string; position: string; isActive: boolean };
type PartnerLogo = { id: string; imageUrl: string; title: string | null; link: string | null; isActive: boolean };

function AdminAdsPage() {
  const { t } = useTranslation();
  const bannersQuery = useAdminBanners();
  const bannerActions = useAdminBannersActions();
  const adsQuery = useAdminAds();
  const adActions = useAdminAdsActions();
  const partnerLogosQuery = useAdminPartnerLogos();
  const partnerLogoActions = useAdminPartnerLogosActions();

  const [newBanner, setNewBanner] = useState({ imageUrl: "", title: "", link: "" });
  const [newAd, setNewAd] = useState({ name: "", position: "", code: "" });
  const [newPartnerLogo, setNewPartnerLogo] = useState({ imageUrl: "", title: "", link: "" });
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const [deleteAd, setDeleteAd] = useState<Ad | null>(null);
  const [deletePartnerLogo, setDeletePartnerLogo] = useState<PartnerLogo | null>(null);
  const [notice, setNotice] = useState("");

  const banners = (bannersQuery.data?.data ?? []) as Banner[];
  const ads = (adsQuery.data?.data ?? []) as Ad[];
  const partnerLogos = (partnerLogosQuery.data?.data ?? []) as PartnerLogo[];

  return (
    <AdminLayout title={t("admin.ads.title")} description={t("admin.ads.description")}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.ads.partnerLogos")}</h2>
          <div className="space-y-3">
            {partnerLogos.length === 0 && <p className="text-[13px] text-slate-400">{t("admin.ads.noLogos")}</p>}
            {partnerLogos.map((logo) => (
              <div key={logo.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                {logo.imageUrl && <img src={logo.imageUrl} alt="" className="h-10 w-20 rounded bg-white/10 object-contain p-1" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{logo.title || t("admin.ads.untitled")}</p>
                  <p className="truncate text-[11px] text-slate-500">{logo.link || logo.imageUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => partnerLogoActions.update.mutate({ id: logo.id, body: { isActive: !logo.isActive } })}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${logo.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-400"}`}
                >
                  {logo.isActive ? t("admin.ads.active") : t("admin.ads.inactive")}
                </button>
                <button type="button" onClick={() => setDeletePartnerLogo(logo)} className="rounded-full bg-red-500/80 px-3 py-1 text-[11px] font-bold text-white">
                  {t("admin.ads.delete")}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
            <p className="text-[13px] font-semibold text-white">{t("admin.ads.addLogo")}</p>
            <input value={newPartnerLogo.imageUrl} onChange={(event) => setNewPartnerLogo((current) => ({ ...current, imageUrl: event.target.value }))} placeholder={t("admin.ads.imageUrlPlaceholder")} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={newPartnerLogo.title} onChange={(event) => setNewPartnerLogo((current) => ({ ...current, title: event.target.value }))} placeholder={t("admin.ads.partnerNamePlaceholder")} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
              <input value={newPartnerLogo.link} onChange={(event) => setNewPartnerLogo((current) => ({ ...current, link: event.target.value }))} placeholder={t("admin.ads.linkOptionalPlaceholder")} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            </div>
            <button
              type="button"
              disabled={partnerLogoActions.create.isPending || !newPartnerLogo.imageUrl.trim()}
              onClick={() =>
                partnerLogoActions.create.mutate(
                  { imageUrl: newPartnerLogo.imageUrl.trim(), title: newPartnerLogo.title.trim() || undefined, link: newPartnerLogo.link.trim() || undefined, isActive: true },
                  { onSuccess: () => { setNewPartnerLogo({ imageUrl: "", title: "", link: "" }); setNotice(t("admin.ads.logoAdded")); } },
                )
              }
              className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827] disabled:opacity-50"
            >
              {t("admin.ads.add")}
            </button>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.ads.homeCarousel")}</h2>
          <div className="space-y-3">
            {banners.length === 0 && <p className="text-[13px] text-slate-400">{t("admin.ads.noBanners")}</p>}
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                {banner.imageUrl && <img src={banner.imageUrl} alt="" className="h-12 w-20 rounded object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{banner.title || t("admin.ads.untitled")}</p>
                  <p className="truncate text-[11px] text-slate-500">{banner.link || banner.imageUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => bannerActions.update.mutate({ id: banner.id, body: { isActive: !banner.isActive } })}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${banner.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-400"}`}
                >
                  {banner.isActive ? t("admin.ads.active") : t("admin.ads.inactive")}
                </button>
                <button type="button" onClick={() => setDeleteBanner(banner)} className="rounded-full bg-red-500/80 px-3 py-1 text-[11px] font-bold text-white">
                  {t("admin.ads.delete")}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
            <p className="text-[13px] font-semibold text-white">{t("admin.ads.addBanner")}</p>
            <input value={newBanner.imageUrl} onChange={(event) => setNewBanner((current) => ({ ...current, imageUrl: event.target.value }))} placeholder={t("admin.ads.imageUrlPlaceholder")} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={newBanner.title} onChange={(event) => setNewBanner((current) => ({ ...current, title: event.target.value }))} placeholder={t("admin.ads.titleOptionalPlaceholder")} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
              <input value={newBanner.link} onChange={(event) => setNewBanner((current) => ({ ...current, link: event.target.value }))} placeholder={t("admin.ads.linkOptionalPlaceholder")} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            </div>
            <button
              type="button"
              disabled={bannerActions.create.isPending || !newBanner.imageUrl.trim()}
              onClick={() =>
                bannerActions.create.mutate(
                  { imageUrl: newBanner.imageUrl.trim(), title: newBanner.title.trim() || undefined, link: newBanner.link.trim() || undefined, isActive: true },
                  { onSuccess: () => { setNewBanner({ imageUrl: "", title: "", link: "" }); setNotice(t("admin.ads.bannerAdded")); } },
                )
              }
              className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827] disabled:opacity-50"
            >
              {t("admin.ads.add")}
            </button>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.ads.adSlots")}</h2>
          <div className="space-y-3">
            {ads.length === 0 && <p className="text-[13px] text-slate-400">{t("admin.ads.noAdSlots")}</p>}
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
                  {ad.isActive ? t("admin.ads.active") : t("admin.ads.inactive")}
                </button>
                <button type="button" onClick={() => setDeleteAd(ad)} className="rounded-full bg-red-500/80 px-3 py-1 text-[11px] font-bold text-white">
                  {t("admin.ads.delete")}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
            <p className="text-[13px] font-semibold text-white">{t("admin.ads.addAdSlot")}</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={newAd.name} onChange={(event) => setNewAd((current) => ({ ...current, name: event.target.value }))} placeholder={t("admin.ads.namePlaceholder")} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
              <input value={newAd.position} onChange={(event) => setNewAd((current) => ({ ...current, position: event.target.value }))} placeholder={t("admin.ads.positionPlaceholder")} className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
            </div>
            <textarea value={newAd.code} onChange={(event) => setNewAd((current) => ({ ...current, code: event.target.value }))} placeholder={t("admin.ads.codePlaceholder")} className="min-h-20 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none" />
            <button
              type="button"
              disabled={adActions.create.isPending || !newAd.name.trim() || !newAd.position.trim()}
              onClick={() =>
                adActions.create.mutate(
                  { name: newAd.name.trim(), position: newAd.position.trim(), code: newAd.code.trim(), isActive: true },
                  { onSuccess: () => { setNewAd({ name: "", position: "", code: "" }); setNotice(t("admin.ads.adSlotAdded")); } },
                )
              }
              className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827] disabled:opacity-50"
            >
              {t("admin.ads.add")}
            </button>
          </div>
        </AdminCard>
      </div>

      <ConfirmDialog
        open={Boolean(deleteBanner)}
        onOpenChange={(open) => !open && setDeleteBanner(null)}
        title={t("admin.ads.deleteBannerTitle")}
        description={t("admin.ads.deleteBannerDesc")}
        danger
        confirmLabel={t("admin.ads.delete")}
        pending={bannerActions.remove.isPending}
        onConfirm={() => {
          if (!deleteBanner) return;
          bannerActions.remove.mutate(deleteBanner.id, { onSuccess: () => setDeleteBanner(null) });
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteAd)}
        onOpenChange={(open) => !open && setDeleteAd(null)}
        title={t("admin.ads.deleteAdSlotTitle")}
        description={t("admin.ads.deleteBannerDesc")}
        danger
        confirmLabel={t("admin.ads.delete")}
        pending={adActions.remove.isPending}
        onConfirm={() => {
          if (!deleteAd) return;
          adActions.remove.mutate(deleteAd.id, { onSuccess: () => setDeleteAd(null) });
        }}
      />
      <ConfirmDialog
        open={Boolean(deletePartnerLogo)}
        onOpenChange={(open) => !open && setDeletePartnerLogo(null)}
        title={t("admin.ads.deleteLogoTitle")}
        description={t("admin.ads.deleteBannerDesc")}
        danger
        confirmLabel={t("admin.ads.delete")}
        pending={partnerLogoActions.remove.isPending}
        onConfirm={() => {
          if (!deletePartnerLogo) return;
          partnerLogoActions.remove.mutate(deletePartnerLogo.id, { onSuccess: () => setDeletePartnerLogo(null) });
        }}
      />
    </AdminLayout>
  );
}
