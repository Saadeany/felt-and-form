import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getNotifications, markRead, markAllRead, deleteNotification, clearAllNotifications } from "../api/notifications";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setNotifications([]); setUnreadCount(0); return; }
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch { /* silent */ }
  }, [isAuthenticated]);

  // Initial load + poll every 60s for new notifications
  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, 60000);
    return () => clearInterval(pollRef.current);
  }, [refresh]);

  const read = useCallback(async (id) => {
    await markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const readAll = useCallback(async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  const remove = useCallback(async (id) => {
    const n = notifications.find((x) => x.id === id);
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    if (n && !n.is_read) setUnreadCount((c) => Math.max(0, c - 1));
  }, [notifications]);

  const clearAll = useCallback(async () => {
    await clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh, read, readAll, remove, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
