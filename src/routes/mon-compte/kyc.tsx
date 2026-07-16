import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, ShieldCheck, Upload, X, XCircle } from "lucide-react";
import { AccountBackLink } from "@/components/dashboard/AccountBackLink";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { getAccessTokenClaims } from "@/lib/authToken";
import { backendAuthUserStore } from "@/lib/api/auth";
import { useSubmitKycMutation } from "@/hooks/useAuthApi";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { KycStatus } from "@/types";

export const Route = createFileRoute("/mon-compte/kyc")({
  head: () => ({ meta: [{ title: "Vérification KYC - IWOSAN" }] }),
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
    label: "En cours de vérification",
    tone: "bg-amber-50 text-amber-700",
    icon: AlertTriangle,
    desc: "Votre dossier est en cours d'examen par l'equipe moderation.",
  },
  approved: {
    label: "Identité vérifiée",
    tone: "bg-emerald-50 text-emerald-700",
    icon: ShieldCheck,
    desc: "Votre identite est approuvee. Les actions protegees sont disponibles.",
  },
  rejected: {
    label: "Rejeté",
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
  const [status, setStatus] = useState<KycStatus>(() =>
    backendStatusToKycStatus(backendAuthUserStore.get()?.kycStatus ?? getAccessTokenClaims()?.kycStatus),
  );
  const [docType, setDocType] = useState("CNI");
  const [country, setCountry] = useState("BJ");
  const [documentNumber, setDocumentNumber] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [files, setFiles] = useState({ front: "", back: "", selfie: "" });
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const submitKyc = useSubmitKycMutation();
  const meta = statusMeta[status];
  const Icon = meta.icon;

  const validateForm = () => {
    if (documentNumber.trim().length < 5) return "Renseignez un numéro de document valide.";
    if (!expiresAt) return "Indiquez la date d'expiration du document.";
    if (new Date(expiresAt).getTime() <= Date.now()) return "Le document doit être encore valide.";
    if (!files.front) return "Ajoutez le recto du document.";
    if (docType === "CNI" && !files.back) return "Ajoutez le verso de la CNI.";
    if (!files.selfie) return "Ajoutez le selfie de vérification.";
    if (!accepted) return "Confirmez l'exactitude des informations avant l'envoi.";
    return "";
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const validationMessage = validateForm();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    try {
      const response = await submitKyc.mutateAsync({
        docType,
        country,
        documentNumber,
        expiresAt,
        files,
      });
      setStatus(backendStatusToKycStatus(response.data?.kycStatus));
      setMessage("Dossier KYC soumis. Vous recevrez une notification apres vérification.");
    } catch {
      setStatus("pending");
      setMessage("Dossier conservé en attente. Une notification confirmera la reprise du traitement.");
    }
  };

  const updateFile = (key: keyof typeof files, fileName: string) => {
    setFiles((current) => ({ ...current, [key]: fileName }));
    setMessage("");
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-border-light)] bg-white">
          <div className="container-iwosan py-8">
            <AccountBackLink />
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
              Mon compte
            </p>
            <h1 className="mt-2 text-[32px] md:text-[42px]">Vérification d'identité</h1>
            <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-muted)]">
              Soumettez vos documents KYC. Le statut est lie a votre compte connecte et sera controle par l'administration.
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
                  Motif : document flou, expiration illisible.
                </p>
              )}
            </div>
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 text-[13px] leading-6 text-[var(--color-text-secondary)]">
              Conseils : utilisez une bonne lumiere, assurez la lisibilite du document, et envoyez un document non expire.
            </div>
          </aside>

          <form onSubmit={submit} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 md:p-6">
            {status === "approved" ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto text-emerald-600" size={54} />
                <h2 className="mt-4 text-[24px] font-bold">Identité vérifiée</h2>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Aucune action requise.</p>
              </div>
            ) : status === "pending" ? (
              <div className="py-12 text-center">
                <AlertTriangle className="mx-auto text-amber-600" size={54} />
                <h2 className="mt-4 text-[24px] font-bold">Dossier en attente</h2>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">Delai indicatif : 24 a 72 heures.</p>
                {message && <p className="mx-auto mt-4 max-w-lg rounded-lg bg-amber-50 p-3 text-[13px] text-amber-800">{message}</p>}
                <button type="button" onClick={() => setStatus("not_submitted")} className="mt-5 h-10 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold">
                  Modifier mon dossier
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <select value={docType} onChange={(event) => setDocType(event.target.value)} className="h-11 rounded-lg border border-[var(--brand-border)] bg-white px-4">
                    {docTypes.map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <CountrySelect value={country} onChange={setCountry} className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4" />
                  <input
                    required
                    value={documentNumber}
                    onChange={(event) => { setDocumentNumber(event.target.value); setMessage(""); }}
                    placeholder="Numero du document"
                    className="h-11 rounded-lg border border-[var(--brand-border)] px-4"
                  />
                  <input
                    value={expiresAt}
                    onChange={(event) => { setExpiresAt(event.target.value); setMessage(""); }}
                    required
                    type="date"
                    className="h-11 rounded-lg border border-[var(--brand-border)] px-4"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <UploadBox label="Recto du document" fileName={files.front} onFile={(fileName) => updateFile("front", fileName)} onClear={() => updateFile("front", "")} />
                  {docType === "CNI" && (
                    <UploadBox label="Verso du document" fileName={files.back} onFile={(fileName) => updateFile("back", fileName)} onClear={() => updateFile("back", "")} />
                  )}
                  <UploadBox label="Selfie avec document" fileName={files.selfie} onFile={(fileName) => updateFile("selfie", fileName)} onClear={() => updateFile("selfie", "")} />
                </div>

                <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
                  <h2 className="font-bold">Selfie : exemple attendu</h2>
                  <div className="mt-3 grid h-[150px] place-items-center rounded-lg bg-white text-[13px] text-[var(--color-text-muted)]">
                    Visage visible + document tenu pres du visage
                  </div>
                </div>

                <label className="flex items-start gap-3 text-[13px] text-[var(--color-text-secondary)]">
                  <Checkbox checked={accepted} onCheckedChange={(checked) => { setAccepted(Boolean(checked)); setMessage(""); }} />
                  <span>Je certifie sur l'honneur que les informations fournies sont exactes.</span>
                </label>

                {message && (
                  <p className={`rounded-lg p-3 text-[13px] ${message.startsWith("Dossier") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                    {message}
                  </p>
                )}

                <button type="submit" disabled={submitKyc.isPending} className="h-11 rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white disabled:opacity-50">
                  {submitKyc.isPending ? "Envoi..." : status === "rejected" ? "Renvoyer le dossier" : "Soumettre mon KYC"}
                </button>
              </div>
            )}
          </form>
        </section>
      </main>
    </ProtectedRoute>
  );
}

function UploadBox({ label, fileName, onFile, onClear }: { label: string; fileName: string; onFile: (fileName: string) => void; onClear: () => void }) {
  return (
    <div className="relative">
      <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-4 text-center">
        <Upload className="text-[var(--brand-primary)]" size={28} />
        <span className="mt-2 text-[13px] font-semibold">{label}</span>
        <span className="mt-1 max-w-full truncate text-[11px] text-[var(--color-text-muted)]">
          {fileName || "Photo ou PDF"}
        </span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(event) => onFile(event.target.files?.[0]?.name ?? "")}
        />
      </label>
      {fileName && (
        <button type="button" onClick={onClear} aria-label={`Retirer ${label}`} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-red-600 shadow">
          <X size={14} />
        </button>
      )}
    </div>
  );
}