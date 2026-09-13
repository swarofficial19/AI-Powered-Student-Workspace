import React, { useState } from "react";
import {
  Sparkles,
  CheckSquare,
  Calendar as CalendarIcon,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  X,
  Menu,
  Sun,
  Moon,
  LayoutDashboard,
  Zap
} from "lucide-react";
import { NotificationItem, Task } from "../types";
import { requestBrowserNotificationPermission, getDeadlineUrgency } from "../utils/notifications";
import { UserProfile } from "../utils/firebaseAuth";
import { NavTabType } from "./SlidingNavPanel";

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  tasks: Task[];
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  user: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  setNotifications,
  tasks,
  onToggleSidebar,
  isSidebarOpen,
  theme,
  onToggleTheme,
  user,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [pushStatus, setPushStatus] = useState<"default" | "granted" | "denied">(
    typeof window !== "undefined" && "Notification" in window
      ? (Notification.permission as "default" | "granted" | "denied")
      : "default"
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentTasks = tasks.filter(
    (t) => !t.completed && getDeadlineUrgency(t.dueDate, t.completed).isSoon
  );

  const handleEnablePush = async () => {
    const granted = await requestBrowserNotificationPermission();
    setPushStatus(granted ? "granted" : "denied");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const tabTitles: Record<NavTabType, { title: string; subtitle: string; icon: any }> = {
    dashboard: {
      title: "Dashboard Overview",
      subtitle: "Academic progress, active kits & study streak",
      icon: LayoutDashboard,
    },
    summarizer: {
      title: "AI Lecture Summarizer & Quiz",
      subtitle: "High-yield takeaways, formulas & 5-MCQ active recall",
      icon: Sparkles,
    },
    tasks: {
      title: "Automated Deadline Tracker",
      subtitle: "Priority tagging & 48-hour urgency countdowns",
      icon: CheckSquare,
    },
    calendar: {
      title: "Academic Calendar Sync",
      subtitle: "Interactive month view with .ICS export & Google Cal links",
      icon: CalendarIcon,
    },
    "study-groups": {
      title: "Shared Study Squads",
      subtitle: "Peer task allocations, pinned cheat sheets & live Q&A",
      icon: Users,
    },
  };

  const CurrentIcon = tabTitles[activeTab].icon;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Sidebar Toggle & Active Section Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title="Toggle sliding navigation panel"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <CurrentIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white leading-tight">
                  {tabTitles[activeTab].title}
                </span>
                <span className="hidden sm:inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  Active
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-zinc-500 dark:text-zinc-400">
                {tabTitles[activeTab].subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Tab Pills + Push Notifications + Theme Toggle + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Tab Switcher on larger screens */}
          <nav className="hidden xl:flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("summarizer")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeTab === "summarizer"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              AI Summarizer
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeTab === "tasks"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Tasks
              {urgentTasks.length > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 px-1 text-[9px] text-white">
                  {urgentTasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeTab === "calendar"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("study-groups")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeTab === "study-groups"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Study Squads
            </button>
          </nav>

          {/* Light / Dark Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* Push notification toggle */}
          {pushStatus !== "granted" ? (
            <button
              onClick={handleEnablePush}
              title="Enable browser push notifications for upcoming deadlines"
              className="hidden items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 md:flex"
            >
              <Bell className="h-3.5 w-3.5 text-amber-500" />
              <span>Enable Alerts</span>
            </button>
          ) : (
            <div
              title="Push notifications active"
              className="hidden items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 md:flex"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Alerts On</span>
            </div>
          )}

          {/* Notifications bell */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs sm:text-sm font-bold font-display text-zinc-900 dark:text-white">
                      Notifications & Alerts
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Urgent tasks alert */}
                <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                  {urgentTasks.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{urgentTasks.length} Assignment(s) Due in 48 Hours</span>
                      </div>
                      <div className="mt-1.5 space-y-1">
                        {urgentTasks.slice(0, 2).map((ut) => (
                          <div key={ut.id} className="flex items-center justify-between font-medium">
                            <span className="truncate">{ut.title}</span>
                            <span className="ml-2 font-mono text-[10px] text-amber-700 dark:text-amber-400">
                              Due {ut.dueDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
                      <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                      All caught up! No unread notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`group relative rounded-2xl border p-3 transition-colors ${
                          n.read
                            ? "border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-850/50 text-zinc-600 dark:text-zinc-400"
                            : "border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/30 text-zinc-800 dark:text-zinc-200 font-medium"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            {n.type === "due-soon" ? (
                              <Clock className="mt-0.5 h-3.5 w-3.5 text-rose-500 shrink-0" />
                            ) : n.type === "study-group" ? (
                              <Users className="mt-0.5 h-3.5 w-3.5 text-purple-500 shrink-0" />
                            ) : (
                              <Sparkles className="mt-0.5 h-3.5 w-3.5 text-amber-500 shrink-0" />
                            )}
                            <div>
                              <div className="text-xs font-bold text-zinc-900 dark:text-white">
                                {n.title}
                              </div>
                              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="mt-1 block text-[10px] text-zinc-400 dark:text-zinc-500">
                                {n.timestamp}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-2.5 border-t border-zinc-100 dark:border-zinc-800 pt-2 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab("tasks");
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All Tasks & Deadlines →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-zinc-200 dark:border-zinc-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xs">
                {user.displayName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
