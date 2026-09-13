import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { SlidingNavPanel, NavTabType } from "./components/SlidingNavPanel";
import { LandingPage } from "./components/LandingPage";
import { DashboardView } from "./components/DashboardView";
import { LectureProcessor } from "./components/LectureProcessor";
import { TaskManager } from "./components/TaskManager";
import { CalendarSyncView } from "./components/CalendarSyncView";
import { StudyGroupBoardView } from "./components/StudyGroupBoardView";
import { ToastContainer, ToastItem } from "./components/Toast";
import {
  Task,
  StudyGroupBoard,
  NotificationItem,
  DetectedDeadline,
  UserProfile,
  DEFAULT_USER_PROFILE,
} from "./types";
import { INITIAL_TASKS, INITIAL_STUDY_GROUPS, INITIAL_NOTIFICATIONS } from "./data/initialData";
import { checkUpcomingTaskAlerts, sendBrowserPushNotification, getDeadlineUrgency } from "./utils/notifications";

export default function App() {
  // Student user profile (No login required)
  const [user] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("sw_user");
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  // Screen view state: "landing" vs "workspace"
  const [viewMode, setViewMode] = useState<"landing" | "workspace">(() => {
    try {
      const saved = localStorage.getItem("sw_view_mode");
      return saved === "workspace" ? "workspace" : "landing";
    } catch {
      return "landing";
    }
  });

  // Navigation tab state inside workspace
  const [activeTab, setActiveTab] = useState<NavTabType>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data persistence
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem("sw_tasks");
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [studyGroups, setStudyGroups] = useState<StudyGroupBoard[]>(() => {
    try {
      const saved = localStorage.getItem("sw_study_groups");
      return saved ? JSON.parse(saved) : INITIAL_STUDY_GROUPS;
    } catch {
      return INITIAL_STUDY_GROUPS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("sw_notifications");
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: "success" | "info" | "warning" | "error", title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Set root to clean, accessible Light mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    document.body.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    try {
      localStorage.setItem("sw_theme", "light");
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
  }, []);

  // Sync user state
  useEffect(() => {
    try {
      localStorage.setItem("sw_user", JSON.stringify(user));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [user]);

  // Sync tasks, study groups, notifications
  useEffect(() => {
    try {
      localStorage.setItem("sw_tasks", JSON.stringify(tasks));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem("sw_study_groups", JSON.stringify(studyGroups));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [studyGroups]);

  useEffect(() => {
    try {
      localStorage.setItem("sw_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  }, [notifications]);

  // Check upcoming assignments on mount and trigger notification
  useEffect(() => {
    const upcoming = checkUpcomingTaskAlerts(tasks);
    if (upcoming.length > 0) {
      sendBrowserPushNotification("Upcoming Assignment Alert", {
        body: `You have ${upcoming.length} deliverable(s) due within the next 48 hours!`,
      });
    }
  }, []);

  const handleGetStarted = () => {
    setViewMode("workspace");
    setActiveTab("dashboard");
    try {
      localStorage.setItem("sw_view_mode", "workspace");
    } catch (e) {
      console.warn("Could not save view mode", e);
    }
    addToast(
      "success",
      "Welcome to your Workspace!",
      "Direct access enabled — all tools are ready with no login required."
    );
  };

  const handleReturnToLanding = () => {
    setViewMode("landing");
    try {
      localStorage.setItem("sw_view_mode", "landing");
    } catch (e) {
      console.warn("Could not save view mode", e);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = !t.completed;
          if (updated) {
            addToast("success", "Task Completed! 🎉", `"${t.title}" marked as finished.`);
          }
          return { ...t, completed: updated };
        }
        return t;
      })
    );
  };

  // Add deadlines detected by AI Lecture Processor into the task management system
  const handleAddTasksFromAI = (deadlines: DetectedDeadline[]) => {
    const newTasks: Task[] = deadlines.map((dl, idx) => ({
      id: `task-ai-${Date.now()}-${idx}`,
      title: dl.title,
      description: dl.notes || `Extracted by AI copilot for ${dl.course}`,
      dueDate: dl.dueDate,
      priority: dl.priority,
      category: dl.category,
      course: dl.course,
      completed: false,
      createdAt: new Date().toISOString(),
    }));

    setTasks((prev) => [...newTasks, ...prev]);

    // Push in-app notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "New Deadlines Added to Workspace",
      message: `Imported ${newTasks.length} task(s) into your deadline tracking & calendar sync.`,
      timestamp: "Just now",
      type: "system",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast(
      "success",
      `Imported ${newTasks.length} Deadline(s)`,
      "Synced with Task Manager, iCal (.ICS) and Academic Calendar."
    );
  };

  const urgentTasksCount = tasks.filter(
    (t) => !t.completed && getDeadlineUrgency(t.dueDate, t.completed).isSoon
  ).length;

  // Landing Page view: "Get Started" directly switches to the Dashboard Workspace
  if (viewMode === "landing") {
    return (
      <div className="min-h-screen bg-zinc-100 font-sans selection:bg-indigo-300 selection:text-indigo-950">
        <LandingPage onGetStarted={handleGetStarted} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  // Workspace View: Full Dashboard & Sliding Panel (No login required)
  return (
    <div className="min-h-screen bg-zinc-100/80 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex font-sans selection:bg-indigo-300 selection:text-indigo-950 transition-colors">
      {/* Sliding Navigation Panel */}
      <SlidingNavPanel
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          // On small screens, close panel after selecting a tab
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }}
        user={user}
        onViewLanding={handleReturnToLanding}
        urgentTasksCount={urgentTasksCount}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-20"
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
          setNotifications={setNotifications}
          tasks={tasks}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          user={user}
        />

        {/* Workspace Body */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
          {activeTab === "dashboard" && (
            <DashboardView
              user={user}
              tasks={tasks}
              studyGroups={studyGroups}
              onSelectTab={setActiveTab}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === "summarizer" && (
            <LectureProcessor
              onAddTasks={handleAddTasksFromAI}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === "tasks" && (
            <TaskManager
              tasks={tasks}
              setTasks={setTasks}
              onOpenCalendarView={() => setActiveTab("calendar")}
            />
          )}

          {activeTab === "calendar" && (
            <CalendarSyncView
              tasks={tasks}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === "study-groups" && (
            <StudyGroupBoardView
              studyGroups={studyGroups}
              setStudyGroups={setStudyGroups}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900/60 py-4 text-center text-xs text-zinc-600 dark:text-zinc-400">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Helpify • AI Student Workspace
              </span>
              <span>•</span>
              <span className="text-indigo-600 font-medium">Instant Access • No Login Required</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-400 dark:text-zinc-500">
              <span>Gemini 3.8 Flash Engine</span>
              <span>•</span>
              <span>RFC 5545 iCal Protocol</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
