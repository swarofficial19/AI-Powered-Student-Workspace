import React from "react";
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  Users,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  X
} from "lucide-react";
import { UserProfile } from "../utils/firebaseAuth";

export type NavTabType = "dashboard" | "summarizer" | "tasks" | "calendar" | "study-groups";

interface SlidingNavPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  user: UserProfile;
  onSignOut: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  urgentTasksCount: number;
}

export const SlidingNavPanel: React.FC<SlidingNavPanelProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onSelectTab,
  user,
  onSignOut,
  theme,
  onToggleTheme,
  urgentTasksCount,
}) => {
  const navItems: Array<{
    id: NavTabType;
    label: string;
    icon: any;
    color: string;
    activeBg: string;
    activeText: string;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-blue-500",
      activeBg: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20",
      activeText: "text-white",
    },
    {
      id: "summarizer",
      label: "AI Lecture Summarizer",
      icon: Sparkles,
      color: "text-purple-500",
      activeBg: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20",
      activeText: "text-white",
      badge: "AI",
      badgeColor: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    },
    {
      id: "tasks",
      label: "Task Deadlines",
      icon: CheckSquare,
      color: "text-amber-500",
      activeBg: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20",
      activeText: "text-white",
      badge: urgentTasksCount > 0 ? urgentTasksCount : undefined,
      badgeColor: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
    },
    {
      id: "calendar",
      label: "Calendar Sync (.ICS)",
      icon: Calendar,
      color: "text-cyan-500",
      activeBg: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20",
      activeText: "text-white",
    },
    {
      id: "study-groups",
      label: "Study Squads",
      icon: Users,
      color: "text-pink-500",
      activeBg: "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20",
      activeText: "text-white",
      badge: "Live",
      badgeColor: "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sliding Panel Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl lg:shadow-none transition-all duration-300 ease-in-out ${
          isOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-20 lg:translate-x-0"
        }`}
      >
        {/* Panel Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>

            {isOpen && (
              <div className="flex flex-col truncate animate-in fade-in">
                <span className="font-display text-sm font-black text-zinc-900 dark:text-white truncate">
                  Student Workspace
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Academic Copilot
                </span>
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title={isOpen ? "Collapse navigation panel" : "Expand navigation panel"}
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Tabs List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 ${!isOpen ? "lg:hidden" : ""}`}>
            Academic Tasks
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={!isOpen ? item.label : undefined}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? item.activeBg
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : item.color}`} />

                {isOpen && (
                  <div className="flex flex-1 items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-1.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badgeColor || "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Panel Footer: Theme Toggle & User Account */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-indigo-500 shrink-0" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400 shrink-0" />
            )}
            {isOpen && (
              <span>{theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}</span>
            )}
          </button>

          {/* User Profile Card */}
          <div className="flex items-center justify-between rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs shrink-0">
                  {user.displayName.charAt(0)}
                </div>
              )}

              {isOpen && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate">{user.email}</span>
                </div>
              )}
            </div>

            {isOpen && (
              <button
                onClick={onSignOut}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                title="Sign out of student account"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
