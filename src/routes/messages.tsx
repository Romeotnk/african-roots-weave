import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Image, Laugh, MoreHorizontal, Paperclip, Plus, Search, Send, SmilePlus, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmojiPicker, QUICK_REACTIONS } from "@/components/shared/EmojiPicker";
import { conversations as initialConversations } from "@/data/messages";
import { useMessagesSocket } from "@/hooks/useMessagesSocket";
import { useProfessional, useProfessionals } from "@/hooks/useApiCatalog";
import { useDebounce } from "@/hooks/useDebounce";
import { listConversations, markConversationRead, uploadMessageAttachments } from "@/lib/api/messages";
import { authTokenStore } from "@/lib/api/client";
import type { ChatMessage, Conversation } from "@/types";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages - IWOSAN" }] }),
  component: MessagesPage,
});

const IMAGE_PATTERN = /\.(png|jpe?g|gif|webp)$/i;
const GROUP_GAP_MS = 5 * 60 * 1000;
const MAX_ATTACHMENTS = 10;

type MessageGroup = { sender: "me" | "them"; messages: ChatMessage[] };
type DaySection = { dateLabel: string; groups: MessageGroup[] };

function formatDateSeparator(date: Date, t: TFunction) {
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return t("messages.today");
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return t("messages.yesterday");
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function groupMessagesByDay(messages: ChatMessage[], t: TFunction): DaySection[] {
  const sections: DaySection[] = [];
  let lastDateKey = "";
  let lastGroup: MessageGroup | null = null;
  let lastSender: ChatMessage["sender"] | null = null;
  let lastTimestamp = 0;

  for (const message of messages) {
    const date = new Date(message.createdAt);
    const dateKey = date.toDateString();
    if (dateKey !== lastDateKey) {
      sections.push({ dateLabel: formatDateSeparator(date, t), groups: [] });
      lastDateKey = dateKey;
      lastGroup = null;
      lastSender = null;
    }
    const section = sections[sections.length - 1];
    const gapMs = date.getTime() - lastTimestamp;
    if (lastGroup && lastSender === message.sender && gapMs < GROUP_GAP_MS) {
      lastGroup.messages.push(message);
    } else {
      lastGroup = { sender: message.sender, messages: [message] };
      section.groups.push(lastGroup);
    }
    lastSender = message.sender;
    lastTimestamp = date.getTime();
  }
  return sections;
}

function formatLastSeen(lastSeen: string | undefined, t: TFunction) {
  if (!lastSeen) return t("messages.offline");
  const date = new Date(lastSeen);
  if (Number.isNaN(date.getTime())) return lastSeen;
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return t("messages.activeNow");
  if (diffMin < 60) return t("messages.activeMinutesAgo", { count: diffMin });
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return t("messages.activeHoursAgo", { count: diffHours });
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === yesterday.toDateString()) return t("messages.activeYesterday", { time });
  return t("messages.activeOn", { date: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) });
}

