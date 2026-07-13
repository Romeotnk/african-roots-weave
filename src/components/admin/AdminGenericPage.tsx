import { useMemo, useState } from "react";
import { AdminCard, AdminLayout, AdminTable } from "@/components/admin/AdminLayout";
import {
  adminCommunityReports,
  adminFinance,
  adminHomeSections,
  adminKycQueue,
  adminLogs,
  adminMenus,
  adminModules,
  adminNewsletter,
  adminStaticPages,
  adminUsers,
} from "@/data/admin";

type AdminPageKind =
  | "home"
  | "menus"
  | "pages"
  | "identity"
  | "ads"
  | "content"
  | "marketplace"
  | "users"
  | "kyc"
  | "finance"
  | "transactions"
  | "commissions"
  | "refunds"
  | "disputes"
  | "communication"
  | "newsletter"
  | "notifications"
  | "tickets"
  | "community"
  | "reports"
  | "forum"
  | "reviews"
  | "affiliate"
  | "logs";

const labels: Record<AdminPageKind, { title: string; description: string }> = {
  home: { title: "Page d'accueil", description: "Sections activables, ordre, hero et blocs visibles." },
  menus: { title: "Menus de navigation", description: "Header, footer, sous-menus et visibilite." },
  pages: { title: "Pages statiques", description: "Pages CMS, SEO et statuts de publication." },
  identity: { title: "Identite visuelle", description: "Logo, couleurs, typographie et CSS personnalise." },
  ads: { title: "Bannieres et publicites", description: "Emplacements, campagnes et performances mock." },
  content: { title: "Contenus", description: "Articles, pharmacophee, rites, recettes, agenda et formations." },
  marketplace: { title: "Marketplace", description: "Moderation annonces, categories, boosts et encheres." },
  users: { title: "Utilisateurs", description: "Recherche, roles, suspension et fiches utilisateurs." },
  kyc: { title: "KYC en attente", description: "Documents soumis, approbation et rejet motive." },
  finance: { title: "Finances", description: "Commissions, transactions, escrow et retraits." },
  transactions: { title: "Transactions", description: "Tableau complet, filtres et export CSV." },
  commissions: { title: "Commissions", description: "Taux globaux, categories, pros et historique." },
  refunds: { title: "Remboursements", description: "Demandes en attente et historique traite." },
  disputes: { title: "Litiges", description: "Timeline, messages, preuves et resolution." },
  communication: { title: "Communication", description: "Newsletter, notifications push et tickets." },
  newsletter: { title: "Newsletter", description: "Abonnes, campagnes, editeur et apercus." },
  notifications: { title: "Notifications push", description: "Envoi cible et historique mock." },
  tickets: { title: "Tickets support", description: "Liste, statut, priorite, assignation et reponses." },
  community: { title: "Communaute", description: "Signalements, questions vedettes et avis." },
  reports: { title: "Signalements forum", description: "Files de moderation et actions." },
  forum: { title: "Forum admin", description: "Questions vedettes et categories CRUD." },
  reviews: { title: "Avis et evaluations", description: "Avis publies, signales et moderation." },
  affiliate: { title: "Affiliation & MLM", description: "Taux par niveau, affilies et versements." },
  logs: { title: "Logs d'activite", description: "Journal admin en lecture seule." },
};

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827]">{children}</button>;
}

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</span>
      <input type={type} defaultValue={value} className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
    </label>
  );
}

