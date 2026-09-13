import React from "react";
import {
  Book,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  X,
  Compass
} from "lucide-react";
import { UserProfile } from "../types";

export type NavTabType = "dashboard" | "summarizer" | "tasks" | "calendar" | "study-groups";

interface SlidingNavPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  user: UserProfile;
  urgentTasksCount: number;
  onViewLanding?: () => void;
}

export const SlidingNavPanel: React.FC<SlidingNavPanelProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onSelectTab,
  user,
  urgentTasksCount,
  onViewLanding,
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
      color: "text-blue-600 dark:text-blue-400",
      activeBg: "bg-blue-200 dark:bg-blue-950/80 text-blue-950 dark:text-blue-200 border-2 border-blue-500 shadow-xs",
      activeText: "text-blue-950 dark:text-blue-200",
    },
    {
      id: "summarizer",
      label: "AI Lecture Summarizer",
      icon: Sparkles,
      color: "text-purple-600 dark:text-purple-400",
      activeBg: "bg-purple-200 dark:bg-purple-950/80 text-purple-950 dark:text-purple-200 border-2 border-purple-500 shadow-xs",
      activeText: "text-purple-950 dark:text-purple-200",
      badge: "AI",
      badgeColor: "bg-purple-200 dark:bg-purple-900 text-purple-950 dark:text-purple-200",
    },
    {
      id: "tasks",
      label: "Task Deadlines",
      icon: CheckSquare,
      color: "text-amber-600 dark:text-amber-400",
      activeBg: "bg-amber-200 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-2 border-amber-500 shadow-xs",
      activeText: "text-amber-950 dark:text-amber-200",
      badge: urgentTasksCount > 0 ? urgentTasksCount : undefined,
      badgeColor: "bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200",
    },
    {
      id: "calendar",
      label: "Calendar Sync (.ICS)",
      icon: Calendar,
      color: "text-cyan-600 dark:text-cyan-400",
      activeBg: "bg-cyan-200 dark:bg-cyan-950/80 text-cyan-950 dark:text-cyan-200 border-2 border-cyan-500 shadow-xs",
      activeText: "text-cyan-950 dark:text-cyan-200",
    },
    {
      id: "study-groups",
      label: "Study Squads",
      icon: Users,
      color: "text-pink-600 dark:text-pink-400",
      activeBg: "bg-pink-200 dark:bg-pink-950/80 text-pink-950 dark:text-pink-200 border-2 border-pink-500 shadow-xs",
      activeText: "text-pink-950 dark:text-pink-200",
      badge: "Live",
      badgeColor: "bg-pink-200 dark:bg-pink-900 text-pink-950 dark:text-pink-200",
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-xl lg:shadow-none transition-all duration-300 ease-in-out ${
          isOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-20 lg:translate-x-0"
        }`}
      >
        {/* Panel Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-300 dark:bg-indigo-900 text-indigo-950 dark:text-indigo-200 shadow-xs">
              <Book className="h-5 w-5" />
            </div>

            {isOpen && (
              <div className="flex flex-col truncate animate-in fade-in">
                <span className="font-display text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                  Helpify
                </span>
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                  AI Study Companion
                </span>
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button
            id="nav-panel-toggle-btn"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-hidden transition-colors"
            title={isOpen ? "Collapse navigation panel" : "Expand navigation panel"}
            aria-label={isOpen ? "Collapse navigation panel" : "Expand navigation panel"}
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Tabs List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5" role="tablist" aria-label="Workspace navigation">
          <div className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 ${!isOpen ? "lg:hidden" : ""}`}>
            Academic Tasks
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTab(item.id)}
                title={!isOpen ? item.label : undefined}
                aria-label={item.label}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-hidden ${
                  isActive
                    ? item.activeBg
                    : "text-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-current" : item.color}`} />

                {isOpen && (
                  <div className="flex flex-1 items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-1.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                          isActive
                            ? "bg-zinc-900/15 dark:bg-zinc-100/15 text-current"
                            : item.badgeColor || "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300"
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

        {/* Panel Footer: User Account */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
          {/* User Profile Card */}
          <div className="flex items-center justify-between rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/60 p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-300 dark:bg-indigo-900 text-indigo-950 dark:text-indigo-200 font-black text-xs shrink-0">
                  {user.displayName.charAt(0)}
                </div>
              )}

              {isOpen && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate">{user.email}</span>
                </div>
              )}
            </div>

            {isOpen && onViewLanding && (
              <button
                onClick={onViewLanding}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 hover:text-indigo-700 transition-colors"
                title="View Product Overview & FAQs"
              >
                <Compass className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
