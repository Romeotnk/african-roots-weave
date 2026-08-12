import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminCard, AdminLayout } from "@/components/admin/AdminLayout";
import { useBroadcastAdminNotification } from "@/hooks/useAdminApi";

export const Route = createFileRoute("/admin/communication/notifications")({
  head: () => ({ meta: [{ title: "Admin notifications - IWOSAN" }] }),
  component: AdminNotifications,
});

const audiences = [
  { value: "all", label: "Tous les utilisateurs" },
  { value: "users", label: "Utilisateurs (compte standard)" },
  { value: "professionals", label: "Professionnels" },
];

function AdminNotifications() {
  const broadcast = useBroadcastAdminNotification();
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [notice, setNotice] = useState("");

  const canSend = title.trim().length > 0 && message.trim().length > 0 && !broadcast.isPending;

  return (
    <AdminLayout title="Notifications push" description="Envoi d'une notification in-app à un segment d'utilisateurs.">
      {notice && <div className="mb-4 rounded-lg bg-emerald-500/15 p-3 text-[13px] text-emerald-200">{notice}</div>}
      {broadcast.isError && (
        <div className="mb-4 rounded-lg bg-red-500/15 p-3 text-[13px] text-red-200">
          {broadcast.error instanceof Error ? broadcast.error.message : "Échec de l'envoi."}
        </div>
      )}

      <AdminCard>
        <h2 className="mb-4 text-[18px] font-bold text-white">Envoyer une notification</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-[13px] text-slate-300">
            Audience
            <select
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
            >
              {audiences.map((item) => (
                <option key={item.value} value={item.value} className="bg-[#151529]">
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[13px] text-slate-300">
            Lien (optionnel)
            <input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="/marketplace"
              className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
            />
          </label>
          <label className="text-[13px] text-slate-300 md:col-span-2">
            Titre
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nouvelle fonctionnalité disponible"
              className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[13px] text-white outline-none"
            />
          </label>
          <label className="text-[13px] text-slate-300 md:col-span-2">
            Message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Corps du message push in-app."
              className="mt-1 min-h-32 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-[13px] text-white outline-none"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={!canSend}
          onClick={() =>
            broadcast.mutate(
              { audience, title: title.trim(), message: message.trim(), link: link.trim() || undefined },
              {
                onSuccess: (result) => {
                  setNotice(`Notification envoyée à ${result.data?.recipientCount ?? 0} utilisateur(s).`);
                  setTitle("");
                  setMessage("");
                  setLink("");
                },
              },
            )
          }
          className="mt-4 rounded-full bg-emerald-400 px-4 py-2 text-[12px] font-bold text-[#111827] disabled:opacity-50"
        >
          {broadcast.isPending ? "Envoi..." : "Envoyer"}
        </button>
      </AdminCard>
    </AdminLayout>
  );
}
