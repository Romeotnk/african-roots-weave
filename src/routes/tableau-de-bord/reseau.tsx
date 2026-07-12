import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Copy, Download, Mail, Network, Search, Send, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";

type MemberStatus = "active" | "pending" | "inactive";

type NetworkMember = {
  id: string;
  name: string;
  email: string;
  level: number;
  status: MemberStatus;
  joinedAt: string;
  volume: number;
};

const initialMembers: NetworkMember[] = [
  { id: "m-1", name: "Amina Traore", email: "amina@example.com", level: 1, status: "active", joinedAt: "08/07/2026", volume: 95000 },
  { id: "m-2", name: "Paul Mensah", email: "paul@example.com", level: 2, status: "pending", joinedAt: "06/07/2026", volume: 42000 },
  { id: "m-3", name: "Nadia Bamba", email: "nadia@example.com", level: 1, status: "inactive", joinedAt: "02/07/2026", volume: 18000 },
];

const statusLabels: Record<MemberStatus, string> = {
  active: "Actif",
  pending: "En attente",
  inactive: "Inactif",
};

const statusClasses: Record<MemberStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  inactive: "bg-slate-100 text-slate-700 border-slate-200",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

function ReseauPage() {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus>("all");
  const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [member.name, member.email, `niveau ${member.level}`].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [members, query, statusFilter]);

  const activeCount = members.filter((member) => member.status === "active").length;
  const levelTwoCount = members.filter((member) => member.level >= 2).length;
  const totalVolume = members.reduce((sum, member) => sum + member.volume, 0);

  const copyLink = async () => {
    setMessage("");
    setError("");
    try {
      await navigator.clipboard.writeText("https://iwosan.com/inscription?ref=PRO-IWOSAN");
      setMessage("Lien d'invitation copie.");
    } catch {
      setError("Impossible de copier automatiquement le lien. Copiez-le manuellement.");
    }
  };

  const sendInvite = () => {
    setMessage("");
    setError("");
    if (!inviteEmail.includes("@") || inviteEmail.trim().length < 6) {
      setError("Saisissez une adresse email valide.");
      return;
    }
    setMembers((current) => [
      {
        id: `m-${Date.now()}`,
        name: inviteEmail.split("@")[0],
        email: inviteEmail.trim(),
        level: 1,
        status: "pending",
        joinedAt: new Date().toLocaleDateString("fr-FR"),
        volume: 0,
      },
      ...current,
    ]);
    setInviteEmail("");
    setMessage("Invitation ajoutee en attente.");
  };

  const remindMember = (id: string) => {
    setMembers((current) => current.map((member) => (member.id === id ? { ...member, status: "pending" } : member)));
    setMessage("Relance preparee pour ce membre.");
    setError("");
  };

  const exportList = () => {
    setMessage("Export CSV prepare localement. La generation serveur sera branchee plus tard.");
    setError("");
  };

  return (
    <ProtectedRoute requireAnyRole={["professional", "researcher", "admin", "super_admin"]}>
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-border-light)] bg-white">
          <div className="container-iwosan py-8">
            <AccountBackLink />
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Reseau</p>
                <h1 className="mt-2 text-[32px] md:text-[42px]">Mon reseau</h1>
                <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
                  Visualisez votre reseau, suivez les filleuls actifs et invitez de nouveaux membres.
                </p>
              </div>
              <button type="button" onClick={exportList} className="btn-secondary h-11 px-5 text-[14px]">
                <Download size={17} /> Exporter
              </button>
            </div>
          </div>
        </section>

        <section className="container-iwosan py-8">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Users} label="Membres actifs" value={String(activeCount)} />
            <StatCard icon={Network} label="Niveau 2+" value={String(levelTwoCount)} />
            <StatCard icon={TrendingUp} label="Volume reseau" value={formatMoney(totalVolume)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
              <h2 className="text-[18px] font-bold">Inviter un membre</h2>
              <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-muted)]">
                Les invitations sont mockees ici. Le lien sera branche au backend de parrainage plus tard.
              </p>
              <button type="button" onClick={copyLink} className="btn-secondary mt-4 h-11 w-full text-[14px]">
                <Copy size={17} /> Copier mon lien
              </button>
              <label className="mt-4 block text-[13px] font-bold text-[var(--color-text-primary)]">
                Email a inviter
                <input
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="nom@email.com"
                  className="mt-2 h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] px-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                />
              </label>
              <button type="button" onClick={sendInvite} className="btn-primary mt-4 h-11 w-full text-[14px]">
                <Send size={17} /> Envoyer l'invitation
              </button>
              {message && <p className="mt-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{message}</p>}
              {error && <p className="mt-4 rounded-[8px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{error}</p>}
            </aside>

            <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher un membre"
                    className="h-11 w-full rounded-[8px] border border-[var(--brand-border-light)] bg-white pl-10 pr-3 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["all", "active", "pending", "inactive"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`h-10 rounded-full px-4 text-[13px] font-semibold transition ${
                        statusFilter === status
                          ? "bg-[var(--brand-primary)] text-white"
                          : "bg-[var(--brand-surface-alt)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {status === "all" ? "Tous" : statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {filteredMembers.length === 0 ? (
                  <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-8 text-center">
                    <Users className="mx-auto text-[var(--brand-primary)]" size={34} />
                    <h2 className="mt-4 text-[20px] font-bold">Aucun membre trouve</h2>
                    <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Essayez une autre recherche ou invitez un nouveau membre.</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <article key={member.id} className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">{member.name}</h2>
                            <span className={`rounded-full border px-3 py-1 text-[12px] font-bold ${statusClasses[member.status]}`}>{statusLabels[member.status]}</span>
                          </div>
                          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                            Niveau {member.level} - {member.email} - inscrit le {member.joinedAt}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-extrabold text-[var(--brand-primary)]">{formatMoney(member.volume)}</span>
                          <button type="button" onClick={() => remindMember(member.id)} className="btn-secondary h-10 px-4 text-[13px]"><Mail size={16} /> Relancer</button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--brand-border-light)] bg-white p-5">
      <Icon size={22} className="text-[var(--brand-primary)]" />
      <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/tableau-de-bord/reseau")({
  head: () => ({ meta: [{ title: "Mon reseau - IWOSAN" }] }),
  component: ReseauPage,
});