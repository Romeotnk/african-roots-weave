import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, ShieldCheck, Upload, X, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AccountLayout } from "@/components/account/AccountLayout";
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

const statusIcons: Record<KycStatus, typeof ShieldCheck> = {
  not_submitted: FileText,
  pending: AlertTriangle,
  approved: ShieldCheck,
  rejected: XCircle,
};

const statusTones: Record<KycStatus, string> = {
  not_submitted: "bg-slate-100 text-slate-700",
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

const docTypes = ["CNI", "Passeport", "Permis de conduire", "Titre de sejour"] as const;
type DocType = (typeof docTypes)[number];

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
  const { t } = useTranslation();
  const [status, setStatus] = useState<KycStatus>(() =>
    backendStatusToKycStatus(backendAuthUserStore.get()?.kycStatus ?? getAccessTokenClaims()?.kycStatus),
  );
  const [docType, setDocType] = useState<DocType>("CNI");
  const [country, setCountry] = useState("BJ");
  const [documentNumber, setDocumentNumber] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [files, setFiles] = useState<{ front: File | null; back: File | null; selfie: File | null }>({ front: null, back: null, selfie: null });
  const [accepted, setAccepted] = useState(false);
  // "Modifier mon dossier" only swaps which form is shown locally — it does
  // not cancel the pending submission server-side. Track it separately so we
  // can tell the user their original submission still stands until they
  // actually resubmit, instead of letting them think they cancelled it.
  const [isEditingPending, setIsEditingPending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsSuccess, setMessageIsSuccess] = useState(false);
  const submitKyc = useSubmitKycMutation();

  const statusMeta: Record<KycStatus, { label: string; desc: string }> = {
    not_submitted: { label: t("account.kyc.statusNotSubmittedLabel"), desc: t("account.kyc.statusNotSubmittedDesc") },
    pending: { label: t("account.kyc.statusPendingLabel"), desc: t("account.kyc.statusPendingDesc") },
    approved: { label: t("account.kyc.statusApprovedLabel"), desc: t("account.kyc.statusApprovedDesc") },
    rejected: { label: t("account.kyc.statusRejectedLabel"), desc: t("account.kyc.statusRejectedDesc") },
  };
  const docTypeLabels: Record<DocType, string> = {
    CNI: t("account.kyc.docTypeCni"),
    Passeport: t("account.kyc.docTypePassport"),
    "Permis de conduire": t("account.kyc.docTypeDrivingLicense"),
    "Titre de sejour": t("account.kyc.docTypeResidencePermit"),
  };
  const meta = statusMeta[status];
  const Icon = statusIcons[status];
  const tone = statusTones[status];

  const validateForm = () => {
    if (documentNumber.trim().length < 5) return t("account.kyc.validDocNumber");
    if (!expiresAt) return t("account.kyc.expiryRequired");
    if (new Date(expiresAt).getTime() <= Date.now()) return t("account.kyc.docMustBeValid");
    if (!files.front) return t("account.kyc.frontRequired");
    if (docType === "CNI" && !files.back) return t("account.kyc.backRequired");
    if (!files.selfie) return t("account.kyc.selfieRequired");
    if (!accepted) return t("account.kyc.confirmAccuracy");
    return "";
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setMessageIsSuccess(false);
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
        files: {
          front: files.front!,
          back: files.back ?? undefined,
          selfie: files.selfie!,
        },
      });
      setStatus(backendStatusToKycStatus(response.data?.kycStatus));
      setIsEditingPending(false);
      setMessage(t("account.kyc.submitted"));
      setMessageIsSuccess(true);
    } catch {
      setStatus("pending");
      setMessage(t("account.kyc.keptPending"));
      setMessageIsSuccess(true);
    }
  };

  const updateFile = (key: keyof typeof files, file: File | null) => {
    setFiles((current) => ({ ...current, [key]: file }));
    setMessage("");
  };

  return (
    <ProtectedRoute>
      <AccountLayout
        title={t("account.kyc.title")}
        description={t("account.kyc.description")}
      >
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold ${tone}`}>
                <Icon size={15} /> {meta.label}
              </div>
              <p className="mt-4 text-[14px] leading-6 text-[var(--color-text-secondary)]">{meta.desc}</p>
              {status === "rejected" && (
                <p className="mt-3 rounded-lg bg-red-50 p-3 text-[13px] text-red-700">
                  {t("account.kyc.rejectionReason")}
                </p>
              )}
            </div>
            <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 text-[13px] leading-6 text-[var(--color-text-secondary)]">
              {t("account.kyc.tips")}
            </div>
          </aside>

          <form onSubmit={submit} className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5 md:p-6">
            {status === "approved" ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto text-emerald-600" size={54} />
                <h2 className="mt-4 text-[24px] font-bold">{t("account.kyc.approvedTitle")}</h2>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("account.kyc.noActionRequired")}</p>
              </div>
            ) : status === "pending" ? (
              <div className="py-12 text-center">
                <AlertTriangle className="mx-auto text-amber-600" size={54} />
                <h2 className="mt-4 text-[24px] font-bold">{t("account.kyc.pendingTitle")}</h2>
                <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{t("account.kyc.pendingDelay")}</p>
                {message && <p className="mx-auto mt-4 max-w-lg rounded-lg bg-amber-50 p-3 text-[13px] text-amber-800">{message}</p>}
                <button
                  type="button"
                  onClick={() => { setIsEditingPending(true); setStatus("not_submitted"); }}
                  className="mt-5 h-10 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold"
                >
                  {t("account.kyc.editFile")}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {isEditingPending && (
                  <p className="rounded-lg bg-amber-50 p-3 text-[13px] text-amber-800">
                    {t("account.kyc.editingPendingNotice")}
                  </p>
                )}
                <div className="grid gap-3 md:grid-cols-2">
                  <select value={docType} onChange={(event) => setDocType(event.target.value as DocType)} className="h-11 rounded-lg border border-[var(--brand-border)] bg-white px-4">
                    {docTypes.map((item) => <option key={item} value={item}>{docTypeLabels[item]}</option>)}
                  </select>
                  <CountrySelect value={country} onChange={setCountry} className="h-11 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4" />
                  <input
                    required
                    value={documentNumber}
                    onChange={(event) => { setDocumentNumber(event.target.value); setMessage(""); }}
                    placeholder={t("account.kyc.documentNumberPlaceholder")}
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
                  <UploadBox label={t("account.kyc.frontLabel")} file={files.front} onFile={(file) => updateFile("front", file)} onClear={() => updateFile("front", null)} />
                  {docType === "CNI" && (
                    <UploadBox label={t("account.kyc.backLabel")} file={files.back} onFile={(file) => updateFile("back", file)} onClear={() => updateFile("back", null)} />
                  )}
                  <UploadBox label={t("account.kyc.selfieLabel")} file={files.selfie} onFile={(file) => updateFile("selfie", file)} onClear={() => updateFile("selfie", null)} />
                </div>

                <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)] p-4">
                  <h2 className="font-bold">{t("account.kyc.selfieExampleTitle")}</h2>
                  <div className="mt-3 grid h-[150px] place-items-center rounded-lg bg-white text-[13px] text-[var(--color-text-muted)]">
                    {t("account.kyc.selfieExampleHint")}
                  </div>
                </div>

                <label className="flex items-start gap-3 text-[13px] text-[var(--color-text-secondary)]">
                  <Checkbox checked={accepted} onCheckedChange={(checked) => { setAccepted(Boolean(checked)); setMessage(""); }} />
                  <span>{t("account.kyc.certifyAccuracy")}</span>
                </label>

                {message && (
                  <p className={`rounded-lg p-3 text-[13px] ${messageIsSuccess ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                    {message}
                  </p>
                )}

                <button type="submit" disabled={submitKyc.isPending} className="h-11 rounded-full bg-[var(--brand-primary)] px-6 font-semibold text-white disabled:opacity-50">
                  {submitKyc.isPending ? t("account.kyc.sending") : status === "rejected" ? t("account.kyc.resubmit") : t("account.kyc.submit")}
                </button>
              </div>
            )}
          </form>
        </div>
      </AccountLayout>
    </ProtectedRoute>
  );
}

function UploadBox({ label, file, onFile, onClear }: { label: string; file: File | null; onFile: (file: File | null) => void; onClear: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--brand-border)] bg-[var(--brand-surface-alt)] p-4 text-center">
        <Upload className="text-[var(--brand-primary)]" size={28} />
        <span className="mt-2 text-[13px] font-semibold">{label}</span>
        <span className="mt-1 max-w-full truncate text-[11px] text-[var(--color-text-muted)]">
          {file?.name || t("account.kyc.photoOrPdf")}
        </span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
      </label>
      {file && (
        <button type="button" onClick={onClear} aria-label={t("account.kyc.removeFile", { label })} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-red-600 shadow">
          <X size={14} />
        </button>
      )}
    </div>
  );
}