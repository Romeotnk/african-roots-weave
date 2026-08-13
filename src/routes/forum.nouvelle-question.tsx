import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Bold, Code, Image, Italic, List, Loader2, Paperclip, Send, X } from "lucide-react";
import { useCreateForumQuestion, useForumCategories, useForumSearch, useUploadForumAttachments } from "@/hooks/useForumApi";
import { useDebounce } from "@/hooks/useDebounce";

type SearchResult = { id: string; title: string };

export const Route = createFileRoute("/forum/nouvelle-question")({
  head: () => ({ meta: [{ title: "Nouvelle question - Forum IWOSAN" }] }),
  component: NewQuestion,
});

const suggestedTags = ["pharmacopee", "grossesse", "securite", "posologie", "karite", "neem", "douleur", "nutrition"];
const severityOptions = ["", "Léger", "Modéré", "Sévère"];

const formatButtonIds = ["bold", "italic", "list", "code", "image"] as const;
type FormatButtonId = (typeof formatButtonIds)[number];
const formatIcons: Record<FormatButtonId, typeof Bold> = { bold: Bold, italic: Italic, list: List, code: Code, image: Image };
const buildFormatButtons = (t: TFunction) =>
  formatButtonIds.map((id) => ({
    id,
    icon: formatIcons[id],
    label: t(`forum.newQuestion.format${id.charAt(0).toUpperCase()}${id.slice(1)}`),
    snippet: t(`forum.newQuestion.formatSnippet${id.charAt(0).toUpperCase()}${id.slice(1)}`),
  }));

