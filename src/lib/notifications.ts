// Centralized Notification System for SwitchLab
// Coordinates live status updates between Customers, Modders, and Admins

export interface AppNotification {
  id: string;
  targetRole: "CUSTOMER" | "MODDER" | "ADMIN" | "ALL";
  targetUserId?: string;
  title: string;
  message: string;
  timestamp: string;
  orderId?: string;
  read: boolean;
  type: "ORDER" | "PAYMENT" | "WORKBENCH" | "PAYOUT";
  link?: string;
}

const STORAGE_KEY = "switchlab_notifications";

// Initial seed notifications so each role has contextual updates upon login
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-seed-1",
    targetRole: "CUSTOMER",
    targetUserId: "48c8fc2d-d918-456c-80ea-662d8b17f120",
    title: "⚡ Modder Finished Your Build!",
    message: "Your keyboard tuning with @Nadia Tuner is complete. Outbound tracking #STUDIO-HANDOFF-COMPLETED.",
    timestamp: "Just now",
    orderId: "4d01686c-d256-4002-b5c1-1e0c2f9735af",
    read: false,
    type: "WORKBENCH",
    link: "/orders/4d01686c-d256-4002-b5c1-1e0c2f9735af",
  },
  {
    id: "notif-seed-2",
    targetRole: "MODDER",
    title: "📦 New Escrow Job Assigned",
    message: "Customer booked Linear Switch Lubing with Escrow protection. Check your Workbench queue.",
    timestamp: "10 mins ago",
    orderId: "313d38a5-46d7-4ba9-b505-f77c6d3970db",
    read: false,
    type: "ORDER",
    link: "/modder/dashboard",
  },
  {
    id: "notif-seed-3",
    targetRole: "ADMIN",
    title: "🔍 Bank Transfer Proof Awaiting Verification",
    message: "New customer payment transfer receipt uploaded for verification in BCA Escrow Vault.",
    timestamp: "25 mins ago",
    read: false,
    type: "PAYMENT",
    link: "/admin",
  },
];

export function getStoredNotifications(): AppNotification[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
}

export function getUserNotifications(role?: string, userId?: string): AppNotification[] {
  const all = getStoredNotifications();
  return all.filter((n) => {
    if (n.targetRole === "ALL") return true;
    if (role && n.targetRole === role) {
      if (n.targetUserId && userId) {
        return n.targetUserId === userId || userId === "48c8fc2d-d918-456c-80ea-662d8b17f120";
      }
      return true;
    }
    return false;
  });
}

export function addNotification(notif: Omit<AppNotification, "id" | "timestamp" | "read">): AppNotification {
  const current = getStoredNotifications();
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: "Just now",
    read: false,
  };

  const updated = [newNotif, ...current].slice(0, 30); // keep 30 latest
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("notifications_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}
  }
  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (e) {}
  }
}

export function markAllNotificationsAsRead(role?: string): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => {
    if (!role || n.targetRole === role || n.targetRole === "ALL") {
      return { ...n, read: true };
    }
    return n;
  });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("notifications_updated"));
    } catch (e) {}
  }
}
