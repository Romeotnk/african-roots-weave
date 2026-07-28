import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminMonographs,
  useCreateMonograph,
  useDeleteMonograph,
  useMonograph,
  useUpdateMonograph,
} from "@/hooks/useContentApi";
import type { MonographPayload, MonographSummary } from "@/lib/api/content";

const linesToArray = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const arrayToLines = (value: unknown) => (Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n") : "");

type PropertyRow = { property: string; use: string; evidence: string };

const propertiesToLines = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (item && typeof item === "object" && "property" in item) {
            const row = item as PropertyRow;
            return `${row.property} | ${row.use} | ${row.evidence}`;
          }
          return "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

const linesToProperties = (value: string): PropertyRow[] =>
  linesToArray(value)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length === 3 && parts.every(Boolean))
    .map(([property, use, evidence]) => ({ property, use, evidence }));

type FormState = {
  scientificName: string;
  vernacularNames: string;
  family: string;
  origin: string;
  region: string;
  therapeuticCategory: string;
  indications: string;
  summary: string;
  medicinalProperties: string;
  preparations: string;
  precautions: string;
  references: string;
  botanicalDescription: string;
  activeCompounds: string;
  therapeuticIndications: string;
  dosage: string;
  contraindications: string;
  clinicalStudies: string;
  drugInteractions: string;
  preparationMethods: string;
  illustration: string;
  fieldPhotos: string;
  isPublished: boolean;
};

const emptyForm: FormState = {
  scientificName: "",
  vernacularNames: "",
  family: "",
  origin: "",
  region: "",
  therapeuticCategory: "",
  indications: "",
  summary: "",
  medicinalProperties: "",
  preparations: "",
  precautions: "",
  references: "",
  botanicalDescription: "",
  activeCompounds: "",
  therapeuticIndications: "",
  dosage: "",
  contraindications: "",
  clinicalStudies: "",
  drugInteractions: "",
  preparationMethods: "",
  illustration: "",
  fieldPhotos: "",
  isPublished: false,
};

const recordToForm = (record: Record<string, unknown>): FormState => ({
  scientificName: typeof record.scientificName === "string" ? record.scientificName : "",
  vernacularNames: arrayToLines(record.vernacularNames),
  family: typeof record.family === "string" ? record.family : "",
  origin: typeof record.origin === "string" ? record.origin : "",
  region: typeof record.region === "string" ? record.region : "",
  therapeuticCategory: typeof record.therapeuticCategory === "string" ? record.therapeuticCategory : "",
  indications: arrayToLines(record.indications),
  summary: typeof record.summary === "string" ? record.summary : "",
  medicinalProperties: propertiesToLines(record.medicinalProperties),
  preparations: arrayToLines(record.preparations),
  precautions: arrayToLines(record.precautions),
  references: arrayToLines(record.references),
  botanicalDescription: typeof record.botanicalDescription === "string" ? record.botanicalDescription : "",
  activeCompounds: typeof record.activeCompounds === "string" ? record.activeCompounds : "",
  therapeuticIndications: typeof record.therapeuticIndications === "string" ? record.therapeuticIndications : "",
  dosage: typeof record.dosage === "string" ? record.dosage : "",
  contraindications: typeof record.contraindications === "string" ? record.contraindications : "",
  clinicalStudies: typeof record.clinicalStudies === "string" ? record.clinicalStudies : "",
  drugInteractions: typeof record.drugInteractions === "string" ? record.drugInteractions : "",
  preparationMethods: typeof record.preparationMethods === "string" ? record.preparationMethods : "",
  illustration: typeof record.illustration === "string" ? record.illustration : "",
  fieldPhotos: arrayToLines(record.fieldPhotos),
  isPublished: Boolean(record.isPublished),
});

