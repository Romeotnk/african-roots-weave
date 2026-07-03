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
};

type UseMessagesSocketOptions = {
  onMessageReceived?: (message: BackendMessage) => void;
  onMessageRead?: (payload: { messageId: string }) => void;
  onUserStatus?: (payload: { userId: string; isOnline: boolean; lastSeen?: string | null }) => void;
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

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const token = authTokenStore.get();
    const socketUrl = getSocketUrl();
    if (!token || !socketUrl) return;

    const socket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true,
    });
    socketRef.current = socket;

    const authenticate = () => {
      setConnected(true);
      socket.emit("authenticate", token, (payload: { success?: boolean }) => {
        setAuthenticated(Boolean(payload?.success));
      });
    };

    socket.on("connect", authenticate);
    socket.on("disconnect", () => {
      setConnected(false);
      setAuthenticated(false);
    });
    socket.on("message:received", (message: BackendMessage) => optionsRef.current.onMessageReceived?.(message));
    socket.on("message:read", (payload: { messageId: string }) => optionsRef.current.onMessageRead?.(payload));
    socket.on("user:status", (payload: { userId: string; isOnline: boolean; lastSeen?: string | null }) =>
      optionsRef.current.onUserStatus?.(payload),
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setAuthenticated(false);
    };
  }, []);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    const socket = socketRef.current;
    if (!socket || !receiverId || !content.trim()) return Promise.resolve(null);

    return new Promise<BackendMessage | null>((resolve) => {
      socket.emit(
        "message:send",
        { receiverId, content: content.trim() },
        (payload: { success?: boolean; data?: BackendMessage }) => {
          resolve(payload?.success ? payload.data ?? null : null);
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

  return { connected, authenticated, sendMessage, markRead, setTyping };
}