function MessagesPage() {
  const { t } = useTranslation();
  const hasBackendAuth = Boolean(authTokenStore.get());
  const [conversations, setConversations] = useState(hasBackendAuth ? [] : initialConversations);
  const [activeId, setActiveId] = useState(hasBackendAuth ? "" : initialConversations[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const dragCounterRef = useRef(0);

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

  const openConversationWith = useCallback((profile: { id: string; name: string; specialty: string; avatar: string }, prefill = "") => {
    setConversations((current) => {
      if (current.some((conversation) => conversation.id === profile.id)) return current;
      const newConversation: Conversation = {
        id: profile.id,
        participantName: profile.name,
        participantRole: profile.specialty,
        avatar: profile.avatar,
        online: false,
        unreadCount: 0,
        messages: [],
      };
      return [newConversation, ...current];
    });
    setActiveId(profile.id);
    if (prefill) setDraft(prefill);
    setMobileConversationOpen(true);
    setNewConversationOpen(false);
  }, []);

  // Arriving from "Réserver ce produit" (?to=sellerId&text=...): open that
  // conversation immediately, prefilled, whether or not it already exists.
  const startParams = useMemo(
    () => (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()),
    [],
  );
  const startTo = startParams.get("to");
  const startText = startParams.get("text") ?? "";
  const alreadyHasStartConversation = conversations.some((conversation) => conversation.id === startTo);
  const startProfileQuery = useProfessional(startTo ?? "", hasBackendAuth && Boolean(startTo) && !alreadyHasStartConversation);

  useEffect(() => {
    if (!hasBackendAuth || !startTo) return;

    if (alreadyHasStartConversation) {
      setActiveId(startTo);
      setDraft(startText);
      setMobileConversationOpen(true);
      return;
    }

    const profile = startProfileQuery.data;
    if (!profile) return;
    openConversationWith({ id: startTo, name: profile.name, specialty: profile.specialty, avatar: profile.avatar }, startText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBackendAuth, startTo, startText, alreadyHasStartConversation, startProfileQuery.data]);

  const handleIncomingMessage = useCallback((message: { id: string; senderId: string; content: string; createdAt: string; isRead?: boolean; attachments?: string[] }) => {
    const nextMessage: ChatMessage = {
      id: message.id,
      sender: "them",
      content: message.content,
      createdAt: message.createdAt,
      read: Boolean(message.isRead),
      attachments: message.attachments,
    };

    setConversations((current) => {
      const existing = current.find((conversation) => conversation.id === message.senderId);
      if (!existing) {
        return [
          {
            id: message.senderId,
            participantName: t("messages.defaultConversationName"),
            participantRole: t("messages.receivedViaApi"),
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
  }, [activeId, t]);

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const { authenticated, sendMessage: sendSocketMessage, markRead, setTyping, react, deleteMessage } = useMessagesSocket({
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
    onTypingStart: ({ userId }) => {
      setTypingUserId(userId);
      clearTypingTimeout();
      typingTimeoutRef.current = window.setTimeout(() => setTypingUserId(null), 3000);
    },
    onTypingStop: ({ userId }) => {
      setTypingUserId((current) => (current === userId ? null : current));
      clearTypingTimeout();
    },
    onMessageReaction: ({ messageId, reactions }) => {
      setConversations((current) =>
        current.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId ? { ...message, reactions: reactions ?? undefined } : message,
          ),
        })),
      );
    },
    onMessageDeleted: ({ messageId }) => {
      setConversations((current) =>
        current.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId
              ? { ...message, content: "", attachments: undefined, reactions: undefined, deletedAt: new Date().toISOString() }
              : message,
          ),
        })),
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
  const daySections = useMemo(() => (active ? groupMessagesByDay(active.messages, t) : []), [active, t]);
  const isActiveTyping = Boolean(active && typingUserId === active.id);

  const addPendingFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    setPendingFiles((current) => [...current, ...Array.from(files)].slice(0, MAX_ATTACHMENTS));
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };

  const sendMessage = async () => {
    const content = draft.trim();
    if (!active) {
      setActionMessage(t("messages.selectConversationFirst"));
      return;
    }
    if (!content && pendingFiles.length === 0) {
      setActionMessage(t("messages.writeMessageFirst"));
      return;
    }

    let attachmentUrls: string[] = [];
    if (pendingFiles.length > 0) {
      setIsUploadingAttachment(true);
      setActionMessage(t("messages.uploadingAttachment"));
      try {
        attachmentUrls = await uploadMessageAttachments(pendingFiles);
      } catch {
        setActionMessage(t("messages.attachmentError"));
        setIsUploadingAttachment(false);
        return;
      }
      setIsUploadingAttachment(false);
    }

    const nextMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: "me",
      content: content || t("messages.attachment"),
      createdAt: new Date().toISOString(),
      read: false,
      attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined,
    };
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === active.id
          ? { ...conversation, messages: [...conversation.messages, nextMessage], unreadCount: 0 }
          : conversation,
      ),
    );
    setDraft("");
    setPendingFiles([]);
    setActionMessage(t("messages.messageAdded"));
    if (authenticated) setTyping(active.id, false);

    if (authenticated && !active.id.startsWith("conv")) {
      try {
        const result = await sendSocketMessage(active.id, nextMessage.content, attachmentUrls.length > 0 ? attachmentUrls : undefined);
        if (result?.message?.id) {
          const { message: sent, contactInfoRedacted } = result;
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === active.id
                ? {
                    ...conversation,
                    messages: conversation.messages.map((message) =>
                      message.id === nextMessage.id
                        ? { ...message, id: sent.id, content: sent.content, read: Boolean(sent.isRead), attachments: sent.attachments?.length ? sent.attachments : message.attachments }
                        : message,
                    ),
                  }
                : conversation,
            ),
          );
          if (contactInfoRedacted) {
            setActionMessage(t("messages.contactInfoRedacted"));
          }
        }
      } catch {
        setActionMessage(t("messages.messageAddedSyncPending"));
      }
    }
  };

  const handleComposerAction = (action: "attachment" | "photo") => {
    if (action === "attachment") {
      attachmentInputRef.current?.click();
      return;
    }
    photoInputRef.current?.click();
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    if (!authenticated) return;
    react(messageId, emoji).catch(() => undefined);
  };

  const requestDeleteMessage = (messageId: string) => {
    if (!window.confirm(t("messages.deleteMessageConfirm"))) return;
    deleteMessage(messageId).then((ok) => {
      if (!ok) setActionMessage(t("messages.deleteMessageError"));
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragCounterRef.current = 0;
    setDragActive(false);
    if (event.dataTransfer.files.length > 0) addPendingFiles(event.dataTransfer.files);
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--brand-bg)]">
      <section className="container-iwosan py-6">
        <div className="overflow-hidden rounded-[16px] border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm lg:grid lg:h-[760px] lg:grid-cols-[340px_1fr]">
          <aside className={`${mobileConversationOpen ? "hidden lg:flex" : "flex"} flex-col border-r border-[var(--brand-border-light)]`}>
            <div className="border-b border-[var(--brand-border-light)] p-4">
              <div className="flex items-center justify-between">
                <Link
                  to="/mon-compte"
                  className="mb-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--brand-primary)]"
                >
                  <ArrowLeft size={15} /> {t("messages.back")}
                </Link>
                <button
                  type="button"
                  onClick={() => setNewConversationOpen(true)}
                  aria-label={t("messages.newMessage")}
                  className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--brand-primary)] text-white transition hover:bg-[var(--brand-primary-dark)]"
                >
                  <Plus size={18} />
                </button>
              </div>
              <h1 className="text-[24px] font-bold">{t("messages.title")}</h1>
              <div className="mt-4 flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)] px-3">
                <Search size={16} className="text-[var(--color-text-muted)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("messages.searchPlaceholder")}
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                />
              </div>
            </div>
            <ScrollArea className="h-[620px]">
              <div className="p-2">
                {filtered.length === 0 && (
                  <div className="rounded-[12px] border border-dashed border-[var(--brand-border)] bg-white p-5 text-center text-[13px] text-[var(--color-text-muted)]">
                    {query.trim() ? t("messages.noConversationMatch") : t("messages.noConversationsYet")}
                  </div>
                )}
                {filtered.map((conversation) => {
                  const last = conversation.messages.at(-1);
                  const lastPreview = last?.deletedAt ? t("messages.messageDeleted") : last?.content;
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
                            <p className={`truncate text-[12px] ${last?.deletedAt ? "italic text-[var(--color-text-muted)]" : "text-[var(--color-text-secondary)]"}`}>{lastPreview}</p>
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
            <section
              className={`${mobileConversationOpen ? "flex" : "hidden lg:flex"} relative min-h-[720px] flex-col`}
              onDragEnter={(event) => {
                event.preventDefault();
                dragCounterRef.current += 1;
                setDragActive(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => {
                dragCounterRef.current -= 1;
                if (dragCounterRef.current <= 0) setDragActive(false);
              }}
              onDrop={handleDrop}
            >
              {dragActive && (
                <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center border-4 border-dashed border-[var(--brand-primary)] bg-[var(--brand-primary)]/10">
                  <p className="rounded-full bg-white px-5 py-2 text-[14px] font-bold text-[var(--brand-primary)] shadow-iwosan-md">
                    {t("messages.dropFilesHere")}
                  </p>
                </div>
              )}

              <header className="flex h-[74px] items-center gap-3 border-b border-[var(--brand-border-light)] px-4">
                <button
                  onClick={() => setMobileConversationOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] lg:hidden"
                  aria-label={t("messages.backToConversations")}
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
                    {isActiveTyping ? t("messages.typingIndicator") : active.online ? t("messages.online") : formatLastSeen(active.lastSeen, t)}
                  </p>
                </div>
              </header>

              <ScrollArea className="flex-1 bg-[var(--brand-surface-alt)]">
                <div className="space-y-4 p-4">
                  {daySections.map((section) => (
                    <div key={section.dateLabel} className="space-y-3">
                      <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
                        {section.dateLabel}
                      </div>
                      {section.groups.map((group, groupIndex) => (
                        <MessageBubbleGroup
                          key={`${section.dateLabel}-${groupIndex}`}
                          group={group}
                          avatar={active.avatar}
                          participantName={active.participantName}
                          onReact={toggleReaction}
                          onRequestDelete={requestDeleteMessage}
                          onOpenImage={setLightboxUrl}
                          t={t}
                        />
                      ))}
                    </div>
                  ))}
                  {isActiveTyping && <TypingBubble avatar={active.avatar} participantName={active.participantName} />}
                </div>
              </ScrollArea>

              <footer className="border-t border-[var(--brand-border-light)] p-4">
                {pendingFiles.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {pendingFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="relative h-16 w-16 overflow-hidden rounded-[8px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-alt)]">
                        {file.type.startsWith("image/") ? (
                          <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[var(--color-text-muted)]">
                            <Paperclip size={18} />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePendingFile(index)}
                          aria-label={t("messages.removeAttachment")}
                          className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      addPendingFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      addPendingFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <EmojiPicker
                    onSelect={(emoji) => setDraft((current) => current + emoji)}
                    trigger={
                      <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)]" aria-label={t("messages.emoji")}>
                        <Laugh size={17} />
                      </button>
                    }
                  />
                  <button type="button" onClick={() => handleComposerAction("attachment")} disabled={isUploadingAttachment} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] disabled:opacity-50" aria-label={t("messages.attachment")}>
                    <Paperclip size={17} />
                  </button>
                  <button type="button" onClick={() => handleComposerAction("photo")} disabled={isUploadingAttachment} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--brand-border)] disabled:opacity-50" aria-label={t("messages.photo")}>
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
                    placeholder={t("messages.writePlaceholder")}
                    className="max-h-28 min-h-10 flex-1 resize-none rounded-[14px] border border-[var(--brand-border)] px-4 py-2 text-[14px] outline-none focus:border-[var(--brand-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={isUploadingAttachment}
                    className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary)] text-white disabled:opacity-50"
                    aria-label={t("messages.send")}
                  >
                    <Send size={17} />
                  </button>
                </div>
                {actionMessage && <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">{actionMessage}</p>}
              </footer>
            </section>
          )}
        </div>
      </section>

      <Dialog open={Boolean(lightboxUrl)} onOpenChange={(open) => !open && setLightboxUrl(null)}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          {lightboxUrl && <img src={lightboxUrl} alt="" className="max-h-[85vh] w-full rounded-lg object-contain" />}
        </DialogContent>
      </Dialog>

      <NewConversationDialog open={newConversationOpen} onOpenChange={setNewConversationOpen} onSelect={openConversationWith} t={t} />
    </main>
  );
}

