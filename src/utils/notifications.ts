import { Task } from "../types";

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  return false;
}

export function sendBrowserPushNotification(title: string, options?: NotificationOptions): boolean {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }
  try {
    new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });
    return true;
  } catch (err) {
    console.warn("Could not dispatch push notification:", err);
    return false;
  }
}

/**
 * Calculates days remaining until a given date string (YYYY-MM-DD).
 * Returns negative if overdue.
 */
export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  target.setHours(23, 59, 59, 999);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Returns a human-friendly deadline status badge info
 */
export function getDeadlineUrgency(dateStr: string, completed: boolean): {
  label: string;
  days: number;
  isOverdue: boolean;
  isToday: boolean;
  isSoon: boolean;
  colorClass: string;
} {
  if (completed) {
    return {
      label: "Completed",
      days: 0,
      isOverdue: false,
      isToday: false,
      isSoon: false,
      colorClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };
  }

  const days = getDaysUntil(dateStr);

  if (days < 0) {
    return {
      label: `Overdue (${Math.abs(days)}d)`,
      days,
      isOverdue: true,
      isToday: false,
      isSoon: false,
      colorClass: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }

  if (days === 0) {
    return {
      label: "Due Today",
      days: 0,
      isOverdue: false,
      isToday: true,
      isSoon: true,
      colorClass: "bg-amber-50 text-amber-700 border-amber-300 animate-pulse",
    };
  }

  if (days === 1) {
    return {
      label: "Due Tomorrow",
      days: 1,
      isOverdue: false,
      isToday: false,
      isSoon: true,
      colorClass: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  if (days <= 3) {
    return {
      label: `${days} days left`,
      days,
      isOverdue: false,
      isToday: false,
      isSoon: true,
      colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
  }

  return {
    label: `${days} days left`,
    days,
    isOverdue: false,
    isToday: false,
    isSoon: false,
    colorClass: "bg-zinc-50 text-zinc-600 border-zinc-200",
  };
}

/**
 * Checks for tasks that are due within the next 48 hours and triggers notifications
 */
export function checkUpcomingTaskAlerts(tasks: Task[]): Task[] {
  const soonTasks = tasks.filter((t) => !t.completed && getDaysUntil(t.dueDate) >= 0 && getDaysUntil(t.dueDate) <= 2);
  return soonTasks;
}