function NewQuestion() {
  const { t } = useTranslation();
  const formatButtons = useMemo(() => buildFormatButtons(t), [t]);
  const navigate = useNavigate();
  const createQuestion = useCreateForumQuestion();
  const uploadAttachments = useUploadForumAttachments();
  const categoriesQuery = useForumCategories();
  const categories = categoriesQuery.data ?? [];
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [severity, setSeverity] = useState("");
  const [tags, setTags] = useState<string[]>(["pharmacopee"]);
  const [draftTag, setDraftTag] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [editorNotice, setEditorNotice] = useState("");
  const [attachmentNotice, setAttachmentNotice] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const debouncedTitle = useDebounce(title, 300);

  useEffect(() => {
    if (categoryId || categories.length === 0) return;
    const first = categories[0];
    setCategoryId(first.children?.[0]?.id ?? first.id);
  }, [categories, categoryId]);

  const searchQuery = useForumSearch(debouncedTitle);
  const similarQuestions = useMemo<SearchResult[]>(() => {
    if (debouncedTitle.trim().length < 8) return [];
    return ((searchQuery.data ?? []) as SearchResult[]).slice(0, 3);
  }, [searchQuery.data, debouncedTitle]);

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (!clean || tags.includes(clean)) return;
    setTags((current) => [...current, clean].slice(0, 6));
    setDraftTag("");
    setDraftSaved(false);
  };

  const applyFormatting = (label: string, snippet: string) => {
    setBody((current) => `${current}${current ? "\n" : ""}${snippet}`);
    setEditorNotice(t("forum.newQuestion.formatAdded", { label }));
    setSubmitted(false);
    setDraftSaved(false);
  };

  const saveDraft = () => {
    window.localStorage.setItem("iwosan.forumDraft", JSON.stringify({ title, body, categoryId, severity, tags }));
    setDraftSaved(true);
    setFormError("");
  };

  const submitQuestion = () => {
    if (title.trim().length < 12) {
      setFormError(t("forum.newQuestion.titleTooShort"));
      return;
    }
    if (body.trim().length < 40) {
      setFormError(t("forum.newQuestion.bodyTooShort"));
      return;
    }
    if (tags.length === 0) {
      setFormError(t("forum.newQuestion.tagsRequired"));
      return;
    }

    setFormError("");
    createQuestion.mutate(
      {
        title: title.trim(),
        content: body.trim(),
        categoryId,
        customFields: severity ? { severite: severity } : undefined,
        tags,
        attachments,
      },
      {
        onSuccess: (created) => {
          setSubmitted(true);
          setDraftSaved(false);
          setAttachments([]);
          window.localStorage.removeItem("iwosan.forumDraft");
          const createdId = (created as { id?: string } | null)?.id;
          if (createdId) {
            navigate({ to: "/forum/$id", params: { id: createdId } });
          }
        },
        onError: (error) => {
          setFormError(error instanceof Error ? error.message : t("forum.newQuestion.publishError"));
        },
      },
    );
  };

  return (
    <main className="min-h-screen bg-[var(--brand-bg)]">
      <section className="border-b border-[var(--brand-border-light)] bg-white">
        <div className="container-iwosan py-8">
          <Link to="/forum" className="text-[13px] font-semibold text-[var(--brand-primary)]">
            {t("forum.detail.backToForum")}
          </Link>
          <h1 className="mt-4 text-[34px] md:text-[46px]">{t("forum.newQuestion.pageTitle")}</h1>
          <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
            {t("forum.newQuestion.pageSubtitle")}
          </p>
        </div>
      </section>

      <section className="container-iwosan grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitQuestion();
          }}
          className="space-y-5"
        >
          {formError && <p className="rounded-[12px] bg-red-50 p-4 text-[13px] font-semibold text-red-700">{formError}</p>}

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <label htmlFor="question-title" className="mb-2 block text-[13px] font-bold">{t("forum.newQuestion.titleLabel")}</label>
            <input
              id="question-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setSubmitted(false);
                setDraftSaved(false);
              }}
              maxLength={160}
              placeholder={t("forum.newQuestion.titlePlaceholder")}
              className="h-12 w-full rounded-lg border border-[var(--brand-border)] px-4"
            />
            <div className="mt-2 flex justify-between text-[12px] text-[var(--color-text-muted)]">
              <span>{t("forum.newQuestion.titleHint")}</span>
              <span>{title.length}/160</span>
            </div>

            {similarQuestions.length > 0 && (
              <div className="mt-4 rounded-lg bg-amber-50 p-4">
                <p className="text-[13px] font-bold text-amber-900">{t("forum.newQuestion.similarQuestionsTitle")}</p>
                <div className="mt-3 space-y-2">
                  {similarQuestions.map((question) => (
                    <Link
                      key={question.id}
                      to="/forum/$id"
                      params={{ id: question.id }}
                      className="block rounded-lg bg-white px-3 py-2 text-[13px] font-semibold text-[var(--brand-primary)]"
                    >
                      {question.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <label htmlFor="question-body" className="mb-2 block text-[13px] font-bold">{t("forum.newQuestion.bodyLabel")}</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {formatButtons.map(({ id, icon: Icon, label, snippet }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => applyFormatting(label, snippet)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--brand-border)]"
                  aria-label={label}
                  title={label}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
            <textarea
              id="question-body"
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setSubmitted(false);
                setDraftSaved(false);
              }}
              rows={10}
              placeholder={t("forum.newQuestion.bodyPlaceholder")}
              className="w-full rounded-lg border border-[var(--brand-border)] px-4 py-3"
            />
            {editorNotice && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-[12px] text-emerald-800">{editorNotice}</p>}
            <div className="mt-2 flex justify-between text-[12px] text-[var(--color-text-muted)]">
              <span>{t("forum.newQuestion.bodyHint")}</span>
              <span>{t("forum.newQuestion.charactersCount", { count: body.trim().length })}</span>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="question-category" className="mb-2 block text-[13px] font-bold">{t("forum.newQuestion.categoryLabel")}</label>
                <select
                  id="question-category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4"
                >
                  {categories.map((item) => (
                    <optgroup key={item.id} label={item.name}>
                      <option value={item.id}>{item.name}</option>
                      {(item.children ?? []).map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="question-severity" className="mb-2 block text-[13px] font-bold">{t("forum.newQuestion.severityLabel")}</label>
                <select
                  id="question-severity"
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[var(--brand-border)] bg-white px-4"
                >
                  {severityOptions.map((option) => (
                    <option key={option || "none"} value={option}>
                      {option ? t(`forum.severity.${option}`) : t("forum.newQuestion.severityNone")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="question-tags" className="mb-2 block text-[13px] font-bold">{t("forum.newQuestion.tagsLabel")}</label>
                <div className="flex gap-2">
                  <input
                    id="question-tags"
                    value={draftTag}
                    onChange={(event) => setDraftTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag(draftTag);
                      }
                    }}
                    placeholder={t("forum.newQuestion.addTagPlaceholder")}
                    className="h-12 min-w-0 flex-1 rounded-lg border border-[var(--brand-border)] px-4"
                  />
                  <button type="button" onClick={() => addTag(draftTag)} className="h-12 rounded-lg bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white">
                    {t("forum.newQuestion.add")}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                  className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]"
                >
                  x #{tag}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="rounded-full border border-[var(--brand-border)] px-3 py-1 text-[12px] font-semibold"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-5">
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <Paperclip size={24} className="text-[var(--brand-primary)]" />
              <p className="font-semibold">{t("forum.newQuestion.attachmentsTitle")}</p>
              <p className="max-w-md text-[13px] text-[var(--color-text-muted)]">
                {t("forum.newQuestion.attachmentsDesc")}
              </p>
              <input
                ref={attachmentInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  if (files.length === 0) return;
                  setAttachmentNotice("");
                  uploadAttachments.mutate(files, {
                    onSuccess: (urls) => {
                      setAttachments((current) => [...current, ...urls]);
                      setAttachmentNotice(t("forum.newQuestion.attachmentsAdded", { count: urls.length }));
                    },
                    onError: (error) =>
                      setAttachmentNotice(error instanceof Error ? error.message : t("forum.detail.attachmentUploadError")),
                  });
                }}
              />
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={uploadAttachments.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 text-[13px] font-semibold disabled:opacity-50"
              >
                {uploadAttachments.isPending && <Loader2 size={14} className="animate-spin" />}
                {t("forum.newQuestion.chooseFiles")}
              </button>
              {attachmentNotice && <p className="max-w-md rounded-lg bg-amber-50 p-3 text-[12px] text-amber-800">{attachmentNotice}</p>}
              {attachments.length > 0 && (
                <ul className="w-full max-w-md space-y-1.5 text-left">
                  {attachments.map((url) => (
                    <li key={url} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--brand-surface-alt)] px-3 py-2 text-[12px]">
                      <a href={url} target="_blank" rel="noreferrer" className="truncate text-[var(--brand-primary)]">{url}</a>
                      <button
                        type="button"
                        onClick={() => setAttachments((current) => current.filter((item) => item !== url))}
                        className="shrink-0 text-[var(--color-text-muted)] hover:text-red-600"
                        aria-label={t("forum.detail.removeFile")}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {draftSaved && (
            <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-800">
              {t("forum.newQuestion.draftSaved")}
            </div>
          )}
          {submitted && (
            <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
              {t("forum.newQuestion.readyToPublish")}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={saveDraft} className="h-11 rounded-full border border-[var(--brand-border)] px-5 text-[13px] font-semibold">
              {t("forum.newQuestion.saveDraftButton")}
            </button>
            <button
              type="submit"
              disabled={createQuestion.isPending}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              <Send size={15} /> {createQuestion.isPending ? t("forum.detail.publishing") : t("forum.newQuestion.publish")}
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-[12px] border border-[var(--brand-border-light)] bg-white p-5">
          <h2 className="text-[18px] font-bold">{t("forum.newQuestion.tipsTitle")}</h2>
          <ul className="mt-4 space-y-3 text-[13px] text-[var(--color-text-secondary)]">
            <li>{t("forum.newQuestion.tip1")}</li>
            <li>{t("forum.newQuestion.tip2")}</li>
            <li>{t("forum.newQuestion.tip3")}</li>
            <li>{t("forum.newQuestion.tip4")}</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}