const formToPayload = (form: FormState): MonographPayload => ({
  scientificName: form.scientificName.trim(),
  vernacularNames: linesToArray(form.vernacularNames),
  family: form.family.trim() || undefined,
  origin: form.origin.trim() || undefined,
  region: form.region.trim() || undefined,
  therapeuticCategory: form.therapeuticCategory.trim() || undefined,
  indications: linesToArray(form.indications),
  summary: form.summary.trim() || undefined,
  medicinalProperties: linesToProperties(form.medicinalProperties),
  preparations: linesToArray(form.preparations),
  precautions: linesToArray(form.precautions),
  references: linesToArray(form.references),
  botanicalDescription: form.botanicalDescription.trim(),
  activeCompounds: form.activeCompounds.trim(),
  therapeuticIndications: form.therapeuticIndications.trim(),
  dosage: form.dosage.trim(),
  contraindications: form.contraindications.trim(),
  clinicalStudies: form.clinicalStudies.trim() || undefined,
  drugInteractions: form.drugInteractions.trim() || undefined,
  preparationMethods: form.preparationMethods.trim(),
  illustration: form.illustration.trim() || undefined,
  fieldPhotos: linesToArray(form.fieldPhotos),
  isPublished: form.isPublished,
});

const REQUIRED_FIELDS: (keyof FormState)[] = [
  "scientificName",
  "botanicalDescription",
  "activeCompounds",
  "therapeuticIndications",
  "dosage",
  "contraindications",
  "preparationMethods",
];

const fieldLabel: Record<string, string> = {
  scientificName: "Nom scientifique",
  botanicalDescription: "Description botanique",
  activeCompounds: "Principes actifs",
  therapeuticIndications: "Indications thérapeutiques",
  dosage: "Posologie",
  contraindications: "Contre-indications",
  preparationMethods: "Méthodes de préparation",
};