export function AdminGenericPage({ kind }: { kind: AdminPageKind }) {
  const [notice, setNotice] = useState("");
  const meta = labels[kind];

  const content = useMemo(() => {
    if (kind === "home") {
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <AdminCard>
            <h2 className="mb-4 text-[18px] font-bold text-white">Sections de la page d'accueil</h2>
            <div className="space-y-3">
              {adminHomeSections.map((section, index) => (
                <div key={section.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-white/5 p-3">
                  <span className="cursor-grab text-slate-500">::</span>
                  <span className="grid h-7 w-7 place-items-center rounded bg-white/10 text-[12px]">{index + 1}</span>
                  <span className="min-w-0 flex-1 font-semibold">{section.name}</span>
                  <label className="flex items-center gap-2 text-[12px]"><input type="checkbox" defaultChecked={section.enabled} /> ON</label>
                  <ActionButton>Modifier</ActionButton>
                </div>
              ))}
            </div>
          </AdminCard>
          <AdminCard>
            <h2 className="mb-4 text-[18px] font-bold text-white">Hero / diaporama</h2>
            <div className="space-y-3">
              <Field label="Titre" value="Iwosan, savoirs africains vivants" />
              <Field label="Sous-titre" value="Marketplace, praticiens, pharmacophee et formation" />
              <Field label="CTA" value="Explorer la plateforme" />
              <Field label="Duree slide" value="6" type="number" />
              <textarea defaultValue="Apercu et edition mock du contenu hero." className="min-h-28 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px]" />
            </div>
          </AdminCard>
        </div>
      );
    }

    if (kind === "menus") {
      return (
        <div className="grid gap-6 xl:grid-cols-2">
          {Object.entries(adminMenus).map(([menu, links]) => (
            <AdminCard key={menu}>
              <h2 className="mb-4 text-[18px] font-bold capitalize text-white">Menu {menu}</h2>
              <div className="space-y-3">
                {links.map((link) => (
                  <div key={link} className="grid gap-3 rounded-lg bg-white/5 p-3 md:grid-cols-[1fr_1fr_160px]">
                    <Field label="Label FR" value={link} />
                    <Field label="URL" value={`/${link.toLowerCase().replaceAll(" ", "-")}`} />
                    <label className="block"><span className="mb-1 block text-[12px] font-bold uppercase text-slate-400">Visibilite</span><select className="h-11 w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-3"><option>Tous</option><option>Connectes</option></select></label>
                  </div>
                ))}
              </div>
            </AdminCard>
          ))}
        </div>
      );
    }

    if (kind === "pages") {
      return (
        <AdminCard>
          <div className="mb-4 flex justify-between gap-3"><h2 className="text-[18px] font-bold text-white">Pages CMS</h2><ActionButton>Nouvelle page</ActionButton></div>
          <AdminTable headers={["Titre", "Slug", "Statut", "Verrou", "Maj", "Actions"]} rows={adminStaticPages.map((page) => [page.title, page.slug, page.status, page.locked ? "Systeme" : "-", page.updatedAt, "Apercu / Editer"])} />
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Field label="Meta title" value="Iwosan - page CMS" />
            <Field label="Meta description" value="Description SEO avec compteur et apercu Google." />
            <textarea className="min-h-32 rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] lg:col-span-2" defaultValue="<h2>Contenu riche mock</h2><p>Editeur TipTap a brancher en API.</p>" />
          </div>
        </AdminCard>
      );
    }

    if (kind === "identity") {
      return (
        <div className="grid gap-6 xl:grid-cols-2">
          <AdminCard>
            <h2 className="mb-4 text-[18px] font-bold text-white">Logo et couleurs</h2>
            <div className="space-y-4">
              <Field label="Logo principal" value="iwosan-logo.svg" />
              <Field label="Favicon" value="favicon.png" />
              {["#1A5C2A", "#D4AF37", "#F8F4E8", "#101828"].map((color, index) => <Field key={color} label={`Couleur ${index + 1}`} value={color} type="color" />)}
            </div>
          </AdminCard>
          <AdminCard>
            <h2 className="mb-4 text-[18px] font-bold text-white">Apercu</h2>
            <div className="rounded-lg bg-white p-4 text-[#111827]">
              <div className="flex items-center justify-between border-b pb-3"><strong>IWOSAN</strong><button type="button" className="rounded-full bg-[#1A5C2A] px-4 py-2 text-white">Bouton</button></div>
              <p className="mt-4 rounded bg-[#F8F4E8] p-4">Carte, badge et lien de previsualisation.</p>
            </div>
            <textarea className="mt-4 min-h-32 w-full rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-[13px]" defaultValue="/* CSS personnalise reserve aux admins techniques */" />
          </AdminCard>
        </div>
      );
    }

    if (kind === "content") {
      return <AdminTable headers={["Module", "Elements", "Statut", "Action"]} rows={[["Articles", adminModules.editorial.articles.length, "Publie", "Gerer"], ["Pharmacopee", adminModules.editorial.plantsCount, "Publie", "Gerer"], ["Recettes", adminModules.editorial.recipes.length, "Publie", "Gerer"], ["Agenda", adminModules.editorial.events.length, "Actif", "Gerer"], ["Formations", adminModules.editorial.trainings.length, "Actif", "Gerer"]]} />;
    }

    if (kind === "marketplace") {
      return <AdminTable headers={["Annonce", "Vendeur", "Prix", "Statut", "Actions"]} rows={adminModules.marketplace.products.map((product, index) => [product.title, product.sellerName, `${product.price.toLocaleString("fr-FR")} ${product.currency}`, index < 3 ? "PENDING" : "ACTIF", "Approuver / Rejeter / Booster"])} />;
    }

    if (kind === "users") {
      return <AdminTable headers={["Nom", "Email", "Role", "Pays", "Statut", "Actions"]} rows={adminUsers.map((user) => [user.name, user.email, user.role, user.country, user.status, "Voir / Suspendre / Role"])} />;
    }

    if (kind === "kyc") {
      return <AdminTable headers={["Utilisateur", "Document", "Pays", "Soumis le", "Statut", "Actions"]} rows={adminKycQueue.map((item) => [item.user, item.document, item.country, item.submittedAt, item.status, "Approuver / Rejeter"])} />;
    }

    if (kind === "transactions") {
      return <AdminTable headers={["Date", "Utilisateur", "Type", "Montant", "Statut", "Reference"]} rows={adminFinance.transactions.map((item) => [item.date, item.user, item.type, `${item.amount.toLocaleString("fr-FR")} XOF`, item.status, item.ref])} />;
    }

    if (kind === "commissions" || kind === "affiliate") {
      return (
        <div className="space-y-6">
          <AdminCard>
            <h2 className="mb-4 text-[18px] font-bold text-white">Configuration des taux</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Taux global" value="10" type="number" />
              <Field label="Niveau 1" value="5" type="number" />
              <Field label="Niveau 2" value="3" type="number" />
              <Field label="Niveau 3" value="2" type="number" />
            </div>
          </AdminCard>
          <AdminTable headers={["Date", "Type", "Source", "Montant", "Statut"]} rows={adminFinance.commissions.map((item) => [item.date, item.type, item.source, `${item.amount.toLocaleString("fr-FR")} XOF`, item.status])} />
        </div>
      );
    }

    if (kind === "refunds") {
      return <AdminTable headers={["ID", "Commande", "Montant", "Motif", "Statut", "Actions"]} rows={adminFinance.refunds.map((item) => [item.id, item.order, `${item.amount.toLocaleString("fr-FR")} XOF`, item.reason, item.status, "Approuver / Rejeter"])} />;
    }

    if (kind === "disputes") {
      return <AdminTable headers={["ID", "Commande", "Acheteur", "Vendeur", "Statut", "Resolution"]} rows={adminFinance.disputes.map((item) => [item.id, item.order, item.buyer, item.seller, item.status, "Timeline / Decision"])} />;
    }

    if (kind === "newsletter") {
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <AdminTable headers={["Email", "Inscription", "Statut"]} rows={adminNewsletter.subscribers.map((item) => [item.email, item.joinedAt, item.status])} />
          <AdminCard><h2 className="mb-4 text-[18px] font-bold text-white">Campagne</h2><Field label="Objet FR" value="Nouvelles Iwosan" /><textarea className="mt-3 min-h-40 w-full rounded-lg border border-white/10 bg-white/5 p-3" defaultValue="Bloc texte, image, bouton CTA et separateur." /><ActionButton>Programmer</ActionButton></AdminCard>
        </div>
      );
    }

    if (kind === "notifications") {
      return <AdminCard><h2 className="mb-4 text-[18px] font-bold text-white">Envoyer une notification</h2><div className="grid gap-4 md:grid-cols-2"><Field label="Titre" value="Nouvelle annonce disponible" /><Field label="Lien" value="/marketplace" /><textarea className="min-h-32 rounded-lg border border-white/10 bg-white/5 p-3 md:col-span-2" defaultValue="Corps du message push in-app." /></div><button type="button" onClick={() => setNotice("Notification envoyee en mock.")} className="mt-4 rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827]">Envoyer</button></AdminCard>;
    }

    if (kind === "tickets") {
      return <AdminTable headers={["ID", "Sujet", "Categorie", "Statut", "Messages", "Actions"]} rows={adminModules.tickets.map((ticket) => [ticket.id, ticket.subject, ticket.category, ticket.status, ticket.messages.length, "Repondre / Assigner"])} />;
    }

    if (kind === "reports") {
      return <AdminTable headers={["Contenu", "Signalements", "Auteur", "Statut", "Actions"]} rows={adminCommunityReports.map((item) => [item.content, item.reports, item.author, item.status, "Ignorer / Masquer / Suspendre"])} />;
    }

    if (kind === "forum") {
      return <AdminTable headers={["Question", "Votes", "Reponses", "Vedette", "Actions"]} rows={adminModules.editorial.articles.slice(0, 2).map((item) => [item.title, 24, 5, "Non", "Mettre en vedette"])} />;
    }

    if (kind === "reviews") {
      return <AdminTable headers={["Avis", "Cible", "Note", "Signalements", "Actions"]} rows={[["Produit efficace", "Kinkeliba", 5, 0, "Valider"], ["Commentaire abusif", "Praticien", 1, 2, "Supprimer"]]} />;
    }

    if (kind === "logs") {
      return <AdminTable headers={["Date", "Admin", "Role", "Action", "Entite", "IP"]} rows={adminLogs.map((log) => [log.at, log.admin, log.role, log.action, log.entity, log.ip])} />;
    }

    if (kind === "ads") {
      return <AdminTable headers={["Emplacement", "Format", "Statut", "Clics", "Actions"]} rows={[["Accueil haut", "Banniere 1200x300", "Actif", 240, "Editer"], ["Sidebar blog", "Carre 300x300", "Inactif", 0, "Activer"]]} />;
    }

    return (
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Synthese</h2>
          <p className="text-[14px] leading-7 text-slate-300">Module admin mock pret. Les endpoints backend seront branches via le client API centralise.</p>
        </AdminCard>
        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">Actions</h2>
          <div className="space-y-3"><ActionButton onClick={() => setNotice("Brouillon cree en mock.")}>Creer</ActionButton><ActionButton onClick={() => setNotice("Export CSV prepare en mock.")}>Exporter CSV</ActionButton><ActionButton onClick={() => setNotice("Modifications enregistrees en mock.")}>Enregistrer</ActionButton></div>
        </AdminCard>
      </div>
    );
  }, [kind]);

  return (
    <AdminLayout title={meta.title} description={meta.description}>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}
      {content}
    </AdminLayout>
  );
}
