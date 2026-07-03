import { useEffect } from "react";
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
  useEffect(() => {
    const token = authTokenStore.get();
    const socketUrl = getSocketUrl();
    if (!token || !socketUrl) return;

    const socket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.emit("authenticate", token);
    });
    socket.on("notification:new", (notification: BackendNotification) => {
      onNotificationNew?.(notification);
    });

    return () => {
      socket.disconnect();
    };
  }, [onNotificationNew]);
}
