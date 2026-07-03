import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, ShieldCheck, Upload, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { getAccessTokenClaims } from "@/lib/authToken";
import type { KycStatus } from "@/types";

export const Route = createFileRoute("/mon-compte/kyc")({
  head: () => ({ meta: [{ title: "Verification KYC - IWOSAN" }] }),
  component: KycPage,
});

const statusMeta: Record<KycStatus, { label: string; tone: string; icon: typeof ShieldCheck; desc: string }> = {
  not_submitted: {
    label: "Non soumis",
    tone: "bg-slate-100 text-slate-700",
    icon: FileText,
    desc: "Envoyez vos documents pour debloquer les ventes, retraits et services verifies.",
  },
  pending: {
    label: "En cours de verification",
    tone: "bg-amber-50 text-amber-700",
    icon: AlertTriangle,
    desc: "Votre dossier est en cours d'examen par l'equipe moderation.",
  },
  approved: {
    label: "Identite verifiee",
    tone: "bg-emerald-50 text-emerald-700",
    icon: ShieldCheck,
    desc: "Votre identite est approuvee. Les actions protegees sont disponibles.",
  },
  rejected: {
    label: "Rejete",
    tone: "bg-red-50 text-red-700",
    icon: XCircle,
    desc: "Le dossier doit etre renvoye avec des documents plus lisibles.",
  },
};

const docTypes = ["CNI", "Passeport", "Permis de conduire", "Titre de sejour"];

const backendStatusToKycStatus = (status?: string): KycStatus => {
  switch (status) {
    case "SUBMITTED":
      return "pending";
    case "VERIFIED":
      return "approved";
    case "REJECTED":
      return "rejected";
    default:
      return "not_submitted";
  }
};

function KycPage() {
  const [status, setStatus] = useState<KycStatus>(() => backendStatusToKycStatus(getAccessTokenClaims()?.kycStatus));
  const [docType, setDocType] = useState("CNI");
  const [country, setCountry] = useState("BJ");
  const [accepted, setAccepted] = useState(false);
  const meta = statusMeta[status];
  const Icon = meta.icon;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accepted) return;
    setStatus("pending");
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
            Mon compte
          </p>
          <h1 className="mt-2 text-[32px] md:text-[42px]">Verification d'identite</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
            Soumettez vos documents KYC. Le statut connecte est lu depuis votre session; l'envoi reste en mock tant que l'API KYC n'existe pas.
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-6 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold ${meta.tone}`}>
              <Icon size={15} /> {meta.label}
            </div>
            <p className="mt-4 text-[14px] leading-6 text-[var(--color-text-secondary)]">{meta.desc}</p>
            {status === "rejected" && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-[13px] text-red-700">
                Motif: document flou, expiration illisible.
              </p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-2">
              {(["not_submitted", "pending", "approved", "rejected"] as KycStatus[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  className={`rounded-lg border px-3 py-2 text-[12px] font-semibold ${status === item ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "border-[var(--brand-border)]"}`}
                >
                  {statusMeta[item].label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 text-[13px] leading-6 text-[var(--color-text-secondary)]">
            Conseils: utilisez une bonne lumiere, assurez la lisibilite du document, et envoyez un document non expire.
          </div>
        </aside>

        <form onSubmit={submit} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 md:p-6">
          {status === "approved" ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto text-emerald-600" size={54} />
              <h2 className="mt-4 text-[24px] font-bold">Identite verifiee</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Aucune action requise.</p>
            </div>
          ) : status === "pending" ? (
            <div className="py-12 text-center">
              <AlertTriangle className="mx-auto text-amber-600" size={54} />
              <h2 className="mt-4 text-[24px] font-bold">Dossier en attente</h2>
              <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Delai indicatif: 24 a 72 heures.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2">
                <select value={docType} onChange={(event) => setDocType(event.target.value)} className="h-11 rounded-lg border border-[var(--brand-border)] bg-white px-4">
                  {docTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
                <CountrySelect value={country} onChange={setCountry} className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4" />
                <input required placeholder="Numero du document" className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
                <input required type="date" className="h-11 rounded-lg border border-[var(--brand-border)] px-4" />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <UploadBox label="Recto du document" />
                {docType === "CNI" && <UploadBox label="Verso du document" />}
                <UploadBox label="Selfie avec document" />
              </div>

              <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
                <h2 className="font-bold">Selfie: exemple attendu</h2>
                <div className="mt-3 grid h-[150px] place-items-center rounded-lg bg-white text-[13px] text-[var(--color-text-muted)]">
                  Visage visible + document tenu pres du visage
                </div>
              </div>

              <label className="flex items-start gap-3 text-[13px] text-[var(--color-text-secondary)]">
                <Checkbox checked={accepted} onCheckedChange={(checked) => setAccepted(Boolean(checked))} />
                <span>Je certifie sur l'honneur que les informations fournies sont exactes.</span>
              </label>

              <button disabled={!accepted} className="h-11 rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white disabled:opacity-50">
                {status === "rejected" ? "Renvoyer le dossier" : "Soumettre mon KYC"}
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

function UploadBox({ label }: { label: string }) {
  return (
    <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-4 text-center">
      <Upload className="text-[var(--brand-primary)]" size={28} />
      <span className="mt-2 text-[13px] font-semibold">{label}</span>
      <span className="mt-1 text-[11px] text-[var(--color-text-muted)]">Photo ou PDF</span>
      <input type="file" accept="image/*,.pdf" className="sr-only" />
    </label>
  );
}