function TypingBubble({ avatar, participantName }: { avatar: string; participantName: string }) {
  return (
    <div className="flex justify-start gap-2">
      <Avatar className="h-7 w-7 self-end">
        <AvatarImage src={avatar} />
        <AvatarFallback>{participantName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 rounded-[16px] bg-white px-4 py-3 shadow-iwosan-sm">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-muted)]"
            style={{ animationDelay: `${dot * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubbleGroup({
  group,
  avatar,
  participantName,
  onReact,
  onRequestDelete,
  onOpenImage,
  t,
}: {
  group: MessageGroup;
  avatar: string;
  participantName: string;
  onReact: (messageId: string, emoji: string) => void;
  onRequestDelete: (messageId: string) => void;
  onOpenImage: (url: string) => void;
  t: TFunction;
}) {
  const isMe = group.sender === "me";
  return (
    <div className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <Avatar className="h-7 w-7 self-end">
          <AvatarImage src={avatar} />
          <AvatarFallback>{participantName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className={`flex max-w-[78%] flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
        {group.messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMe={isMe}
            showMeta={index === group.messages.length - 1}
            onReact={(emoji) => onReact(message.id, emoji)}
            onRequestDelete={() => onRequestDelete(message.id)}
            onOpenImage={onOpenImage}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isMe,
  showMeta,
  onReact,
  onRequestDelete,
  onOpenImage,
  t,
}: {
  message: ChatMessage;
  isMe: boolean;
  showMeta: boolean;
  onReact: (emoji: string) => void;
  onRequestDelete: () => void;
  onOpenImage: (url: string) => void;
  t: TFunction;
}) {
  if (message.deletedAt) {
    return (
      <div className={`rounded-[16px] px-4 py-2.5 text-[13px] italic ${isMe ? "bg-[var(--brand-primary-subtle)] text-[var(--color-text-muted)]" : "bg-white text-[var(--color-text-muted)]"}`}>
        {t("messages.messageDeleted")}
      </div>
    );
  }

  const attachments = message.attachments ?? [];
  const reactionEntries = Object.entries(message.reactions ?? {}).filter(([, ids]) => ids.length > 0);

  return (
    <div className="group relative">
      <div className={`max-w-full rounded-[16px] px-4 py-3 text-[14px] shadow-iwosan-sm ${isMe ? "bg-[var(--brand-primary)] text-white" : "bg-white text-[var(--color-text-primary)]"}`}>
        {attachments.map((url) =>
          IMAGE_PATTERN.test(url) ? (
            <button key={url} type="button" onClick={() => onOpenImage(url)} className="mb-2 block">
              <img src={url} alt="" className="max-h-48 rounded-lg object-cover" />
            </button>
          ) : (
            <a key={url} href={url} target="_blank" rel="noreferrer" className={`mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold underline ${isMe ? "bg-white/10" : "bg-[var(--brand-surface-alt)]"}`}>
              <Paperclip size={14} /> {t("messages.viewAttachment")}
            </a>
          ),
        )}
        {message.content && <p>{message.content}</p>}
        {showMeta && (
          <p className={`mt-1 text-right text-[10px] ${isMe ? "text-white/70" : "text-[var(--color-text-muted)]"}`}>
            {new Date(message.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            {isMe ? (message.read ? " ✓✓" : " ✓") : ""}
          </p>
        )}
      </div>

      {reactionEntries.length > 0 && (
        <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
          {reactionEntries.map(([emoji, ids]) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(emoji)}
              className="flex items-center gap-1 rounded-full border border-[var(--brand-border-light)] bg-white px-2 py-0.5 text-[11px] shadow-iwosan-sm"
            >
              <span>{emoji}</span> <span className="text-[var(--color-text-muted)]">{ids.length}</span>
            </button>
          ))}
        </div>
      )}

      <div className={`absolute bottom-full mb-1 hidden items-center gap-1 group-hover:flex ${isMe ? "right-0" : "left-0"}`}>
        <EmojiPicker
          emojis={QUICK_REACTIONS}
          onSelect={onReact}
          trigger={
            <button type="button" className="grid h-7 w-7 place-items-center rounded-full border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm" aria-label={t("messages.react")}>
              <SmilePlus size={13} />
            </button>
          }
        />
        {isMe && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="grid h-7 w-7 place-items-center rounded-full border border-[var(--brand-border-light)] bg-white shadow-iwosan-sm" aria-label={t("messages.messageActions")}>
                <MoreHorizontal size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRequestDelete} className="text-red-600 focus:text-red-600">
                <Trash2 size={14} className="mr-2" /> {t("messages.deleteMessage")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function NewConversationDialog({
  open,
  onOpenChange,
  onSelect,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (professional: { id: string; name: string; specialty: string; avatar: string }) => void;
  t: TFunction;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const params = useMemo(() => {
    const next = new URLSearchParams();
    if (debouncedSearch.trim()) next.set("search", debouncedSearch.trim());
    next.set("limit", "10");
    return next;
  }, [debouncedSearch]);
  const professionalsQuery = useProfessionals(params);
  const results = professionalsQuery.data?.professionals ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("messages.newConversationTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex h-11 items-center gap-2 rounded-full border border-[var(--brand-border)] px-4">
          <Search size={16} className="text-[var(--color-text-muted)]" />
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("messages.searchProfessionalsPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
          />
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {professionalsQuery.isLoading && <p className="p-3 text-[13px] text-[var(--color-text-muted)]">{t("messages.loading")}</p>}
          {!professionalsQuery.isLoading && results.length === 0 && (
            <p className="p-3 text-[13px] text-[var(--color-text-muted)]">{t("messages.noProfessionalsFound")}</p>
          )}
          {results.map((professional) => (
            <button
              key={professional.id}
              type="button"
              onClick={() => onSelect({ id: professional.id, name: professional.name, specialty: professional.specialty, avatar: professional.avatar })}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-[var(--brand-surface-alt)]"
            >
              <Avatar>
                <AvatarImage src={professional.avatar} />
                <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{professional.name}</p>
                <p className="truncate text-[12px] text-[var(--color-text-muted)]">{professional.specialty}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
