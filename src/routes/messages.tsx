import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Image, Laugh, Paperclip, Search, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { conversations as initialConversations } from "@/data/messages";
import { useMessagesSocket } from "@/hooks/useMessagesSocket";
import { listConversations, markConversationRead } from "@/lib/api/messages";
import { authTokenStore } from "@/lib/api/client";
import type { ChatMessage } from "@/types";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages - IWOSAN" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const hasBackendAuth = Boolean(authTokenStore.get());
  const [conversations, setConversations] = useState(hasBackendAuth ? [] : initialConversations);
  const [activeId, setActiveId] = useState(hasBackendAuth ? "" : initialConversations[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const conversationsQuery = useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: listConversations,
    enabled: hasBackendAuth,
    retry: false,
  });

  useEffect(() => {
    if (!conversationsQuery.data) return;
    setConversations(conversationsQuery.data);
    setActiveId((current) => current || conversationsQuery.data?.[0]?.id || "");
  }, [conversationsQuery.data]);
  const handleIncomingMessage = useCallback((message: { id: string; senderId: string; content: string; createdAt: string; isRead?: boolean }) => {
    const nextMessage: ChatMessage = {
      id: message.id,
      sender: "them",
      content: message.content,
      createdAt: message.createdAt,
      read: Boolean(message.isRead),
    };

    setConversations((current) => {
      const existing = current.find((conversation) => conversation.id === message.senderId);
      if (!existing) {
        return [
          {
            id: message.senderId,
            participantName: "Conversation Iwosan",
            participantRole: "Message recu via API",
            avatar: "",
            online: true,
            unreadCount: 1,
            messages: [nextMessage],
          },
          ...current,
        ];
      }

      return current.map((conversation) =>
        conversation.id === message.senderId
          ? {
              ...conversation,
              messages: [...conversation.messages, nextMessage],
              unreadCount: conversation.id === activeId ? 0 : conversation.unreadCount + 1,
            }
          : conversation,
      );
    });
  }, [activeId]);

  const { authenticated, sendMessage: sendSocketMessage, markRead, setTyping } = useMessagesSocket({
    onMessageReceived: handleIncomingMessage,
    onMessageRead: ({ messageId }) => {
      setConversations((current) =>
        current.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId ? { ...message, read: true } : message,
          ),
        })),
      );
    },
    onUserStatus: ({ userId, isOnline, lastSeen }) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === userId
            ? { ...conversation, online: isOnline, lastSeen: lastSeen ?? conversation.lastSeen }
            : conversation,
        ),
      );
    },
  });

  const filtered = useMemo(
    () =>
      conversations.filter((conversation) =>
        [conversation.participantName, conversation.participantRole]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [conversations, query],
  );

  const active = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];

  const sendMessage = async () => {
    const content = draft.trim();
    if (!active) {
      setActionMessage("Sélectionnez une conversation avant d'envoyer un message.");
      return;
    }
    if (!content) {
      setActionMessage("Écrivez un message avant de l'envoyer.");
      return;
    }

    const nextMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: "me",
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === active.id
          ? { ...conversation, messages: [...conversation.messages, nextMessage], unreadCount: 0 }
          : conversation,
      ),
    );
    setDraft("");
    setActionMessage("Message ajouté à la conversation.");

    if (authenticated && !active.id.startsWith("conv")) {
      try {
        const sent = await sendSocketMessage(active.id, content);
        if (sent?.id) {
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === active.id
                ? {
                    ...conversation,
                    messages: conversation.messages.map((message) =>
                      message.id === nextMessage.id ? { ...message, id: sent.id, read: Boolean(sent.isRead) } : message,
                    ),
                  }
                : conversation,
            ),
          );
        }
      } catch {
        setActionMessage("Message ajouté à la conversation. La synchronisation reprendra automatiquement.");
      }
    }
  };

  const handleComposerAction = (action: "emoji" | "attachment" | "photo") => {
    if (action === "emoji") {
      setDraft((current) => `${current} :)`.trimStart());
      setActionMessage("Emoji ajouté au message.");
      return;
    }

    if (action === "attachment") {
      attachmentInputRef.current?.click();
      return;
    }

    photoInputRef.current?.click();  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--brand-bg)]">
      <section className="container-iwosan py-6">
        <div className="overflow-hidden rounded-[16px] border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm lg:grid lg:h-[760px] lg:grid-cols-[340px_1fr]">
          <aside className={`${mobileConversationOpen ? "hidden lg:flex" : "flex"} flex-col border-r border-[var(--brand-border-light)]`}>
            <div className="border-b border-[var(--brand-border-light)] p-4">
              <h1 className="text-[24px] font-bold">Messages</h1>
              <div className="mt-4 flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-3">
                <Search size={16} className="text-[var(--color-text-muted)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher une conversation"
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                />
              </div>
            </div>
            <ScrollArea className="h-[620px]">
              <div className="p-2">
                {filtered.length === 0 && (
                  <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-5 text-center text-[13px] text-[var(--color-text-muted)]">
                    Aucune conversation ne correspond à cette recherche.
                  </div>
                )}
                {filtered.map((conversation) => {
                  const last = conversation.messages.at(-1);
                  return (
                    <button
                      key={conversation.id}
                  onClick={() => {
                        setActiveId(conversation.id);
                        setMobileConversationOpen(true);
                        setConversations((current) =>
                          current.map((item) =>
                            item.id === conversation.id ? { ...item, unreadCount: 0 } : item,
                          ),
                        );
                        if (!conversation.id.startsWith("conv")) {
                          markConversationRead(conversation.id).catch(() => undefined);
                        }
                        conversation.messages
                          .filter((message) => message.sender === "them" && !message.read && !conversation.id.startsWith("conv"))
                          .forEach((message) => markRead(message.id));
                      }}
                      className={`w-full rounded-[12px] p-3 text-left transition hover:bg-[var(--brand-surface-alt)] ${active?.id === conversation.id ? "bg-[var(--brand-primary-subtle)]" : ""}`}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>{conversation.participantName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {conversation.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[14px] font-bold">{conversation.participantName}</p>
                            <span className="shrink-0 text-[10px] text-[var(--color-text-muted)]">
                              {last ? new Date(last.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                          </div>
                          <p className="truncate text-[12px] text-[var(--color-text-muted)]">{conversation.participantRole}</p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="truncate text-[12px] text-[var(--color-text-secondary)]">{last?.content}</p>
                            {conversation.unreadCount > 0 && (
                              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-white">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </aside>

          {active && (
            <section className={`${mobileConversationOpen ? "flex" : "hidden lg:flex"} min-h-[720px] flex-col`}>
              <header className="flex h-[74px] items-center gap-3 border-b border-[var(--brand-border-light)] px-4">
                <button
                  onClick={() => setMobileConversationOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] lg:hidden"
                  aria-label="Retour aux conversations"
                >
                  <ArrowLeft size={18} />
                </button>
                <Avatar>
                  <AvatarImage src={active.avatar} />
                  <AvatarFallback>{active.participantName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold">{active.participantName}</h2>
                  <p className="text-[12px] text-[var(--color-text-muted)]">
                    {active.online ? "En ligne" : active.lastSeen ?? "Hors ligne"}
                  </p>
                </div>
              </header>

              <ScrollArea className="flex-1 bg-[var(--brand-surface-alt)]">
                <div className="space-y-4 p-4">
                  <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
                    Aujourd'hui
                  </div>
                  {active.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] rounded-[16px] px-4 py-3 text-[14px] shadow-iwosan-sm ${message.sender === "me" ? "bg-[var(--brand-primary)] text-white" : "bg-white text-[var(--color-text-primary)]"}`}>
                        <p>{message.content}</p>
                        <p className={`mt-1 text-right text-[10px] ${message.sender === "me" ? "text-white/70" : "text-[var(--color-text-muted)]"}`}>
                          {new Date(message.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          {message.sender === "me" ? (message.read ? " ✓✓" : " ✓") : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <footer className="border-t border-[var(--brand-border-light)] p-4">
                <div className="flex items-end gap-2">
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setActionMessage(`Pièce jointe ajoutée : ${file.name}.`);
                    }}
                  />
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setActionMessage(`Photo ajoutée : ${file.name}.`);
                    }}
                  />                  <button type="button" onClick={() => handleComposerAction("emoji")} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)]" aria-label="Emoji">
                    <Laugh size={17} />
                  </button>
                  <button type="button" onClick={() => handleComposerAction("attachment")} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)]" aria-label="Pièce jointe">
                    <Paperclip size={17} />
                  </button>
                  <button type="button" onClick={() => handleComposerAction("photo")} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)]" aria-label="Photo">
                    <Image size={17} />
                  </button>
                  <textarea
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      if (active && authenticated && !active.id.startsWith("conv")) {
                        setTyping(active.id, event.target.value.trim().length > 0);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows={1}
                    placeholder="Écrire un message..."
                    className="max-h-28 min-h-10 flex-1 resize-none rounded-[14px] border border-[var(--brand-border)] px-4 py-2 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                  />
                  <button
                    onClick={sendMessage}
                    className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary)] text-white"
                    aria-label="Envoyer"
                  >
                    <Send size={17} />
                  </button>
                </div>
              </footer>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
