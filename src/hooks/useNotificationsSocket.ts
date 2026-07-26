import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { apiBaseUrl, authTokenStore } from "@/lib/api/client";
import type { BackendNotification } from "@/lib/api/notifications";

type UseNotificationsSocketOptions = {
  onNotificationNew?: (notification: BackendNotification) => void;
};

const getSocketUrl = () => {
  if (typeof window === "undefined") return "";
  if (apiBaseUrl.startsWith("/")) return window.location.origin;
  return apiBaseUrl.replace(/\/api\/?$/, "");
};

export function useNotificationsSocket({ onNotificationNew }: UseNotificationsSocketOptions) {
  // Re-render when auth state changes (e.g. this component mounted before
  // AuthContext finished hydrating) so the socket connects/reconnects once a
  // token becomes available instead of staying disconnected forever.
  const [token, setToken] = useState(() => authTokenStore.get());

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
      auth: { token },
    });

    socket.on("notification:new", (notification: BackendNotification) => {
      onNotificationNew?.(notification);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, onNotificationNew]);
}
