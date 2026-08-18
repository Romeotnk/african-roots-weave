import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiBaseUrl, authTokenStore } from "@/lib/api/client";

type BackendMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
  attachments?: string[];
};

type UseMessagesSocketOptions = {
  onMessageReceived?: (message: BackendMessage) => void;
  onMessageRead?: (payload: { messageId: string }) => void;
  onUserStatus?: (payload: { userId: string; isOnline: boolean; lastSeen?: string | null }) => void;
  onTypingStart?: (payload: { userId: string }) => void;
  onTypingStop?: (payload: { userId: string }) => void;
  onMessageReaction?: (payload: { messageId: string; reactions: Record<string, string[]> | null }) => void;
  onMessageDeleted?: (payload: { messageId: string }) => void;
};

const getSocketUrl = () => {
  if (typeof window === "undefined") return "";
  if (apiBaseUrl.startsWith("/")) return window.location.origin;
  return apiBaseUrl.replace(/\/api\/?$/, "");
};

export function useMessagesSocket(options: UseMessagesSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  // Re-render when auth state changes (e.g. this component mounted before
  // AuthContext finished hydrating) so the socket connects/reconnects once a
  // token becomes available instead of staying disconnected forever.
  const [token, setToken] = useState(() => authTokenStore.get());

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const onAuthChanged = () => setToken(authTokenStore.get());
    window.addEventListener("iwosan.auth.changed", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);
    return () => {
      window.removeEventListener("iwosan.auth.changed", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, []);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    if (!token || !socketUrl) return;

    const socket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setAuthenticated(true);
    });
    socket.on("connect_error", () => {
      setConnected(false);
      setAuthenticated(false);
    });
    socket.on("disconnect", () => {
      setConnected(false);
      setAuthenticated(false);
    });
    socket.on("message:received", (message: BackendMessage) => optionsRef.current.onMessageReceived?.(message));
    socket.on("message:read", (payload: { messageId: string }) => optionsRef.current.onMessageRead?.(payload));
    socket.on("user:status", (payload: { userId: string; isOnline: boolean; lastSeen?: string | null }) =>
      optionsRef.current.onUserStatus?.(payload),
    );
    socket.on("typing:start", (payload: { userId: string }) => optionsRef.current.onTypingStart?.(payload));
    socket.on("typing:stop", (payload: { userId: string }) => optionsRef.current.onTypingStop?.(payload));
    socket.on("message:reaction", (payload: { messageId: string; reactions: Record<string, string[]> | null }) =>
      optionsRef.current.onMessageReaction?.(payload),
    );
    socket.on("message:deleted", (payload: { messageId: string }) => optionsRef.current.onMessageDeleted?.(payload));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setAuthenticated(false);
    };
  }, [token]);

  const sendMessage = useCallback((receiverId: string, content: string, attachments?: string[]) => {
    const socket = socketRef.current;
    if (!socket || !receiverId || (!content.trim() && !attachments?.length)) return Promise.resolve(null);

    return new Promise<{ message: BackendMessage; contactInfoRedacted: boolean } | null>((resolve) => {
      socket.emit(
        "message:send",
        { receiverId, content: content.trim(), attachments },
        (payload: { success?: boolean; data?: BackendMessage; contactInfoRedacted?: boolean }) => {
          resolve(payload?.success && payload.data ? { message: payload.data, contactInfoRedacted: Boolean(payload.contactInfoRedacted) } : null);
        },
      );
    });
  }, []);

  const markRead = useCallback((messageId: string) => {
    socketRef.current?.emit("message:read", messageId);
  }, []);

  const setTyping = useCallback((receiverId: string, typing: boolean) => {
    socketRef.current?.emit(typing ? "typing:start" : "typing:stop", { receiverId });
  }, []);

  const react = useCallback((messageId: string, emoji: string) => {
    const socket = socketRef.current;
    if (!socket) return Promise.resolve(null);
    return new Promise<{ messageId: string; reactions: Record<string, string[]> | null } | null>((resolve) => {
      socket.emit(
        "message:react",
        { messageId, emoji },
        (payload: { success?: boolean; data?: { messageId: string; reactions: Record<string, string[]> | null } }) => {
          resolve(payload?.success && payload.data ? payload.data : null);
        },
      );
    });
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    const socket = socketRef.current;
    if (!socket) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      socket.emit("message:delete", { messageId }, (payload: { success?: boolean }) => resolve(Boolean(payload?.success)));
    });
  }, []);

  return { connected, authenticated, sendMessage, markRead, setTyping, react, deleteMessage };
}