export function MonographManager() {
  const monographsQuery = useAdminMonographs();
  const createMonograph = useCreateMonograph();
  const updateMonograph = useUpdateMonograph();
  const deleteMonograph = useDeleteMonograph();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MonographSummary | null>(null);

  const editingRecordQuery = useMonograph(editingId ?? "", Boolean(editingId));
  const monographs = monographsQuery.data ?? [];

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCreating(true);
    setError("");
  };

  const startEdit = (id: string) => {
    setEditingId(id);
    setCreating(true);
    setError("");
    setForm(emptyForm);
  };

  useEffect(() => {
    if (!editingId || !editingRecordQuery.data) return;
    const record = editingRecordQuery.data as Record<string, unknown>;
    if (record.id === editingId) setForm(recordToForm(record));
  }, [editingId, editingRecordQuery.data]);

  const cancel = () => {
    setCreating(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const setField = (key: keyof FormState) => (value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    setError("");
    const missing = REQUIRED_FIELDS.filter((key) => !form[key] || String(form[key]).trim() === "");
    if (missing.length > 0) {
      setError(`Champs requis manquants : ${missing.map((key) => fieldLabel[key] ?? key).join(", ")}`);
      return;
    }

    const payload = formToPayload(form);
    if (editingId) {
      updateMonograph.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            setNotice(`« ${form.scientificName} » mis à jour.`);
            cancel();
          },
          onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Échec de la mise à jour."),
        },
      );
    } else {
      createMonograph.mutate(payload, {
        onSuccess: () => {
          setNotice(`« ${form.scientificName} » créé.`);
          cancel();
        },
        onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Échec de la création."),
      });
    }
  };

  const isPending = createMonograph.isPending || updateMonograph.isPending;

  return (
    <div>
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}

      {!creating && (
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={startCreate} className="rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827]">
            + Nouvelle monographie
          </button>
        </div>
      )}

      {creating && (
        <div className="mb-6 rounded-[12px] border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-[15px] font-bold text-white">{editingId ? "Modifier la monographie" : "Nouvelle monographie"}</h3>
          {editingId && editingRecordQuery.isLoading && <p className="mt-2 text-[13px] text-slate-400">Chargement...</p>}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Nom scientifique *" value={form.scientificName} onChange={setField("scientificName")} />
            <Field label="Famille botanique" value={form.family} onChange={setField("family")} />
            <Field label="Origine" value={form.origin} onChange={setField("origin")} />
            <Field label="Région de distribution" value={form.region} onChange={setField("region")} />
            <Field label="Catégorie thérapeutique" value={form.therapeuticCategory} onChange={setField("therapeuticCategory")} />
            <Field label="Illustration (URL image)" value={form.illustration} onChange={setField("illustration")} />
          </div>

          <TextArea label="Noms vernaculaires (un par ligne)" value={form.vernacularNames} onChange={setField("vernacularNames")} rows={2} />
          <TextArea label="Résumé" value={form.summary} onChange={setField("summary")} rows={2} />
          <TextArea label="Indications (une par ligne)" value={form.indications} onChange={setField("indications")} rows={3} />
          <TextArea label="Description botanique *" value={form.botanicalDescription} onChange={setField("botanicalDescription")} rows={3} />
          <TextArea label="Principes actifs *" value={form.activeCompounds} onChange={setField("activeCompounds")} rows={3} />
          <TextArea label="Indications thérapeutiques *" value={form.therapeuticIndications} onChange={setField("therapeuticIndications")} rows={3} />
          <TextArea label="Posologie *" value={form.dosage} onChange={setField("dosage")} rows={2} />
          <TextArea label="Contre-indications *" value={form.contraindications} onChange={setField("contraindications")} rows={2} />
          <TextArea label="Interactions médicamenteuses" value={form.drugInteractions} onChange={setField("drugInteractions")} rows={2} />
          <TextArea label="Études cliniques" value={form.clinicalStudies} onChange={setField("clinicalStudies")} rows={2} />
          <TextArea label="Méthodes de préparation *" value={form.preparationMethods} onChange={setField("preparationMethods")} rows={3} />
          <TextArea label="Préparations (une par ligne)" value={form.preparations} onChange={setField("preparations")} rows={2} />
          <TextArea label="Précautions (une par ligne)" value={form.precautions} onChange={setField("precautions")} rows={2} />
          <TextArea label="Références (une par ligne)" value={form.references} onChange={setField("references")} rows={2} />
          <TextArea
            label="Propriétés médicinales — une par ligne, format : propriété | usage | preuve"
            value={form.medicinalProperties}
            onChange={setField("medicinalProperties")}
            rows={3}
          />
          <TextArea label="Photos de terrain (une URL par ligne)" value={form.fieldPhotos} onChange={setField("fieldPhotos")} rows={2} />

          <label className="mt-4 flex items-center gap-2 text-[13px] text-slate-300">
            <input type="checkbox" checked={form.isPublished} onChange={(event) => setField("isPublished")(event.target.checked)} />
            Publier immédiatement (visible sur le site public)
          </label>

          {error && <p className="mt-3 text-[13px] font-semibold text-red-400">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={submit}
              className="rounded-full bg-emerald-400 px-5 py-2 text-[13px] font-bold text-[#111827] disabled:opacity-50"
            >
              {isPending ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer la monographie"}
            </button>
            <button type="button" onClick={cancel} className="rounded-full border border-white/15 px-5 py-2 text-[13px] font-semibold text-white/80">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-[12px] border border-white/10">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-white/10 text-slate-300">
            <tr>{["Nom scientifique", "Catégorie", "Statut", "Créée le", "Actions"].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {monographsQuery.isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>}
            {!monographsQuery.isLoading && monographs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Aucune monographie pour le moment.</td></tr>
            )}
            {monographs.map((monograph) => (
              <tr key={monograph.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{monograph.scientificName}</td>
                <td className="px-4 py-3 text-slate-200">{monograph.therapeuticCategory ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${monograph.isPublished ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-300"}`}>
                    {monograph.isPublished ? "Publiée" : "Brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-200">{new Date(monograph.createdAt).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEdit(monograph.id)} className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                      Modifier
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(monograph)} className="rounded-full bg-red-500/80 px-3 py-1 text-[12px] font-bold text-white">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Supprimer « ${deleteTarget?.scientificName ?? ""} » ?`}
        description="Cette monographie sera définitivement supprimée."
        danger
        confirmLabel="Supprimer"
        pending={deleteMonograph.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMonograph.mutate(deleteTarget.id, {
            onSuccess: () => {
              setNotice(`« ${deleteTarget.scientificName} » supprimée.`);
              setDeleteTarget(null);
            },
          });
        }}
      />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-[12px] font-semibold text-slate-300">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none focus:border-emerald-400"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="mt-4 block text-[12px] font-semibold text-slate-300">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white outline-none focus:border-emerald-400"
      />
    </label>
  );
}
