import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Calendar, GraduationCap, Megaphone, Video } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useEvents, useFormations } from "@/hooks/useEventsFormationsApi";
import { useMyAnnouncements } from "@/hooks/useNotificationsApi";
import { toEventItem, type BackendEvent } from "@/lib/eventMappers";
import { PROFESSIONAL_ACCOUNT_ROLES } from "@/lib/auth/roles";

export const Route = createFileRoute("/tableau-de-bord/communication")({
  head: () => ({ meta: [{ title: "Communication & webinaires - IWOSAN" }] }),
  component: () => (
    <ProtectedRoute requireAnyRole={PROFESSIONAL_ACCOUNT_ROLES}>
      <CommunicationHub />
    </ProtectedRoute>
  ),
});

function CommunicationHub() {
  const announcementsQuery = useMyAnnouncements();
  const webinarsQuery = useEvents({ type: "WEBINAR", limit: 6 });
  const formationsQuery = useFormations({ limit: 4 });

  const announcements = announcementsQuery.data ?? [];

  const webinars = useMemo(() => {
    const items = ((webinarsQuery.data as { events?: BackendEvent[] } | undefined)?.events ?? [])
      .map(toEventItem)
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    return items.filter((item) => new Date(item.date).getTime() >= Date.now()).slice(0, 4);
  }, [webinarsQuery.data]);

  const formations = (formationsQuery.data as { formations?: { id: string; title: string; category?: string; coverImage?: string | null }[] } | undefined)?.formations ?? [];

  return (
    <AccountLayout
      title="Communication & webinaires"
      description="Annonces de l'équipe Iwosan, webinaires à venir et formations pour développer votre activité."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[18px] font-bold"><Megaphone size={18} className="text-[var(--brand-primary)]" /> Annonces & opportunités</h2>
            {announcementsQuery.isLoading && <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">Chargement...</p>}
            {!announcementsQuery.isLoading && announcements.length === 0 && (
              <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">Aucune annonce pour le moment. Les opportunités et communications de l'équipe Iwosan apparaîtront ici.</p>
            )}
            <div className="mt-4 space-y-3">
              {announcements.map((item) => (
                <div key={item.id} className="rounded-lg border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                    <span className="shrink-0 text-[11px] text-[var(--color-text-muted)]">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{item.message}</p>
                  {item.link && (
                    <Link to={item.link as never} className="mt-2 inline-flex text-[12px] font-semibold text-[var(--brand-primary)]">En savoir plus</Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[18px] font-bold"><GraduationCap size={18} className="text-[var(--brand-primary)]" /> Formations pour développer votre activité</h2>
            {formationsQuery.isLoading && <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">Chargement...</p>}
            {!formationsQuery.isLoading && formations.length === 0 && (
              <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">Aucune formation disponible pour le moment.</p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {formations.map((formation) => (
                <Link
                  key={formation.id}
                  to="/formations/$id"
                  params={{ id: formation.id }}
                  className="rounded-lg border border-[var(--brand-border-light)] p-4 transition hover:border-[var(--brand-primary)]"
                >
                  {formation.category && <span className="rounded-full bg-[var(--brand-primary-subtle)] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-primary)]">{formation.category}</span>}
                  <p className="mt-2 text-[14px] font-bold text-[var(--color-text-primary)]">{formation.title}</p>
                </Link>
              ))}
            </div>
            <Link to="/tableau-de-bord/formations" className="mt-4 inline-flex text-[13px] font-semibold text-[var(--brand-primary)]">Gérer mes formations</Link>
          </div>
        </div>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="flex items-center gap-2 text-[16px] font-bold"><Video size={17} className="text-[var(--brand-primary)]" /> Prochains webinaires</h2>
          {webinarsQuery.isLoading && <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">Chargement...</p>}
          {!webinarsQuery.isLoading && webinars.length === 0 && (
            <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">Aucun webinaire programmé pour le moment.</p>
          )}
          <div className="mt-4 space-y-3">
            {webinars.map((webinar) => (
              <Link key={webinar.id} to="/agenda/$id" params={{ id: webinar.id }} className="block rounded-lg border border-[var(--brand-border-light)] p-3 transition hover:border-[var(--brand-primary)]">
                <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-muted)]"><Calendar size={12} /> {new Date(webinar.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                <p className="mt-1 text-[13px] font-bold text-[var(--color-text-primary)]">{webinar.title}</p>
              </Link>
            ))}
          </div>
          <Link to="/agenda" className="mt-4 inline-flex text-[13px] font-semibold text-[var(--brand-primary)]">Voir tout l'agenda</Link>
        </aside>
      </div>
    </AccountLayout>
  );
}
