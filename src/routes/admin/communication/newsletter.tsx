import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminNewsletterSubscribers, useSendAdminNewsletter } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/communication/newsletter")({
  head: () => ({ meta: [{ title: "Admin newsletter - IWOSAN" }] }),
  component: AdminNewsletterPage,
});

type Subscriber = { id: string; email: string; isActive: boolean; subscribedAt: string };

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function AdminNewsletterPage() {
  const { t } = useTranslation();
  const subscribersQuery = useAdminNewsletterSubscribers();
  const sendNewsletter = useSendAdminNewsletter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");

  const subscribers = (subscribersQuery.data?.data ?? []) as Subscriber[];
  const activeCount = subscribers.filter((subscriber) => subscriber.isActive).length;

  const send = () => {
    if (!subject.trim() || !body.trim()) {
      setNotice(t("admin.newsletter.subjectAndMessageRequired"));
      return;
    }
    const html = body
      .trim()
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br/>")}</p>`)
      .join("");
    sendNewsletter.mutate(
      { subject: subject.trim(), html },
      {
        onSuccess: (response) => {
          const sentCount = (response.data as { sent?: number } | null)?.sent ?? activeCount;
          setNotice(t("admin.newsletter.sentTo", { count: sentCount }));
          setSubject("");
          setBody("");
        },
        onError: (error) => setNotice(error instanceof Error ? error.message : t("admin.newsletter.sendError")),
      },
    );
  };

  return (
    <AdminLayout title={t("admin.newsletter.title")} description={t("admin.newsletter.description")}>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <AdminCard className="p-0">
          <div className="max-h-[520px] overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[420px] text-left text-[13px]">
              <thead className="bg-white/10 text-slate-300">
                <tr>{[t("admin.newsletter.colEmail"), t("admin.newsletter.colSubscription"), t("admin.newsletter.colStatus")].map((header) => <th key={header} className="px-4 py-3 font-bold">{header}</th>)}</tr>
              </thead>
              <tbody>
                {subscribersQuery.isLoading && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">{t("admin.newsletter.loading")}</td></tr>}
                {!subscribersQuery.isLoading && subscribers.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">{t("admin.newsletter.noSubscribers")}</td></tr>
                )}
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-slate-200">{subscriber.email}</td>
                    <td className="px-4 py-3 text-slate-200">{new Date(subscriber.subscribedAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${subscriber.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-400"}`}>
                        {subscriber.isActive ? t("admin.newsletter.active") : t("admin.newsletter.unsubscribed")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[18px] font-bold text-white">{t("admin.newsletter.campaign")}</h2>
          <p className="mb-3 text-[12px] text-slate-500">{t("admin.newsletter.activeSubscribersCount", { count: activeCount })}</p>
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{t("admin.newsletter.subject")}</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none" />
          </label>
          <label className="mt-3 block">
            <span className="mb-1 block text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{t("admin.newsletter.message")}</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} className="min-h-40 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none" />
          </label>
          {notice && <p className="mt-3 rounded-lg bg-emerald-500/15 p-3 text-[12px] text-emerald-200">{notice}</p>}
          <button
            type="button"
            disabled={sendNewsletter.isPending}
            onClick={send}
            className="mt-4 rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827] disabled:opacity-50"
          >
            {sendNewsletter.isPending ? t("admin.newsletter.sending") : t("admin.newsletter.send")}
          </button>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
